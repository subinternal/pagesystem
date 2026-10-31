# Revision comparison (revision-compare)

Kind: component. Accept or reject proposed copy by section and assemble the reviewed text.

Task: Accept or reject proposed copy by section and assemble the reviewed text.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: input.

Native behavior: revision-compare. It needs pagesystem.js (see ../implementation.md).

## content

- Original and proposed copy for three sections.
- Independent pending, accepted or rejected decisions.

## states

- pending
- accepted
- rejected
- reopened
- assembled
- reset

## responsive

- Stack panels and editors on narrow screens.
- Keep essential text at body size and control targets readable under text enlargement.

## checks

- Differences preserve all original characters and whitespace.
- All changes must be reviewed before assembly.
- Changing or reopening any decision invalidates the assembled draft.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Revision comparison</h1><p class="ps-note">Review proposed copy section by section and assemble the version you choose.</p></header>
<section class="ps-instrument" data-ps-revision-compare aria-label="Sample copy revision"><header class="ps-instrument-header"><div><h2>A clearer introduction</h2><p>Original → proposed revision</p></div><span class="ps-note" data-revision-count>0 of 3 reviewed</span></header><div class="ps-instrument-body"><label class="ps-visually-hidden" for="revision-progress">Changes reviewed</label><progress class="ps-review-progress" id="revision-progress" data-revision-progress max="3" value="0"></progress>
<div class="ps-revision-sections" data-revision-sections role="group" aria-label="Choose a section"></div><div class="ps-product-heading"><h3 data-revision-title>Change details</h3><span class="ps-note" data-revision-decision></span></div><div class="ps-revision-pair"><section><h4>Original</h4><p data-revision-before></p></section><section><h4>Proposed</h4><p data-revision-after></p></section></div><div class="ps-workflow-actions"><button class="ps-button" type="button" data-revision-reopen>Reopen change</button><button class="ps-button" type="button" data-revision-reject>Keep original</button><button class="ps-button ps-button-primary" type="button" data-revision-accept>Accept revision</button></div><p class="ps-workflow-status" data-revision-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-revision-reset>Reset review</button><button class="ps-button ps-button-primary" type="button" data-revision-assemble>Assemble draft</button></div></div>
<div class="ps-product-result" data-revision-result hidden><label class="ps-compact-field">Reviewed draft<textarea class="ps-input ps-product-output" data-revision-output readonly></textarea></label><button class="ps-button" type="button" data-revision-select>Select draft</button></div><footer class="ps-instrument-footer"><span>Text is preserved exactly</span><span>Local copy sample</span></footer></section></main>
```

## Variant: Assembled

Every change decided and the reviewed draft built from those decisions, ready to copy.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Revision comparison, assembled</h1><p class="ps-note">Every change decided and the reviewed draft assembled from those decisions.</p></header>
<section class="ps-instrument" aria-label="Sample copy revision, assembled"><header class="ps-instrument-header"><div><h2>A clearer introduction</h2><p>Original and proposed revision</p></div><span class="ps-note">3 of 3 reviewed</span></header><div class="ps-instrument-body"><label class="ps-visually-hidden" for="assembled-progress">Changes reviewed</label><progress class="ps-review-progress" id="assembled-progress" max="3" value="3"></progress>
<div class="ps-revision-sections" role="group" aria-label="Choose a section"><button class="ps-revision-section" type="button" aria-pressed="false"><strong>Opening</strong><small class="ps-revision-state"><span class="ps-i ps-i-check" aria-hidden="true"></span>Accepted</small></button><button class="ps-revision-section" type="button" aria-pressed="false"><strong>Delivery</strong><small class="ps-revision-state">Original kept</small></button><button class="ps-revision-section" type="button" aria-pressed="true"><strong>Next step</strong><small class="ps-revision-state"><span class="ps-i ps-i-check" aria-hidden="true"></span>Accepted</small></button></div>
<div class="ps-product-heading"><h3>Next step</h3><span class="ps-note">This change is accepted.</span></div><div class="ps-revision-pair"><section><h4>Original</h4><p><del>Contact us to learn more about our full range of services.</del></p></section><section><h4>Proposed</h4><p><ins>Bring one difficult workflow. We will map the decisions and prototype the next step.</ins></p></section></div>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Reopen change</button><button class="ps-button" type="button">Keep original</button><button class="ps-button ps-button-primary" type="button">Accept revision</button></div><p class="ps-workflow-status" role="status">Reviewed draft assembled locally.</p><div class="ps-workflow-actions"><button class="ps-button" type="button">Reset review</button><button class="ps-button ps-button-primary" type="button">Assemble draft</button></div></div>
<div class="ps-product-result"><label class="ps-compact-field">Reviewed draft<textarea class="ps-input ps-product-output" readonly>We build review tools for product teams that need clearer decisions.

Every project includes a dashboard and a final presentation.

Bring one difficult workflow. We will map the decisions and prototype the next step.</textarea></label><button class="ps-button" type="button">Select draft</button></div><footer class="ps-instrument-footer"><span>2 accepted · 1 original kept</span><span>Local copy sample</span></footer></section></main>
```

