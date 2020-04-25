title: So you think Postgres is good enough?
published: 2020/04/17

---

To set the scene, I work at a startup. We are fortunate to be in a place where our business has been less affected than many other industries. That being said, reducing burn-rate has become of a higher importance recently.

Among a number of other budget-optimization strategies, our $900/mo Elasticsearch cluster seemed like a juicy target. Weighing in as our 4th most expensive engineering service, behind data warehouse (Redshift), CI (CircleCI) and compute (Heroku). Even more tantalizingly, it received a paltry 10 queries per day.

I had read two blog posts over the past few years, [Postgres full-text search is Good Enough](http://rachbelaid.com/postgres-full-text-search-is-good-enough/) and [Postgresql Search: From the trenches](https://blog.soykaf.com/post/postgresl-front-report/). One of which paints Postgres FTS in a positive light, while the other reads as a cautionary tale with a handful of optimization tricks. Writing search queries in SQL, not needing to manage/index ES, -$900 - it seemed like a no-brainer: let's move our search functionality to Postgres.

Also, as a preface to the below, if you are experienced with Postgres, or RDBMS in general - it may be clear to you that *I do things that are obviously dumb*. Yup - this was a learning experience for me.

I spent the weekend understanding our usage of Elasticsearch and experimenting with Postgres' FTS functionality. By the end of the weekend, I had a functional prototype using *real production data* and a ~2 page document describing the opportunity, the drawbacks, and how we might implement the solution. I should also add, that I *seldom work on weekends*, this was something I was excited about and something I wanted to make happen.

Come Monday, I got a (somewhat distracted) thumbs-up from my manager to push it ahead. So I got to work, preparing to make the prototype production ready. What this involved was:

1. Create two materialized views
2. Periodically refresh these materialized views
3. Replace the ES code with SQL
4. Remove ES from our dev and production stack
5. and 2) were relatively straight forward. However the first problem was that the query in 3) looked like this:

```sql
SELECT * FROM (
  SELECT *, tsrank(document, to_tsquery(:query) AS relevancy FROM search_index_foo
  WHERE document @@ to_tsquery(:query)

  UNION

  SELECT *, tsrank(document, to_tsquery(:query) AS relevancy FROM search_index_bar
  WHERE document @@ to_tsquery(:query)
) ORDER BY relevancy DESC LIMIT 20

```

We wanted to be able to conditionally query against `search_index_foo` or `search_index_bar`, or across both simultaneously. Turned out, this was too slow >30s across ~1.7M rows. Because of the ranking by relevancy, both parts of the union need to be loaded completely. No matter, we are in the early stages and SQL is easy to write. Instead of two materialized views, let's just have one, and we can add a new column to indicate the type. Now we have something like:

```sql
SELECT *, tsrank(document, to_tsquery(:query)) AS relevancy FROM search_index_foo
WHERE document @@ to_tsquery(:query)
ORDER BY relevancy DESC LIMIT 20

```

Sweet, this worked pretty well. I was profiling against production data (not on a production DB) and the queries were completing in ~200ms. Definitely slower than ES, but no big deal for us right now.

Here is the second problem - the `:query` in the above queries is coming from our web form. `to_tsquery` expects a well-formed tsquery string. So while `gender & equality` is a valid search term, `gender equality` is not (no binary operator between terms). Postgres 10+ has `websearch_to_tsquery` which supports more complicated queries like `gender or equality`, but we were on `9.6` (we have since upgraded). I opted for `plainto_tsquery` which simply puts an `&` between each term, workable, but not as fun as `websearch_to_tsquery`.

Throughout the above work, I had been profiling the queries against production data to verify performance, correctness and quality. Although all three performed poorer than ES, it was deemed a suitable tradeoff.

At this point, the work was reviewed and deemed ready to be deployed, and so it was. Release went smoothly, I fired off a couple of queries against production and everything seemed as expected. I followed up with a PR to remove Elasticsearch from our stack completely, and was suitably satisfied with the past few days of work.

---

Two weeks and one Postgres upgrade later, I wanted to swap over to `websearch_to_tsquery`. To get started, I went to our production search form and fired off a query, and waited and waited and waited. It timed out. Shit.

