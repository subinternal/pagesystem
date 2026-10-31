# Status label (badge)

Kind: element. State expressed in a word.

Task: Recognize state without relying on color.

Semantic HTML: span.

## content

- Meaningful content and an accessible name where applicable

## states

- neutral
- success
- warning
- error

## responsive

- Inherit host typography and colors.
- Do not clip content or focus indicators.

## checks

- Text carries all meaning conveyed by color.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Element</p><h1 class="ps-heading">Status label</h1><p class="ps-note">Short status words beside the items they describe; the word carries the meaning without color.</p></header>
<div class="ps-stack"><div class="ps-row"><span>Invoice 1042</span><span class="ps-badge">Draft</span></div><div class="ps-row"><span>Invoice 1041</span><span class="ps-badge ps-badge-good">Paid</span></div><div class="ps-row"><span>Invoice 1038</span><span class="ps-badge ps-badge-error">Past due</span></div><div class="ps-row"><span>Invoice 1035</span><span class="ps-badge">Void</span></div></div></main>
```
