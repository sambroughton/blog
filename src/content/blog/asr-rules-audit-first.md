---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Rolling out attack surface reduction rules without breaking line-of-business apps
description: Audit mode as a measurement exercise, per-rule exclusions over global ones, and the order that keeps the rollout reversible.
pubDate: 2026-06-24
solutions:
  - Microsoft Defender for Endpoint
topics:
  - Attack Surface Reduction
  - Endpoint Hardening
draft: true
---

Attack surface reduction rules are cheap to enable and expensive to enable carelessly. The failure mode is not a security incident; it is a business application that stops working on a Monday for reasons nobody connects to last week's policy change.

## Audit is a measurement phase, not a formality

Every rule goes to audit first, and audit runs long enough to cover a full business cycle, including month-end. What you are looking for is which rules generate events at all, and whether those events belong to software the business depends on.

## Prefer narrow exclusions to global ones

An exclusion applied to a single rule keeps the rest of the rule set intact. A global exclusion silently widens the hole across every rule, and its blast radius is invisible at the point you write it.

## Enable in tranches

Move rules to block a few at a time, with a known rollback and a stated observation window between tranches. A single change everywhere leaves nothing to correlate a regression against.
