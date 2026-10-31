# Template editor (template-editor)

Kind: component. Compose reusable copy with variable insertion and a literal resolved preview.

Task: Compose reusable copy with variable insertion and a literal resolved preview.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: input.

Native behavior: template-editor. It needs pagesystem.js (see ../implementation.md).

## content

- Task-specific inputs, sample context and visible feedback.

## states

- editing
- resolved
- unknown variable
- saved
- discarded

## responsive

- Stack related fields at narrow widths.
- Preserve text enlargement, keyboard access and visible labels.

## checks

- Insert variables at the text selection.
- Unknown or unclosed variables prevent saving.
- Treat resolved content as text, never HTML.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Template editor</h1><p class="ps-note">Write reusable copy with variables and inspect the resolved text as you edit.</p></header><section class="ps-instrument" data-ps-template-editor aria-label="Sample template editor"><header class="ps-instrument-header"><div><h2>Introduction template</h2><p>Variables · local text preview</p></div><span class="ps-note" data-template-dirty></span></header><div class="ps-instrument-body">
<label class="ps-compact-field">Template<textarea class="ps-input ps-template-input" maxlength="1000" aria-describedby="template-help">Hi {{name}}, I enjoyed the design work at {{company}}. We're looking for a {{role}} to help shape our next release. Open to a conversation?</textarea></label><div class="ps-chart-caption"><span id="template-help">Use double braces around a variable name.</span><span data-template-count></span></div>
<div class="ps-token-options" role="group" aria-label="Insert a variable"><button class="ps-button" type="button" data-template-variable="name">+ Name</button><button class="ps-button" type="button" data-template-variable="company">+ Company</button><button class="ps-button" type="button" data-template-variable="role">+ Role</button></div>
<div class="ps-template-preview"><h3>Preview for Maya · Northstar</h3><p data-template-output></p></div><p class="ps-workflow-status" data-template-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-template-discard>Discard changes</button><button class="ps-button ps-button-primary" type="button" data-template-save>Save template</button></div></div><footer class="ps-instrument-footer"><span>Literal variable replacement</span><span>No AI generation or sending</span></footer></section></main>
```

## Variant: Unknown variable

A template using a variable the record does not define, which stays literal in the preview and blocks saving until it is fixed.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Template with an unknown variable</h1><p class="ps-note">A variable the record does not define stays visible in the preview and blocks saving.</p></header><section class="ps-instrument" data-ps-template-editor aria-label="Sample follow-up template editor"><header class="ps-instrument-header"><div><h2>Follow‑up template</h2><p>Variables · local text preview</p></div><span class="ps-note" data-template-dirty></span></header><div class="ps-instrument-body">
<label class="ps-compact-field">Template<textarea class="ps-input ps-template-input" maxlength="1000" aria-describedby="followup-help">Hi {{first_name}}, thanks for walking me through the {{role}} opening at {{company}}. I have attached the portfolio review we discussed.

Best,
Jordan</textarea></label><div class="ps-chart-caption"><span id="followup-help">Available variables: name, company and role.</span><span data-template-count></span></div>
<div class="ps-token-options" role="group" aria-label="Insert a variable"><button class="ps-button" type="button" data-template-variable="name">+ Name</button><button class="ps-button" type="button" data-template-variable="company">+ Company</button><button class="ps-button" type="button" data-template-variable="role">+ Role</button></div>
<div class="ps-template-preview"><h3>Preview for Maya · Northstar</h3><p data-template-output></p></div><p class="ps-workflow-status" data-template-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-template-discard>Discard changes</button><button class="ps-button ps-button-primary" type="button" data-template-save>Save template</button></div></div><footer class="ps-instrument-footer"><span>Literal variable replacement</span><span>No AI generation or sending</span></footer></section></main>
```

## Variant: Side-by-side preview

Source and resolved preview in two columns in wide containers, so line breaks can be compared directly; they stack when narrow.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Template beside its preview</h1><p class="ps-note">On wide containers the source and resolved text sit side by side, so line breaks can be compared directly.</p></header><section class="ps-instrument ps-template-wide" data-ps-template-editor aria-label="Sample offer template editor"><header class="ps-instrument-header"><div><h2>Offer letter opening</h2><p>Variables · local text preview</p></div><span class="ps-note" data-template-dirty></span></header><div class="ps-instrument-body">
<div class="ps-template-split"><div class="ps-template-source"><label class="ps-compact-field">Template<textarea class="ps-input ps-template-input" maxlength="1000" aria-describedby="offer-help">Dear {{name}},

We are pleased to offer you the position of {{role}} at {{company}}, starting on Monday, January 4.

Your manager will be Tom Okafor, Head of Design.</textarea></label><div class="ps-chart-caption"><span id="offer-help">Use double braces around a variable name.</span><span data-template-count></span></div>
<div class="ps-token-options" role="group" aria-label="Insert a variable"><button class="ps-button" type="button" data-template-variable="name">+ Name</button><button class="ps-button" type="button" data-template-variable="company">+ Company</button><button class="ps-button" type="button" data-template-variable="role">+ Role</button></div></div>
<div class="ps-template-preview"><h3>Preview for Maya · Northstar</h3><p data-template-output></p></div></div><p class="ps-workflow-status" data-template-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-template-discard>Discard changes</button><button class="ps-button ps-button-primary" type="button" data-template-save>Save template</button></div></div><footer class="ps-instrument-footer"><span>Literal variable replacement</span><span>No AI generation or sending</span></footer></section></main>
```

## Variant: Short message

A compact-density editor for one- or two-sentence reminders, with a shorter field and tighter panel spacing.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Short message template</h1><p class="ps-note">A compact editor for one-paragraph reminders, with a shorter field and tighter spacing.</p></header><section class="ps-instrument ps-template-short" data-density="compact" data-ps-template-editor aria-label="Sample reminder template editor"><header class="ps-instrument-header"><div><h2>Interview reminder</h2><p>Sent the day before · local text preview</p></div><span class="ps-note" data-template-dirty></span></header><div class="ps-instrument-body">
<label class="ps-compact-field">Message<textarea class="ps-input ps-template-input" maxlength="1000" aria-describedby="reminder-help">Hi {{name}}, a reminder that your {{role}} interview with {{company}} is tomorrow at 10:30 AM. Reply here if you need to move it.</textarea></label><div class="ps-chart-caption"><span id="reminder-help">Keep reminders to one or two sentences.</span><span data-template-count></span></div>
<div class="ps-token-options" role="group" aria-label="Insert a variable"><button class="ps-button" type="button" data-template-variable="name">+ Name</button><button class="ps-button" type="button" data-template-variable="company">+ Company</button><button class="ps-button" type="button" data-template-variable="role">+ Role</button></div>
<div class="ps-template-preview"><h3>Preview for Maya · Northstar</h3><p data-template-output></p></div><p class="ps-workflow-status" data-template-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-template-discard>Discard changes</button><button class="ps-button ps-button-primary" type="button" data-template-save>Save template</button></div></div><footer class="ps-instrument-footer"><span>Literal variable replacement</span><span>No AI generation or sending</span></footer></section></main>
```
