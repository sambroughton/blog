---
title: Designing Conditional Access policies for privileged administrator access
description: A policy set for admin roles, the order to deploy it in, and the exclusions you must get right before you enable anything.
pubDate: 2026-07-28
solutions:
  - Microsoft Entra ID
topics:
  - Conditional Access
  - Privileged Access
featured: true
---

Conditional Access for administrators is where a tenant is most often either locked down properly or locked out entirely. The difference is almost always the exclusions, not the grant controls.

## Emergency access first

Before writing a single policy, create emergency access accounts and exclude them from every Conditional Access policy you build. Microsoft's guidance is to hold at least two, cloud-only, excluded from MFA-based policies, and monitored for any sign-in at all. If you skip this step, a policy misconfiguration is unrecoverable without support.

## Deploy in report-only

Every new policy starts in report-only mode. It evaluates on real sign-ins and records what _would_ have happened without enforcing it. Give it a full business cycle, including whatever weekly batch job authenticates as a service account nobody documented.

## Check what report-only actually caught

```kql title="Report-only results for admin sign-ins"
SigninLogs
| where TimeGenerated > ago(7d)
| mv-expand todynamic(ConditionalAccessPolicies)
| extend PolicyName = tostring(ConditionalAccessPolicies.displayName)
| extend Result = tostring(ConditionalAccessPolicies.result)
| where Result startswith "reportOnly"
| summarize Sign_ins = count() by PolicyName, Result, UserPrincipalName
| order by Sign_ins desc
```

Anything showing `reportOnlyFailure` is an account that would have been blocked. Resolve every one before you flip the policy to on.

## Grant controls worth requiring

Require phishing-resistant MFA rather than "any" MFA, since that excludes SMS and voice approval. Require a compliant or hybrid-joined device where the role justifies it, and set an explicit sign-in frequency instead of relying on default session lifetimes.
