---
title: Moving detection exclusions out of rule queries and into a watchlist
description: One watchlist as the exception register for every analytics rule, the KQL shape that keeps the lookup fast, and the published limits that decide whether this works for you at all.
pubDate: 2026-08-08
solutions:
  - Microsoft Sentinel
topics:
  - Detection Tuning
  - Analytics Rules
  - Projects
---

Exclusions written into rule bodies rot in a specific way. The service account that was excluded for a migration two years ago is still excluded, nobody remembers why, and finding out means reading the query of every rule that might mention it. Moving them into a watchlist does not make exclusions good, but it makes them countable.

## The shape

One watchlist per exception class, not one per rule. The point is central management: a watchlist can be referenced by several rules, so an analyst adds an exception once rather than editing three queries.

`_GetWatchlist('<alias>')` returns the contents of a watchlist so it can be referenced directly in a rule query.

Source: [Build queries or detection rules with watchlists](https://learn.microsoft.com/azure/sentinel/watchlists-queries)

```kusto title="Rule query with the exception list pulled out"
let allowlist = (_GetWatchlist('ipallowlist') | project IPAddress);
SigninLogs
| where TimeGenerated >= ago(1d)
| where IPAddress !in (allowlist)
```

That is the whole mechanism. Everything below is about making it survive contact with a real workspace.

## Use SearchKey, and know why

When you create a watchlist you nominate one column as the **SearchKey** - the column you expect to join or search on. Projecting `SearchKey` rather than the named column is the documented shape for the inline form:

```kusto title="Inline against the search key"
Heartbeat
| where ComputerIP in (
    (_GetWatchlist('ipwatchlist')
    | project SearchKey)
)
```

For a lookup rather than a filter, `lookup` against the search key is the documented join:

```kusto title="Enriching rather than excluding"
Heartbeat
| lookup kind=leftouter _GetWatchlist('mywatchlist')
  on $left.RemoteIPCountry == $right.SearchKey
```

Source: [Watchlists in Microsoft Sentinel](https://learn.microsoft.com/azure/sentinel/watchlists)

## Read the limits before you commit to this

This is the part that decides whether the project is worth starting, and the numbers are published rather than folklore:

- A maximum of **10 million active watchlist items** across all watchlists in a workspace. Deleted items do not count.
- Data in the `Watchlist` table is retained for **28 days**.
- Watchlists refresh every **12 days**, which updates `TimeGenerated`.
- Local file uploads are capped at **3.8 MB**; Azure Storage uploads at **500 MB**, in preview at time of writing.
- Names and aliases must be 3 to 64 characters, alphanumeric at each end.

Source: [Watchlist limitations](https://learn.microsoft.com/azure/sentinel/watchlists#watchlist-limitations)

Microsoft is explicit that watchlists are for reference data and are not designed for large data volumes, and points at custom logs for anything bigger. An exception register is squarely reference data, so this fits - but a watchlist is the wrong home for anything that grows with your telemetry.

## The refresh interval is the trap

A watchlist refreshing every 12 days and updating `TimeGenerated` interacts badly with a habit most detection engineers have, which is scoping every query with a time filter. Apply a narrow global time range while testing and `_GetWatchlist()` can come back empty or partial, because the rows sit outside the window. The watchlist is fine; the query excluded it.

Microsoft's own troubleshooting guidance for empty results is to confirm the alias, then widen or remove the query-level time scope and re-run. Worth knowing before you spend an afternoon convinced a watchlist failed to upload.

A zero-row result is not proof the watchlist is missing either - a workspace that has hit its daily ingestion cap can produce the same symptom.

Source: [Troubleshoot watchlists during incidents and query issues](https://learn.microsoft.com/azure/sentinel/watchlists#troubleshoot-watchlists-during-incidents-and-query-issues)

## Give every exception an owner and a date

The watchlist is a table, so add the columns that make an exception reviewable: who asked for it, which change or ticket it came from, and when it should be reconsidered. None of that is enforced by anything, and a `ReviewBy` column nobody queries is decoration.

The query that makes it real is the one nobody thinks to write:

```kusto title="Exceptions past their review date"
_GetWatchlist('ipallowlist')
| where todatetime(ReviewBy) < now()
| project IPAddress, Owner, Ticket, ReviewBy
```

Schedule that as its own rule and the exception register maintains itself, which is the only version of this that is better than exclusions in rule bodies. Without it you have moved the rot somewhere more convenient rather than dealt with it.
