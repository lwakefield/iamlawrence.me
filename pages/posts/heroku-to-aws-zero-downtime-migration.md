title: Heroku to AWS Zero Downtime Migration
published: TBD

---

This is a story about how I migrated a business from Heroku to AWS.

First off, I want to address the why. The team had been throwing around the idea of migrating off of Heroku for some time. There were three factors that led to us biting the bullet and migrating from Heroku to AWS: stability, performance and cost.

Starting sometime mid 2019, we started observing instability in Heroku's platform. During these outages, Heroku's communication and response time left something to be desired.

![heroku-stability](https://user-images.githubusercontent.com/5688923/90965111-42302b80-e493-11ea-8b26-bb60aacb6c3d.png)

Our Heroku dynos were located _somewhere in the US_. Heroku isn't particularly forthcoming with the location of their data centers. Though, if you do some searching around - there are some references to Heroku hosting their [US region dynos in AWS's us-east-1 region](https://stackoverflow.com/a/45229837). Due to some poor planning on our end, our primary database was located in us-east-2. To complicate things further, we also had another (deprecated) database located in us-east-1. As we moved more of features to use our primary database, we were observing an increase in latency over time. So we were in this weird place where our ShinyNew database (purple in the image below) was running slower than our OldPleaseStopUsing database (orange in the image below)

![Colocation vs. latency. Orange is the geographically close database, purple is not colocated](https://user-images.githubusercontent.com/5688923/90965134-7efc2280-e493-11ea-9b72-f4000300a65b.png)

Our Heroku application was becoming expensive. We were running 3-5x PM (2.5GiB RAM and some undetermined amount of virtual compute) dynos which run $250/mo per dyno. For comparison, a t3.medium (4GiB RAM and 2vCPU) AWS EC2 instance runs ~$30/mo.

![heroku-bills](https://user-images.githubusercontent.com/5688923/90965168-d4d0ca80-e493-11ea-9da2-e57235b49bb1.png)

None of the three factors detailed above were enough to justify the migration alone, but all together, they built a strong enough case to take the plunge.

So without further a do, let's introduce what we were working with:

![Untitled-2020-08-21-1359(2)](https://user-images.githubusercontent.com/5688923/90965212-2bd69f80-e494-11ea-8520-4e3389241f15.png)

We have: four domain names some going through fastly, three applications and two databases. There was also a message queue (SQS) and Redis cluster included in the infra, but were omitted from the diagram for simplicity sake (they were not part of the critical path during the migration).

The infra topology is not that complicated in itself, but that did not mean the migration would not be complicated. Here is a photo of the whiteboard after our first "how the hell are we going to do this" meeting:

![IMG_20191210_130258(1)](https://user-images.githubusercontent.com/5688923/90965315-fe3e2600-e494-11ea-9d5e-413bbd692f2d.jpg)

We had a rough understanding of what was going to need to happen, but there were an awful lot of "we don't know what problems we will encounter here". The gist of it was this:

1. Get our API running on AWS. It will be connected to our production databases, and exposed publicly. BUT it does not need to be running the latest application code. No traffic will be routed to this API. This is to uncover problems, help us fail fast and either prove to ourselves that we can do this, OR that it isn't a good idea.

2. Start deploying to AWS. We should do this at the same time which we deploy to Heroku. The goal is to get AWS and Heroku in sync. At this stage, AWS is still not receiving traffic.

3. Split traffic between AWS and Heroku. This is where we start sending real traffic to AWS. See Fastly in the infra diagram above? This is where she comes into play. We want to slowly direct more and more traffic to AWS until a point where we can simply turn off Heroku.

4. While rolling out - monitor, evaluate, monitor, evaluate! If we aren't hitting goals, then we need to rethink our approach. We should be honest about if it isn't working, ready to change our approach and in the worst case - rollback the project.

5. Rinse and repeat for the remaining projects and components. This includes workers, scheduled jobs, client application and frontend application. If we have moved API succesfully, then we should feel confident moving these across in a fraction of the time.

What I like about the approach is 1) we are attempting the hardest parts first and 2) we are factoring failure into the process. Both are derived from the same principle "de-risk, de-risk, de-risk". If we do the easy parts first, we lull ourselves into a false sense of security. We don't want to end up in the situation where the first 90% of code accounts for the first 90% of dev time, and the last 10% of code accounts for the other 90% of dev time. There are unknowns in every project, but it is especially true in this project and if we are going to fail, we want to do it fast, so that we have time to try another approach or deem the project "not worth it".
