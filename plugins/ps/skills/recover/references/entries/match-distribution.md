# Match distribution (match-distribution)

Kind: component. Inspect a score population against a configurable threshold.

Task: Choose a threshold and understand which score groups qualify.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: data.

Native behavior: match-distribution. It needs pagesystem.js (see ../implementation.md).

## content

- Clearly labeled synthetic data
- Selected scope and period
- Exact values and explanatory labels
- The threshold drawn as a dashed reference line tagged with its value

## states

- design cohort
- engineering cohort
- inclusive threshold
- selected score group

## responsive

- Controls wrap without reducing editable text size.
- Plots remain supplementary to native inspection controls and exact values.
- Data tables scroll in a named local region.

## checks

- Threshold changes recompute the qualified population.
- The selected score group and table agree.
- Dots represent up to four sample profiles; exact counts remain available.
- The inspected score group gets a band and a pinned tip; the readout restates it.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Match distribution</h1><p class="ps-note">Compare a score distribution with a configurable threshold.</p></header><section class="ps-instrument" data-ps-match-distribution aria-label="Match distribution sample">
<header class="ps-instrument-header"><div><h2>Match scores</h2><p>Sample candidate population</p></div><label class="ps-compact-field">Role<select class="ps-input" data-match-role><option value="design">Product design</option><option value="engineering">Engineering</option></select></label></header><div class="ps-instrument-body">
<div class="ps-metric-heading"><strong data-match-count>—</strong><span data-match-summary>profiles above threshold</span></div><div class="ps-chart-caption"><span>Each dot represents up to 4 profiles</span><span data-match-percent></span></div>
<div class="ps-match-plot" data-match-plot role="img" aria-label="Score distribution with the qualifying range highlighted"></div><div class="ps-match-axis" data-match-axis aria-hidden="true"></div>
<label class="ps-inspect-control">Shortlist threshold<input data-match-threshold type="range" min="40" max="100" step="5" value="85"><output data-match-threshold-label>85%</output></label>
<label class="ps-compact-field">Inspect score group<select class="ps-input" data-match-bin><option value="85">85%</option></select></label><div class="ps-data-readout" data-match-detail aria-live="polite"></div>
<details class="ps-data-details"><summary>View score counts</summary><div class="ps-table-region" tabindex="0" aria-label="Match score counts"><table class="ps-table"><caption>Sample population by score</caption><thead><tr><th scope="col">Score</th><th scope="col">Profiles</th><th scope="col">Threshold</th></tr></thead><tbody data-match-table></tbody></table></div></details></div><footer class="ps-instrument-footer"><span>Threshold is inclusive</span><span>Sample data</span></footer></section></main>
```

## Variant: Broad shortlist

The engineering cohort at a 70% threshold, for an early screening pass that keeps more candidates.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Match distribution, broad shortlist</h1><p class="ps-note">A larger engineering cohort with a lower threshold, for an early screening pass.</p></header><section class="ps-instrument" data-ps-match-distribution aria-label="Match distribution broad sample">
<header class="ps-instrument-header"><div><h2>Match scores</h2><p>Sample candidate population · Screening</p></div><label class="ps-compact-field">Role<select class="ps-input" data-match-role><option value="design">Product design</option><option value="engineering" selected>Engineering</option></select></label></header><div class="ps-instrument-body">
<div class="ps-metric-heading"><strong data-match-count>—</strong><span data-match-summary>profiles above threshold</span></div><div class="ps-chart-caption"><span>Each dot represents up to 4 profiles</span><span data-match-percent></span></div>
<div class="ps-match-plot" data-match-plot role="img" aria-label="Score distribution with the qualifying range highlighted"></div><div class="ps-match-axis" data-match-axis aria-hidden="true"></div>
<label class="ps-inspect-control">Shortlist threshold<input data-match-threshold type="range" min="40" max="100" step="5" value="70"><output data-match-threshold-label>70%</output></label>
<label class="ps-compact-field">Inspect score group<select class="ps-input" data-match-bin><option value="85">85%</option></select></label><div class="ps-data-readout" data-match-detail aria-live="polite"></div>
<details class="ps-data-details"><summary>View score counts</summary><div class="ps-table-region" tabindex="0" aria-label="Match score counts"><table class="ps-table"><caption>Sample population by score</caption><thead><tr><th scope="col">Score</th><th scope="col">Profiles</th><th scope="col">Threshold</th></tr></thead><tbody data-match-table></tbody></table></div></details></div><footer class="ps-instrument-footer"><span>Threshold is inclusive</span><span>Sample data</span></footer></section></main>
```

## Variant: Narrow panel

