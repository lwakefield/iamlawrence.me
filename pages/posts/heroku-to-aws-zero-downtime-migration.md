title: Heroku to AWS Zero Downtime Migration
published: TBD

---

This is a story about I migrated a business from Heroku to AWS.

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

[0] https://stackoverflow.com/a/45229837
