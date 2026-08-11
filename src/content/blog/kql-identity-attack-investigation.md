---
title: Advanced KQL techniques for investigating identity-based attacks in Entra ID sign-in logs
description: Queries for password spray, failed-then-succeeded sequences, and unfamiliar sign-in properties, with the joins that make them usable.
pubDate: 2026-07-14
domain: siem-detection-engineering
topics:
  - kql
technologies:
  - microsoft-sentinel
  - microsoft-entra-id
series: Identity investigation
featured: true
---

`SigninLogs` is verbose enough that the useful signal is usually a shape across rows, not a single row. These are the shapes worth querying for.

## Password spray: one source, many accounts

Spray is characterised by breadth rather than depth. A single IP failing once against many distinct accounts looks nothing like one account being brute forced.

```kql title="Spray candidates by source address"
SigninLogs
| where TimeGenerated > ago(1d)
| where ResultType != 0
| summarize
    TargetedAccounts = dcount(UserPrincipalName),
    Attempts = count(),
    Countries = make_set(Location, 10)
    by IPAddress
| where TargetedAccounts >= 10
| extend AttemptsPerAccount = round(todouble(Attempts) / TargetedAccounts, 2)
| order by TargetedAccounts desc
```

A low `AttemptsPerAccount` alongside a high `TargetedAccounts` is the tell. Tune the threshold to your tenant size rather than copying the 10 above.

## Failure followed by success

The sequence that matters most is a run of failures that then succeeds from the same source.

```kql title="Failed then succeeded from one address"
let window = 1h;
let failures =
    SigninLogs
    | where TimeGenerated > ago(7d) and ResultType != 0
    | project FailTime = TimeGenerated, UserPrincipalName, IPAddress;
let successes =
    SigninLogs
    | where TimeGenerated > ago(7d) and ResultType == 0
    | project SuccessTime = TimeGenerated, UserPrincipalName, IPAddress, AppDisplayName;
failures
| join kind=inner successes on UserPrincipalName, IPAddress
| where SuccessTime between (FailTime .. FailTime + window)
| summarize Failures = count(), FirstFail = min(FailTime), Success = min(SuccessTime)
    by UserPrincipalName, IPAddress, AppDisplayName
| where Failures >= 5
| order by Failures desc
```

## Narrow before you join

Both queries project only the columns they need before joining. On a busy tenant, joining full `SigninLogs` rows is the difference between a query that returns and one that times out.
