# Brief composer (composer)

Kind: component. A quiet place to turn an intention into a useful brief.

Task: Capture a short page or audit brief, choose its intent, and prepare an explicit local handoff.

Elements: [text](text.md), [input](input.md), [button](button.md).

Category: input.

Native behavior: composer. It needs pagesystem.js (see ../implementation.md).

## content

- A labeled textarea with a 2,000-character limit.
- A native intent selector: page brief or site review.
- An explicit prepare action and a local result.

## states

- Empty or whitespace-only: prepare is disabled.
- Editing: previous output is cleared so it never represents a changed draft.
- Prepared: show the exact trimmed text and intent; keep the draft editable.
- No model, upload, persistence or remote request is implied.

## responsive

- The textarea fills the available width.
- Controls wrap without clipping; the result wraps long text.

## checks

- Tab reaches the textarea, intent and action in source order.
- Enter inserts a newline; Ctrl/Cmd + Enter prepares a valid draft.
- Preparation emits one bubbling pagesystem:brief event with {text, intent}.
- Result text is inserted with textContent, never parsed as HTML.
- The exported HTML works offline, including the local behavior.

## HTML

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Brief composer</h1><p class="ps-note">A text area and brief type selector that prepare a local draft brief.</p></header>
  <div data-ps-composer class="ps-stack">
    <form class="ps-composer">
      <label class="ps-visually-hidden" for="brief-text">Your brief</label>
      <textarea id="brief-text" name="brief" rows="3" maxlength="2000" required placeholder="Describe the page you need…" aria-describedby="brief-help"></textarea>
      <div class="ps-composer-actions">
        <label class="ps-visually-hidden" for="brief-intent">Brief type</label>
        <select id="brief-intent" name="intent"><option value="page">Page brief</option><option value="review">Site review</option></select>
        <button class="ps-button ps-button-primary" type="submit" disabled aria-label="Prepare brief">Prepare <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </form>
    <p id="brief-help" class="ps-note">A local draft. Nothing is sent.</p>
    <div data-brief-result class="ps-brief-result" role="status" aria-atomic="true" hidden><p data-brief-title class="ps-kicker"></p><p data-brief-text></p></div>
  </div>
</main>
```

## Variant: Prefilled draft

A composer that opens with existing brief text, so Prepare is available straight away.

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Composer</p><h1 class="ps-heading">Pick up a draft brief.</h1><p class="ps-note">The composer starts with existing text, so prepare is available at once.</p></header>
  <div data-ps-composer class="ps-stack">
    <form class="ps-composer">
      <label class="ps-visually-hidden" for="draft-text">Your brief</label>
      <textarea id="draft-text" name="brief" rows="4" maxlength="2000" required aria-describedby="draft-help">A pricing page for Northstar's team plan. Three tiers with monthly and yearly billing, a comparison table of the 12 features that differ, and an FAQ covering seat changes, invoices and refunds. Audience: operations leads at 20–200 person studios.</textarea>
      <div class="ps-composer-actions">
        <label class="ps-visually-hidden" for="draft-intent">Brief type</label>
        <select id="draft-intent" name="intent"><option value="page">Page brief</option><option value="review">Site review</option></select>
        <button class="ps-button ps-button-primary" type="submit" disabled aria-label="Prepare brief">Prepare <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </form>
    <p id="draft-help" class="ps-note">Sample draft. Press Ctrl or Cmd and Enter to prepare. Nothing is sent.</p>
    <div data-brief-result class="ps-brief-result" role="status" aria-atomic="true" hidden><p data-brief-title class="ps-kicker"></p><p data-brief-text></p></div>
  </div>
</main>
```

## Variant: Single line

A compact one-line composer for toolbars and list headers, defaulting to a site review; the field grows as the text wraps.

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Composer</p><h1 class="ps-heading">A one-line brief.</h1><p class="ps-note">A compact composer for a toolbar or the top of a list. The field grows as text wraps.</p></header>
  <div data-ps-composer class="ps-stack">
    <form class="ps-composer ps-composer-inline">
      <label class="ps-visually-hidden" for="quick-text">Your brief</label>
      <textarea id="quick-text" name="brief" rows="1" maxlength="2000" required placeholder="Review the checkout pages for…" aria-describedby="quick-help"></textarea>
      <div class="ps-composer-actions">
        <label class="ps-visually-hidden" for="quick-intent">Brief type</label>
        <select id="quick-intent" name="intent"><option value="review">Site review</option><option value="page">Page brief</option></select>
        <button class="ps-button ps-button-primary" type="submit" disabled aria-label="Prepare brief">Prepare <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </form>
    <p id="quick-help" class="ps-note">Starts as a site review. A local draft; nothing is sent.</p>
    <div data-brief-result class="ps-brief-result" role="status" aria-atomic="true" hidden><p data-brief-title class="ps-kicker"></p><p data-brief-text></p></div>
  </div>
</main>
```

## Variant: Prepared

The state after Prepare: the exact trimmed text and intent shown under the still-editable draft.

```html
<main>
  <header class="ps-stack-tight"><p class="ps-kicker">Component / Composer</p><h1 class="ps-heading">A prepared brief.</h1><p class="ps-note">The state after Prepare: the exact text and intent shown below an editable draft.</p></header>
  <div class="ps-stack">
    <form class="ps-composer">
      <label class="ps-visually-hidden" for="done-text">Your brief</label>
      <textarea id="done-text" name="brief" rows="3" maxlength="2000" required aria-describedby="done-help">Review the onboarding flow on northstar.studio: sign-up, workspace setup and the first invite. Flag unclear copy, missing error states and anything that fails at 375 px.</textarea>
      <div class="ps-composer-actions">
        <label class="ps-visually-hidden" for="done-intent">Brief type</label>
        <select id="done-intent" name="intent"><option value="page">Page brief</option><option value="review" selected>Site review</option></select>
        <button class="ps-button ps-button-primary" type="button" aria-label="Prepare brief">Prepare <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </form>
    <p id="done-help" class="ps-note">Static sample of the prepared state. Editing the live composer clears this result.</p>
    <div class="ps-brief-result" role="status" aria-atomic="true"><p class="ps-kicker">Site review · prepared locally</p><p>Review the onboarding flow on northstar.studio: sign-up, workspace setup and the first invite. Flag unclear copy, missing error states and anything that fails at 375 px.</p></div>
  </div>
</main>
```
