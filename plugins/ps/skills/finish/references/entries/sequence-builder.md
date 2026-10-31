# Sequence builder (sequence-builder)

Kind: component. Edit and reorder a timed sequence with derived day offsets and saved drafts.

Task: Edit and reorder a timed sequence with derived day offsets and saved drafts.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: workflow.

Native behavior: sequence-builder. It needs pagesystem.js (see ../implementation.md).

## content

- Labeled synthetic records and task-specific controls.

## states

- selected step
- edited
- saved
- discarded
- six-step limit

## responsive

- Wrap controls and preserve reading order at narrow widths.
- Keep essential labels and keyboard targets at enlarged text sizes.

## checks

- One to six steps; each delay is 0–30 days.
- Reordering recomputes cumulative days.
- Discard restores the saved draft; no messages are sent.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Sequence builder</h1><p class="ps-note">Arrange a series of actions with explicit delays and a recoverable draft.</p></header><section class="ps-instrument" data-ps-sequence-builder aria-label="Sample sequence editor"><header class="ps-instrument-header"><div><h2>Design leads</h2><p data-sequence-count>3 steps</p></div><span class="ps-note" data-sequence-dirty></span></header><div class="ps-instrument-body"><div class="ps-sequence-list" data-sequence-list role="group" aria-label="Select a step"></div>
<form class="ps-editor-fields"><label class="ps-compact-field">Step title<input class="ps-input" name="title" maxlength="60" required></label><div class="ps-field-pair"><label class="ps-compact-field">Channel<select class="ps-input" name="channel"><option>Email</option><option>LinkedIn</option></select></label><label class="ps-compact-field">Wait before this step · days<input class="ps-input" name="delay" type="number" min="0" max="30" step="1" required></label></div><div class="ps-workflow-actions"><button type="button" class="ps-button" data-sequence-up>Move earlier</button><button type="button" class="ps-button" data-sequence-down>Move later</button><button type="button" class="ps-button" data-sequence-remove>Remove step</button></div><div class="ps-workflow-actions"><button type="button" class="ps-button" data-sequence-add>Add step</button><button type="button" class="ps-button" data-sequence-discard>Discard changes</button><button type="submit" class="ps-button ps-button-primary">Save sequence</button></div></form><p class="ps-workflow-status" data-sequence-status role="status"></p></div><footer class="ps-instrument-footer"><span>Up to six steps</span><span>Local demo · no messages sent</span></footer></section></main>
```

## Variant: At limit

A six-step, 30-day sequence with unsaved edits, where Add step is disabled and the limit is explained.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Sequence at its six-step limit</h1><p class="ps-note">A full sequence with unsaved edits. Adding is disabled until a step is removed. Static state.</p></header><section class="ps-instrument" aria-label="Sample sequence at the step limit"><header class="ps-instrument-header"><div><h2>Platform evaluation</h2><p>6 steps · 30 days</p></div><span class="ps-note">Unsaved changes</span></header><div class="ps-instrument-body"><div class="ps-sequence-list" role="group" aria-label="Select a step">
<button type="button" class="ps-sequence-step" aria-pressed="false"><span class="ps-step-number">1</span><span>Quick introduction</span><small>Day 0 · Email</small></button>
<button type="button" class="ps-sequence-step" aria-pressed="false"><span class="ps-step-number">2</span><span>Connection note</span><small>Day 2 · LinkedIn</small></button>
<button type="button" class="ps-sequence-step" aria-pressed="false"><span class="ps-step-number">3</span><span>Case study: Northwind rollout</span><small>Day 5 · Email</small></button>
<button type="button" class="ps-sequence-step" aria-pressed="false"><span class="ps-step-number">4</span><span>Comment on a recent post</span><small>Day 9 · LinkedIn</small></button>
<button type="button" class="ps-sequence-step" aria-pressed="false"><span class="ps-step-number">5</span><span>Short check-in</span><small>Day 16 · Email</small></button>
<button type="button" class="ps-sequence-step" aria-pressed="true"><span class="ps-step-number">6</span><span>Close the loop</span><small>Day 30 · Email</small></button>
</div>
<form class="ps-editor-fields"><label class="ps-compact-field">Step title<input class="ps-input" name="title" maxlength="60" required value="Close the loop"></label><div class="ps-field-pair"><label class="ps-compact-field">Channel<select class="ps-input" name="channel"><option selected>Email</option><option>LinkedIn</option></select></label><label class="ps-compact-field">Wait before this step · days<input class="ps-input" name="delay" type="number" min="0" max="30" step="1" required value="14"></label></div><div class="ps-workflow-actions"><button type="button" class="ps-button">Move earlier</button><button type="button" class="ps-button" disabled>Move later</button><button type="button" class="ps-button">Remove step</button></div><div class="ps-workflow-actions"><button type="button" class="ps-button" disabled aria-describedby="limit-status">Add step</button><button type="button" class="ps-button">Discard changes</button><button type="submit" class="ps-button ps-button-primary">Save sequence</button></div></form><p class="ps-workflow-status" id="limit-status" role="status">Six steps is the limit. Remove a step to add another.</p></div><footer class="ps-instrument-footer"><span>6 of 6 steps</span><span>Local demo · no messages sent</span></footer></section></main>
```

