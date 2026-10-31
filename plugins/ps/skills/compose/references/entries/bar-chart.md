# Bar chart (bar-chart)

Kind: component. Periods or categories as tall, softly rounded bars in context gray, with the focused bar in color, a dashed reference line and a headline that reads it.

Task: Compare periods or categories at a glance, read one bar exactly with its change, and see each against an average or a target.

Elements: [button](button.md), [text](text.md), [separator](separator.md).

Category: data.

Native behavior: bar-chart. It needs pagesystem.js (see ../implementation.md).

## content

- A headline for the focused bar: its full label, value in tabular numerals and a delta pill against the previous bar, the same period last year or the target
- Vertical bars from a true zero on a round value scale, the unit stated once on the top value, or ranked horizontal bars with the name and value printed on every row
- The focused bar in its series color over a quiet band; every other bar in the context gray
- A dashed reference line for the average or a target, its name and value tagged at the scale's edge
- For two series, this year beside last year: last year in context gray, this year in its color at low strength until focused, with a key that draws each mark as the plot does
- Period labels with the focused label in ink, thinned by the space available
- A data table in a View data disclosure, and footer totals derived from it: total, average, weeks at target or change against last year

## states

- largest bar focused on load
- bar focused by click
- bar focused by keyboard
- first period, with no previous bar to compare
- grouped against last year
- against a target
- ranked horizontal
- narrow: readout in place of the tip
- reduced motion

## responsive

- Bars share the plot width with clear gaps and stop growing at about 3rem, so wide panels keep the bars tall rather than fat.
- Below 34rem of component width the pinned tip is hidden and the readout beneath the plot is shown; ranked rows narrow their name column.
- Below 20rem ranked names move above their bars and the average is stated in its tag only.
- The value and reference gutters grow with text size, so the scale and the reference tag never collide at 200% text.

## checks

