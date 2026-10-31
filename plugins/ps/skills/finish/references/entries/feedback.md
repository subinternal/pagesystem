# Feedback (feedback)

Kind: component. Explain what happened and what someone can do.

Task: Understand progress, absence, failure or completion.

Elements: [text](text.md), [link](link.md), [badge](badge.md).

Category: feedback.

## content

- State label
- Explanation
- Recovery action when appropriate

## states

- empty
- loading
- error
- success

## responsive

- Message wraps; recovery action stays in reading order.

## checks

- Announce dynamic updates politely; reserve alerts for urgent errors.
- Never claim success before confirmation.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Feedback</p><h1 class="ps-heading">Feedback</h1><p class="ps-note">An empty state with a status badge, an explanation, and a link to the guidance that resolves it.</p></header><section class="ps-panel ps-stack" aria-labelledby="empty-title"><span class="ps-badge">Empty</span><h2 class="ps-subheading" id="empty-title">No projects yet</h2><p>Create a project with a name and a short description of the page you need.</p><a href="#recovery">What to include in a brief</a></section><section id="recovery" class="ps-stack"><h2 class="ps-subheading">What to include in a brief</h2><p>State who the page is for, what they need to do on it, and the content it must carry.</p></section><p class="ps-note">For dynamic status, use a live region only when this message changes.</p></main>
```

## Variant: Success

Confirmation after the bank accepts a new card, with the facts that changed and where to go next.

```html
<main><h1 class="ps-heading">Payment method updated</h1>
<section class="ps-panel ps-feedback-notice" role="status" aria-labelledby="success-title">
  <span class="ps-feedback-icon ps-feedback-icon-success" aria-hidden="true"><span class="ps-i ps-i-check"></span></span>
  <div class="ps-feedback-body">
    <h2 id="success-title">Your card ending 4242 is now the default</h2>
    <p>The bank confirmed the card at 2:32 PM. The next invoice, on November 1, will be charged to this card.</p>
    <dl class="ps-feedback-facts"><div><dt>Card</dt><dd>Visa ending 4242, expires 08/29</dd></div><div><dt>Next charge</dt><dd>$480.00 on 1 Nov 2026</dd></div></dl>
    <div class="ps-feedback-actions"><a class="ps-button ps-button-primary" href="#billing">Back to billing</a><a class="ps-button" href="#receipts">Where receipts are sent</a></div>
  </div>
</section>
<section id="billing" class="ps-feedback-detail" aria-labelledby="billing-title"><h2 id="billing-title">Billing</h2><p>Sample destination. Plan, invoices and payment methods.</p></section>
<section id="receipts" class="ps-feedback-detail" aria-labelledby="receipts-title"><h2 id="receipts-title">Receipts</h2><p>Sample destination. Receipts go to billing@northline.example.</p></section>
</main>
```

## Variant: Error

An export that stopped, with the cause, a support reference and a recovery path to the files that caused it.

```html
<main><h1 class="ps-heading">Export could not finish</h1>
<section class="ps-panel ps-feedback-notice" role="alert" aria-labelledby="error-title">
  <span class="ps-feedback-icon ps-feedback-icon-error" aria-hidden="true">!</span>
  <div class="ps-feedback-body">
    <h2 id="error-title">The workspace export stopped at 62%</h2>
    <p>Three files are larger than the 2 GB export limit, so the archive was not created. Nothing was deleted, and the export can run again once those files are excluded.</p>
    <dl class="ps-feedback-facts"><div><dt>Started</dt><dd>Oct 28, 2026, 9:14 AM</dd></div><div><dt>Reference</dt><dd><code>EXP-7Q4M-2210</code></dd></div></dl>
    <div class="ps-feedback-actions"><a class="ps-button ps-button-primary" href="#large-files">Review the 3 large files</a><a class="ps-button" href="#support">Contact support</a></div>
  </div>
</section>
<section id="large-files" class="ps-feedback-detail" aria-labelledby="large-title"><h2 id="large-title">Files over the limit</h2><ul><li>Launch film master.mov · 6.4 GB</li><li>Showroom scan.obj · 3.1 GB</li><li>Archive 2019.zip · 2.6 GB</li></ul></section>
<section id="support" class="ps-feedback-detail" aria-labelledby="support-title"><h2 id="support-title">Support</h2><p>Sample destination. Quote reference EXP-7Q4M-2210 so support can find the log.</p></section>
</main>
```

## Variant: In progress

A long-running import with determinate progress, time remaining and reassurance that leaving the page is safe.

```html
<main><h1 class="ps-heading">Importing contacts</h1>
<section class="ps-panel ps-feedback-notice" aria-labelledby="loading-title">
  <span class="ps-feedback-icon" aria-hidden="true"><span class="ps-feedback-spinner"></span></span>
  <div class="ps-feedback-body">
    <h2 id="loading-title">Importing 1,240 contacts from customers.csv</h2>
    <p>New contacts are added as each batch finishes. You can leave this page; the import keeps running and you will get an email when it is done.</p>
    <div class="ps-feedback-progress"><div><label for="import-progress">Processed</label><span role="status">820 of 1,240 · about 2 minutes left</span></div><progress id="import-progress" max="1240" value="820">820 of 1,240</progress></div>
    <div class="ps-feedback-actions"><a class="ps-button" href="#import-log">View import log</a></div>
  </div>
</section>
<section id="import-log" class="ps-feedback-detail" aria-labelledby="log-title"><h2 id="log-title">Import log</h2><p>Sample destination. 12 rows skipped so far for missing email addresses.</p></section>
</main>
```
