---
title: 'Microsoft Sentinel data collection rules: what actually costs you money'
description: Where ingestion spend concentrates, and how transformations and table plans change the bill without losing the detections you rely on.
pubDate: 2026-06-12
categories:
  - Microsoft Sentinel
topics:
  - Data Collection
---

Sentinel spend is dominated by ingestion, and ingestion is dominated by a small number of tables. Before changing anything, find out which.

## Find where the volume actually is

```kql title="Billable ingestion by table, last 30 days"
Usage
| where TimeGenerated > ago(30d)
| where IsBillable == true
| summarize GB = round(sum(Quantity) / 1000, 2) by DataType
| order by GB desc
| take 15
```

The result is usually lopsided. High-volume offenders are typically `CommonSecurityLog`, `Syslog`, `SecurityEvent` and firewall traffic logs. Optimising anything outside the top few tables is effort spent for rounding errors.

## Filter at ingestion, not at query time

A data collection rule can apply a KQL transformation before data is written, so filtered rows are never billed. This is different from filtering in a query, which costs full price and then discards.

```kql title="Transformation to drop informational firewall noise"
source
| where NOT (DeviceVendor == "Contoso" and Activity == "Traffic Allowed")
```

Be deliberate here. A transformation that drops a column your detections join on will break those detections silently, and the data is gone rather than merely hidden.

## Match the table plan to how the data is used

Not every table needs to support full analytics. Data kept for occasional investigation or compliance rather than scheduled rules can often sit in a cheaper tier, at the cost of reduced query features and no support in some rule types. Check that no analytics rule depends on a table before you move its plan.

Verify the specifics against current Microsoft documentation before committing, since tier names, features and pricing all change.
