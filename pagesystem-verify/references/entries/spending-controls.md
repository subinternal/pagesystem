# Spending controls (spending-controls)

Kind: component. Configure a sample card with linked budget limits and merchant restrictions.

Task: Configure a sample card with linked budget limits and merchant restrictions.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: workflow.

Native behavior: spending-controls. It needs pagesystem.js (see ../implementation.md).

## content

- Monthly limit as the headline figure, with a delta from the saved limit while unsaved
- Spent this month on a unit meter with today's pace and what is left per day
- Per-transaction limit, merchant categories and payment toggles
- Sample cardholder context and visible feedback

## states

- valid
- invalid limits
- unsaved
- saved
- discarded
- over pace
- over limit

## responsive

- Stack related fields at narrow widths.
- Preserve text enlargement, keyboard access and visible labels.

## checks

- Per-transaction limits cannot exceed the monthly limit.
- Range and numeric entry update the same limit.
- Save and discard affect only the local demo.
- Pace and limit status read in words and an icon, never color alone.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Spending controls</h1><p class="ps-note">Configure a sample company card with linked limits and explicit restrictions.</p></header><section class="ps-instrument" data-ps-spending-controls data-spend-spent="2860" data-spend-day="19" data-spend-days="30" aria-label="Sample spending controls"><header class="ps-instrument-header"><div><h2>Design team card</h2><p>Maya Okafor · Sample workspace</p></div><span class="ps-note" data-spend-dirty></span></header><form class="ps-instrument-body" novalidate>
<div class="ps-spend-summary"><div class="ps-spend-lead"><p class="ps-note">Monthly limit · <span data-spend-type>Physical card</span></p><p class="ps-spend-figure"><strong class="ps-card-limit" data-spend-total>$5,000</strong><span class="ps-delta" data-spend-delta hidden></span></p></div><p class="ps-note">Maya Okafor · ends 4821</p></div>
<div class="ps-spend-meter" data-spend-meter><div class="ps-spend-meter-head"><p class="ps-spend-spent"><span class="ps-spend-label">Spent in November</span><strong class="ps-spend-amount">$2,860</strong><span class="ps-spend-share" data-spend-share>57% of $5,000</span></p><p class="ps-spend-key"><span class="ps-spend-key-mark" aria-hidden="true"></span>Expected by day 19 <strong data-spend-expected>$3,167</strong></p></div><div class="ps-spend-track" style="--cells:30;--pace:19"><div class="ps-units" data-spend-units role="img" aria-label="$2,860 spent of $5,000, 57%. Expected by day 19 of 30: $3,167. On pace."><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="ps-spend-tick" aria-hidden="true"></span></div><p class="ps-goals-line"><span class="ps-goal-status" data-status="on" data-spend-pace><i class="ps-i ps-i-check" aria-hidden="true"></i>On pace</span><span data-spend-budget>$2,140 left · $194 a day for 11 days</span></p></div>
<div class="ps-field-pair"><label class="ps-compact-field">Card type<select class="ps-input" name="type"><option value="physical">Physical</option><option value="virtual">Virtual</option></select></label><label class="ps-compact-field">Monthly limit · USD<input class="ps-input" type="number" name="monthly" value="5000" min="100" max="10000" step="1" required></label></div><label class="ps-compact-field">Adjust monthly limit<input class="ps-budget-range" type="range" min="100" max="10000" step="1" value="5000" data-spend-range></label><label class="ps-compact-field">Per‑transaction limit · USD<input class="ps-input" type="number" name="transaction" value="1500" min="1" step="1" required></label>
<fieldset class="ps-weekday-options"><legend>Allowed merchant categories</legend><label><input type="checkbox" name="category" value="Software" checked>Software</label><label><input type="checkbox" name="category" value="Travel" checked>Travel</label><label><input type="checkbox" name="category" value="Ads" checked>Ads</label><label><input type="checkbox" name="category" value="Meals">Meals</label><label><input type="checkbox" name="category" value="Hardware">Hardware</label></fieldset>
<label class="ps-check-row">Online payments<input type="checkbox" name="online" checked></label><label class="ps-check-row">International payments<input type="checkbox" name="international" checked></label><p class="ps-workflow-status" data-spend-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-spend-discard>Discard changes</button><button class="ps-button ps-button-primary" type="submit">Save controls</button></div></form><footer class="ps-instrument-footer"><span>Sample card</span><span>No financial changes</span></footer></section></main>
```

## Variant: Side panel

A compact settings panel for one single-vendor virtual card, opened beside a list of cards.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Spending controls, side panel</h1><p class="ps-note">A compact settings panel for one virtual card, opened beside a list of cards.</p></header>
<section class="ps-instrument ps-spend-panel" data-density="compact" data-ps-spending-controls data-spend-spent="470" data-spend-day="19" data-spend-days="30" aria-label="Sample virtual card controls">
<header class="ps-instrument-header"><div><h2>Figma subscription</h2><p>Sam Chen · Engineering · sample</p></div><span class="ps-note" data-spend-dirty></span></header>
<form class="ps-instrument-body" novalidate>
<div class="ps-spend-summary"><div class="ps-spend-lead"><p class="ps-note">Monthly limit · <span data-spend-type>Virtual card</span></p><p class="ps-spend-figure"><strong class="ps-card-limit" data-spend-total>$600</strong><span class="ps-delta" data-spend-delta hidden></span></p></div><p class="ps-note">Single vendor · ends 0937</p></div>
<div class="ps-spend-meter" data-spend-meter><div class="ps-spend-meter-head"><p class="ps-spend-spent"><span class="ps-spend-label">Spent in November</span><strong class="ps-spend-amount">$470</strong><span class="ps-spend-share" data-spend-share>78% of $600</span></p><p class="ps-spend-key"><span class="ps-spend-key-mark" aria-hidden="true"></span>Expected by day 19 <strong data-spend-expected>$380</strong></p></div><div class="ps-spend-track" style="--cells:30;--pace:19"><div class="ps-units" data-spend-units role="img" aria-label="$470 spent of $600, 78%. Expected by day 19 of 30: $380. Over pace."><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on data-over></i><i data-on data-over></i><i data-on data-over></i><i data-on data-over></i><i data-on data-over></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="ps-spend-tick" aria-hidden="true"></span></div><p class="ps-goals-line"><span class="ps-goal-status" data-status="over" data-spend-pace><i class="ps-i ps-i-kpi-alert" aria-hidden="true"></i>Over pace</span><span data-spend-budget>$130 left · $11 a day for 11 days</span></p></div>
<div class="ps-field-pair">
<label class="ps-compact-field">Card type<select class="ps-input" name="type"><option value="physical">Physical</option><option value="virtual" selected>Virtual</option></select></label>
<label class="ps-compact-field">Monthly limit · USD<input class="ps-input" type="number" name="monthly" value="600" min="100" max="10000" step="1" required></label>
</div>
<label class="ps-compact-field">Adjust monthly limit<input class="ps-budget-range" type="range" min="100" max="10000" step="1" value="600" data-spend-range></label>
<label class="ps-compact-field">Per‑transaction limit · USD<input class="ps-input" type="number" name="transaction" value="600" min="1" step="1" required></label>
<fieldset class="ps-weekday-options"><legend>Allowed merchant categories</legend><label><input type="checkbox" name="category" value="Software" checked>Software</label><label><input type="checkbox" name="category" value="Travel">Travel</label><label><input type="checkbox" name="category" value="Ads">Ads</label><label><input type="checkbox" name="category" value="Meals">Meals</label><label><input type="checkbox" name="category" value="Hardware">Hardware</label></fieldset>
<div class="ps-spend-toggles"><label class="ps-check-row">Online payments<input type="checkbox" name="online" checked></label><label class="ps-check-row">International payments<input type="checkbox" name="international" checked></label></div>
<p class="ps-workflow-status" data-spend-status role="status"></p>
<div class="ps-workflow-actions"><button class="ps-button" type="button" data-spend-discard>Discard</button><button class="ps-button ps-button-primary" type="submit">Save controls</button></div>
</form>
<footer class="ps-instrument-footer"><span>Sample virtual card</span><span>No financial changes</span></footer>
</section>
</main>
```

