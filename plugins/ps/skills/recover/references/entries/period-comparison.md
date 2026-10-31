# Period comparison (period-comparison)

Kind: component. One measure this period against the last: the change first, paired bars per day or week, and the biggest movers beneath.

Task: Tell whether a measure is up or down against the previous period, see which days or weeks drove it and which segments moved most.

Elements: [button](button.md), [text](text.md), [separator](separator.md).

Category: data.

Native behavior: period-comparison. It needs pagesystem.js (see ../implementation.md).

## content

- This period's and the previous period's totals, and a delta pill with arrow and sign that compares like for like
- A note naming what is compared, such as vs last week, or Mon–Wed against the same days last week while the period is incomplete
- Paired bars per day or week from a true zero: the previous period in context gray, the current period in its series color, with a key
- An incomplete current bucket drawn open with a dashed edge and labeled Partial; buckets not yet reached are left empty
- A pinned tip and readout for the focused pair with both values and the change
- A list of the biggest movers by segment with the current value, the absolute change and a delta pill
- A data table in a View data disclosure and a visible sample label

## states

- complete period, latest bucket focused
- weekly buckets
- decline
- incomplete current period with a partial bucket
- future bucket focused: not yet
- pair focused by click or keyboard
- narrow: readout in place of the tip, change column dropped
- reduced motion

## responsive

- From 34rem of component width the focused pair carries the pinned tip; below it the tip gives way to the readout beneath the plot.
- Mover rows keep name, value, change and pill on one line on wide panels, drop the absolute change below 34rem and put the name on its own line below 20rem.
- The value gutter grows with the text size, so the scale stays legible at 200% text.

## checks

