# Action bar (action-bar)

Kind: component. A primary action with an explicit alternative.

Task: Take the next step or safely leave.

Elements: [button](button.md), [link](link.md).

Category: input.

## content

- Primary action
- Optional secondary action
- Consequence when needed

## states

- ready
- pending
- disabled

## responsive

- Actions wrap or stack in DOM order.

## checks

- One primary action in the region.
- Links navigate and buttons perform actions.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Action bar</h1><p class="ps-note">One primary action paired with a secondary link back to the surrounding context.</p></header><div class="ps-row"><a class="ps-button ps-button-primary" href="#next">Continue to review <span class="ps-i ps-i-up-right" aria-hidden="true"></span></a><a class="ps-link" href="#context">Back to project details</a></div><section id="next" class="ps-stack-tight"><h2 class="ps-subheading">Review</h2><p>Check the page task and required content before the build starts.</p></section><section id="context" class="ps-stack-tight"><h2 class="ps-subheading">Project details</h2><p>Audience, deadline, and content constraints for the sample project.</p></section></main>
```

## Variant: Destructive confirm

A delete confirmation that states the consequence, keeps the safe choice beside the danger action and links that action to the consequence text.

```html
<main><h1 class="ps-heading">Confirm before removing.</h1><p>A destructive action states its consequence and keeps the safe choice beside it.</p>
<section class="ps-panel ps-stack" aria-labelledby="delete-title"><div class="ps-stack-tight"><h2 id="delete-title" class="ps-subheading">Delete the Spring launch project?</h2><p id="delete-consequence">This removes 14 pages, 3 open review threads and the shared preview link. Files you have already exported are not affected. This cannot be undone.</p></div>
<div class="ps-action-end"><button class="ps-button" type="button">Keep project</button><button class="ps-button ps-button-danger" type="button" aria-describedby="delete-consequence">Delete project</button></div></section>
<p class="ps-note">Sample confirmation. Neither button changes anything here.</p></main>
```

## Variant: Pending

The primary action while it runs: disabled so it cannot be pressed twice, with a status line explaining what is happening and a link that still works.

```html
<main><h1 class="ps-heading">Waiting on the action.</h1><p>While the primary action runs, it stays in place, says what is happening and cannot be pressed twice.</p>
<div class="ps-row"><button class="ps-button ps-button-primary" type="button" disabled aria-describedby="publish-status">Publishing…</button><a class="ps-link" href="#publish-changes">Review what is being published</a></div>
<p id="publish-status" class="ps-note" role="status">Publishing 6 pages to the staging site. You can keep editing; new changes go out with the next publish.</p>
<section id="publish-changes" class="ps-stack-tight"><h2 class="ps-subheading">Changes in this publish</h2><p>Pricing, Security and four help articles, edited by Ana Silva and Tom Okafor.</p></section></main>
```

## Variant: Form footer

A save-or-discard footer under a list of unsaved changes, with the consequence on the left and actions that go full width on narrow screens.

```html
<main><h1 class="ps-heading">Save or discard a set of changes.</h1>
<section class="ps-stack" aria-labelledby="roles-title"><h2 id="roles-title" class="ps-subheading">Member roles</h2>
<ul class="ps-list"><li><strong>Ana Silva</strong><span class="ps-note">Viewer, changed to Editor</span></li><li><strong>Tom Okafor</strong><span class="ps-note">Editor, changed to Owner</span></li></ul>
<div class="ps-action-footer"><p id="roles-consequence" class="ps-note">2 unsaved changes. Both members are emailed when you save.</p><div class="ps-action-end"><button class="ps-button" type="button">Discard</button><button class="ps-button ps-button-primary" type="button" aria-describedby="roles-consequence">Save roles</button></div></div></section>
<p class="ps-note">Sample settings footer. Buttons are inert in this specimen.</p></main>
```
