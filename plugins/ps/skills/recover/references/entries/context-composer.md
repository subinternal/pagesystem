# Context composer (context-composer)

Kind: component. Compose a portable instruction with selected source excerpts and an explicit writing direction.

Task: Compose a portable instruction with selected source excerpts and an explicit writing direction.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: input.

Native behavior: context-composer. It needs pagesystem.js (see ../implementation.md).

## content

- Source records with names and excerpts.
- Instruction, formality and detail values.

## states

- ready
- missing instruction
- no sources
- prepared
- edited
- reset

## responsive

- Stack panels and editors on narrow screens.
- Keep essential text at body size and control targets readable under text enlargement.

## checks

- Editing invalidates the prepared brief.
- Source toggles control the exact excerpts included.
- Tone controls work by keyboard; Ctrl/Command Enter prepares without sending.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Context composer</h1><p class="ps-note">Bring source material, an instruction and a writing direction into one portable brief.</p></header>
<section class="ps-instrument" data-ps-context-composer aria-label="Context brief composer"><header class="ps-instrument-header"><div><h2>A little more context</h2><p>Prepare an instruction with its sources</p></div><span class="ps-product-label">Local workspace</span></header><form class="ps-instrument-body">
<fieldset class="ps-context-options"><legend>Include sources</legend><div class="ps-context-sources" data-context-sources></div></fieldset><div class="ps-context-excerpt" data-context-excerpt></div>
<label class="ps-compact-field">What should happen next?<textarea class="ps-input ps-template-input" name="instruction" maxlength="1000" required>Turn these notes into a practical brief for the project overview page.</textarea></label><p class="ps-note" data-context-count></p>
<div class="ps-product-heading"><h3>Writing direction</h3><span class="ps-note" data-context-style></span></div><div class="ps-tone-plane" aria-hidden="true"><div class="ps-tone-field"><i data-context-dot></i></div><span class="ps-tone-top">Brief</span><span class="ps-tone-bottom">Detailed</span><span class="ps-tone-left">Formal</span><span class="ps-tone-right">Conversational</span></div>
<p class="ps-note">Drag the point or use the sliders to set the writing direction.</p><div class="ps-field-pair"><label class="ps-easing-input">Formality<input type="range" min="0" max="100" value="35" name="formality"><output>Balanced</output></label><label class="ps-easing-input">Detail<input type="range" min="0" max="100" value="30" name="depth"><output>Brief</output></label></div>
<p class="ps-workflow-status" data-context-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-context-reset>Reset brief</button><button class="ps-button ps-button-primary" type="submit" data-context-prepare>Prepare brief</button></div></form>
<div class="ps-product-result" data-context-result hidden><label class="ps-compact-field">Prepared brief<textarea class="ps-input ps-product-output" data-context-output readonly></textarea></label><button class="ps-button" type="button" data-context-select>Select brief</button></div><footer class="ps-instrument-footer"><span>⌘ / Ctrl Enter to prepare</span><span>No AI generation or sending</span></footer></section></main>
```

## Variant: Prepared brief

The finished brief, ready to copy, beside a summary of its instruction, sources, writing direction and length.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Context composer, prepared brief</h1><p class="ps-note">The finished brief beside a summary of what went into it, ready to copy into another tool.</p></header>
<section class="ps-instrument ps-context-prepared" aria-label="Prepared context brief"><header class="ps-instrument-header"><div><h2>A little more context</h2><p>Brief prepared from 2 sources</p></div><span class="ps-product-label">Local workspace</span></header><div class="ps-instrument-body">
<dl class="ps-context-summary"><div><dt>Instruction</dt><dd>Draft a short update for the design team about what the first release covers.</dd></div><div><dt>Sources</dt><dd>Research notes, Launch brief</dd></div><div><dt>Writing direction</dt><dd>Conversational · Detailed</dd></div><div><dt>Length</dt><dd><span class="ps-context-figure">77</span> / 1,000 characters</dd></div></dl>
<p class="ps-workflow-status" role="status">Brief prepared locally. No generated answer or message was sent.</p>
</div>
<div class="ps-product-result"><label class="ps-compact-field">Prepared brief<textarea class="ps-input ps-product-output" readonly>Draft a short update for the design team about what the first release covers.

Style: conversational, detailed.

Research notes
Teams lose context when project decisions move between documents. Keep the source beside the decision.

Launch brief
The first release serves small product teams. Prioritize review, clear ownership and a useful offline handoff.</textarea></label><div class="ps-workflow-actions"><button class="ps-button" type="button">Edit brief</button><button class="ps-button ps-button-primary" type="button">Select brief</button></div></div>
<footer class="ps-instrument-footer"><span>Editing any field clears this brief</span><span>No AI generation or sending</span></footer></section></main>
```

## Variant: Incomplete

