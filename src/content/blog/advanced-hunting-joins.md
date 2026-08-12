---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Joins in advanced hunting that stay fast as the time range grows
description: Reducing before joining, choosing the smaller side deliberately, and why a working query still gets slower every month you leave it alone.
pubDate: 2026-05-28
categories:
  - Microsoft Defender for Endpoint
topics:
  - Advanced Hunting
  - KQL
draft: true
---

A hunting query that runs in seconds over a day and times out over a month is usually not a query about too much data. It is a query that joins first and filters afterwards.

## Reduce both sides before the join

Project only the columns the join and the output need, and apply every time and scope filter above the join rather than below it. The cost of a join scales with what you hand it, and most queries hand it entire tables.

## Be deliberate about which side is which

Join order is not cosmetic. Put the narrower, more selective set where the query engine can use it to eliminate work early, and state in a comment why that side is the small one, because the assumption ages.

## Re-check queries you rely on

Saved queries inherit the growth of the tables underneath them. A query written when a table was small can quietly become the slowest thing in a scheduled workload without anybody editing it.
