---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Reviewing OAuth application consent as a standing control
description: Application permissions age badly, nobody owns them, and the review that catches this has to be routine rather than reactive.
pubDate: 2026-03-04
categories:
  - Entra ID
topics:
  - Privileged Access
draft: true
---

Application consent is the one privileged grant that usually has no owner, no review date and no expiry. It was approved once, for a reason that is no longer written down anywhere.

## Rank by what the permission can do

Sort the estate by capability rather than by application count. A small number of grants can read or write broadly across the tenant, and those are the entire review; the rest are noise until the top of the list is clean.

## Ask who owns it, in writing

An application nobody will claim is a candidate for removal. Making ownership an explicit answer converts a vague risk into a decision someone has to make.

## Make it a schedule, not an incident

The value here is entirely in the cadence. A review triggered by an incident finds the grant that caused it; a scheduled one finds the grant that would have.
