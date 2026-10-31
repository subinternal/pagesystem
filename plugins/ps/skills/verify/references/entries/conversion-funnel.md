# Conversion funnel (conversion-funnel)

Kind: component. Trace a sample cohort through successive activation stages.

Task: Inspect stage conversion and compare periods or acquisition channels.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: data.

Native behavior: conversion-funnel. It needs pagesystem.js (see ../implementation.md).

## content

- Clearly labeled synthetic data
- Selected scope and period
- Exact values and explanatory labels
- The activation rate with its change against the other channel or period
- The drop-off between stages, in people and share

## states

- weekly
- monthly
- all channels
- single channel
- selected stage

## responsive

- Controls wrap without reducing editable text size.
- Plots remain supplementary to native inspection controls and exact values.
- Data tables scroll in a named local region.

## checks

- All-channel counts equal the sum of channel cohorts.
- Stage conversion uses the preceding stage as its denominator.
- All stages are keyboard-operable native buttons.
- Stage bars share one scale from the cohort entry stage.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Conversion funnel</h1><p class="ps-note">Compare cohort progression and inspect the loss between stages.</p></header><section class="ps-instrument" data-ps-conversion-funnel aria-label="Conversion funnel sample">
<header class="ps-instrument-header"><div><h2>Activation</h2><p>Sample product cohort</p></div><div class="ps-data-controls"><label class="ps-compact-field">Channel<select class="ps-input" data-funnel-channel><option value="all">All channels</option><option value="direct">Direct</option><option value="community">Community</option></select></label><label class="ps-compact-field">Period<select class="ps-input" data-funnel-period><option value="week">7 days</option><option value="month">30 days</option></select></label></div></header><div class="ps-instrument-body">
<div class="ps-data-lead"><div class="ps-data-figure"><p class="ps-data-caption">Activated from visits</p><div class="ps-metric-heading"><strong data-funnel-rate>—</strong><span class="ps-delta" data-funnel-delta hidden></span><span data-funnel-base></span></div></div><dl class="ps-metrics"><div><dt>Visited</dt><dd><span data-funnel-visits>—</span></dd></div><div><dt>Activated</dt><dd><span data-funnel-completed>—</span></dd></div></dl></div>
<div class="ps-funnel-plot" data-funnel-stages role="group" aria-label="Inspect a funnel stage"></div><div class="ps-data-readout" data-funnel-detail aria-live="polite"></div></div>
<footer class="ps-instrument-footer"><span>Bars share one scale, the visits that entered the cohort</span><span>Sample data</span></footer></section></main>
```

## Variant: Step table

Every stage as exact counts, with conversion from the previous stage, conversion from visits and the people lost at each step, in one scrollable table.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Conversion funnel, step table</h1><p class="ps-note">Read every stage as exact counts with step and cumulative conversion side by side.</p></header><section class="ps-instrument" aria-labelledby="funnel-table-title">
<header class="ps-instrument-header"><div><h2 id="funnel-table-title">Activation by step</h2><p>October 19 – 25, 2026 · All channels</p></div></header><div class="ps-instrument-body">
<div class="ps-metric-heading"><strong>8.5%</strong><span>of 1,320 visits activated</span></div>
<div class="ps-table-region" role="region" aria-labelledby="funnel-table-caption" tabindex="0"><table class="ps-table ps-funnel-table"><caption id="funnel-table-caption" class="ps-visually-hidden">Activation stages, October 19 to 25, 2026, all channels</caption>
<thead><tr><th scope="col">Stage</th><th scope="col">People</th><th scope="col">From previous</th><th scope="col">From visits</th><th scope="col">Did not continue</th></tr></thead>
<tbody>
<tr><th scope="row">Visited</th><td data-label="People">1,320</td><td data-label="From previous"><span class="ps-funnel-step"><span class="ps-funnel-meter" aria-hidden="true"><i style="--v:0%"></i></span>Entry</span></td><td data-label="From visits">100%</td><td data-label="Did not continue">—</td></tr>
<tr><th scope="row">Signed up</th><td data-label="People">445</td><td data-label="From previous"><span class="ps-funnel-step"><span class="ps-funnel-meter" aria-hidden="true"><i style="--v:33.7%"></i></span>33.7%</span></td><td data-label="From visits">33.7%</td><td data-label="Did not continue">875</td></tr>
<tr><th scope="row">Created a project</th><td data-label="People">301</td><td data-label="From previous"><span class="ps-funnel-step"><span class="ps-funnel-meter" aria-hidden="true"><i style="--v:67.6%"></i></span>67.6%</span></td><td data-label="From visits">22.8%</td><td data-label="Did not continue">144</td></tr>
<tr><th scope="row">Invited a teammate</th><td data-label="People">170</td><td data-label="From previous"><span class="ps-funnel-step"><span class="ps-funnel-meter" aria-hidden="true"><i style="--v:56.5%"></i></span>56.5%</span></td><td data-label="From visits">12.9%</td><td data-label="Did not continue">131</td></tr>
<tr><th scope="row">Activated</th><td data-label="People">112</td><td data-label="From previous"><span class="ps-funnel-step"><span class="ps-funnel-meter" aria-hidden="true"><i style="--v:65.9%"></i></span>65.9%</span></td><td data-label="From visits">8.5%</td><td data-label="Did not continue">58</td></tr>
</tbody></table></div>
<p class="ps-funnel-note">The largest loss is between visiting and signing up: 875 people, 66.3% of visits. Step conversion divides by the preceding stage.</p></div>
<footer class="ps-instrument-footer"><span>Completed <strong>112</strong></span><span>Sample data</span></footer></section></main>
```

