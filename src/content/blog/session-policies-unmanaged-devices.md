---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Session policies for unmanaged devices that stop short of blocking
description: Read-only access as the middle option between trust and refusal, and the parts of app control that surprise people after it is switched on.
pubDate: 2026-01-14
categories:
  - Microsoft Defender for Cloud Apps
  - Microsoft Entra ID
topics:
  - Conditional Access
  - External Access
draft: true
---

Blocking unmanaged devices outright is the easy policy to write and the hard one to keep. The exceptions arrive within a week, and each is individually reasonable, which is how a block becomes a list of people it does not apply to.

## Decide what "unmanaged" is being used as a proxy for

The device state is rarely the actual concern. The concern is data leaving on a machine nobody can wipe, and that is narrower - it points at download, print and copy rather than at access. Naming the real constraint tends to produce a policy that survives contact with the business.

## Route through app control deliberately

Session control is a proxied session, and the session behaves like one. Downloads can be inspected or blocked, but the trade is a rewritten host and the handful of client behaviours that do not tolerate it. Pilot with the applications people actually live in before the ones that were easy to onboard.

## Expect the read-only session to need an exit

Someone will have a legitimate need to take the file. A policy with no path to that is a policy that gets an exclusion group bolted onto it, so decide up front what the sanctioned route is and make it easier than the workaround.