- Bars, the reference value, the headline and every footer figure are derived from the data table's data-value cells.
- Each bar is a button named with its period and values; the bars are one tab stop: arrows move, Home and End jump, a click focuses; the focused button is aria-pressed.
- The headline, the pinned tip and the polite readout follow the focused bar, never only the hover.
- The average is the mean of the drawn values; a target comes from the chart's own data attribute and the footer counts the periods at or above it.
- Ranked bars are ordered largest first from the authored table, with ties kept in table order, and share one zero so the average line crosses every track.
- A delta states its direction with an arrow and a signed figure, and color is never the only carrier of the series or the focus.
- Focus color changes ease in at most 90ms for a pointer; keys and reduced motion change instantly.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Bar chart</h1><p class="ps-note">Compare periods at a glance, read any bar exactly and see it against the average.</p></header><section class="ps-instrument ps-chart" data-ps-bar-chart data-chart-format="currency" data-chart-reference="average" aria-label="Revenue by day sample">
<header class="ps-instrument-header"><div><h2>Revenue by day</h2><p>Sample store · Week of October 20</p></div></header>
<div class="ps-instrument-body"><div class="ps-chart-head"><p class="ps-chart-period" data-chart-label>Friday, Oct 24</p><div class="ps-chart-figure"><strong data-chart-value>$29,740</strong><span class="ps-delta" data-trend="up" data-chart-delta><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+22.3%</span></span><span class="ps-chart-base" data-chart-base>vs Thu</span></div></div>
<div class="ps-chart-plot ps-bar-plot" data-chart-plot role="group" aria-label="Bar chart of revenue for each day of the week of October 20, with the daily average marked. Choose a bar to read it; arrow keys, Home and End move between bars."></div>
<p class="ps-chart-readout" data-chart-readout aria-live="polite">Friday, Oct 24, Revenue $29,740 · ↑ +22.3% vs Thu</p>
<details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" aria-label="Revenue by day, sample values"><table class="ps-table" data-chart-data><caption>Revenue by day, sample values</caption><thead><tr><th scope="col">Period</th><th scope="col" data-series="endpoint">Revenue</th></tr></thead><tbody><tr><th scope="row" data-label="Monday, Oct 20">Mon</th><td data-value="18420">$18,420</td></tr><tr><th scope="row" data-label="Tuesday, Oct 21">Tue</th><td data-value="21060">$21,060</td></tr><tr><th scope="row" data-label="Wednesday, Oct 22">Wed</th><td data-value="26880">$26,880</td></tr><tr><th scope="row" data-label="Thursday, Oct 23">Thu</th><td data-value="24310">$24,310</td></tr><tr><th scope="row" data-label="Friday, Oct 24">Fri</th><td data-value="29740">$29,740</td></tr><tr><th scope="row" data-label="Saturday, Oct 25">Sat</th><td data-value="15220">$15,220</td></tr><tr><th scope="row" data-label="Sunday, Oct 26">Sun</th><td data-value="12980">$12,980</td></tr></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Week total <strong data-chart-total>$148,610</strong></span><span>Daily average <strong data-chart-mean>$21,230</strong></span><span>Sample data</span></footer></section></main>
```

## Variant: Grouped

Monthly revenue for 2026 beside 2025; the focused month carries full color and the headline states the change against last year.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Bar chart, grouped</h1><p class="ps-note">Two series per period, this year against last; the focused month carries full color.</p></header><section class="ps-instrument ps-chart" data-ps-bar-chart data-chart-format="currency" aria-label="Revenue by month sample">
<header class="ps-instrument-header"><div><h2>Revenue by month</h2><p>Sample store · January to October, 2026 against 2025</p></div></header>
<div class="ps-instrument-body"><div class="ps-chart-head"><p class="ps-chart-period" data-chart-label>October</p><div class="ps-chart-figure"><strong data-chart-value>$268,000</strong><span class="ps-delta" data-trend="up" data-chart-delta><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+26.4%</span></span><span class="ps-chart-base" data-chart-base>vs 2025</span></div></div>
<ul class="ps-chart-key"><li><i data-series="endpoint"></i>2026</li><li><i data-series="previous"></i>2025</li></ul>
<div class="ps-chart-plot ps-bar-plot" data-chart-plot role="group" aria-label="Grouped bar chart of monthly revenue, 2026 beside 2025, January to October. Choose a bar to read it; arrow keys, Home and End move between bars."></div>
<p class="ps-chart-readout" data-chart-readout aria-live="polite">October, 2026 $268,000, 2025 $212,000 · ↑ +26.4% vs 2025</p>
<details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" aria-label="Revenue by month, sample values"><table class="ps-table" data-chart-data><caption>Revenue by month, sample values</caption><thead><tr><th scope="col">Period</th><th scope="col" data-series="endpoint">2026</th><th scope="col" data-series="endpoint" data-style="previous">2025</th></tr></thead><tbody><tr><th scope="row" data-label="January">Jan</th><td data-value="182000">$182,000</td><td data-value="151000">$151,000</td></tr><tr><th scope="row" data-label="February">Feb</th><td data-value="176000">$176,000</td><td data-value="149000">$149,000</td></tr><tr><th scope="row" data-label="March">Mar</th><td data-value="204000">$204,000</td><td data-value="170000">$170,000</td></tr><tr><th scope="row" data-label="April">Apr</th><td data-value="219000">$219,000</td><td data-value="176000">$176,000</td></tr><tr><th scope="row">May</th><td data-value="231000">$231,000</td><td data-value="189000">$189,000</td></tr><tr><th scope="row" data-label="June">Jun</th><td data-value="226000">$226,000</td><td data-value="192000">$192,000</td></tr><tr><th scope="row" data-label="July">Jul</th><td data-value="214000">$214,000</td><td data-value="181000">$181,000</td></tr><tr><th scope="row" data-label="August">Aug</th><td data-value="238000">$238,000</td><td data-value="197000">$197,000</td></tr><tr><th scope="row" data-label="September">Sep</th><td data-value="252000">$252,000</td><td data-value="205000">$205,000</td></tr><tr><th scope="row" data-label="October">Oct</th><td data-value="268000">$268,000</td><td data-value="212000">$212,000</td></tr></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Year to date <strong data-chart-total>$2,210,000</strong></span><span>Against 2025 <strong data-chart-yoy>↑ +21.3%</strong></span><span>Sample data</span></footer></section></main>
```

## Variant: With target

