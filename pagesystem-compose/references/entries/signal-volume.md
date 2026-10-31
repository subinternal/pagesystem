# Signal volume (signal-volume)

Kind: component. Explore event volume by source and time bucket.

Task: Identify changes in event volume and inspect the underlying counts.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: data.

Native behavior: signal-volume. It needs pagesystem.js (see ../implementation.md).

## content

- Clearly labeled synthetic data
- Selected scope and period
- Exact values and explanatory labels
- Events in view with a week-on-week change, and peak and escalated counts beside it

## states

- all sources
- filtered sources
- no sources
- daily
- weekly
- selected bucket

## responsive

- Controls wrap without reducing editable text size.
- Plots remain supplementary to native inspection controls and exact values.
- Data tables scroll in a named local region.

## checks

- Grouping preserves totals across days and weeks.
- No selected sources produces a useful empty state.
- Range inspection works by keyboard; the data table contains exact values.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Signal volume</h1><p class="ps-note">Explore a shared event history by source and period.</p></header><section class="ps-instrument" data-ps-signal-volume aria-label="Signal volume sample">
<header class="ps-instrument-header"><div><h2>Signal volume</h2><p>Sample workspace · October 1–14</p></div><label class="ps-compact-field">Group by<select class="ps-input" data-volume-period><option value="day">Day</option><option value="week">Week</option></select></label></header>
<div class="ps-instrument-body"><div class="ps-data-lead"><div class="ps-data-figure"><p class="ps-data-caption">Events in view</p><div class="ps-metric-heading"><strong data-volume-total>—</strong><span class="ps-delta" data-volume-delta hidden></span><span data-volume-base></span></div></div><dl class="ps-metrics"><div><dt>Peak</dt><dd><span data-volume-peak>—</span><span class="ps-data-note" data-volume-peak-date></span></dd></div><div><dt>Escalated</dt><dd><span data-volume-escalated>—</span></dd></div></dl></div>
<fieldset class="ps-series-options"><legend>Sources</legend><label class="ps-source-identity"><input type="checkbox" value="identity" checked><i></i>Identity</label><label class="ps-source-endpoint"><input type="checkbox" value="endpoint" checked><i></i>Endpoint</label><label class="ps-source-cloud"><input type="checkbox" value="cloud" checked><i></i>Cloud</label><label class="ps-source-email"><input type="checkbox" value="email" checked><i></i>Email</label><label class="ps-source-network"><input type="checkbox" value="network" checked><i></i>Network</label><label class="ps-source-saas"><input type="checkbox" value="saas" checked><i></i>SaaS</label></fieldset>
<div class="ps-volume-plot" data-volume-plot role="img" aria-label="Stacked event volume. Use the inspect control or data table for exact values."></div><p class="ps-note" data-volume-empty hidden>No sources selected. Select a source to see its events.</p>
<label class="ps-inspect-control">Inspect period<input type="range" min="0" max="13" value="11" data-volume-inspect><output data-volume-date>Oct 12</output></label>
<div class="ps-data-readout" data-volume-readout aria-live="polite"></div><details class="ps-data-details"><summary>View data table</summary><div class="ps-table-region" tabindex="0" aria-label="Event values"><table class="ps-table"><caption>Events for selected sources</caption><thead><tr><th scope="col">Period</th><th scope="col">Events</th><th scope="col">Escalated</th></tr></thead><tbody data-volume-table></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Change compares the last week in view with the first</span><span>Sample data</span></footer></section></main>
```

## Variant: Filtered sources

Only identity and email are selected for one investigation; total, peak and table count only those sources.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Signal volume, filtered sources</h1><p class="ps-note">Two sources selected to follow one investigation; totals, peak and table count only those.</p></header><section class="ps-instrument" data-ps-signal-volume aria-label="Signal volume filtered sample">
<header class="ps-instrument-header"><div><h2>Signal volume</h2><p>Sample workspace · Identity and email · Oct&nbsp;1–14</p></div><label class="ps-compact-field">Group by<select class="ps-input" data-volume-period><option value="day">Day</option><option value="week">Week</option></select></label></header>
<div class="ps-instrument-body"><div class="ps-data-lead"><div class="ps-data-figure"><p class="ps-data-caption">Events in view</p><div class="ps-metric-heading"><strong data-volume-total>—</strong><span class="ps-delta" data-volume-delta hidden></span><span data-volume-base></span></div></div><dl class="ps-metrics"><div><dt>Peak</dt><dd><span data-volume-peak>—</span><span class="ps-data-note" data-volume-peak-date></span></dd></div><div><dt>Escalated</dt><dd><span data-volume-escalated>—</span></dd></div></dl></div>
<fieldset class="ps-series-options"><legend>Sources</legend><label class="ps-source-identity"><input type="checkbox" value="identity" checked><i></i>Identity</label><label class="ps-source-endpoint"><input type="checkbox" value="endpoint"><i></i>Endpoint</label><label class="ps-source-cloud"><input type="checkbox" value="cloud"><i></i>Cloud</label><label class="ps-source-email"><input type="checkbox" value="email" checked><i></i>Email</label><label class="ps-source-network"><input type="checkbox" value="network"><i></i>Network</label><label class="ps-source-saas"><input type="checkbox" value="saas"><i></i>SaaS</label></fieldset>
<div class="ps-volume-plot" data-volume-plot role="img" aria-label="Stacked event volume. Use the inspect control or data table for exact values."></div><p class="ps-note" data-volume-empty hidden>No sources selected. Select a source to see its events.</p>
<label class="ps-inspect-control">Inspect period<input type="range" min="0" max="13" value="11" data-volume-inspect><output data-volume-date>Oct 12</output></label>
<div class="ps-data-readout" data-volume-readout aria-live="polite"></div><details class="ps-data-details"><summary>View data table</summary><div class="ps-table-region" tabindex="0" aria-label="Event values"><table class="ps-table"><caption>Events for selected sources</caption><thead><tr><th scope="col">Period</th><th scope="col">Events</th><th scope="col">Escalated</th></tr></thead><tbody data-volume-table></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Change compares the last week in view with the first</span><span>Sample data</span></footer></section></main>
```

