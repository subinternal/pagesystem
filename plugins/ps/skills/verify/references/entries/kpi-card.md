# KPI card (kpi-card)

Kind: component. One measure: its caption, the latest figure, the change against the previous period and a sparkline of the period behind it.

Task: Read one measure at a glance, see whether it moved up or down since the last period, and inspect any earlier point without losing the current figure.

Elements: [text](text.md), [button](button.md), [badge](badge.md).

Category: data.

Native behavior: kpi-card. It needs pagesystem.js (see ../implementation.md).

## content

- A caption naming the measure, with an info hint that says how it is calculated
- The latest figure in tabular numerals
- A delta pill against the previous period with an arrow, a sign and the comparison in words
- A sparkline of the period with the current point marked
- A readout naming the inspected point and its value
- Optionally, a thin progress line to a goal with the share reached in text
- The values in a data table under View data, and a sample data label

## states

- current: the readout names the latest point
- inspecting: a focus dot, a dashed guide and the readout follow the pointer or the arrow keys; the headline does not change
- hint open
- rising
- falling: the delta reads down in its arrow, its sign and the danger color
- with target
- compact: caption, figure and delta only

## responsive

- The card fills its column up to 24rem; compact cards tile a grid that fits as many 12.5rem columns as the width allows.
- The sparkline is redrawn at the card's own width, so its line weight and dots never stretch.
- The info note opens inside the card's edges at any width.

## checks

- The figure is the last row of the data table and the delta is derived from the last two rows; neither is typed separately.
- A rate changes in percentage points and an amount or count in percent; the sign and the arrow both carry the direction, never color alone.
- The sparkline is a slider: Left and Right move one point, Home and End jump, and its value text names the point and value.
- Leaving or blurring the sparkline returns the readout to the current point.
- The info hint is a native disclosure that Escape or a press outside closes.
- Progress to a target is the latest value over the target, rounded to a whole percent, and the line stops at 100%.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">KPI card</h1><p class="ps-note">One measure with its change against the previous period and the shape of the year behind it.</p></header><section class="ps-kpi" data-ps-kpi-card data-kpi-format="currency" aria-labelledby="kpi-mrr-title"><div class="ps-kpi-top"><h2 class="ps-kpi-caption" id="kpi-mrr-title">Monthly recurring revenue</h2><details class="ps-kpi-hint"><summary><i class="ps-i ps-i-kpi-info" aria-hidden="true"></i><span class="ps-visually-hidden">About monthly recurring revenue</span></summary><p id="kpi-mrr-hint">Active subscription prices at month end, after discounts. Excludes one-off services.</p></details></div><p class="ps-kpi-figure"><data value="410200" data-kpi-figure>$410,200</data></p><p class="ps-kpi-delta"><span class="ps-delta" data-trend="up" data-kpi-delta><i class="ps-i ps-i-up" aria-hidden="true"></i>+4.8%</span><span>vs last month</span></p><div class="ps-kpi-spark" data-kpi-spark role="img" aria-label="Monthly recurring revenue, Nov 2025 to Oct 2026: rising from $268,500 to $410,200."></div><p class="ps-kpi-readout" data-kpi-readout><span data-kpi-when>Oct 2026 · current</span><span data-kpi-value>$410,200</span></p><details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" role="region" aria-label="Monthly recurring revenue values"><table class="ps-table"><caption>Monthly recurring revenue by month</caption><thead><tr><th scope="col">Month</th><th scope="col">Monthly recurring revenue</th></tr></thead><tbody data-kpi-rows><tr data-value="268500"><th scope="row">Nov 2025</th><td>$268,500</td></tr><tr data-value="279300"><th scope="row">Dec 2025</th><td>$279,300</td></tr><tr data-value="284100"><th scope="row">Jan 2026</th><td>$284,100</td></tr><tr data-value="297800"><th scope="row">Feb 2026</th><td>$297,800</td></tr><tr data-value="306200"><th scope="row">Mar 2026</th><td>$306,200</td></tr><tr data-value="318900"><th scope="row">Apr 2026</th><td>$318,900</td></tr><tr data-value="331400"><th scope="row">May 2026</th><td>$331,400</td></tr><tr data-value="352100"><th scope="row">Jun 2026</th><td>$352,100</td></tr><tr data-value="349600"><th scope="row">Jul 2026</th><td>$349,600</td></tr><tr data-value="368700"><th scope="row">Aug 2026</th><td>$368,700</td></tr><tr data-value="391400"><th scope="row">Sep 2026</th><td>$391,400</td></tr><tr data-value="410200"><th scope="row">Oct 2026</th><td>$410,200</td></tr></tbody></table></div></details><p class="ps-kpi-foot">Sample data · month to Oct 28</p></section></main>
```

## Variant: With target

Recurring revenue against a year-end goal: a thin progress line under the figure reads 82% of the $500k goal.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">KPI card, with target</h1><p class="ps-note">The same measure tracked against a goal: a thin progress line states how much of the target is reached.</p></header><section class="ps-kpi" data-ps-kpi-card data-kpi-format="currency" aria-labelledby="kpi-mrr-goal-title"><div class="ps-kpi-top"><h2 class="ps-kpi-caption" id="kpi-mrr-goal-title">Monthly recurring revenue</h2><details class="ps-kpi-hint"><summary><i class="ps-i ps-i-kpi-info" aria-hidden="true"></i><span class="ps-visually-hidden">About monthly recurring revenue</span></summary><p id="kpi-mrr-goal-hint">Active subscription prices at month end, after discounts. Excludes one-off services.</p></details></div><p class="ps-kpi-figure"><data value="410200" data-kpi-figure>$410,200</data></p><p class="ps-kpi-delta"><span class="ps-delta" data-trend="up" data-kpi-delta><i class="ps-i ps-i-up" aria-hidden="true"></i>+4.8%</span><span>vs last month</span></p><div class="ps-kpi-target" data-kpi-target="500000"><span class="ps-kpi-track" aria-hidden="true"><span style="--progress:82%"></span></span><p><span data-kpi-progress>82%</span> of $500k goal</p></div><div class="ps-kpi-spark" data-kpi-spark role="img" aria-label="Monthly recurring revenue, Nov 2025 to Oct 2026: rising from $268,500 to $410,200."></div><p class="ps-kpi-readout" data-kpi-readout><span data-kpi-when>Oct 2026 · current</span><span data-kpi-value>$410,200</span></p><details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" role="region" aria-label="Monthly recurring revenue values"><table class="ps-table"><caption>Monthly recurring revenue by month</caption><thead><tr><th scope="col">Month</th><th scope="col">Monthly recurring revenue</th></tr></thead><tbody data-kpi-rows><tr data-value="268500"><th scope="row">Nov 2025</th><td>$268,500</td></tr><tr data-value="279300"><th scope="row">Dec 2025</th><td>$279,300</td></tr><tr data-value="284100"><th scope="row">Jan 2026</th><td>$284,100</td></tr><tr data-value="297800"><th scope="row">Feb 2026</th><td>$297,800</td></tr><tr data-value="306200"><th scope="row">Mar 2026</th><td>$306,200</td></tr><tr data-value="318900"><th scope="row">Apr 2026</th><td>$318,900</td></tr><tr data-value="331400"><th scope="row">May 2026</th><td>$331,400</td></tr><tr data-value="352100"><th scope="row">Jun 2026</th><td>$352,100</td></tr><tr data-value="349600"><th scope="row">Jul 2026</th><td>$349,600</td></tr><tr data-value="368700"><th scope="row">Aug 2026</th><td>$368,700</td></tr><tr data-value="391400"><th scope="row">Sep 2026</th><td>$391,400</td></tr><tr data-value="410200"><th scope="row">Oct 2026</th><td>$410,200</td></tr></tbody></table></div></details><p class="ps-kpi-foot">Sample data · goal set for Dec 31</p></section></main>
```

