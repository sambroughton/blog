---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Scoping an incident in the first hour
description: What to establish before containment, what to leave alone, and the questions that decide whether this is one host or a hundred.
pubDate: 2026-04-15
domain: threat-hunting-incident-response
topics:
  - device-investigation
technologies:
  - microsoft-defender-xdr
draft: true
---

The first hour decides whether the rest of the response is proportionate. Containment applied before scoping is either too narrow to help or wide enough to cause its own outage.

## Three questions, in order

How did this get here, what identity is it operating as, and where else does that identity or that artefact appear. Answering them in that order stops the investigation turning into an indicator sweep before anyone knows what they are sweeping for.

## Preserve before you contain

Some containment actions remove the evidence that would have explained the intrusion. Decide explicitly what you are collecting first, and accept the delay knowingly rather than discovering the loss afterwards.

## Write down the scope you believe you have

State the boundary in a sentence: these hosts, this identity, this window. It is the claim everything later either confirms or breaks, and an unstated boundary quietly expands until the incident has no end.
