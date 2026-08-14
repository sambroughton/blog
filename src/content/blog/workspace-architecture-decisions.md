---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Workspace architecture decisions you cannot easily reverse
description: Regions, tenancy boundaries and retention are settled early and inherited forever, so they deserve the reasoning written down.
pubDate: 2025-11-19
solutions:
  - Microsoft Sentinel
topics:
  - Data Collection
draft: true
---

Most SIEM design decisions can be revisited. A handful cannot, or can only be revisited by rebuilding and re-ingesting, and those are worth more deliberation than they usually get.

## Know which choices are structural

Where data lands, which boundary it sits inside, and how long it is kept all shape cost, access and the questions you can still answer next year. These are architecture; table plans and rule thresholds are configuration.

## Design for the access model you have

A single collection point is simpler to query and harder to delegate. Multiple points delegate cleanly and complicate every cross-cutting query. The right answer follows from who needs to see what, not from tidiness.

## Record the decision and its date

Constraints change. A decision with its reasoning and date attached can be re-examined honestly later; one without becomes folklore that nobody feels able to overturn.