- Both totals, the headline change, the bars and the movers' changes are derived from the data table and the movers' data attributes.
- The headline compares only buckets complete in the current period with the same buckets in the previous one, and says so in text.
- A partial bucket reads as partial in its label, its table cell and its tip (so far), and has no change computed for it.
- Movers are ordered by the size of their change in either direction; each change has an arrow and a sign.
- Each pair is a button named with its period and both values; the pairs are one tab stop with arrows, Home and End.
- The tip is hidden from assistive technology; the polite readout restates the focused pair.
- Color never carries meaning alone: the previous period is gray and named in the key, and a decline reads as a decline in arrow, sign and words.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Period comparison</h1><p class="ps-note">One measure, this period against the last: the change first, the days paired beneath, and what moved most.</p></header><section class="ps-instrument ps-chart ps-pair" data-ps-period-comparison data-pair-previous="last week" aria-label="Sign-ups sample">
<header class="ps-instrument-header"><div><h2>Sign-ups</h2><p>Sample workspace · Week of October 20 against the week before</p></div></header>
<div class="ps-instrument-body"><div class="ps-chart-head"><dl class="ps-metrics ps-pair-metrics"><div><dt>This week</dt><dd data-pair-current>1,311</dd></div><div><dt>Last week</dt><dd data-pair-previous>1,192</dd></div></dl>
<div class="ps-chart-figure"><span class="ps-delta" data-trend="up" data-chart-delta><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+10.0%</span></span><span class="ps-chart-base" data-chart-base>vs last week</span></div></div>
<ul class="ps-chart-key"><li><i data-series="endpoint"></i>This week</li><li><i data-series="previous"></i>Last week</li></ul>
<div class="ps-chart-plot ps-bar-plot" data-chart-plot role="group" aria-label="Paired bars of sign-ups per period, this week beside last week. Choose a pair to read it; arrow keys, Home and End move between pairs."></div>
<p class="ps-chart-readout" data-chart-readout aria-live="polite">Sunday, Oct 26, This week 81, Last week 76 · ↑ +6.6% vs Sun last week</p>
<section class="ps-pair-movers" aria-labelledby="period-comparison-movers"><h3 id="period-comparison-movers">Biggest movers by channel</h3><ol data-pair-movers><li data-current="512" data-previous="431"><span>Organic search</span><span data-mover-value>512</span><span data-mover-change>+81</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+18.8%</span></span></li><li data-current="188" data-previous="151"><span>Referral</span><span data-mover-value>188</span><span data-mover-change>+37</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+24.5%</span></span></li><li data-current="241" data-previous="268"><span>Paid search</span><span data-mover-value>241</span><span data-mover-change>−27</span><span class="ps-delta" data-trend="down"><i class="ps-i ps-i-down" aria-hidden="true"></i><span>−10.1%</span></span></li><li data-current="100" data-previous="80"><span>Partners</span><span data-mover-value>100</span><span data-mover-change>+20</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+25.0%</span></span></li><li data-current="270" data-previous="262"><span>Direct</span><span data-mover-value>270</span><span data-mover-change>+8</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+3.1%</span></span></li></ol></section>
<details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" aria-label="Sign-ups, sample values"><table class="ps-table" data-chart-data><caption>Sign-ups, sample values</caption><thead><tr><th scope="col">Period</th><th scope="col" data-series="endpoint">This week</th><th scope="col" data-series="endpoint" data-style="previous">Last week</th></tr></thead><tbody><tr><th scope="row" data-label="Monday, Oct 20">Mon</th><td data-value="212">212</td><td data-value="188">188</td></tr><tr><th scope="row" data-label="Tuesday, Oct 21">Tue</th><td data-value="238">238</td><td data-value="201">201</td></tr><tr><th scope="row" data-label="Wednesday, Oct 22">Wed</th><td data-value="251">251</td><td data-value="219">219</td></tr><tr><th scope="row" data-label="Thursday, Oct 23">Thu</th><td data-value="229">229</td><td data-value="214">214</td></tr><tr><th scope="row" data-label="Friday, Oct 24">Fri</th><td data-value="204">204</td><td data-value="192">192</td></tr><tr><th scope="row" data-label="Saturday, Oct 25">Sat</th><td data-value="96">96</td><td data-value="102">102</td></tr><tr><th scope="row" data-label="Sunday, Oct 26">Sun</th><td data-value="81">81</td><td data-value="76">76</td></tr></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Best day <strong>Wed · 251</strong></span><span>Sample data</span></footer></section></main>
```

## Variant: Weekly

Net revenue for October against September in weekly buckets, with movers by plan.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Period comparison, weekly</h1><p class="ps-note">A month against the one before it in weekly buckets, for a measure that is noisy by the day.</p></header><section class="ps-instrument ps-chart ps-pair" data-ps-period-comparison data-pair-previous="September" data-chart-format="currency" aria-label="Net revenue sample">
<header class="ps-instrument-header"><div><h2>Net revenue</h2><p>Sample store · October 1–28 against September 3–30</p></div></header>
<div class="ps-instrument-body"><div class="ps-chart-head"><dl class="ps-metrics ps-pair-metrics"><div><dt>October</dt><dd data-pair-current>$209,150</dd></div><div><dt>September</dt><dd data-pair-previous>$188,380</dd></div></dl>
<div class="ps-chart-figure"><span class="ps-delta" data-trend="up" data-chart-delta><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+11.0%</span></span><span class="ps-chart-base" data-chart-base>vs September</span></div></div>
<ul class="ps-chart-key"><li><i data-series="endpoint"></i>October</li><li><i data-series="previous"></i>September</li></ul>
<div class="ps-chart-plot ps-bar-plot" data-chart-plot role="group" aria-label="Paired bars of net revenue per period, october beside September. Choose a pair to read it; arrow keys, Home and End move between pairs."></div>
<p class="ps-chart-readout" data-chart-readout aria-live="polite">Week 4 · Oct 22–28, October $57,620, September $47,240 · ↑ +22.0% vs W4 September</p>
<section class="ps-pair-movers" aria-labelledby="period-comparison--weekly-movers"><h3 id="period-comparison--weekly-movers">Biggest movers by plan</h3><ol data-pair-movers><li data-current="61200" data-previous="48900"><span>Business annual</span><span data-mover-value>$61,200</span><span data-mover-change>+$12,300</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+25.2%</span></span></li><li data-current="23450" data-previous="14080"><span>Team annual</span><span data-mover-value>$23,450</span><span data-mover-change>+$9,370</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+66.5%</span></span></li><li data-current="52100" data-previous="55600"><span>Enterprise</span><span data-mover-value>$52,100</span><span data-mover-change>−$3,500</span><span class="ps-delta" data-trend="down"><i class="ps-i ps-i-down" aria-hidden="true"></i><span>−6.3%</span></span></li><li data-current="72400" data-previous="69800"><span>Team monthly</span><span data-mover-value>$72,400</span><span data-mover-change>+$2,600</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+3.7%</span></span></li></ol></section>
<details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" aria-label="Net revenue, sample values"><table class="ps-table" data-chart-data><caption>Net revenue, sample values</caption><thead><tr><th scope="col">Period</th><th scope="col" data-series="endpoint">October</th><th scope="col" data-series="endpoint" data-style="previous">September</th></tr></thead><tbody><tr><th scope="row" data-label="Week 1 · Oct 1–7">W1</th><td data-value="48210">$48,210</td><td data-value="44960">$44,960</td></tr><tr><th scope="row" data-label="Week 2 · Oct 8–14">W2</th><td data-value="52940">$52,940</td><td data-value="46310">$46,310</td></tr><tr><th scope="row" data-label="Week 3 · Oct 15–21">W3</th><td data-value="50380">$50,380</td><td data-value="49870">$49,870</td></tr><tr><th scope="row" data-label="Week 4 · Oct 22–28">W4</th><td data-value="57620">$57,620</td><td data-value="47240">$47,240</td></tr></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Weeks ahead <strong>4 of 4</strong></span><span>Sample data</span></footer></section></main>
```

