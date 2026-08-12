---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Choosing authentication strengths instead of blanket MFA requirements
description: Where a strength requirement says something a generic MFA grant cannot, and how to introduce one without stranding users mid-rollout.
pubDate: 2026-08-05
categories:
  - Microsoft Entra ID
topics:
  - Authentication
  - Conditional Access
draft: true
---

A generic MFA requirement treats every second factor as equivalent. That is fine until you need a specific class of credential for a specific class of access, at which point the policy has nothing to say.

## Decide what the requirement is protecting

Start from the resource, not the method. Administrative surfaces, finance systems and legacy protocol endpoints each justify a different answer, and writing one requirement across all three produces a policy nobody can explain.

## Introduce it behind report-only

Registration state is the usual blocker: a requirement is only satisfiable by users who already hold a matching credential. Run in report-only long enough to see who does not, and drive registration before enforcement rather than after.

Confirm the current method names and their ordering against Microsoft documentation before writing anything permanent, since both change.