## Variant: Channel comparison

Two acquisition channels compared stage by stage as paired bars on one shared scale, with each channel's conversion from the previous stage.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Conversion funnel, channel comparison</h1><p class="ps-note">Compare two acquisition channels stage by stage on one shared scale.</p></header><section class="ps-instrument" aria-labelledby="funnel-compare-title">
<header class="ps-instrument-header"><div><h2 id="funnel-compare-title">Activation by channel</h2><p>October 19 – 25, 2026 · Sample product cohort</p></div><ul class="ps-funnel-legend" aria-label="Channels"><li data-series="direct">Direct</li><li data-series="community">Community</li></ul></header><div class="ps-instrument-body">
<dl class="ps-funnel-summary"><div><dt>Direct</dt><dd><strong>10.3%</strong> activated from 780 visits</dd></div><div><dt>Community</dt><dd><strong>5.9%</strong> activated from 540 visits</dd></div></dl>
<ol class="ps-funnel-pairs">
<li><p class="ps-funnel-pair-stage"><span>Visited</span><span>1,320 total</span></p>
<p class="ps-funnel-pair" data-series="direct"><span>Direct</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:100%"></i></span><strong>780</strong><span>Entry</span></p>
<p class="ps-funnel-pair" data-series="community"><span>Community</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:69.2%"></i></span><strong>540</strong><span>Entry</span></p></li>
<li><p class="ps-funnel-pair-stage"><span>Signed up</span><span>445 total</span></p>
<p class="ps-funnel-pair" data-series="direct"><span>Direct</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:37.2%"></i></span><strong>290</strong><span>37.2%</span></p>
<p class="ps-funnel-pair" data-series="community"><span>Community</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:19.9%"></i></span><strong>155</strong><span>28.7%</span></p></li>
<li><p class="ps-funnel-pair-stage"><span>Created a project</span><span>301 total</span></p>
<p class="ps-funnel-pair" data-series="direct"><span>Direct</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:26.3%"></i></span><strong>205</strong><span>70.7%</span></p>
<p class="ps-funnel-pair" data-series="community"><span>Community</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:12.3%"></i></span><strong>96</strong><span>61.9%</span></p></li>
<li><p class="ps-funnel-pair-stage"><span>Invited a teammate</span><span>170 total</span></p>
<p class="ps-funnel-pair" data-series="direct"><span>Direct</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:15.1%"></i></span><strong>118</strong><span>57.6%</span></p>
<p class="ps-funnel-pair" data-series="community"><span>Community</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:6.7%"></i></span><strong>52</strong><span>54.2%</span></p></li>
<li><p class="ps-funnel-pair-stage"><span>Activated</span><span>112 total</span></p>
<p class="ps-funnel-pair" data-series="direct"><span>Direct</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:10.3%"></i></span><strong>80</strong><span>67.8%</span></p>
<p class="ps-funnel-pair" data-series="community"><span>Community</span><span class="ps-funnel-track" aria-hidden="true"><i style="--v:4.1%"></i></span><strong>32</strong><span>61.5%</span></p></li>
</ol>
<p class="ps-funnel-note">Bars share one scale, the largest channel entry. Percentages are conversion from the preceding stage within each channel.</p></div>
<footer class="ps-instrument-footer"><span>Completed <strong>112</strong></span><span>Sample data</span></footer></section></main>
```

## Variant: Empty period

A selected period with no visits explains why the cohort is empty and offers the nearest period with data, keeping the stage list visible at zero.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Conversion funnel, empty period</h1><p class="ps-note">Explain why a selected period has no cohort and offer the nearest period with data.</p></header><section class="ps-instrument" aria-labelledby="funnel-empty-title">
<header class="ps-instrument-header"><div><h2 id="funnel-empty-title">Activation</h2><p>Sample product cohort</p></div><label class="ps-compact-field">Period<select class="ps-input"><option>October 19 – 25</option><option>October 12 – 18</option><option>October 5 – 11</option></select></label></header><div class="ps-instrument-body">
<div class="ps-data-empty" role="status"><p class="ps-data-empty-title">No visits recorded in this period</p><p>Event collection was paused from October 19 to 25 during the site migration, so no cohort entered the funnel. Earlier periods are unaffected.</p><button class="ps-button" type="button">Show October 12 – 18</button></div>
<ol class="ps-funnel-ghost" aria-label="Stages with no data"><li><span>Visited</span><strong>0</strong></li><li><span>Signed up</span><strong>0</strong></li><li><span>Created a project</span><strong>0</strong></li><li><span>Invited a teammate</span><strong>0</strong></li><li><span>Activated</span><strong>0</strong></li></ol></div>
<footer class="ps-instrument-footer"><span>Completed <strong>0</strong></span><span>Sample data</span></footer></section></main>
```