Weekly qualified leads against a target of 120, tagged at the scale edge; the headline states the gap and the footer counts weeks at target.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Bar chart, with target</h1><p class="ps-note">Each week against a fixed target, tagged at the scale edge; the headline states the gap to it.</p></header><section class="ps-instrument ps-chart" data-ps-bar-chart data-chart-reference="target" data-chart-target="120" aria-label="Qualified leads sample">
<header class="ps-instrument-header"><div><h2>Qualified leads</h2><p>Sample pipeline · Weeks of September 1 to October 20</p></div></header>
<div class="ps-instrument-body"><div class="ps-chart-head"><p class="ps-chart-period" data-chart-label>Week of Oct 20</p><div class="ps-chart-figure"><strong data-chart-value>137</strong><span class="ps-delta" data-trend="up" data-chart-delta><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+14.2%</span></span><span class="ps-chart-base" data-chart-base>vs target</span></div></div>
<div class="ps-chart-plot ps-bar-plot" data-chart-plot role="group" aria-label="Bar chart of qualified leads per week, September 1 to October 20, against a target of 120. Choose a bar to read it; arrow keys, Home and End move between bars."></div>
<p class="ps-chart-readout" data-chart-readout aria-live="polite">Week of Oct 20, Leads 137 · ↑ +14.2% vs target</p>
<details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" aria-label="Qualified leads, sample values"><table class="ps-table" data-chart-data><caption>Qualified leads, sample values</caption><thead><tr><th scope="col">Period</th><th scope="col" data-series="network">Leads</th></tr></thead><tbody><tr><th scope="row" data-label="Week of Sep 1">Sep 1</th><td data-value="96">96</td></tr><tr><th scope="row" data-label="Week of Sep 8">Sep 8</th><td data-value="112">112</td></tr><tr><th scope="row" data-label="Week of Sep 15">Sep 15</th><td data-value="128">128</td></tr><tr><th scope="row" data-label="Week of Sep 22">Sep 22</th><td data-value="104">104</td></tr><tr><th scope="row" data-label="Week of Sep 29">Sep 29</th><td data-value="131">131</td></tr><tr><th scope="row" data-label="Week of Oct 6">Oct 6</th><td data-value="142">142</td></tr><tr><th scope="row" data-label="Week of Oct 13">Oct 13</th><td data-value="118">118</td></tr><tr><th scope="row" data-label="Week of Oct 20">Oct 20</th><td data-value="137">137</td></tr></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Weeks at target <strong data-chart-hits>4 of 8</strong></span><span>Weekly average <strong data-chart-mean>121</strong></span><span>Sample data</span></footer></section></main>
```

## Variant: Ranked

Revenue by channel as horizontal bars, largest first, each named and valued on its row, against the channel average.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Bar chart, ranked</h1><p class="ps-note">Categories ranked largest first as horizontal bars, each named and valued at its row, against the average.</p></header><section class="ps-instrument ps-chart" data-ps-bar-chart data-chart-orientation="horizontal" data-chart-format="currency" aria-label="Revenue by channel sample">
<header class="ps-instrument-header"><div><h2>Revenue by channel</h2><p>Sample store · October 1–28</p></div></header>
<div class="ps-instrument-body"><div class="ps-chart-head"><p class="ps-chart-period" data-chart-label>Organic search · ranked 1 of 7</p><div class="ps-chart-figure"><strong data-chart-value>$48,200</strong><span class="ps-delta" data-trend="up" data-chart-delta><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+106.5%</span></span><span class="ps-chart-base" data-chart-base>vs average</span></div></div>
<div class="ps-chart-plot ps-bar-plot" data-chart-plot role="group" aria-label="Ranked bar chart of revenue by channel, largest first, with the channel average marked. Choose a channel to read it; arrow keys, Home and End move between rows."></div>
<p class="ps-chart-readout" data-chart-readout aria-live="polite">Organic search · $48,200 · ranked 1 of 7 · ↑ +106.5% vs average</p>
<details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" aria-label="Revenue by channel, sample values"><table class="ps-table" data-chart-data><caption>Revenue by channel, sample values</caption><thead><tr><th scope="col">Channel</th><th scope="col" data-series="cloud">Revenue</th></tr></thead><tbody><tr><th scope="row">Direct</th><td data-value="36900">$36,900</td></tr><tr><th scope="row">Organic search</th><td data-value="48200">$48,200</td></tr><tr><th scope="row">Paid search</th><td data-value="29400">$29,400</td></tr><tr><th scope="row">Referral</th><td data-value="18700">$18,700</td></tr><tr><th scope="row">Email</th><td data-value="14300">$14,300</td></tr><tr><th scope="row">Social</th><td data-value="9800">$9,800</td></tr><tr><th scope="row">Partners</th><td data-value="6100">$6,100</td></tr></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Total <strong data-chart-total>$163,400</strong></span><span>Channel average <strong data-chart-mean>$23,343</strong></span><span>Sample data</span></footer></section></main>
```
