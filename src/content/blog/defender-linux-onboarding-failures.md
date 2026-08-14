---
title: 'Defender for Endpoint onboarding on Linux servers: the parts that fail'
description: Diagnosing onboarding that reports success but leaves the agent unhealthy, from audit framework conflicts to blocked egress.
pubDate: 2026-05-20
solutions:
  - Microsoft Defender for Endpoint
topics:
  - Device Onboarding
---

Linux onboarding tends to fail quietly. The script exits zero, the device appears in the portal, and the agent is not actually protecting anything. Start from the agent's own view rather than the portal's.

## Ask the agent, not the console

```bash title="Baseline health check"
mdatp health
mdatp health --field healthy
mdatp health --field definitions_status
mdatp health --field real_time_protection_enabled
```

`healthy` returning `false` with everything else looking reasonable usually means definitions have never successfully updated, which is a connectivity problem rather than an onboarding one.

## The audit framework is the usual culprit

Defender consumes audit events, and on most distributions `auditd` is already owned by something else: a hardening baseline, a compliance agent, another EDR. Two consumers fighting over the same subsystem produces missing telemetry rather than an error.

Check what rules are loaded and who wrote them before assuming the file is yours to change:

```bash title="Inspect loaded audit rules"
sudo auditctl -l
sudo systemctl status auditd
```

If a configuration management tool owns that file, fix it there. A local edit will be reverted on the next run and the failure will reappear without an obvious cause.

## Confirm egress properly

Onboarding needs outbound access to the service endpoints for your region, and a proxy that intercepts TLS will break it. Test the actual endpoints rather than general internet access:

```bash title="Connectivity test"
mdatp connectivity test
```

General egress working tells you nothing here, because the failure is normally a specific hostname or an inspecting proxy rather than the network being down.

## Check the distribution is supported

Support is per distribution _and_ per version, and an unsupported minor version can install cleanly then behave unpredictably. Confirm against current Microsoft documentation before troubleshooting further, since the supported list changes.
