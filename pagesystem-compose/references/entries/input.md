# Input (input)

Kind: element. A native field with a persistent label.

Task: Provide a value.

Semantic HTML: input.

## content

- Meaningful content and an accessible name where applicable

## states

- empty
- filled
- invalid
- disabled

## responsive

- Inherit host typography and colors.
- Do not clip content or focus indicators.

## checks

- Label and input are associated.
- Type and autocomplete match the data.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Element</p><h1 class="ps-heading">Input</h1><p class="ps-note">A text input with a visible label and help text, and the same field showing a validation error.</p></header>
<form class="ps-stack"><div class="ps-field"><label for="name">Project name</label><input class="ps-input" id="name" autocomplete="off" placeholder="Website refresh" aria-describedby="name-help"><p class="ps-note" id="name-help">Shown to everyone on the project. This sample does not store input.</p></div><div class="ps-field"><label for="billing-email">Billing email</label><input class="ps-input" id="billing-email" type="email" autocomplete="off" value="finance@northwind" aria-invalid="true" aria-describedby="billing-email-help billing-email-error"><p class="ps-note" id="billing-email-help">Invoices and payment receipts go to this address.</p><p class="ps-error" id="billing-email-error">Add the domain after the @ to finish this address.</p></div></form></main>
```
