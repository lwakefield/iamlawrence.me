title: Software where the user owns the data
published: 2020/04/26

---

Here is an idea: what if software required the user to provide the data?

Obviously, this isn't a new idea. This is how things used to be done. Someone, somewhere wrote some software. You install that software on your computer, and that software reads and writes data to your local filesystem. You own the data and allow the software to manage it.

The ecosystem has changed. Most software runs on someone else's computer, reading and writing data to a location that they decide. You do not own the data.

There are a number of things gained with this shift. Most notably, it is easier and more reliable for the authors to write and maintain software. As a side-effect though, it is more expensive for the authors to maintain that software, because now they are paying for servers to run their software. The more users, the more servers needed and the more it costs. Rightfully so, the cost is passed on to the user. The cost of maintaining these servers is on-going, so it makes most sense for the users to pay a monthly cost for the upkeep.

Additionally, we (as users) also lose portability. We are locked in to a particular service. We have no idea what data is being stored on the other end, and even if we did, we have no way of retrieving it easily. If the service changed it's feature offering, or ran out of money, or changed for some other reason that displeases the user - the user is fucked. They either deal with these changes or take arduous task of migrating to another service.

---

I recently experimented with [gitmark](https://gitmark.lwakefield.now.sh/about). It is a dead simple bookmarking tool as a Firefox extension, or a web app. Once you connect it to your GitHub repository, adding a bookmark will commit it to your git repository (hosted on GitHub). What is interesting about this, is that the user owns the data and the data is easily visible. If someone wanted, they could move the backend to GitLab, or Bitbucket, or whatever[0]. Meanwhile the business logic remains agnostic about where the data ultimately resides. Where it gets interesting though, is that you could run a hosted cloud service that exposes the data and the users have the exact same freedoms.

This is a pipe dream right now. But I enjoy the building and the experimenting with "what if". Again, this isn't a new idea - the internet was fundamentally built on an idea of decentralization (though the realization of that is currently wonky). Software like email was built on a standard interface. Newer software like GitHub or Mastodon touch similar ideas.

Anyway, enough ramblings for now.

[0] - the idea is there, but this is not currently true - I haven't programmed it yet.
