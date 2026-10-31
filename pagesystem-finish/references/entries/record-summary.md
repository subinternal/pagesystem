# Record summary (record-summary)

Kind: component. One record at a glance: its name and status first, then labeled facts with their context.

Task: Read the state of one thing.

Elements: [text](text.md), [badge](badge.md).

Category: data.

## content

- A record name with its type and a status badge
- Named facts with values and units
- A muted line of context under a value where it helps (lead, time left, who updated it)
- Source or sample label

## states

- ready
- missing: say not provided
- stale: show age

## responsive

- Facts sit on one row when they fit and wrap in order, never reordered.

## checks

- Every value has a label and relevant units.
- Status reads in words, not only color.
- Context lines are quieter than values and never carry the only copy of a fact.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Record summary</h1><p class="ps-note">One record at a glance: what it is and its status first, then its key facts with their units and context.</p></header><section class="ps-panel ps-record" aria-labelledby="record-title"><header class="ps-record-head"><div><h2 id="record-title">Pricing page update</h2><p>Project · Website</p></div><span class="ps-badge">In review</span></header><dl class="ps-facts"><div><dt>Owner</dt><dd>Web team<small>Lead: Maya Chen</small></dd></div><div><dt>Due</dt><dd><time datetime="2026-11-14">November 14, 2026</time><small>In 16 days</small></dd></div><div><dt>Tasks</dt><dd>6 of 9 done<span class="ps-fact-meter" aria-hidden="true"><i style="--share:66.7%"></i></span></dd></div><div><dt>Last updated</dt><dd><time datetime="2026-10-28">October 28, 2026</time><small>By Maya Chen</small></dd></div></dl></section><p class="ps-note">Sample record. Replace with your own source data.</p></main>
```

## Variant: Incomplete

A record with values the source did not provide, shown as such, and a last sync old enough to be marked stale.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Incomplete record</h1><p class="ps-note">Missing values say so plainly, and an old sync shows its age.</p></header>
<dl class="ps-facts ps-panel"><div><dt>Project</dt><dd>Website refresh</dd></div><div><dt>Owner</dt><dd class="ps-fact-missing">Not provided</dd></div><div><dt>State</dt><dd><span class="ps-badge">Proposed</span></dd></div><div><dt>Budget</dt><dd class="ps-fact-missing">Not provided</dd></div><div><dt>Launch target</dt><dd>Nov 18, 2026</dd></div><div><dt>Last synced</dt><dd class="ps-fact-aged"><time datetime="2026-10-19">9 days ago</time><span class="ps-badge">Stale</span></dd></div></dl>
<p class="ps-note">Sample record. Two fields were not provided by the source, and values may have changed since the last sync.</p></main>
```

## Variant: Side panel

Label and value share one row so a longer account record fits a narrow side column.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Record summary in a side panel</h1><p class="ps-note">Label and value share one row so a long record fits a narrow column.</p></header>
<section class="ps-panel ps-record-aside" aria-labelledby="account-title"><header><h2 id="account-title">Northwind Studio</h2><p>Sample customer account</p></header>
<dl class="ps-facts ps-facts-rows"><div><dt>Plan</dt><dd>Team, annual</dd></div><div><dt>Seats</dt><dd>18 of 25 used</dd></div><div><dt>Monthly cost</dt><dd>$540.00</dd></div><div><dt>Data region</dt><dd>EU, Frankfurt</dd></div><div><dt>Renews</dt><dd>Mar 3, 2027</dd></div><div><dt>Status</dt><dd><span class="ps-badge ps-badge-good">Active</span></dd></div><div><dt>Account ID</dt><dd class="ps-id">acct_2Q8fK41m</dd></div></dl></section></main>
```

## Variant: With sources

Each value names the source it came from and the date it was captured, for records assembled from several inputs.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Record summary with sources</h1><p class="ps-note">Each value names where it came from and when, for records assembled from several inputs.</p></header>
<dl class="ps-facts ps-facts-pair ps-panel"><div><dt>Data residency</dt><dd class="ps-fact-sourced">EU only<span class="ps-fact-source">Vendor questionnaire, Oct 2</span></dd></div><div><dt>SOC 2 report</dt><dd class="ps-fact-sourced">Type II, valid to Jun 30, 2027<span class="ps-fact-source">Uploaded report, Sep 14</span></dd></div><div><dt>Subprocessors</dt><dd class="ps-fact-sourced">14<span class="ps-fact-source">Public trust page, checked Oct 21</span></dd></div><div><dt>Encryption at rest</dt><dd class="ps-fact-sourced">AES-256<span class="ps-fact-source">Vendor questionnaire, Oct 2</span></dd></div></dl>
<p class="ps-note">Sample vendor review. Replace with your own source data.</p></main>
```