## Variant: Negative trend

Weekly active teams falling 6.2% on last week; the delta reads down in its arrow, sign and color, and the sparkline ends at its low.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">KPI card, negative trend</h1><p class="ps-note">A falling measure: the delta reads down in its arrow, its sign and its color.</p></header><section class="ps-kpi" data-ps-kpi-card data-kpi-format="count" aria-labelledby="kpi-teams-title"><div class="ps-kpi-top"><h2 class="ps-kpi-caption" id="kpi-teams-title">Weekly active teams</h2><details class="ps-kpi-hint"><summary><i class="ps-i ps-i-kpi-info" aria-hidden="true"></i><span class="ps-visually-hidden">About weekly active teams</span></summary><p id="kpi-teams-hint">Teams with at least one member who opened a project during the week.</p></details></div><p class="ps-kpi-figure"><data value="1284" data-kpi-figure>1,284</data></p><p class="ps-kpi-delta"><span class="ps-delta" data-trend="down" data-kpi-delta><i class="ps-i ps-i-down" aria-hidden="true"></i>−6.2%</span><span>vs last week</span></p><div class="ps-kpi-spark" data-kpi-spark role="img" aria-label="Weekly active teams, Week of Aug 10 to Week of Oct 26: falling from 1,402 to 1,284."></div><p class="ps-kpi-readout" data-kpi-readout><span data-kpi-when>Week of Oct 26 · current</span><span data-kpi-value>1,284</span></p><details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" role="region" aria-label="Weekly active teams values"><table class="ps-table"><caption>Weekly active teams by week</caption><thead><tr><th scope="col">Week</th><th scope="col">Weekly active teams</th></tr></thead><tbody data-kpi-rows><tr data-value="1402"><th scope="row">Week of Aug 10</th><td>1,402</td></tr><tr data-value="1415"><th scope="row">Week of Aug 17</th><td>1,415</td></tr><tr data-value="1398"><th scope="row">Week of Aug 24</th><td>1,398</td></tr><tr data-value="1431"><th scope="row">Week of Aug 31</th><td>1,431</td></tr><tr data-value="1447"><th scope="row">Week of Sep 7</th><td>1,447</td></tr><tr data-value="1439"><th scope="row">Week of Sep 14</th><td>1,439</td></tr><tr data-value="1421"><th scope="row">Week of Sep 21</th><td>1,421</td></tr><tr data-value="1410"><th scope="row">Week of Sep 28</th><td>1,410</td></tr><tr data-value="1392"><th scope="row">Week of Oct 5</th><td>1,392</td></tr><tr data-value="1388"><th scope="row">Week of Oct 12</th><td>1,388</td></tr><tr data-value="1369"><th scope="row">Week of Oct 19</th><td>1,369</td></tr><tr data-value="1284"><th scope="row">Week of Oct 26</th><td>1,284</td></tr></tbody></table></div></details><p class="ps-kpi-foot">Sample data · weeks start Monday</p></section></main>
```

## Variant: Compact

Four measures as caption, figure and delta only, tiled in a dense grid, including a rate whose change is in points.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">KPI card, compact</h1><p class="ps-note">Figure and delta only, for dense grids where the trend lives elsewhere.</p></header><div class="ps-kpi-grid" role="list" aria-label="Sample measures"><div role="listitem"><section class="ps-kpi ps-kpi--compact" data-ps-kpi-card data-kpi-format="currency" aria-labelledby="kpi-c-mrr-title"><div class="ps-kpi-top"><h2 class="ps-kpi-caption" id="kpi-c-mrr-title">Recurring revenue</h2><details class="ps-kpi-hint"><summary><i class="ps-i ps-i-kpi-info" aria-hidden="true"></i><span class="ps-visually-hidden">About recurring revenue</span></summary><p id="kpi-c-mrr-hint">Active subscription prices at month end, after discounts. Excludes one-off services.</p></details></div><p class="ps-kpi-figure"><data value="410200" data-kpi-figure>$410,200</data></p><p class="ps-kpi-delta"><span class="ps-delta" data-trend="up" data-kpi-delta><i class="ps-i ps-i-up" aria-hidden="true"></i>+4.8%</span><span>vs last month</span></p><p class="ps-kpi-foot">Sample</p></section></div><div role="listitem"><section class="ps-kpi ps-kpi--compact" data-ps-kpi-card data-kpi-format="count" aria-labelledby="kpi-c-new-title"><div class="ps-kpi-top"><h2 class="ps-kpi-caption" id="kpi-c-new-title">New customers</h2><details class="ps-kpi-hint"><summary><i class="ps-i ps-i-kpi-info" aria-hidden="true"></i><span class="ps-visually-hidden">About new customers</span></summary><p id="kpi-c-new-hint">Accounts that paid their first invoice in the month.</p></details></div><p class="ps-kpi-figure"><data value="88" data-kpi-figure>88</data></p><p class="ps-kpi-delta"><span class="ps-delta" data-trend="up" data-kpi-delta><i class="ps-i ps-i-up" aria-hidden="true"></i>+11.4%</span><span>vs last month</span></p><p class="ps-kpi-foot">Sample</p></section></div><div role="listitem"><section class="ps-kpi ps-kpi--compact" data-ps-kpi-card data-kpi-format="count" aria-labelledby="kpi-c-teams-title"><div class="ps-kpi-top"><h2 class="ps-kpi-caption" id="kpi-c-teams-title">Weekly active teams</h2><details class="ps-kpi-hint"><summary><i class="ps-i ps-i-kpi-info" aria-hidden="true"></i><span class="ps-visually-hidden">About weekly active teams</span></summary><p id="kpi-c-teams-hint">Teams with at least one member who opened a project during the week.</p></details></div><p class="ps-kpi-figure"><data value="1284" data-kpi-figure>1,284</data></p><p class="ps-kpi-delta"><span class="ps-delta" data-trend="down" data-kpi-delta><i class="ps-i ps-i-down" aria-hidden="true"></i>−6.2%</span><span>vs last week</span></p><p class="ps-kpi-foot">Sample</p></section></div><div role="listitem"><section class="ps-kpi ps-kpi--compact" data-ps-kpi-card data-kpi-format="percent" aria-labelledby="kpi-c-nrr-title"><div class="ps-kpi-top"><h2 class="ps-kpi-caption" id="kpi-c-nrr-title">Net revenue retention</h2><details class="ps-kpi-hint"><summary><i class="ps-i ps-i-kpi-info" aria-hidden="true"></i><span class="ps-visually-hidden">About net revenue retention</span></summary><p id="kpi-c-nrr-hint">Revenue kept from customers a year ago, including expansion, as a share of what they paid then.</p></details></div><p class="ps-kpi-figure"><data value="108.41" data-kpi-figure>108.41%</data></p><p class="ps-kpi-delta"><span class="ps-delta" data-trend="up" data-kpi-delta><i class="ps-i ps-i-up" aria-hidden="true"></i>+0.6 pts</span><span>vs last quarter</span></p><p class="ps-kpi-foot">Sample</p></section></div></div></main>
```