## Variant: Invalid delay

A 45-day delay rejected beside its field, with saving blocked and the list keeping the last valid timing.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Sequence with an invalid delay</h1><p class="ps-note">A delay outside the 0–30 day range. The list keeps the last valid timing and saving is blocked until the field is fixed. Static state.</p></header><section class="ps-instrument ps-sequence-invalid" aria-label="Sample sequence with a validation error"><header class="ps-instrument-header"><div><h2>Design leads</h2><p>3 steps · 5 days</p></div><span class="ps-note">Unsaved changes</span></header><div class="ps-instrument-body"><div class="ps-sequence-list" role="group" aria-label="Select a step">
<button type="button" class="ps-sequence-step" aria-pressed="false"><span class="ps-step-number">1</span><span>Quick introduction</span><small>Day 0 · Email</small></button>
<button type="button" class="ps-sequence-step" aria-pressed="false"><span class="ps-step-number">2</span><span>Connection note</span><small>Day 2 · LinkedIn</small></button>
<button type="button" class="ps-sequence-step" aria-pressed="true"><span class="ps-step-number">3</span><span>Follow up</span><small>Day 5 · Email</small></button>
</div>
<form class="ps-editor-fields"><label class="ps-compact-field">Step title<input class="ps-input" name="title" maxlength="60" required value="Follow up"></label><div class="ps-field-pair"><label class="ps-compact-field">Channel<select class="ps-input" name="channel"><option selected>Email</option><option>LinkedIn</option></select></label><label class="ps-compact-field">Wait before this step · days<input class="ps-input" name="delay" type="number" min="0" max="30" step="1" required value="45" aria-invalid="true" aria-describedby="delay-error"><span id="delay-error" class="ps-error">Enter a delay from 0 to 30 days.</span></label></div><div class="ps-workflow-actions"><button type="button" class="ps-button">Move earlier</button><button type="button" class="ps-button" disabled>Move later</button><button type="button" class="ps-button">Remove step</button></div><div class="ps-workflow-actions"><button type="button" class="ps-button">Add step</button><button type="button" class="ps-button">Discard changes</button><button type="submit" class="ps-button ps-button-primary">Save sequence</button></div></form><p class="ps-workflow-status ps-sequence-error" role="alert">Step 3 needs a delay from 0 to 30 days before the sequence can be saved.</p></div><footer class="ps-instrument-footer"><span>Up to six steps</span><span>Local demo · no messages sent</span></footer></section></main>
```

## Variant: Running

A live sequence shown as a read-only day-by-day schedule with sent and due counts, where editing requires pausing first.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Running sequence, read only</h1><p class="ps-note">A live sequence shown as a schedule. Steps cannot be edited or reordered until the sequence is paused. Static state.</p></header><section class="ps-instrument" aria-label="Sample running sequence"><header class="ps-instrument-header"><div><h2>Design leads</h2><p>Started October 14 · 212 people enrolled</p></div><span class="ps-badge ps-sequence-live">Running</span></header><div class="ps-instrument-body"><ol class="ps-sequence-schedule" aria-label="Sequence steps">
<li data-state="done"><span class="ps-sequence-day">Day 0</span><span class="ps-sequence-what"><strong>Quick introduction</strong><span>Email · sent to 212</span></span><span class="ps-sequence-state">Sent</span></li>
<li data-state="done"><span class="ps-sequence-day">Day 2</span><span class="ps-sequence-what"><strong>Connection note</strong><span>LinkedIn · sent to 188</span></span><span class="ps-sequence-state">Sent</span></li>
<li data-state="current"><span class="ps-sequence-day">Day 5</span><span class="ps-sequence-what"><strong>Follow up</strong><span>Email · 164 due today</span></span><span class="ps-sequence-state">Sending today</span></li>
<li data-state="upcoming"><span class="ps-sequence-day">Day 12</span><span class="ps-sequence-what"><strong>Last note</strong><span>Email · after a 7 day wait</span></span><span class="ps-sequence-state">Scheduled</span></li>
</ol><p class="ps-note">Editing is locked while people are enrolled. Pause the sequence to change steps; people already enrolled keep their current timing.</p><div class="ps-workflow-actions"><button type="button" class="ps-button">Duplicate as draft</button><button type="button" class="ps-button ps-button-primary">Pause to edit</button></div></div><footer class="ps-instrument-footer"><span>Sample sequence</span><span>Local demo · no messages sent</span></footer></section></main>
```
