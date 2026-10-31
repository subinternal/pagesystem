# Approval inbox (approval-inbox)

Kind: component. Review fictional requests, confirm a decision, and recover it with local undo.

Task: Review fictional requests, confirm a decision, and recover it with local undo.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: workflow.

Native behavior: approval-inbox. It needs pagesystem.js (see ../implementation.md).

## content

- Requester, amount, category and decision context.
- Required reason for returned requests.
- A meter of one cell per request, colored by status, with a worded count key

## states

- pending
- confirmation
- approved
- returned
- empty filter
- undone
- reset

## responsive

- Stack panels and editors on narrow screens.
- Keep essential text at body size and control targets readable under text enlargement.

## checks

- Only pending requests may be decided.
- Escape cancels approval confirmation and returns focus.
- Return requires a reason; undo restores the prior decision and request selection.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Approval inbox</h1><p class="ps-note">Review a request in context, make a deliberate decision, and recover it with undo.</p></header>
<section class="ps-instrument" data-ps-approval-inbox aria-label="Sample approval inbox"><header class="ps-instrument-header"><div><h2>Needs your review</h2><p data-approval-count>4 pending</p></div><label class="ps-compact-field">Show requests<select class="ps-input" data-approval-filter><option value="pending">Pending</option><option value="decided">Decided</option><option value="all">All requests</option></select></label></header><div class="ps-instrument-body">
<div class="ps-product-figure"><span>Awaiting a sample decision</span><div><strong data-approval-total></strong></div><div class="ps-approval-meter" data-approval-meter aria-hidden="true"></div><p class="ps-approval-key" data-approval-breakdown></p></div><div class="ps-request-list" data-approval-list role="group" aria-label="Choose a request"></div><p class="ps-data-readout" data-approval-empty hidden>No requests in this view. Undo a decision or change the filter.</p>
<div class="ps-request-detail" data-approval-detail><div class="ps-product-heading"><div><h3 data-approval-title>Request details</h3><p class="ps-note" data-approval-person></p></div><strong class="ps-product-number" data-approval-amount></strong></div><p data-approval-description></p><p class="ps-product-warning" data-approval-risk hidden>Above the sample $1,500 review threshold. Check the scope before deciding.</p><p class="ps-note" data-approval-decision></p><label class="ps-compact-field">Return reason<textarea class="ps-input" data-approval-reason maxlength="240" rows="2" placeholder="Required when returning a request"></textarea></label><div class="ps-workflow-actions"><button class="ps-button" type="button" data-approval-return>Return with reason</button><button class="ps-button ps-button-primary" type="button" data-approval-approve>Approve request</button></div></div>
<p class="ps-workflow-status" data-approval-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-approval-undo>Undo last decision</button><button class="ps-button" type="button" data-approval-reset>Reset inbox</button></div></div><footer class="ps-instrument-footer"><span>Fictional requests</span><span>No payments or external approvals</span></footer>
<dialog class="ps-workflow-dialog" aria-labelledby="approval-confirm-title"><h3 id="approval-confirm-title">Confirm sample approval</h3><p data-approval-confirm-text></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-approval-cancel autofocus>Keep reviewing</button><button class="ps-button ps-button-primary" type="button" data-approval-confirm>Confirm approval</button></div></dialog></section></main>
```

## Variant: Caught up

The inbox once every request is decided, with today's decisions listed and the last one still undoable.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Approval inbox, caught up</h1><p class="ps-note">The inbox once every request has a decision, with the latest decisions still reachable and the last one undoable.</p></header>
<section class="ps-instrument" aria-label="Sample approval inbox with nothing pending">
<header class="ps-instrument-header"><div><h2>Needs your review</h2><p>0 pending</p></div><label class="ps-compact-field">Show requests<select class="ps-input"><option value="pending" selected>Pending</option><option value="decided">Decided</option><option value="all">All requests</option></select></label></header>
<div class="ps-instrument-body">
<div class="ps-approval-empty">
<span class="ps-approval-empty-mark" aria-hidden="true"><span class="ps-i ps-i-check"></span></span>
<h3>Nothing waiting for your decision</h3>
<p class="ps-note">New requests from the Design, Research, Product and Engineering teams will appear here.</p>
</div>
<section class="ps-approval-recent" aria-labelledby="approval-recent-title">
<h3 id="approval-recent-title">Decided today</h3>
<ul>
<li><span class="ps-product-avatar" aria-hidden="true">SC</span><span><strong>Preview environments</strong><small>Sam Chen · approved at <time datetime="2026-10-28T16:42">4:42 PM</time></small></span><span class="ps-product-number">$240</span></li>
<li><span class="ps-product-avatar" aria-hidden="true">LH</span><span><strong>Studio workshop</strong><small>Lena Hoffmann · returned at <time datetime="2026-10-28T15:10">3:10 PM</time>: split rail and hotel into two requests</small></span><span class="ps-product-number">$1,850</span></li>
<li><span class="ps-product-avatar" aria-hidden="true">TM</span><span><strong>Research incentives</strong><small>Theo Martin · approved at <time datetime="2026-10-28T11:05">11:05 AM</time></small></span><span class="ps-product-number">$960</span></li>
<li><span class="ps-product-avatar" aria-hidden="true">MO</span><span><strong>Typeface license</strong><small>Maya Okafor · approved at <time datetime="2026-10-28T09:31">9:31 AM</time></small></span><span class="ps-product-number">$420</span></li>
</ul>
</section>
<p class="ps-workflow-status" role="status">Sample request approved. Undo is available.</p>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Undo last decision</button><button class="ps-button" type="button">Reset inbox</button></div>
</div>
<footer class="ps-instrument-footer"><span>Fictional requests</span><span>No payments or external approvals</span></footer>
</section>
</main>
```