The full threshold instrument in a side column about 22rem wide, beside a candidate list.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Match distribution in a narrow panel</h1><p class="ps-note">The same controls and plot placed in a side column beside a candidate list.</p></header><div class="ps-variant-narrow"><section class="ps-instrument" data-ps-match-distribution aria-label="Match distribution narrow sample">
<header class="ps-instrument-header"><div><h2>Match scores</h2><p>Sample candidate population</p></div><label class="ps-compact-field">Role<select class="ps-input" data-match-role><option value="design">Product design</option><option value="engineering">Engineering</option></select></label></header><div class="ps-instrument-body">
<div class="ps-metric-heading"><strong data-match-count>—</strong><span data-match-summary>profiles above threshold</span></div><div class="ps-chart-caption"><span>Each dot represents up to 4 profiles</span><span data-match-percent></span></div>
<div class="ps-match-plot" data-match-plot role="img" aria-label="Score distribution with the qualifying range highlighted"></div><div class="ps-match-axis" data-match-axis aria-hidden="true"></div>
<label class="ps-inspect-control">Shortlist threshold<input data-match-threshold type="range" min="40" max="100" step="5" value="85"><output data-match-threshold-label>85%</output></label>
<label class="ps-compact-field">Inspect score group<select class="ps-input" data-match-bin><option value="85">85%</option></select></label><div class="ps-data-readout" data-match-detail aria-live="polite"></div>
<details class="ps-data-details"><summary>View score counts</summary><div class="ps-table-region" tabindex="0" aria-label="Match score counts"><table class="ps-table"><caption>Sample population by score</caption><thead><tr><th scope="col">Score</th><th scope="col">Profiles</th><th scope="col">Threshold</th></tr></thead><tbody data-match-table></tbody></table></div></details></div><footer class="ps-instrument-footer"><span>Threshold is inclusive</span><span>Sample data</span></footer></section></div></main>
```

## Variant: Locked threshold

A read-only record of an approved shortlist threshold, showing who approved it and when, with exact counts.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Match distribution, locked threshold</h1><p class="ps-note">A read-only record of an approved shortlist threshold, with who set it and when.</p></header><section class="ps-instrument" aria-label="Match distribution locked sample">
<header class="ps-instrument-header"><div><h2>Match scores</h2><p>Sample candidate population · Product design</p></div><span class="ps-badge">Locked</span></header><div class="ps-instrument-body">
<div class="ps-metric-heading"><strong>110</strong><span>of 548 profiles at 85% or above</span></div><div class="ps-chart-caption"><span>Each dot represents up to 4 profiles</span><span>20% qualify</span></div>
<div class="ps-match-plot" role="img" aria-label="Score distribution from 40% to 100%. Scores of 85% and above are highlighted as qualifying."><div class="ps-match-column" data-qualified="false"><div class="ps-match-dots"><i></i><i></i></div></div><div class="ps-match-column" data-qualified="false"><div class="ps-match-dots"><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="false"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="false"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="false"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="false"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="false"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="false"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="false"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="true"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="true"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="true"><div class="ps-match-dots"><i></i><i></i><i></i><i></i><i></i></div></div><div class="ps-match-column" data-qualified="true"><div class="ps-match-dots"><i></i><i></i></div></div><div class="ps-match-ref" style="--at:9" data-side="start" aria-hidden="true"><span class="ps-match-ref-tag"><span>Threshold</span><b>85%</b></span></div></div><div class="ps-match-axis" aria-hidden="true"><span style="grid-column:1" data-edge="start">40%</span><span style="grid-column:4">55%</span><span style="grid-column:7">70%</span><span style="grid-column:10">85%</span><span style="grid-column:13" data-edge="end">100%</span></div>
<p class="ps-instrument-record"><span>Shortlist threshold <strong>85%</strong></span><span>Approved by Dana Ortiz, Oct 20 at <time datetime="2026-10-20T14:05">2:05 PM</time></span></p>
<details class="ps-data-details"><summary>View score counts</summary><div class="ps-table-region" tabindex="0" role="region" aria-label="Match score counts"><table class="ps-table"><caption>Sample population by score</caption><thead><tr><th scope="col">Score</th><th scope="col">Profiles</th><th scope="col">Threshold</th></tr></thead><tbody><tr><td>40%</td><td>6</td><td>Excluded</td></tr><tr><td>45%</td><td>10</td><td>Excluded</td></tr><tr><td>50%</td><td>20</td><td>Excluded</td></tr><tr><td>55%</td><td>39</td><td>Excluded</td></tr><tr><td>60%</td><td>57</td><td>Excluded</td></tr><tr><td>65%</td><td>83</td><td>Excluded</td></tr><tr><td>70%</td><td>91</td><td>Excluded</td></tr><tr><td>75%</td><td>70</td><td>Excluded</td></tr><tr><td>80%</td><td>62</td><td>Excluded</td></tr><tr><td>85%</td><td>48</td><td>Included</td></tr><tr><td>90%</td><td>37</td><td>Included</td></tr><tr><td>95%</td><td>20</td><td>Included</td></tr><tr><td>100%</td><td>5</td><td>Included</td></tr></tbody></table></div></details></div><footer class="ps-instrument-footer"><span>Threshold is inclusive · Reopen the shortlist to change it</span><span>Sample data</span></footer></section></main>
```
