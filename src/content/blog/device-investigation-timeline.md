---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Reading a device timeline when the alert tells you almost nothing
description: Working outwards from a single process event to a defensible account of what ran, what it touched and what it talked to.
pubDate: 2026-06-05
domain: endpoint-security
topics:
  - device-investigation
  - advanced-hunting
technologies:
  - microsoft-defender-xdr
  - microsoft-defender-for-endpoint
draft: true
---

Most device investigations start from one event with no context: a process, a time, a device name. The work is turning that into a sequence you can defend in writing.

## Anchor on the process tree first

Establish what launched the thing that alerted, and what that thing launched in turn. Parentage answers the question that matters early on, which is whether this was user-initiated, scheduled, or the tail of something that arrived from elsewhere.

## Then widen by device, not by indicator

Pivoting on an indicator finds other copies of the same thing. Pivoting on the device finds the rest of the story on that host, which is usually where the interesting part is. Do the device pass before the fleet-wide sweep.

## Write the timeline as you go

A timeline assembled at the end is a reconstruction from memory. One assembled while querying is evidence, and it makes the gaps obvious while you can still fill them.