## Variant: Invalid limits

The state after saving a per-transaction limit above the monthly limit with no merchant category selected, with a linked list of the errors.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Spending controls, invalid limits</h1><p class="ps-note">What the cardholder sees after saving a per‑transaction limit above the monthly limit with no merchant category selected.</p></header>
<section class="ps-instrument" aria-label="Sample spending controls with errors">
<header class="ps-instrument-header"><div><h2>Design team card</h2><p>Maya Okafor · Sample workspace</p></div><span class="ps-note">Unsaved changes</span></header>
<div class="ps-instrument-body">
<div class="ps-spend-errors" role="alert" aria-labelledby="spend-invalid-title">
<p id="spend-invalid-title" class="ps-spend-errors-title">Fix two settings before saving</p>
<ul><li><a href="#spend-invalid-transaction">Per‑transaction limit is higher than the monthly limit</a></li><li><a href="#spend-invalid-software">Select at least one merchant category</a></li></ul>
</div>
<div class="ps-spend-summary"><div class="ps-spend-lead"><p class="ps-note">Monthly limit · Physical card</p><p class="ps-spend-figure"><strong class="ps-card-limit">$5,000</strong></p></div><p class="ps-note">Maya Okafor · ends 4821</p></div>
<div class="ps-field-pair">
<label class="ps-compact-field">Card type<select class="ps-input" name="type"><option value="physical" selected>Physical</option><option value="virtual">Virtual</option></select></label>
<label class="ps-compact-field">Monthly limit · USD<input class="ps-input" type="number" name="monthly" value="5000" min="100" max="10000" step="1" required></label>
</div>
<label class="ps-compact-field">Adjust monthly limit<input class="ps-budget-range" type="range" min="100" max="10000" step="1" value="5000"></label>
<p class="ps-note">$5,000 of the sample team budget remains</p>
<div class="ps-compact-field">
<label for="spend-invalid-transaction">Per‑transaction limit · USD</label>
<input class="ps-input" id="spend-invalid-transaction" type="number" name="transaction" value="6000" min="1" step="1" required aria-invalid="true" aria-describedby="spend-invalid-transaction-error">
<p class="ps-error" id="spend-invalid-transaction-error">Must be $5,000 or less, the current monthly limit.</p>
</div>
<fieldset class="ps-weekday-options" aria-describedby="spend-invalid-category-error"><legend>Allowed merchant categories</legend><label><input id="spend-invalid-software" type="checkbox" name="category" value="Software" aria-invalid="true">Software</label><label><input type="checkbox" name="category" value="Travel" aria-invalid="true">Travel</label><label><input type="checkbox" name="category" value="Ads" aria-invalid="true">Ads</label><label><input type="checkbox" name="category" value="Meals" aria-invalid="true">Meals</label><label><input type="checkbox" name="category" value="Hardware" aria-invalid="true">Hardware</label><p class="ps-error ps-spend-fieldset-error" id="spend-invalid-category-error">With no category selected, every purchase would be declined.</p></fieldset>
<label class="ps-check-row">Online payments<input type="checkbox" name="online" checked></label>
<label class="ps-check-row">International payments<input type="checkbox" name="international" checked></label>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Discard changes</button><button class="ps-button ps-button-primary" type="button">Save controls</button></div>
</div>
<footer class="ps-instrument-footer"><span>Sample card</span><span>No financial changes</span></footer>
</section>
</main>
```

## Variant: Managed

The cardholder's read-only view when finance sets the limits, showing the limit, this month's spend on a unit meter and a way to request a change.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Spending controls, managed by finance</h1><p class="ps-note">The cardholder's read-only view when limits are set by a finance policy, with this month's spend and a way to request a change.</p></header>
<section class="ps-instrument" aria-label="Sample managed spending controls">
<header class="ps-instrument-header"><div><h2>Design team card</h2><p>Maya Okafor · Sample workspace</p></div><span class="ps-note">Managed by Finance</span></header>
<div class="ps-instrument-body">
<div class="ps-spend-summary"><div class="ps-spend-lead"><p class="ps-note">Monthly limit · Physical card</p><p class="ps-spend-figure"><strong class="ps-card-limit">$5,000</strong></p></div><p class="ps-note">Resets on December 1</p></div>
<div class="ps-spend-meter"><div class="ps-spend-meter-head"><p class="ps-spend-spent"><span class="ps-spend-label">Spent in November</span><strong class="ps-spend-amount">$3,180</strong><span class="ps-spend-share">64% of $5,000</span></p><p class="ps-spend-key"><span class="ps-spend-key-mark" aria-hidden="true"></span>Expected by day 21 <strong>$3,500</strong></p></div><div class="ps-spend-track" style="--cells:30;--pace:21"><div class="ps-units" role="img" aria-label="$3,180 spent of $5,000, 64%. Expected by day 21 of 30: $3,500. On pace."><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i data-on></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="ps-spend-tick" aria-hidden="true"></span></div><p class="ps-goals-line"><span class="ps-goal-status" data-status="on"><i class="ps-i ps-i-check" aria-hidden="true"></i>On pace</span><span>$1,820 left · $202 a day for 9 days</span></p></div>
<dl class="ps-spend-rules">
<div><dt>Per‑transaction limit</dt><dd>$1,500</dd></div>
<div><dt>Merchant categories</dt><dd>Software, Travel, Ads</dd></div>
<div><dt>Online payments</dt><dd>Allowed</dd></div>
<div><dt>International payments</dt><dd>Allowed</dd></div>
</dl>
<p class="ps-data-readout">These limits follow the sample Design team policy. Only a finance admin can change them; a request goes to Lena Hoffmann.</p>
<div class="ps-workflow-actions"><button class="ps-button" type="button">View policy</button><button class="ps-button ps-button-primary" type="button">Request a change</button></div>
</div>
<footer class="ps-instrument-footer"><span>Sample card</span><span>Last changed October 3 by Lena Hoffmann</span></footer>
</section>
</main>
```