Okay, I grabbed the SQL used by the query and fired it directly at our production database. Yup, it was slow. I spent a few hours in the evening (also unlike me) debugging and profiling the query and looking for fixes. The long story short was, the query had *a lot* of hits. About 10% of all documents matched the search term, that is about 100k rows. The quantity of matches itself wasn't the issue, the issue was that we were using `ORDER BY relevancy DESC`, which meant that postgres had to load *every matching row* to work out it's relevancy, before it could be sorted. I started with the low hanging fruit, I tried adjusting `gin_fuzzy_search_limit` and `work_mem`. Nope, no luck. I eventually settled on the fact that `ORDER BY relevancy DESC` wasn't going to work for us. I whipped up a new PR (with a 😞) that introduced a new materialized view including an `updated_at` column, so that we can sort our queries by that instead. This worked a treat, but is obviously moving us further away in terms of quality of search results.

I got the PR reviewed, a ✅ and merged it into master. I watched the deploy go through, waited for it to hit our servers and test it out. Once it landed, I went back to our production search form and fired off the same query from earlier. And waited, and waited and waited. Fuck it. Okay back to the drawing board. I grabbed the new query, and ran it directly against our production database. Great, it looked fine. Nice and snappy. What else could it be? Well, it turns out there was another (what I thought) innocuous query I had added - the query to get the total hits:

```sql
SELECT count(*) FROM search_index_foo
WHERE document @@ to_tsquery(:query)
```

As it turns out, this query is just as slow as the query ordering by `tsrank`, for much the same reason - every matching row needs to be loaded. The solution for this was very dissatisfying. We were in for a penny at this point, so we did this:

```sql
// TODO: this is a hack. select count(*) for the above query is _slow_ when
// there are a lot of results... Until search is a more frequently used
// feature, this will have to do.
const totalResults = 10000;
```

We hard code the count to a high number. No one has looked past the 10th page, and our frontend handles the "empty pages". Not a great fix, in fact maybe even a bad fix.

---

Okay, so that was a... story.

Hopefully, some of you are looking at me with a strange look: "did this guy really think that was going to work?". Fair enough.

There are plenty of learning here though:

I am not very experienced with postgres (or RDBMS), in particular understanding what the engine is going to do, what limitations it has, and how it scales with performance. Don't push weekend projects with features that you don't *deeply understand* into production.

I was given a warning *right at the beginning*. [Postgresql Search: From the trenches](https://blog.soykaf.com/post/postgresl-front-report/) discusses *this exact case*. After the profiling that I had done as part of the early work, I was under the impression that it might be an issue for us, but not for some time (>12mo). In fact, I had run a couple of queries which returned a large number of matches against production data as part of the profiling in the early stages. However, the database instance was either running locally on my machine, or running on a fresh RDS instance (I cannot remember what resource class was used). I think this goes to underline how shallow my understanding of Postgres is.

Sometime between starting work on this, and the first release - we had downsized our ES cluster cutting costs to ~$300/mo, so that already shaved a lot off of our bill. So why didn't we just go back to Elasticsearch? We could have, and we discussed it. I tried to leave my ego out of it, though I defer to co-workers to confirm this - but there were a few reasons why we didn't go back to ES. 1) Search usage is barely used within our product, such that we are okay having a degraded experience. 2) Not having to haul ES around in our production and dev environment is appealing, not to mention the lack of experience on our team working with ES. 3) $300

Do I regret doing it? Hindsight makes it easy of course to say "look at all these problems, of course I regret it". But I don't. We did end up with a number of improvements (mentioned above). If I knew that it would come at a cost of significantly degraded search, I think I might have been less excited about this project and pushed ahead, but ultimately, I think it was worth it. Oh, I learned a bunch too - selfishly, that made it valuable.

"But ES is so much better, look at all these features, can postgres do that?" - yup, you are right. If we need "real" search, we will be bringing it back. For smaller and simpler search features, like internal admin tools, I would advocate for postgres FTS still, but I would have a longer list of caveats and some extra experience under my belt.
