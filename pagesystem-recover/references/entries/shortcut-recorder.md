# Shortcut recorder (shortcut-recorder)

Kind: component. Record a keyboard chord and test it in a scoped field.

Task: Record a keyboard chord and test it in a scoped field.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: input.

Native behavior: shortcut-recorder. It needs pagesystem.js (see ../implementation.md).

## content

- Task-specific inputs, sample context and visible feedback.

## states

- idle
- recording
- conflict
- captured
- saved
- tested
- canceled

## responsive

- Stack related fields at narrow widths.
- Preserve text enlargement, keyboard access and visible labels.

## checks

- Escape and focus loss cancel recording.
- Modifier-only and reserved combinations cannot be saved.
- Keys outside the recording control and test field are not captured.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Shortcut recorder</h1><p class="ps-note">Capture a keyboard combination, resolve local conflicts, and test it in context.</p></header><section class="ps-instrument" data-ps-shortcut-recorder aria-label="Sample shortcut recorder"><header class="ps-instrument-header"><div><h2>Your shortcut</h2><p>Open the quick editor</p></div><span class="ps-note" data-shortcut-dirty></span></header><div class="ps-instrument-body"><div class="ps-shortcut-board"><div class="ps-keycaps" data-shortcut-keys role="group" aria-label="Current shortcut"></div><button class="ps-button ps-shortcut-capture" type="button" data-shortcut-capture aria-pressed="false">Record shortcut</button></div>
<p class="ps-note">Recording only listens while its button has focus. Escape cancels; Tab leaves recording. Browser and operating‑system shortcuts may be unavailable.</p><p class="ps-workflow-status" data-shortcut-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-shortcut-reset>Restore saved</button><button class="ps-button ps-button-primary" type="button" data-shortcut-save>Save shortcut</button></div>
<label class="ps-compact-field">Test the saved shortcut here<input class="ps-input" type="text" data-shortcut-test placeholder="Press the saved shortcut here" autocomplete="off"></label><p class="ps-data-readout" data-shortcut-runs role="status">No test runs yet.</p></div><footer class="ps-instrument-footer"><span>Local conflict checks</span><span>No global key registration</span></footer></section></main>
```

## Variant: Inline setting

The recorder as one row in a settings page, with the test field, restore and save beside it.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Shortcut recorder, inline setting</h1><p class="ps-note">The recorder as a single settings row, with saving and testing kept beside it.</p></header>
<section class="ps-instrument ps-shortcut-inline" data-ps-shortcut-recorder data-density="compact" aria-labelledby="inline-shortcut-title"><div class="ps-instrument-body">
<div class="ps-shortcut-row"><div class="ps-shortcut-row-text"><h2 id="inline-shortcut-title">Open quick editor</h2><p class="ps-note">Editor commands · this workspace only</p></div><div class="ps-keycaps" data-shortcut-keys role="group" aria-label="Current shortcut"></div><button class="ps-button ps-shortcut-capture" type="button" data-shortcut-capture aria-pressed="false">Record shortcut</button></div>
<p class="ps-workflow-status" data-shortcut-status role="status"></p>
<div class="ps-shortcut-inline-test"><label class="ps-compact-field">Test field<input class="ps-input" type="text" data-shortcut-test placeholder="Press the saved shortcut here" autocomplete="off"></label><p class="ps-note" data-shortcut-runs role="status">No test runs yet.</p></div>
<div class="ps-shortcut-inline-actions"><span class="ps-note" data-shortcut-dirty></span><div class="ps-workflow-actions"><button class="ps-button" type="button" data-shortcut-reset>Restore saved</button><button class="ps-button ps-button-primary" type="button" data-shortcut-save>Save shortcut</button></div></div>
</div></section></main>
```

## Variant: Conflict

A captured combination that another command already uses, showing that command and offering to record again or reassign the shortcut.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Shortcut recorder, conflict</h1><p class="ps-note">A captured combination that another command already uses, with both ways out stated.</p></header>
<section class="ps-instrument" aria-label="Sample shortcut conflict"><header class="ps-instrument-header"><div><h2>Your shortcut</h2><p>Open the quick editor</p></div><span class="ps-note">Unsaved shortcut</span></header><div class="ps-instrument-body">
<div class="ps-shortcut-captured"><div class="ps-shortcut-keys-flat" role="group" aria-label="Captured shortcut"><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>F</kbd></div><span class="ps-badge ps-badge-error">Conflict</span></div>
<div class="ps-shortcut-clash" role="status"><p><strong>Ctrl Shift F is already assigned.</strong> Saving it here removes it from the command below.</p><dl class="ps-shortcut-clash-row"><div><dt>Command</dt><dd>Find in project</dd></div><div><dt>Scope</dt><dd>Search</dd></div><div><dt>Shortcut</dt><dd><span class="ps-shortcut-keys-flat ps-shortcut-keys-small"><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>F</kbd></span></dd></div></dl></div>
<p class="ps-note">Find in project will have no shortcut until you assign one in Keyboard settings.</p>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Record again</button><button class="ps-button ps-button-primary" type="button">Reassign shortcut</button></div>
</div><footer class="ps-instrument-footer"><span>Local conflict checks</span><span>No global key registration</span></footer></section></main>
```

## Variant: Command list

A filterable list of commands and their shortcuts, with one row recording and one command unassigned.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Shortcut recorder, command list</h1><p class="ps-note">Many commands with their shortcuts, one of them recording a new combination.</p></header>
<section class="ps-instrument ps-shortcut-list" data-density="compact" aria-labelledby="shortcut-list-title"><header class="ps-instrument-header"><div><h2 id="shortcut-list-title">Keyboard shortcuts</h2><p>Editor · 5 sample commands</p></div><span class="ps-note">1 unassigned</span></header><div class="ps-instrument-body">
<label class="ps-compact-field">Filter commands<input class="ps-input" type="search" placeholder="Command name or key" autocomplete="off"></label>
<ul class="ps-shortcut-rows">
<li class="ps-shortcut-item"><div><strong>Open quick editor</strong><small>Editor</small></div><span class="ps-shortcut-keys-flat" role="group" aria-label="Ctrl Shift J"><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>J</kbd></span><button class="ps-button" type="button" aria-label="Change shortcut for Open quick editor">Change</button></li>
<li class="ps-shortcut-item"><div><strong>Find in project</strong><small>Search</small></div><span class="ps-shortcut-keys-flat" role="group" aria-label="Ctrl Shift F"><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>F</kbd></span><button class="ps-button" type="button" aria-label="Change shortcut for Find in project">Change</button></li>
<li class="ps-shortcut-item" data-recording><div><strong>Duplicate selection</strong><small id="shortcut-recording-hint">Press the new combination. Escape cancels.</small></div><span class="ps-shortcut-listening">Listening</span><button class="ps-button ps-shortcut-capture" type="button" aria-pressed="true" aria-describedby="shortcut-recording-hint">Cancel</button></li>
<li class="ps-shortcut-item"><div><strong>Toggle sidebar</strong><small>View</small></div><span class="ps-shortcut-keys-flat" role="group" aria-label="Ctrl Alt B"><kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>B</kbd></span><button class="ps-button" type="button" aria-label="Change shortcut for Toggle sidebar">Change</button></li>
<li class="ps-shortcut-item"><div><strong>Go to symbol</strong><small>Navigation</small></div><span class="ps-note">Not assigned</span><button class="ps-button" type="button" aria-label="Assign shortcut for Go to symbol">Assign</button></li>
</ul>
</div><footer class="ps-instrument-footer"><span>Sample commands</span><span>Recording listens only on the active row</span></footer></section></main>
```