## Variant: Weekly

Days grouped into weeks for a longer view, with the same total as the daily view.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Signal volume by week</h1><p class="ps-note">Days grouped into weeks for a longer view; totals match the daily view.</p></header><section class="ps-instrument" data-ps-signal-volume aria-label="Signal volume weekly sample">
<header class="ps-instrument-header"><div><h2>Signal volume</h2><p>Sample workspace · Weeks of October 1 and 8</p></div><label class="ps-compact-field">Group by<select class="ps-input" data-volume-period><option value="day">Day</option><option value="week" selected>Week</option></select></label></header>
<div class="ps-instrument-body"><div class="ps-data-lead"><div class="ps-data-figure"><p class="ps-data-caption">Events in view</p><div class="ps-metric-heading"><strong data-volume-total>—</strong><span class="ps-delta" data-volume-delta hidden></span><span data-volume-base></span></div></div><dl class="ps-metrics"><div><dt>Peak</dt><dd><span data-volume-peak>—</span><span class="ps-data-note" data-volume-peak-date></span></dd></div><div><dt>Escalated</dt><dd><span data-volume-escalated>—</span></dd></div></dl></div>
<fieldset class="ps-series-options"><legend>Sources</legend><label class="ps-source-identity"><input type="checkbox" value="identity" checked><i></i>Identity</label><label class="ps-source-endpoint"><input type="checkbox" value="endpoint" checked><i></i>Endpoint</label><label class="ps-source-cloud"><input type="checkbox" value="cloud" checked><i></i>Cloud</label><label class="ps-source-email"><input type="checkbox" value="email" checked><i></i>Email</label><label class="ps-source-network"><input type="checkbox" value="network" checked><i></i>Network</label><label class="ps-source-saas"><input type="checkbox" value="saas" checked><i></i>SaaS</label></fieldset>
<div class="ps-volume-plot" data-volume-plot role="img" aria-label="Stacked event volume. Use the inspect control or data table for exact values."></div><p class="ps-note" data-volume-empty hidden>No sources selected. Select a source to see its events.</p>
<label class="ps-inspect-control">Inspect period<input type="range" min="0" max="1" value="1" data-volume-inspect><output data-volume-date>Oct 8–14</output></label>
<div class="ps-data-readout" data-volume-readout aria-live="polite"></div><details class="ps-data-details"><summary>View data table</summary><div class="ps-table-region" tabindex="0" aria-label="Event values"><table class="ps-table"><caption>Events for selected sources</caption><thead><tr><th scope="col">Period</th><th scope="col">Events</th><th scope="col">Escalated</th></tr></thead><tbody data-volume-table></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Change compares the last week in view with the first</span><span>Sample data</span></footer></section></main>
```

## Variant: No sources

Every source cleared: the plot keeps its place and the empty message says how to recover.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Signal volume with no sources</h1><p class="ps-note">Every source cleared: the plot stays in place and says how to recover.</p></header><section class="ps-instrument" data-ps-signal-volume aria-label="Signal volume empty sample">
<header class="ps-instrument-header"><div><h2>Signal volume</h2><p>Sample workspace · October 1–14</p></div><label class="ps-compact-field">Group by<select class="ps-input" data-volume-period><option value="day">Day</option><option value="week">Week</option></select></label></header>
<div class="ps-instrument-body"><div class="ps-data-lead"><div class="ps-data-figure"><p class="ps-data-caption">Events in view</p><div class="ps-metric-heading"><strong data-volume-total>—</strong><span class="ps-delta" data-volume-delta hidden></span><span data-volume-base></span></div></div><dl class="ps-metrics"><div><dt>Peak</dt><dd><span data-volume-peak>—</span><span class="ps-data-note" data-volume-peak-date></span></dd></div><div><dt>Escalated</dt><dd><span data-volume-escalated>—</span></dd></div></dl></div>
<fieldset class="ps-series-options"><legend>Sources</legend><label class="ps-source-identity"><input type="checkbox" value="identity"><i></i>Identity</label><label class="ps-source-endpoint"><input type="checkbox" value="endpoint"><i></i>Endpoint</label><label class="ps-source-cloud"><input type="checkbox" value="cloud"><i></i>Cloud</label><label class="ps-source-email"><input type="checkbox" value="email"><i></i>Email</label><label class="ps-source-network"><input type="checkbox" value="network"><i></i>Network</label><label class="ps-source-saas"><input type="checkbox" value="saas"><i></i>SaaS</label></fieldset>
<div class="ps-volume-plot" data-volume-plot role="img" aria-label="Stacked event volume. Use the inspect control or data table for exact values."></div><p class="ps-note" data-volume-empty hidden>No sources selected. Select a source to see its events.</p>
<label class="ps-inspect-control">Inspect period<input type="range" min="0" max="13" value="11" data-volume-inspect><output data-volume-date>Oct 12</output></label>
<div class="ps-data-readout" data-volume-readout aria-live="polite"></div><details class="ps-data-details"><summary>View data table</summary><div class="ps-table-region" tabindex="0" aria-label="Event values"><table class="ps-table"><caption>Events for selected sources</caption><thead><tr><th scope="col">Period</th><th scope="col">Events</th><th scope="col">Escalated</th></tr></thead><tbody data-volume-table></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Change compares the last week in view with the first</span><span>Sample data</span></footer></section></main>
```