## Variant: Decline

Trial starts down against last week on every day; the change and most movers read as declines.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Period comparison, decline</h1><p class="ps-note">A measure that fell: the change reads as a decline in arrow, sign and words, and the movers show where.</p></header><section class="ps-instrument ps-chart ps-pair" data-ps-period-comparison data-pair-previous="last week" aria-label="Trial starts sample">
<header class="ps-instrument-header"><div><h2>Trial starts</h2><p>Sample workspace · Week of October 20 against the week before</p></div></header>
<div class="ps-instrument-body"><div class="ps-chart-head"><dl class="ps-metrics ps-pair-metrics"><div><dt>This week</dt><dd data-pair-current>777</dd></div><div><dt>Last week</dt><dd data-pair-previous>948</dd></div></dl>
<div class="ps-chart-figure"><span class="ps-delta" data-trend="down" data-chart-delta><i class="ps-i ps-i-down" aria-hidden="true"></i><span>−18.0%</span></span><span class="ps-chart-base" data-chart-base>vs last week</span></div></div>
<ul class="ps-chart-key"><li><i data-series="endpoint"></i>This week</li><li><i data-series="previous"></i>Last week</li></ul>
<div class="ps-chart-plot ps-bar-plot" data-chart-plot role="group" aria-label="Paired bars of trial starts per period, this week beside last week. Choose a pair to read it; arrow keys, Home and End move between pairs."></div>
<p class="ps-chart-readout" data-chart-readout aria-live="polite">Sunday, Oct 26, This week 47, Last week 58 · ↓ −19.0% vs Sun last week</p>
<section class="ps-pair-movers" aria-labelledby="period-comparison--decline-movers"><h3 id="period-comparison--decline-movers">Biggest movers by source</h3><ol data-pair-movers><li data-current="96" data-previous="171"><span>Paid social</span><span data-mover-value>96</span><span data-mover-change>−75</span><span class="ps-delta" data-trend="down"><i class="ps-i ps-i-down" aria-hidden="true"></i><span>−43.9%</span></span></li><li data-current="200" data-previous="262"><span>Direct</span><span data-mover-value>200</span><span data-mover-change>−62</span><span class="ps-delta" data-trend="down"><i class="ps-i ps-i-down" aria-hidden="true"></i><span>−23.7%</span></span></li><li data-current="12" data-previous="38"><span>Product Hunt</span><span data-mover-value>12</span><span data-mover-change>−26</span><span class="ps-delta" data-trend="down"><i class="ps-i ps-i-down" aria-hidden="true"></i><span>−68.4%</span></span></li><li data-current="264" data-previous="281"><span>Organic search</span><span data-mover-value>264</span><span data-mover-change>−17</span><span class="ps-delta" data-trend="down"><i class="ps-i ps-i-down" aria-hidden="true"></i><span>−6.0%</span></span></li><li data-current="205" data-previous="196"><span>Referral</span><span data-mover-value>205</span><span data-mover-change>+9</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+4.6%</span></span></li></ol></section>
<details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" aria-label="Trial starts, sample values"><table class="ps-table" data-chart-data><caption>Trial starts, sample values</caption><thead><tr><th scope="col">Period</th><th scope="col" data-series="endpoint">This week</th><th scope="col" data-series="endpoint" data-style="previous">Last week</th></tr></thead><tbody><tr><th scope="row" data-label="Monday, Oct 20">Mon</th><td data-value="141">141</td><td data-value="168">168</td></tr><tr><th scope="row" data-label="Tuesday, Oct 21">Tue</th><td data-value="152">152</td><td data-value="174">174</td></tr><tr><th scope="row" data-label="Wednesday, Oct 22">Wed</th><td data-value="138">138</td><td data-value="171">171</td></tr><tr><th scope="row" data-label="Thursday, Oct 23">Thu</th><td data-value="126">126</td><td data-value="162">162</td></tr><tr><th scope="row" data-label="Friday, Oct 24">Fri</th><td data-value="119">119</td><td data-value="149">149</td></tr><tr><th scope="row" data-label="Saturday, Oct 25">Sat</th><td data-value="54">54</td><td data-value="66">66</td></tr><tr><th scope="row" data-label="Sunday, Oct 26">Sun</th><td data-value="47">47</td><td data-value="58">58</td></tr></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Days behind <strong>7 of 7</strong></span><span>Sample data</span></footer></section></main>
```

## Variant: Partial period

A week in progress: Thursday drawn open and labeled partial, later days empty, and the headline comparing only complete days.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Period comparison, partial period</h1><p class="ps-note">A week still in progress: the open day is drawn open and labeled partial, and the headline compares only complete days.</p></header><section class="ps-instrument ps-chart ps-pair" data-ps-period-comparison data-pair-previous="last week" aria-label="Sign-ups sample">
<header class="ps-instrument-header"><div><h2>Sign-ups</h2><p>Sample workspace · Week of October 27 so far, updated Thursday 2:00 PM</p></div></header>
<div class="ps-instrument-body"><div class="ps-chart-head"><dl class="ps-metrics ps-pair-metrics"><div><dt>This week so far</dt><dd data-pair-current>828</dd></div><div><dt>Last week</dt><dd data-pair-previous>1,311</dd></div></dl>
<div class="ps-chart-figure"><span class="ps-delta" data-trend="up" data-chart-delta><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+1.3%</span></span><span class="ps-chart-base" data-chart-base>Mon–Wed against the same days last week</span></div></div>
<ul class="ps-chart-key"><li><i data-series="endpoint"></i>This week</li><li><i data-series="previous"></i>Last week</li><li><i data-series="partial"></i>Partial, still counting</li></ul>
<div class="ps-chart-plot ps-bar-plot" data-chart-plot role="group" aria-label="Paired bars of sign-ups per period, this week beside last week. Choose a pair to read it; arrow keys, Home and End move between pairs."></div>
<p class="ps-chart-readout" data-chart-readout aria-live="polite">Thursday, Oct 30, This week 118 so far, Last week 229</p>
<section class="ps-pair-movers" aria-labelledby="period-comparison--partial-movers"><h3 id="period-comparison--partial-movers">Biggest movers by channel, complete days</h3><ol data-pair-movers><li data-current="342" data-previous="301"><span>Organic search</span><span data-mover-value>342</span><span data-mover-change>+41</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+13.6%</span></span></li><li data-current="158" data-previous="171"><span>Paid search</span><span data-mover-value>158</span><span data-mover-change>−13</span><span class="ps-delta" data-trend="down"><i class="ps-i ps-i-down" aria-hidden="true"></i><span>−7.6%</span></span></li><li data-current="109" data-previous="96"><span>Referral</span><span data-mover-value>109</span><span data-mover-change>+13</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+13.5%</span></span></li><li data-current="168" data-previous="164"><span>Direct</span><span data-mover-value>168</span><span data-mover-change>+4</span><span class="ps-delta" data-trend="up"><i class="ps-i ps-i-up" aria-hidden="true"></i><span>+2.4%</span></span></li></ol></section>
<details class="ps-data-details"><summary>View data</summary><div class="ps-table-region" tabindex="0" aria-label="Sign-ups, sample values"><table class="ps-table" data-chart-data><caption>Sign-ups, sample values</caption><thead><tr><th scope="col">Period</th><th scope="col" data-series="endpoint">This week</th><th scope="col" data-series="endpoint" data-style="previous">Last week</th></tr></thead><tbody><tr><th scope="row" data-label="Monday, Oct 27">Mon</th><td data-value="224">224</td><td data-value="212">212</td></tr><tr><th scope="row" data-label="Tuesday, Oct 28">Tue</th><td data-value="247">247</td><td data-value="238">238</td></tr><tr><th scope="row" data-label="Wednesday, Oct 29">Wed</th><td data-value="239">239</td><td data-value="251">251</td></tr><tr><th scope="row" data-label="Thursday, Oct 30">Thu</th><td data-value="118" data-partial>118 (partial)</td><td data-value="229">229</td></tr><tr><th scope="row" data-label="Friday, Oct 31">Fri</th><td data-value="">—</td><td data-value="204">204</td></tr><tr><th scope="row" data-label="Saturday, Nov 1">Sat</th><td data-value="">—</td><td data-value="96">96</td></tr><tr><th scope="row" data-label="Sunday, Nov 2">Sun</th><td data-value="">—</td><td data-value="81">81</td></tr></tbody></table></div></details></div>
<footer class="ps-instrument-footer"><span>Complete days <strong>3 of 7</strong></span><span>Sample data</span></footer></section></main>
```
