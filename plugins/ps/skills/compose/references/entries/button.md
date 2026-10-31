# Button (button)

Kind: element. A named action with a visible state.

Task: Perform an action.

Semantic HTML: button.

## content

- Meaningful content and an accessible name where applicable

## states

- default
- hover
- focus
- disabled
- pending

## responsive

- Inherit host typography and colors.
- Do not clip content or focus indicators.

## checks

- Type is explicit.
- Accessible name remains during pending state.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Element</p><h1 class="ps-heading">Button</h1><p class="ps-note">Primary, secondary, reset and disabled buttons in a draft form, and a destructive action with its consequence stated.</p></header>
<div class="ps-stack"><form class="ps-stack"><div class="ps-field"><label for="draft-name">Draft name</label><input id="draft-name" class="ps-input" value="Untitled draft"></div><div class="ps-row"><button class="ps-button ps-button-primary" type="button" disabled aria-describedby="save-reason">Save draft</button><button class="ps-button" type="button">Preview</button><button class="ps-button" type="reset">Reset draft name</button></div><p class="ps-note" id="save-reason">Save is unavailable in this sample. Your application supplies the save action.</p></form>
<hr class="ps-rule"><section class="ps-stack-tight" aria-labelledby="delete-heading"><h2 class="ps-subheading" id="delete-heading">Delete draft</h2><p id="delete-detail">Deletes Untitled draft and its 3 comments. This cannot be undone.</p><div class="ps-row"><button class="ps-button ps-button-danger" type="button" aria-describedby="delete-detail">Delete draft</button></div></section></div></main>
```
