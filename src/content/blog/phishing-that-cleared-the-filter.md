---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Investigating a phishing campaign that cleared your mail filters
description: Working backwards from the one report that arrived, establishing who else received it, and deciding what is worth purging after the fact.
pubDate: 2026-02-04
categories:
  - Defender for Office 365
topics:
  - Incident Investigation
  - Detection Tuning
draft: true
---

The reported message is rarely the first one delivered. It is the first one somebody bothered to tell you about, which is a different thing, and the gap between those two facts is most of the investigation.

## Establish the delivery set before anything else

Start from the campaign rather than the message. Sender, subject and payload URL each give a different slice of the same send, and the union of them is closer to the real delivery set than any one of them is. Scope first, then act: a purge issued against a partial set is a purge you have to run again.

## Read the verdict, not just the outcome

A message that landed can have landed for several unrelated reasons - the verdict was clean, the verdict was overridden by a policy exception, or the mail bypassed filtering entirely. These need different fixes, and the delivery outcome on its own does not distinguish them.

## Separate the fix from the clean-up

Removing the delivered mail closes this campaign. It does nothing about the next one from the same infrastructure. Treat the retro-purge and the policy change as two pieces of work, and be honest about which one you actually finished before you close the incident.