## Variant: Inline

One reading column with each change marked in place and decided per section, for narrow panels.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Revision comparison, inline</h1><p class="ps-note">One reading column with each change marked in place, for narrow panels and long documents.</p></header>
<section class="ps-instrument ps-revision-inline" data-density="compact" aria-label="Sample copy revision, inline"><header class="ps-instrument-header"><div><h2>A clearer introduction</h2><p>Changes marked in place</p></div><span class="ps-note">1 of 3 reviewed</span></header><div class="ps-instrument-body"><label class="ps-visually-hidden" for="inline-progress">Changes reviewed</label><progress class="ps-review-progress" id="inline-progress" max="3" value="1"></progress>
<ol class="ps-revision-list">
<li class="ps-revision-item"><div class="ps-product-heading"><h3 id="inline-opening">Opening</h3><span class="ps-revision-state"><span class="ps-i ps-i-check" aria-hidden="true"></span>Accepted</span></div><p class="ps-revision-text">We build review tools for product teams that need clearer decisions.</p><div class="ps-workflow-actions"><button class="ps-button" type="button" aria-describedby="inline-opening">Reopen change</button></div></li>
<li class="ps-revision-item"><div class="ps-product-heading"><h3 id="inline-delivery">Delivery</h3><span class="ps-note">Pending</span></div><p class="ps-revision-text">Every project includes <del>a dashboard and a final presentation.</del> <ins>an interactive prototype, documented decisions and a reusable component library.</ins></p><div class="ps-workflow-actions"><button class="ps-button" type="button" aria-describedby="inline-delivery">Keep original</button><button class="ps-button" type="button" aria-describedby="inline-delivery">Accept revision</button></div></li>
<li class="ps-revision-item"><div class="ps-product-heading"><h3 id="inline-next">Next step</h3><span class="ps-note">Pending</span></div><p class="ps-revision-text"><del>Contact us to learn more about our full range of services.</del> <ins>Bring one difficult workflow. We will map the decisions and prototype the next step.</ins></p><div class="ps-workflow-actions"><button class="ps-button" type="button" aria-describedby="inline-next">Keep original</button><button class="ps-button" type="button" aria-describedby="inline-next">Accept revision</button></div></li>
</ol>
<p class="ps-workflow-status" role="status">Review the two pending changes to assemble the draft.</p><div class="ps-workflow-actions"><button class="ps-button" type="button">Reset review</button><button class="ps-button ps-button-primary" type="button" disabled>Assemble draft</button></div></div><footer class="ps-instrument-footer"><span>Removed text is struck through; added text is underlined</span><span>Local copy sample</span></footer></section></main>
```

## Variant: Reopened

A decided change reopened after assembly, so the old draft is cleared until that change is decided again.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Revision comparison, reopened</h1><p class="ps-note">A decided change reopened after assembly: the old draft is cleared until the change is decided again.</p></header>
<section class="ps-instrument" aria-label="Sample copy revision, reopened"><header class="ps-instrument-header"><div><h2>A clearer introduction</h2><p>Original and proposed revision</p></div><span class="ps-note">2 of 3 reviewed</span></header><div class="ps-instrument-body"><label class="ps-visually-hidden" for="reopened-progress">Changes reviewed</label><progress class="ps-review-progress" id="reopened-progress" max="3" value="2"></progress>
<div class="ps-revision-sections" role="group" aria-label="Choose a section"><button class="ps-revision-section" type="button" aria-pressed="false"><strong>Opening</strong><small class="ps-revision-state"><span class="ps-i ps-i-check" aria-hidden="true"></span>Accepted</small></button><button class="ps-revision-section" type="button" aria-pressed="true"><strong>Delivery</strong><small>Reopened</small></button><button class="ps-revision-section" type="button" aria-pressed="false"><strong>Next step</strong><small class="ps-revision-state">Original kept</small></button></div>
<div class="ps-product-heading"><h3>Delivery</h3><span class="ps-note">Pending · previously accepted</span></div><div class="ps-revision-pair"><section><h4>Original</h4><p>Every project includes <del>a dashboard and a final presentation.</del></p></section><section><h4>Proposed</h4><p>Every project includes <ins>an interactive prototype, documented decisions and a reusable component library.</ins></p></section></div>
<div class="ps-workflow-actions"><button class="ps-button" type="button" disabled>Reopen change</button><button class="ps-button" type="button">Keep original</button><button class="ps-button ps-button-primary" type="button">Accept revision</button></div><p class="ps-workflow-status" role="status">Change reopened. Decide Delivery again to assemble a new draft.</p></div>
<div class="ps-product-result ps-revision-cleared"><h3>Reviewed draft cleared</h3><p class="ps-note">The draft assembled at <time datetime="14:32">2:32 PM</time> no longer matches your decisions, so it was removed rather than left out of date.</p><div class="ps-workflow-actions"><button class="ps-button" type="button">Reset review</button><button class="ps-button ps-button-primary" type="button" disabled>Assemble draft</button></div></div><footer class="ps-instrument-footer"><span>Text is preserved exactly</span><span>Local copy sample</span></footer></section></main>
```
