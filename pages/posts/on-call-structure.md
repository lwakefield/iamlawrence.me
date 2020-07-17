title: An on-call starting point
published: 2019/02/01

---

This doc is intended as a starting point for building an on-call rotation.

---

Engineers that are "On Call" are responsible for maintaining the health of all
production services.

Roster
======

There shall be two engineers (for redundancy) on-call at any one time.

One engineer is considered the "primary", while the other engineer is
considered the "secondary". An example roster looks like this:

```
Alice: | primary   | secondary |           |           | primary   |
Bob:   |           | primary   | secondary |           |           |
Carol: |           |           | primary   | secondary |           |
Dan:   | secondary |           |           | primary   | secondary |
```

Responsibilities
================

Both the primary and the secondary engineer must be available and unimpaired
for responding to any incidents that occur. This means that the on-call
engineer must have access to a laptop and internet during the rotation.

Most incidents are triggered by PagerDuty. The primary will receive an alert
immediately during an incident. If the primary does not respond within 5m, the
secondary will also receive an alert.

Both the primary and secondary are responsible for making sure that PagerDuty
alerts are set up correctly and making sure that they are reachable via other
communication channels.

Uncommon, but possibly reports will come in from other sources - so it is wise
to keep an eye on Slack for anything unusual.

During an incident:
1. acknowledge the incident
2. grade the severity
3. identify the cause
4. fix the problem
5. resolve the incident
6. update the on-call journal

What to do during an incident
=============================

Breathe!

Although you are the first responder, it is important to understand that you
are not alone.

Your job is to triage the incident - take the path of least resistance to
minimize the impact of the incident. If a couple of servers are experiencing
periodic hiccoughs, you don't necessarily need start bug hunting, simply
increasing the pool size, or recycling the servers might be enough.

Make sure you check the playbook and the on-call journal to see if the incident
is a known problem with a known solution.

Occasionally, you will run into an issue which is not easily resolved and
requires some further investigation. If this is the case, start by looking at
monitoring services to get a high level understanding of the issue. If you
think you can resolve the issue, great. If you are unsure whether you can solve
the issue, make sure to timebox yourself, which leads to...

If you are unable to resolve the issue, no worries - you aren't alone. If you
are the primary - call the secondary for assistance and vice-versa if you are
the secondary. Failing that, call another engineer for assistance.

If the issue is less urgent - ping in @eng in slack. There are likely other
engineers hanging out who can help.

The On-call Journal
===================

The on-call journal is a tool used to record all production incidents. This is
helpful when reviewing the stability of our production environment and
prioritizing which issues should be pro-actively resolved. Additionally, it is
helpful for engineers entering their shift to understand which issues to
expect.

An entry to the journal should include timestamps (in UTC), who was involved, a
description of the issue and resolution.

Larger incidents should have an additional post-mortem.

FAQ
===

**Q: What if I have plans that interfere for a few hours of on-call?**

A: It's your responsibility to find another engineer to cover that time for
you. You can add overrides into PagerDuty.

**Q: What if I have plans that interfere with a shift of on-call?**

A: It's your responsibility to find another engineer who will be willing to
trade shifts with you.

**Q: What if I am sick and don't feel like I can respond appropriately?**

A: Get someone to cover.

**Q: Does this mean I need to abstain from over-indulging?**

A: Yes.

**Q: Do I need to carry my laptop with me everywhere?**

A: Yes.

**Q: What if I am caught without internet?**

A: We will provide you with a wireless hotspot.