## Variant: Reason required

A request above the review threshold that the reviewer tried to return without a reason.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Approval inbox, reason required</h1><p class="ps-note">A request above the review threshold that the reviewer tried to return without a reason.</p></header>
<section class="ps-instrument" aria-label="Sample approval inbox with a missing return reason">
<header class="ps-instrument-header"><div><h2>Needs your review</h2><p>4 pending</p></div><label class="ps-compact-field">Show requests<select class="ps-input"><option value="pending" selected>Pending</option><option value="decided">Decided</option><option value="all">All requests</option></select></label></header>
<div class="ps-instrument-body">
<div class="ps-product-figure"><span>Awaiting a sample decision</span><div><strong>$3,470</strong></div><div class="ps-approval-meter" aria-hidden="true"><i data-status="pending"></i><i data-status="pending"></i><i data-status="pending" data-focus></i><i data-status="pending"></i></div><p class="ps-approval-key"><span><i data-status="pending"></i>4 pending</span><span><i data-status="approved"></i>0 approved</span><span><i data-status="returned"></i>0 returned</span></p></div>
<div class="ps-request-list" role="group" aria-label="Choose a request">
<button class="ps-request-row" type="button" aria-pressed="false"><span class="ps-product-avatar" aria-hidden="true">MO</span><span><strong>Typeface license</strong><small>Maya Okafor · pending</small></span><span class="ps-product-number">$420</span></button>
<button class="ps-request-row" type="button" aria-pressed="false"><span class="ps-product-avatar" aria-hidden="true">TM</span><span><strong>Research incentives</strong><small>Theo Martin · pending</small></span><span class="ps-product-number">$960</span></button>
<button class="ps-request-row" type="button" aria-pressed="true"><span class="ps-product-avatar" aria-hidden="true">LH</span><span><strong>Studio workshop</strong><small>Lena Hoffmann · pending</small></span><span class="ps-product-number">$1,850</span></button>
<button class="ps-request-row" type="button" aria-pressed="false"><span class="ps-product-avatar" aria-hidden="true">SC</span><span><strong>Preview environments</strong><small>Sam Chen · pending</small></span><span class="ps-product-number">$240</span></button>
</div>
<div class="ps-request-detail">
<div class="ps-product-heading"><div><h3>Studio workshop</h3><p class="ps-note">Lena Hoffmann · Product</p></div><strong class="ps-product-number">$1,850</strong></div>
<p>Rail travel and two nights for the product workshop. The requested amount exceeds the sample $1,500 review threshold.</p>
<p class="ps-product-warning">Above the sample $1,500 review threshold. Check the scope before deciding.</p>
<p class="ps-note">Awaiting a sample decision</p>
<div class="ps-compact-field"><label for="approval-reason-input">Return reason</label><textarea class="ps-input" id="approval-reason-input" maxlength="240" rows="2" placeholder="Required when returning a request" aria-invalid="true" aria-describedby="approval-reason-error"></textarea><p class="ps-error" id="approval-reason-error">Add a return reason, up to 240 characters.</p></div>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Return with reason</button><button class="ps-button ps-button-primary" type="button">Approve request</button></div>
</div>
<div class="ps-workflow-actions"><button class="ps-button" type="button" disabled>Undo last decision</button><button class="ps-button" type="button">Reset inbox</button></div>
</div>
<footer class="ps-instrument-footer"><span>Fictional requests</span><span>No payments or external approvals</span></footer>
</section>
</main>
```

## Variant: Queue table

A dense, multi-select table for finance reviewers who approve many small pending requests at once.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Approval inbox, queue table</h1><p class="ps-note">A dense queue for finance reviewers who clear many small requests at once; only pending rows can be selected.</p></header>
<section class="ps-instrument ps-approval-queue" data-density="compact" aria-label="Sample approval queue">
<header class="ps-instrument-header"><div><h2>Finance queue</h2><p>5 pending · 2 decided this week</p></div><label class="ps-compact-field">Show requests<select class="ps-input"><option value="pending">Pending</option><option value="decided">Decided</option><option value="all" selected>All requests</option></select></label></header>
<div class="ps-instrument-body">
<div class="ps-approval-table-region">
<table class="ps-approval-table">
<caption class="ps-visually-hidden">Sample expense requests</caption>
<thead><tr><th scope="col"><span class="ps-visually-hidden">Select</span></th><th scope="col">Request</th><th scope="col">Category</th><th scope="col">Submitted</th><th scope="col">Status</th><th scope="col" class="ps-approval-num">Amount</th></tr></thead>
<tbody>
<tr data-selected="true"><td><label class="ps-approval-pick"><input type="checkbox" checked aria-label="Select Typeface license"></label></td><th scope="row"><strong>Typeface license</strong><small>Maya Okafor · Design</small></th><td data-label="Category">Software</td><td data-label="Submitted"><time datetime="2026-10-26">Oct 26</time></td><td data-label="Status">Pending</td><td data-label="Amount" class="ps-approval-num">$420</td></tr>
<tr data-selected="true"><td><label class="ps-approval-pick"><input type="checkbox" checked aria-label="Select Preview environments"></label></td><th scope="row"><strong>Preview environments</strong><small>Sam Chen · Engineering</small></th><td data-label="Category">Infrastructure</td><td data-label="Submitted"><time datetime="2026-10-26">Oct 26</time></td><td data-label="Status">Pending</td><td data-label="Amount" class="ps-approval-num">$240</td></tr>
<tr data-selected="true"><td><label class="ps-approval-pick"><input type="checkbox" checked aria-label="Select Usability test recruiting"></label></td><th scope="row"><strong>Usability test recruiting</strong><small>Theo Martin · Research</small></th><td data-label="Category">Research</td><td data-label="Submitted"><time datetime="2026-10-27">Oct 27</time></td><td data-label="Status">Pending</td><td data-label="Amount" class="ps-approval-num">$310</td></tr>
<tr><td><label class="ps-approval-pick"><input type="checkbox" aria-label="Select Research incentives"></label></td><th scope="row"><strong>Research incentives</strong><small>Theo Martin · Research</small></th><td data-label="Category">Research</td><td data-label="Submitted"><time datetime="2026-10-27">Oct 27</time></td><td data-label="Status">Pending</td><td data-label="Amount" class="ps-approval-num">$960</td></tr>
<tr><td><label class="ps-approval-pick"><input type="checkbox" disabled aria-label="Select Studio workshop, needs individual review"></label></td><th scope="row"><strong>Studio workshop</strong><small>Lena Hoffmann · Product</small></th><td data-label="Category">Travel</td><td data-label="Submitted"><time datetime="2026-10-28">Oct 28</time></td><td data-label="Status">Pending, above threshold</td><td data-label="Amount" class="ps-approval-num">$1,850</td></tr>
<tr data-decided="true"><td><label class="ps-approval-pick"><input type="checkbox" disabled aria-label="Select Conference tickets, already decided"></label></td><th scope="row"><strong>Conference tickets</strong><small>Maya Okafor · Design</small></th><td data-label="Category">Travel</td><td data-label="Submitted"><time datetime="2026-10-22">Oct 22</time></td><td data-label="Status">Approved</td><td data-label="Amount" class="ps-approval-num">$690</td></tr>
<tr data-decided="true"><td><label class="ps-approval-pick"><input type="checkbox" disabled aria-label="Select Monitor stands, already decided"></label></td><th scope="row"><strong>Monitor stands</strong><small>Sam Chen · Engineering</small></th><td data-label="Category">Hardware</td><td data-label="Submitted"><time datetime="2026-10-21">Oct 21</time></td><td data-label="Status">Returned</td><td data-label="Amount" class="ps-approval-num">$180</td></tr>
</tbody>
</table>
</div>
<div class="ps-approval-bulk"><p><strong>3 selected · $970</strong><span class="ps-note">Requests above $1,500 must be reviewed one at a time.</span></p><div class="ps-workflow-actions"><button class="ps-button" type="button">Clear selection</button><button class="ps-button ps-button-primary" type="button">Approve 3 requests</button></div></div>
</div>
<footer class="ps-instrument-footer"><span>Fictional requests</span><span>No payments or external approvals</span></footer>
</section>
</main>
```
