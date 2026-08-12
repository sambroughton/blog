---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Designing an XDR role model that survives an audit
description: Mapping analyst work to least-privilege roles, and why the exceptions are where every role model actually fails.
pubDate: 2025-12-10
categories:
  - Microsoft Entra ID
topics:
  - Privileged Access
draft: true
---

Role models are usually designed around job titles and then quietly undone by the first task a title cannot perform. The exception granted that afternoon is the one an audit finds two years later.

## Start from tasks, not titles

Enumerate what analysts actually do, including the response actions, then group those into the smallest set of roles that covers them. Titles map onto roles afterwards; designing in the other direction produces roles nobody fits.

## Write the escalation path down

There will be work that needs more privilege than the standing role holds. Decide in advance how that is requested, time-bound and recorded, because the alternative is a permanent grant made under time pressure.

## Review against what is used

Compare granted privilege against exercised privilege periodically. A role nobody exercises is either wrong or unnecessary, and both are worth knowing before someone else points it out.
