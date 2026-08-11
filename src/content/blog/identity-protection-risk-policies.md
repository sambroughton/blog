---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Risk-based policies that remediate rather than merely block
description: Wiring user and sign-in risk into a response that clears itself, instead of a block that turns into a helpdesk queue.
pubDate: 2026-07-21
categories:
  - Entra ID
topics:
  - Identity Protection
  - Conditional Access
draft: true
---

Risk signals are only useful if something acts on them. A policy that blocks on risk and stops there converts every detection into a ticket, which is how risk-based access gets switched off.

## Self-remediation is the point

The value of a risk policy is that a legitimate user can clear their own risk state through a credential challenge or a password change, and an illegitimate one cannot. Blocking removes that difference and leaves an analyst to make the call manually every time.

## Watch what remains unremediated

The population worth reviewing is not the risk detections; it is the accounts still carrying risk days later, because those are the ones where remediation never happened. Report on that set rather than on raw detection volume.
