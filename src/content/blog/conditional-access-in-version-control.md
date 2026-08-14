---
title: 'Conditional Access in version control: exporting, diffing and reviewing policy'
description: A scheduled export of every Conditional Access policy into Git, the read-only fields you have to strip before a diff is readable, and what a diff tells you that the audit log does not.
pubDate: 2026-08-11
solutions:
  - Microsoft Entra ID
topics:
  - Conditional Access
  - Projects
---

The audit log answers "who changed something, and when". It does not answer "what does the policy set look like today, and how is that different from the version we signed off". Those are the questions that come up in a review, and the cheapest way to answer both is to export the whole policy set on a schedule and commit it.

This is a read-only project. Nothing here writes back to the tenant, which is deliberate: the value is in the record, and a pipeline that can rewrite Conditional Access is a much bigger thing to secure than one that can only read it.

## Export the whole set, not the changed ones

`GET /identity/conditionalAccess/policies` returns every policy in the tenant. Least privilege is `Policy.Read.All`, as an application permission for an unattended run.

Source: [conditionalAccessRoot: List policies](https://learn.microsoft.com/graph/api/conditionalaccessroot-list-policies?view=graph-rest-1.0)

```powershell title="Export-CaPolicy.ps1"
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$OutputPath
)

Connect-MgGraph -Scopes 'Policy.Read.All' -NoWelcome

$policies = Get-MgIdentityConditionalAccessPolicy -All |
    Sort-Object -Property DisplayName

foreach ($policy in $policies) {
    $name = $policy.DisplayName -replace '[^\w\-]', '_'
    $file = Join-Path -Path $OutputPath -ChildPath "$name.json"

    $policy |
        Select-Object -Property * -ExcludeProperty Id, CreatedDateTime, ModifiedDateTime |
        ConvertTo-Json -Depth 20 |
        Set-Content -Path $file -Encoding utf8
}
```

Exporting everything every run is what makes a deletion visible. An incremental export only ever adds files, so a policy that was removed from the tenant sits in the repository looking current.

## Strip the read-only fields or every run is a diff

`id`, `createdDateTime` and `modifiedDateTime` are documented read-only on `conditionalAccessPolicy`. Leaving `modifiedDateTime` in means any unrelated touch to a policy produces a commit that says nothing, and once a few of those land nobody reads the diffs any more.

Source: [conditionalAccessPolicy resource type](https://learn.microsoft.com/graph/api/resources/conditionalaccesspolicy?view=graph-rest-1.0)

Sorting matters for the same reason. `Sort-Object DisplayName` on the collection, and consistent ordering inside each file, are what keep a diff to the fields that actually moved. Unstable ordering produces a large diff for a small change, which is the same failure as a noisy timestamp.

## Filename by display name, and what that costs

Naming each file after the policy rather than its `id` is what makes the repository readable: a pull request lists the policies that changed, by name, before anyone opens a file.

The cost is that renaming a policy shows up as a delete plus an add rather than as a rename, and the two are only obviously the same policy if you look inside. Keying the filename on `id` fixes that and makes every other diff worse, because the file list becomes GUIDs. Display name is the better trade for review, which is what this exists for, and the `id` is worth keeping in a separate manifest file if you need to correlate back to the tenant.

## What the diff catches

Report-only is the case worth naming. `state` has three values - `enabled`, `disabled` and `enabledForReportingButNotEnforced` - and the last one is a single JSON field away from the first. A policy that was quietly moved back to report-only during an incident and never moved forward again looks completely healthy in the portal's policy list, and shows up in a diff immediately.

Exclusions are the other one. Adding a group to a policy's exclusion list is a small edit that changes who the control applies to, and it reads as one line in a diff against a named group.

## Keep the audit log as well

The two are not substitutes, and the honest version of this project keeps both. The audit log records who made the change and when, with old and new values under `TargetResources` > `modifiedProperties`, filtered by service `Conditional Access`. Audit data is kept for 30 days by default, which is the real argument for the export: the Git history is the part that survives past a month without a diagnostic setting shipping the logs somewhere.

Source: [Use audit logs to troubleshoot Conditional Access policy changes](https://learn.microsoft.com/entra/identity/conditional-access/troubleshoot-policy-changes-audit-log)

So the export answers "what is true now, and what changed since the review", and the audit log answers "who did it". Run the export on a schedule, commit only when the tree is dirty, and let the pull request be the review record.
