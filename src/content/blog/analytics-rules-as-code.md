---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Treating analytics rules as code, including the parts that resist it
description: Version control, review and promotion for detection logic, and an honest account of what portal-authored rules cost you later.
pubDate: 2026-05-12
domain: siem-detection-engineering
topics:
  - analytics-rules
  - detection-tuning
technologies:
  - microsoft-sentinel
draft: true
---

Detection logic authored in a portal has no history, no reviewer and no way to answer why a threshold is what it is. That is tolerable for one rule and unmanageable for a hundred.

## The minimum useful version control

Rule definitions live in a repository, changes arrive by review, and the deployed state is reconciled against the repository rather than assumed to match it. Anything less and the portal remains the source of truth no matter what the repository says.

## Record the reasoning next to the logic

The valuable part of a tuned rule is not its query; it is the sentence explaining why the threshold is set where it is and what was ruled out. Keep that with the definition, because it is the thing the next engineer needs and the only thing a portal never captures.

## Expect exceptions

Some rule types and some content packs do not round-trip cleanly. Document which ones you manage by hand instead of pretending coverage is complete.
