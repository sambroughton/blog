---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Hunting lateral movement across identity and endpoint telemetry
description: Correlating authentication patterns with process and network activity, and the joins that make a two-source hunt tractable.
pubDate: 2026-04-29
solutions:
  - Microsoft Sentinel
topics:
  - Advanced Hunting
  - KQL
series: Identity investigation
draft: true
---

Lateral movement is difficult to hunt in one data source because it is, definitionally, a relationship between two hosts and an identity. Endpoint telemetry sees the halves; identity telemetry sees the join.

## Start from the pattern, not the tool

Define what you expect the movement to look like as a shape across rows: an account authenticating to hosts it has no history with, in a window shorter than a person would take. Tool-specific indicators come after the shape, not instead of it.

## Establish a baseline before alerting on novelty

"First time this account touched this host" is only interesting against a known history. Decide how far back the baseline reaches and say so in the query, because a short baseline makes everything look novel.

## Keep the hunt reproducible

A hunt that found something once should be runnable again unchanged. Parameterise the time range and the scope, and keep the query where someone else can run it.
