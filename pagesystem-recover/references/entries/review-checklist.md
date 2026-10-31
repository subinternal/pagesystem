# Review checklist (review-checklist)

Kind: component. Small checks that make the next decision clearer.

Task: Track explicitly completed review steps with an honest, reversible progress indicator.

Elements: [text](text.md), [input](input.md), [button](button.md).

Category: workflow.

Native behavior: review-checklist. It needs pagesystem.js (see ../implementation.md).

## content

- A named group of review steps.
- Native checkboxes with complete labels.
- A live completion count, progress bar and reset action.
- An explicit sample label; completing checks is not an approval.

## states

- Untouched: zero steps checked.
- In progress: count and progress match the checked steps.
- Complete: all steps checked, without claiming the page passed an audit.
- Reset: restore the authored defaults and report the new count.

## responsive

- Rows allow labels to wrap and keep the checkbox visible.
- Reset and count wrap without overlap.

## checks

- Space toggles the focused checkbox.
- Each update emits one bubbling pagesystem:review event with {completed, total}.
- Reset restores the source defaults and moves no unexpected focus.
- No state is saved or sent; a new document starts fresh.

## HTML

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Review checklist</h1><p class="ps-note">A short list of checks to complete before a decision. Checking every box is not an approval.</p></header>
  <form data-ps-review-checklist class="ps-checklist">
    <fieldset><legend>Before publishing</legend><div class="ps-checklist-items">
      <label><input type="checkbox" name="review" value="task"><span>Title and summary are final</span></label>
      <label><input type="checkbox" name="review" value="content"><span>All links have been checked</span></label>
      <label><input type="checkbox" name="review" value="next"><span>An owner is assigned for updates</span></label>
    </div></fieldset>
    <div class="ps-checklist-footer"><span data-review-count role="status" aria-atomic="true">0 of 3 checked</span><button class="ps-reset" type="reset">Reset</button></div>
    <progress max="3" value="0" aria-label="Review steps checked"></progress>
  </form>
</main>
```

## Variant: Grouped

Six release checks in two named groups, each with a one-line reason, for reviews longer than a handful of steps.

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Review</p><h1 class="ps-heading">Review a release in groups.</h1><p class="ps-note">Example release checks with a short reason for each. Checking every box is not a sign-off.</p></header>
  <form data-ps-review-checklist class="ps-checklist ps-checklist-detailed">
    <div class="ps-checklist-groups">
      <fieldset><legend>Content</legend><div class="ps-checklist-items">
        <label><input type="checkbox" name="review" value="pricing" checked><span><span class="ps-checklist-title">Pricing matches the billing page</span><span class="ps-checklist-hint">Team plan shows $18 per seat in both places.</span></span></label>
        <label><input type="checkbox" name="review" value="changelog" checked><span><span class="ps-checklist-title">Changelog entry links to this release</span><span class="ps-checklist-hint">Version 4.2 notes, not the 4.1 draft.</span></span></label>
        <label><input type="checkbox" name="review" value="screenshots"><span><span class="ps-checklist-title">Screenshots show the current interface</span><span class="ps-checklist-hint">The settings panel was renamed last week.</span></span></label>
      </div></fieldset>
      <fieldset><legend>Access</legend><div class="ps-checklist-items">
        <label><input type="checkbox" name="review" value="keyboard"><span><span class="ps-checklist-title">The new export flow works by keyboard</span><span class="ps-checklist-hint">Tab order reaches the format choice before Export.</span></span></label>
        <label><input type="checkbox" name="review" value="contrast"><span><span class="ps-checklist-title">Status colors keep a text label</span><span class="ps-checklist-hint">Failed exports say Failed, not only red.</span></span></label>
        <label><input type="checkbox" name="review" value="zoom"><span><span class="ps-checklist-title">The dialog reflows at 200% text</span><span class="ps-checklist-hint">No clipped buttons at a 320 pixel viewport.</span></span></label>
      </div></fieldset>
    </div>
    <div class="ps-checklist-footer"><span data-review-count role="status" aria-atomic="true">2 of 6 checked</span><button class="ps-reset" type="reset">Reset</button></div>
    <progress max="6" value="2" aria-label="Release checks completed"></progress>
    <p class="ps-checklist-disclosure">Sample checks. Nothing is saved, and completing them does not approve the release.</p>
  </form>
</main>
```

## Variant: All checked

Every step checked, with a full progress bar and a plain note that a finished checklist is not an audit or approval.

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Review</p><h1 class="ps-heading">Every step checked.</h1><p class="ps-note">Example review with all steps checked. A finished checklist records the reviewer’s own checks; it is not an audit result.</p></header>
  <form data-ps-review-checklist class="ps-checklist">
    <fieldset><legend>Before handing off the onboarding email</legend><div class="ps-checklist-items">
      <label><input type="checkbox" name="review" value="subject" checked><span>The subject line names the product</span></label>
      <label><input type="checkbox" name="review" value="link" checked><span>The setup link opens the right workspace</span></label>
      <label><input type="checkbox" name="review" value="plain" checked><span>The plain-text version reads in order</span></label>
      <label><input type="checkbox" name="review" value="unsubscribe" checked><span>The unsubscribe link is present</span></label>
    </div></fieldset>
    <div class="ps-checklist-footer"><span data-review-count role="status" aria-atomic="true">4 of 4 checked</span><button class="ps-reset" type="reset">Reset</button></div>
    <progress max="4" value="4" aria-label="Review steps checked"></progress>
    <p class="ps-checklist-disclosure">Sample review. All steps checked by you; the email has not been tested or sent.</p>
  </form>
</main>
```

## Variant: Side panel

A narrow handoff checklist with the count and progress above divided rows, for a settings or inspector column.

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Review</p><h1 class="ps-heading">A checklist in a side panel.</h1><p class="ps-note">Example handoff steps in a narrow panel, with the count and progress above the list.</p></header>
  <form data-ps-review-checklist class="ps-checklist ps-checklist-panel">
    <fieldset><legend>Handoff to engineering</legend>
      <div class="ps-checklist-meter"><span data-review-count role="status" aria-atomic="true">1 of 5 checked</span><progress max="5" value="1" aria-label="Handoff steps checked"></progress></div>
      <div class="ps-checklist-items">
        <label><input type="checkbox" name="review" value="states" checked><span>Empty, loading and error states are drawn</span></label>
        <label><input type="checkbox" name="review" value="copy"><span>Final copy replaces placeholder text</span></label>
        <label><input type="checkbox" name="review" value="tokens"><span>Colors and spacing use system tokens</span></label>
        <label><input type="checkbox" name="review" value="narrow"><span>The 375 pixel layout is specified</span></label>
        <label><input type="checkbox" name="review" value="owner"><span>An owner is named for open questions</span></label>
      </div>
    </fieldset>
    <div class="ps-checklist-footer"><span>Sample steps · not an approval</span><button class="ps-reset" type="reset">Reset</button></div>
  </form>
</main>
```
