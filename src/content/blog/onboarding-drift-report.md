---
title: A weekly report for devices that are onboarded but not reporting
description: Reconciling onboarding status against sensor health in advanced hunting, why a device can be both onboarded and silent, and turning the gap into a list somebody actually works.
pubDate: 2026-08-13
solutions:
  - Microsoft Defender for Endpoint
topics:
  - Device Onboarding
  - Advanced Hunting
  - Projects
---

Onboarding coverage is usually reported as a percentage, and the percentage is usually wrong in the same direction: a device counts as onboarded the moment it has reported once, and nothing in that number says it is still reporting. The gap between "onboarded" and "healthy" is where the actual coverage problem lives, and it is two columns apart in `DeviceInfo`.

## The two columns are answering different questions

`OnboardingStatus` says whether the device has the agent and is reporting to the service. `SensorHealthState` says whether that agent is working correctly, and only applies to onboarded devices.

The documented values:

- **OnboardingStatus**: `Onboarded`, `Can be onboarded`, `Unsupported`, `Insufficient info`
- **SensorHealthState**: `Active`, `Inactive`, `No sensor data`, `Impaired communications`, `Misconfigured`

In the portal filter, `Impaired communications` and `No sensor data` appear as sub-values under `Misconfigured`. All three are unhealthy states that need investigation, which is worth knowing before you write a query that treats `Misconfigured` as the only bad one.

Source: [Device inventory field reference](https://learn.microsoft.com/defender-endpoint/device-inventory-field-reference)

`Onboarded` plus anything other than `Active` is the population this report exists for. Those devices are inside your coverage number and outside your coverage.

## Take the latest row per device

`DeviceInfo` is updated continuously and every update carries the full current device record, so a naive query counts the same device many times over its reporting window. Collapse to the newest row first.

Microsoft's own sample query for the latest state of a device uses `arg_max` over ingestion time:

```kusto title="Latest state per device"
DeviceInfo
| extend IngestionTime = ingestion_time()
| where isnotempty(OSPlatform)
| summarize arg_max(IngestionTime, *) by DeviceId
```

Source: [DeviceInfo table](https://learn.microsoft.com/defender-xdr/advanced-hunting-deviceinfo-table)

## The report

```kusto title="Onboarded but not reporting"
let window = 30d;
DeviceInfo
| where Timestamp > ago(window)
| extend IngestionTime = ingestion_time()
| where isnotempty(OSPlatform)
| summarize arg_max(IngestionTime, *) by DeviceId
| where OnboardingStatus == "Onboarded"
| where SensorHealthState != "Active"
| project
    DeviceName,
    DeviceId,
    OSPlatform,
    OSVersion,
    SensorHealthState,
    LastSeen = Timestamp,
    MachineGroup,
    IsInternetFacing
| order by SensorHealthState asc, LastSeen asc
```

`MachineGroup` is in the projection because it is what decides who owns the remediation - machine groups drive role-based access to the device - and a report nobody owns is a report nobody works. `IsInternetFacing` is there to sort the list by consequence rather than by count.

## Read the states as different problems

They are not one bucket, and treating them as one produces a list that gets ignored:

- **Inactive** means the device stopped communicating, typically for seven or more days. Most of these are decommissioned machines nobody offboarded, which is a hygiene problem rather than a security one. It is also the state most likely to be genuinely fine.
- **No sensor data** means the device has never sent anything. On a recently onboarded machine that is expected for a while; on one that onboarded a month ago it is a failed onboarding that reported success.
- **Impaired communications** means it is talking to the service intermittently. Check proxy settings and firewall rules against the service URLs before you touch the agent.
- **Misconfigured** covers partial or improper configuration - missing prerequisites, proxy settings, an outdated sensor.

Source: [Fix unhealthy sensors](https://learn.microsoft.com/defender-endpoint/fix-unhealthy-sensors)

The one that matters most is the second. A device with `Onboarded` and `No sensor data` is the exact failure the coverage percentage hides, because it counted as a success at the moment it was least likely to be one.

## Make it arrive somewhere

Run it weekly rather than daily. Sensor health moves on a scale of days - `Inactive` is defined against roughly a week of silence - so a daily report is the same list five times, and a list that repeats is a list that gets filtered to a folder.

Send it to whoever owns the machine groups rather than to the security team, since almost every fix here is a build, network or decommissioning problem rather than a detection one. Include last-seen and the state, drop the device IDs from the human-readable version, and keep the full output where it can be diffed week to week. The trend is the number worth reporting upwards - not how many devices are unhealthy, but whether the same ones are unhealthy as last month.
