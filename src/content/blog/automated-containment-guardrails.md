---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Guardrails for automated user and device containment
description: What to automate, what to gate behind a human, and how to make an automated containment action reversible before you enable it.
pubDate: 2026-01-28
solutions:
  - Microsoft Entra ID
topics:
  - Privileged Access
  - Detection Tuning
draft: true
---

Automated containment is the most useful automation in a security operation and the easiest to regret. The deciding factor is not the detection's accuracy; it is whether the action can be undone by someone who did not write it.

## Reversibility first

Before enabling an action, write down how it is reverted, who can revert it, and how long that takes. If the answer involves a specialist who is not on call, the action is not ready to be automatic.

## Exempt the accounts that break everything

Break-glass accounts, service principals that hold the estate together, and the identities the response tooling itself depends on. Containing any of these automatically turns an incident into an outage with no path back in.

## Gate on impact, not on confidence

A high-confidence detection against a critical system still deserves a human. Route by what the action would affect rather than by how sure the rule claims to be.
