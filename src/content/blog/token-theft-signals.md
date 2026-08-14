---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Signals worth watching for stolen session tokens
description: Why a successful sign-in is the wrong place to look, and which properties actually separate a replayed session from a real one.
pubDate: 2026-04-02
solutions:
  - Microsoft Entra ID
  - Microsoft Sentinel
topics:
  - Authentication
  - Identity Protection
series: Identity investigation
draft: true
---

Token replay does not look like a failed authentication, because there is no authentication. It looks like a session continuing, which is why sign-in success and failure counts say nothing about it.

## Look at continuity, not at outcome

The useful comparison is between properties that should stay stable across a session and the properties actually observed: the device it started on, the network it started from, the client it presented as. Divergence within a single session is the signal.

## Accept that some divergence is legitimate

Roaming, split tunnels and corporate egress all produce changes that look like the thing you are hunting. Decide in advance which combinations you will treat as noise, and write that decision next to the query rather than re-deciding it per alert.

## Response is revocation, not a password reset

If the concern is a stolen session, the credential was never the weak point. The response has to invalidate the session itself, and the query is only useful if it hands the analyst enough to do that confidently.
