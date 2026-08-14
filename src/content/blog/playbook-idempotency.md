---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: Automation playbooks have to survive running twice
description: Replays, retries and duplicate triggers are normal, so every action a playbook takes needs to be safe on the second attempt.
pubDate: 2026-02-17
solutions:
  - Microsoft Sentinel
topics:
  - Analytics Rules
draft: true
---

Any triggered automation will eventually run twice on the same input. Retries, replays and duplicate triggers are ordinary operational events, not edge cases, and a playbook that assumes single execution will do its damage quietly.

## Make the write side idempotent

Derive the identifier for anything the playbook creates from the input rather than generating a new one per run. Two runs on the same alert should converge on the same record instead of producing two.

## Decide what partial failure means

If the third action fails after the first two succeeded, the playbook is in a state somebody has to reason about. Say what that state is and how it is resolved, rather than leaving the answer to whoever finds it.

## Never fan out unbounded

An automation iterating over an unpredictable number of entities against a throttled API will find the throttle. Bound the concurrency deliberately and cap the retry budget.
