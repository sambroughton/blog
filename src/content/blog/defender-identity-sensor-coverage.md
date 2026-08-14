---
# Sample entry, added to exercise pagination and the taxonomy pages. Draft, so it
# is visible in `astro dev` and excluded from production builds.
title: 'Defender for Identity: coverage gaps you only notice during an incident'
description: Sensor placement, unmonitored domain controllers and the quiet assumptions that make identity telemetry look complete when it is not.
pubDate: 2026-07-07
solutions:
  - Microsoft Defender for Identity
topics:
  - Identity Protection
  - Device Onboarding
draft: true
---

Identity telemetry fails in the same way backups do: it looks fine until the one time you need it, and the gap is always the part nobody enumerated.

## Enumerate controllers from the directory, not from the deployment sheet

The list of domain controllers that should carry a sensor comes from the directory itself. Any list maintained by hand drifts, and it drifts specifically towards omitting the controllers built most recently.

## Confirm the sensor is reporting, not merely installed

Installed and healthy are different states. Treat a sensor that has not reported inside its expected window as absent, and alert on that condition rather than discovering it while scoping an incident.
