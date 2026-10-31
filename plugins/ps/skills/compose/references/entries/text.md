# Text (text)

Kind: element. Type that makes hierarchy legible.

Task: Read content in a clear order.

Semantic HTML: h1–h6, p, small.

## content

- Meaningful content and an accessible name where applicable

## states

- reading
- supporting

## responsive

- Inherit host typography and colors.
- Do not clip content or focus indicators.

## checks

- Heading levels express structure, not size.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Element</p><h1 class="ps-heading">Text</h1><p class="ps-note">Page title, lead, section heading, subheading, body and note roles on one billing report.</p></header>
<article class="ps-stack"><div class="ps-stack-tight"><p class="ps-kicker">Billing / Reports</p><h2 class="ps-title">September invoices</h2><p class="ps-lead">42 invoices sent, 38 paid. Four are past due and total $6,120.</p></div><div class="ps-prose"><h3 class="ps-heading">Past due</h3><p>Overdue invoices are listed oldest first. Each reminder goes to the billing contact on the account, and a second reminder follows seven days later if the invoice is still open.</p><h3 class="ps-subheading">Reminder schedule</h3><p>Reminders send at 9:00 AM in the customer's time zone. You can pause them for a single account from its billing settings.</p></div><p class="ps-note">Totals exclude refunds issued after September 30.</p></article></main>
```
