# Landing (landing)

Kind: system. Make the offer clear. Give the next step a reason.

Task: Decide whether this product belongs in my work.

Composition: opening ([page-header](page-header.md)) → explanation ([answer](answer.md)) → proof ([record-summary](record-summary.md)) → next-step ([action-bar](action-bar.md)).

## content

- A concrete audience and outcome
- A demonstrated mechanism
- Evidence with provenance
- One primary next step

## states

- ready: evidence and action available
- unreleased: say what exists and what is planned

## responsive

- Opening stacks before copy becomes narrow.
- Proof and action keep the same container edges.

## checks

- One page title and ordered headings.
- Keyboard order follows reading order.
- Source HTML contains the answer; no script is needed to read it.
- Text contrast and focus must be measured in both themes.

## HTML

```html
<main class="ps-page" id="main"><header class="ps-stack"><p class="ps-kicker">Fieldnotes / sample product page</p><h1 class="ps-title">Keep the thinking with the work.</h1><p class="ps-lead">A shared project notebook for small teams. Decisions, evidence, and next steps in one place.</p><div class="ps-row"><a class="ps-button ps-button-primary" href="#example">See the notebook <span class="ps-i ps-i-up-right" aria-hidden="true"></span></a><a href="#availability">Availability</a></div></header><section class="ps-prose"><h2 class="ps-heading">What belongs in a project notebook?</h2><p>The decisions that explain the work: what changed, why it changed, and what happens next. A notebook keeps that context beside the project, so the next person can pick it up without piecing together a conversation.</p></section><section id="example" class="ps-panel ps-stack"><p class="ps-kicker">Sample notebook / website refresh</p><h2 class="ps-heading">Make the next step obvious.</h2><p>Decision: put the project inquiry after the service scope, where the visitor has enough context to act.</p><dl class="ps-facts"><div><dt>Owner</dt><dd>Design team</dd></div><div><dt>State</dt><dd>Proposed</dd></div><div><dt>Next</dt><dd>Review the page</dd></div></dl></section><section id="availability" class="ps-stack"><h2 class="ps-heading">A product concept, made tangible.</h2><p>This is a fictional product specimen. No account or hosted notebook is available.</p><a href="#example">Return to the example</a></section></main>
```
