# Segmented control (segmented-control)

Kind: component. One compact choice, with a clear selected state.

Task: Choose exactly one option from a small, related set without opening a menu.

Elements: [text](text.md), [input](input.md).

Category: input.

## content

- A fieldset with a visible legend.
- Two to four native radios sharing a unique name per group.
- Short, distinct option labels.

## states

- Exactly one option starts selected.
- Selection is separate from keyboard focus.
- A disabled option remains legible and cannot be selected.

## responsive

- Segments share the available width.
- Labels wrap within their segment; do not hide them on small screens.

## checks

- Arrow keys move and select using native radio behavior.
- Tab enters the selected option; focus is visible around its label.
- The checked value is available through FormData.
- Use a separate tab pattern when the controls switch content panels.

## HTML

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Segmented control</h1><p class="ps-note">One choice from two to five related options. Native radios carry the selection and keyboard behavior.</p></header>
  <fieldset class="ps-choice"><legend>Review scope</legend><div class="ps-segments">
    <label><input type="radio" name="review-scope" value="page" checked><span>Page</span></label>
    <label><input type="radio" name="review-scope" value="section"><span>Section</span></label>
    <label><input type="radio" name="review-scope" value="site"><span>Site</span></label>
  </div></fieldset>
  <p class="ps-note">Use the arrow keys to move between scopes. This example sets a value; it does not start an audit.</p>
</main>
```

## Variant: Disabled option

A four-option range with one unavailable option that stays visible, plus a note on when it becomes available.

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Selection</p><h1 class="ps-heading">An option that is not available yet.</h1><p class="ps-note">A disabled segment stays visible so the full set is understood.</p></header>
  <fieldset class="ps-choice" aria-describedby="range-help"><legend>Chart range</legend><div class="ps-segments">
    <label><input type="radio" name="chart-range" value="day"><span>Day</span></label>
    <label><input type="radio" name="chart-range" value="week" checked><span>Week</span></label>
    <label><input type="radio" name="chart-range" value="month"><span>Month</span></label>
    <label><input type="radio" name="chart-range" value="quarter" disabled><span>Quarter</span></label>
  </div></fieldset>
  <p id="range-help" class="ps-note">Quarter becomes available after 90 days of sample data. Arrow keys skip it.</p>
</main>
```

## Variant: With counts

Filter segments that show how many items each choice would include, using tabular figures.

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Selection</p><h1 class="ps-heading">Choices with a count.</h1><p class="ps-note">Each segment shows how many items it would include.</p></header>
  <fieldset class="ps-choice"><legend>Show review threads</legend><div class="ps-segments ps-segments-counts">
    <label><input type="radio" name="thread-status" value="open" checked><span>Open <small class="ps-numeric">12</small></span></label>
    <label><input type="radio" name="thread-status" value="resolved"><span>Resolved <small class="ps-numeric">48</small></span></label>
    <label><input type="radio" name="thread-status" value="all"><span>All <small class="ps-numeric">60</small></span></label>
  </div></fieldset>
  <p class="ps-note">Sample counts. This sets a filter value; use tabs when each choice reveals its own panel.</p>
</main>
```

## Variant: Two-line labels

A two-option choice where each segment has a short label and one supporting line, such as a billing period with prices.

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Selection</p><h1 class="ps-heading">Two choices with detail.</h1><p class="ps-note">A short label with one supporting line, for choices that differ in a value.</p></header>
  <fieldset class="ps-choice"><legend>Billing period</legend><div class="ps-segments ps-segments-detail">
    <label><input type="radio" name="billing-period" value="monthly"><span><strong>Monthly</strong><small>$24 per seat a month</small></span></label>
    <label><input type="radio" name="billing-period" value="yearly" checked><span><strong>Yearly</strong><small>$240 per seat a year</small></span></label>
  </div></fieldset>
  <p class="ps-note">Sample prices. Yearly billing is charged once and renews on the same date.</p>
</main>
```
