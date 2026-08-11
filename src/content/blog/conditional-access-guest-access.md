---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Conditional Access for guests without blocking the collaboration you wanted
description: Separating guest policy from employee policy, and the assumptions about home-tenant controls that do not hold.
pubDate: 2026-03-18
categories:
  - Entra ID
topics:
  - Conditional Access
  - External Access
  - Guest Accounts
draft: true
---

Guest access policy tends to be written as an afterthought to employee policy, which is how organisations end up either trusting another tenant's controls by accident or blocking the collaboration the invitation existed to enable.

## Guests are a separate population

Give them their own policies rather than exceptions inside employee ones. Exceptions accumulate, and an exception written for guests is an exception available to everybody it accidentally matches.

## Do not assume the home tenant's controls

Whether a guest's own tenant satisfied a control, and whether you can rely on that, is a specific configuration question, not a default. Check the current behaviour in Microsoft documentation before designing around it.

## Have an exit

Guest access outlives the project that justified it. Decide up front what expires it, because nothing else will.