No source selected and no instruction written, so preparing is disabled and each field says what is missing.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Context composer, incomplete</h1><p class="ps-note">No source selected and no instruction written: preparing is blocked and each field says why.</p></header>
<section class="ps-instrument" aria-label="Incomplete context brief"><header class="ps-instrument-header"><div><h2>A little more context</h2><p>Prepare an instruction with its sources</p></div><span class="ps-product-label">Local workspace</span></header><form class="ps-instrument-body" aria-describedby="incomplete-status">
<fieldset class="ps-context-options" aria-describedby="incomplete-sources-error"><legend>Include sources</legend><div class="ps-context-sources"><label class="ps-context-source"><input type="checkbox" value="research"><span><strong>Research notes</strong><small>Research</small></span></label><label class="ps-context-source"><input type="checkbox" value="principles"><span><strong>Interface principles</strong><small>Guidelines</small></span></label><label class="ps-context-source"><input type="checkbox" value="launch"><span><strong>Launch brief</strong><small>Planning</small></span></label></div><p class="ps-error ps-context-error" id="incomplete-sources-error">Select at least one source.</p></fieldset>
<div class="ps-context-excerpt ps-context-excerpt-empty"><p>Select a source to include its context.</p></div>
<label class="ps-compact-field">What should happen next?<textarea class="ps-input ps-template-input" name="instruction" maxlength="1000" required aria-invalid="true" aria-describedby="incomplete-instruction-error"></textarea></label><p class="ps-error" id="incomplete-instruction-error">Write an instruction from 1 to 1,000 characters.</p><p class="ps-note">0 sources · 0 / 1,000 characters</p>
<div class="ps-product-heading"><h3>Writing direction</h3><span class="ps-note">Balanced · Brief</span></div><div class="ps-tone-plane ps-tone-plane-still" aria-hidden="true"><div class="ps-tone-field"><i class="ps-tone-dot-35-30"></i></div><span class="ps-tone-top">Brief</span><span class="ps-tone-bottom">Detailed</span><span class="ps-tone-left">Formal</span><span class="ps-tone-right">Conversational</span></div>
<div class="ps-field-pair"><label class="ps-easing-input">Formality<input type="range" min="0" max="100" value="35" name="formality" aria-valuetext="Balanced"><output>Balanced</output></label><label class="ps-easing-input">Detail<input type="range" min="0" max="100" value="30" name="depth" aria-valuetext="Brief"><output>Brief</output></label></div>
<p class="ps-workflow-status" id="incomplete-status" role="status">Two things are missing before a brief can be prepared.</p><div class="ps-workflow-actions"><button class="ps-button" type="button">Reset brief</button><button class="ps-button ps-button-primary" type="submit" disabled>Prepare brief</button></div></form>
<footer class="ps-instrument-footer"><span>Writing direction is kept while you fix the rest</span><span>No AI generation or sending</span></footer></section></main>
```

## Variant: Two panes

A wide layout that keeps the selected sources and excerpts in view while the instruction and writing direction are set.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Context composer, two panes</h1><p class="ps-note">A wide layout that keeps the chosen sources in view while the instruction and direction are written.</p></header>
<section class="ps-instrument ps-context-split" data-ps-context-composer aria-label="Context brief composer, two panes"><header class="ps-instrument-header"><div><h2>A little more context</h2><p>Prepare an instruction with its sources</p></div><span class="ps-product-label">Local workspace</span></header><form class="ps-instrument-body">
<div class="ps-context-pane"><fieldset class="ps-context-options"><legend>Include sources</legend><div class="ps-context-sources" data-context-sources></div></fieldset><div class="ps-context-excerpt" data-context-excerpt></div></div>
<div class="ps-context-pane"><label class="ps-compact-field">What should happen next?<textarea class="ps-input ps-template-input" name="instruction" maxlength="1000" required>Summarize the release priorities for a project kickoff, with one open question per source.</textarea></label><p class="ps-note" data-context-count></p>
<div class="ps-product-heading"><h3>Writing direction</h3><span class="ps-note" data-context-style></span></div><div class="ps-tone-plane" aria-hidden="true"><div class="ps-tone-field"><i data-context-dot></i></div><span class="ps-tone-top">Brief</span><span class="ps-tone-bottom">Detailed</span><span class="ps-tone-left">Formal</span><span class="ps-tone-right">Conversational</span></div>
<div class="ps-field-pair"><label class="ps-easing-input">Formality<input type="range" min="0" max="100" value="20" name="formality"><output>Formal</output></label><label class="ps-easing-input">Detail<input type="range" min="0" max="100" value="55" name="depth"><output>Standard</output></label></div>
<p class="ps-workflow-status" data-context-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-context-reset>Reset brief</button><button class="ps-button ps-button-primary" type="submit" data-context-prepare>Prepare brief</button></div></div></form>
<div class="ps-product-result" data-context-result hidden><label class="ps-compact-field">Prepared brief<textarea class="ps-input ps-product-output" data-context-output readonly></textarea></label><button class="ps-button" type="button" data-context-select>Select brief</button></div><footer class="ps-instrument-footer"><span>Ctrl or Command Enter prepares</span><span>No AI generation or sending</span></footer></section></main>
```
