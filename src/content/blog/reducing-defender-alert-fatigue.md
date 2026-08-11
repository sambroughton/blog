---
title: Reducing alert fatigue in Microsoft Defender without hiding real threats
description: Why suppression rules are the wrong first instinct, and what to do instead when the queue is unmanageable.
pubDate: 2026-06-30
domain: endpoint-security
topics:
  - detection-tuning
technologies:
  - microsoft-defender-xdr
featured: true
---

An unmanageable alert queue gets treated as a volume problem, so the first reflex is a suppression rule. That reduces the number visibly and the risk invisibly, which is the worst combination available.

## Suppression hides, tuning explains

A suppression rule says "do not show me this". It does not say why the alert fired, and it keeps applying long after the thing that justified it has changed. The account that legitimately ran the script has left; the rule stays.

Before suppressing anything, work out which of these it is:

- **Genuinely benign, permanently.** A signed internal tool doing what it is built to do. This is the only case that deserves suppression, scoped as narrowly as the rule language allows.
- **Benign now, because of a temporary exception.** A migration, a pilot, a contractor. This needs an expiry date and an owner, not a permanent rule.
- **Real, but low value on its own.** Better handled by correlation than by hiding. Defender XDR already groups related alerts into incidents; the fix is usually to work the incident rather than the alerts.
- **Noisy because the underlying configuration is wrong.** The alert is doing its job and pointing at drift.

That last category is the one suppression damages most, because the alert was the only thing telling you about the misconfiguration.

## Measure the queue before and after

Track how many alerts a change removes and, separately, how many incidents it touches. A rule that removes 400 alerts across 3 incidents is fine. A rule that removes 400 alerts across 180 incidents is deleting signal.

## Scope every rule as tightly as it will go

Match on the specific file path, the specific signer, the specific device group. A rule matching only a process name will eventually match something you did not intend, and nothing will tell you when it does.
