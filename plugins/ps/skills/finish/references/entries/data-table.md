# Data table (data-table)

Kind: component. Comparable records, aligned under named columns.

Task: Compare records and find an exception.

Elements: [text](text.md), [badge](badge.md), [link](link.md).

Category: data.

## content

- Caption
- Headers
- Rows
- Units

## states

- ready
- loading
- empty
- error

## responsive

- Horizontal scroll belongs to the labeled table region.

## checks

- Column headers have scope.
- Status has words, not color alone.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Data table</h1><p class="ps-note">A captioned table of page templates with a review status column, in a scroll region for narrow screens.</p></header><div class="ps-table-region" tabindex="0" role="region" aria-label="Sample templates"><table class="ps-table"><caption>Sample templates and their review status</caption><thead><tr><th scope="col">Template</th><th scope="col" class="ps-numeric">Pages</th><th scope="col">Review</th></tr></thead><tbody><tr><td>Service page</td><td class="ps-numeric">6</td><td><span class="ps-badge ps-badge-good">Checked</span></td></tr><tr><td>Help article</td><td class="ps-numeric">12</td><td><span class="ps-badge">Pending</span></td></tr></tbody></table></div></main>
```

## Variant: Dense

Compact rows for scanning many operational records, with right-aligned numbers, monospace run IDs and one failed run to find.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Dense data table</h1><p class="ps-note">Many records at compact row height for operational review.</p></header>
<div class="ps-table-region" tabindex="0" role="region" aria-label="Sample deploy runs"><table class="ps-table ps-table-dense"><caption>Sample deploy runs, last 24 hours</caption>
<thead><tr><th scope="col">Run</th><th scope="col">Service</th><th scope="col">Branch</th><th scope="col" class="ps-num">Duration</th><th scope="col" class="ps-num">Tests passed</th><th scope="col">Result</th></tr></thead>
<tbody>
<tr><td class="ps-id">run_4821</td><td>Checkout API</td><td>main</td><td class="ps-num">4m 12s</td><td class="ps-num">1,284 / 1,284</td><td><span class="ps-badge ps-badge-good">Passed</span></td></tr>
<tr><td class="ps-id">run_4820</td><td>Search indexer</td><td>main</td><td class="ps-num">7m 48s</td><td class="ps-num">612 / 612</td><td><span class="ps-badge ps-badge-good">Passed</span></td></tr>
<tr><td class="ps-id">run_4819</td><td>Billing worker</td><td>fix/proration</td><td class="ps-num">3m 05s</td><td class="ps-num">438 / 441</td><td><span class="ps-badge ps-badge-error">Failed</span></td></tr>
<tr><td class="ps-id">run_4818</td><td>Checkout API</td><td>main</td><td class="ps-num">4m 09s</td><td class="ps-num">1,284 / 1,284</td><td><span class="ps-badge ps-badge-good">Passed</span></td></tr>
<tr><td class="ps-id">run_4817</td><td>Web app</td><td>release/2.14</td><td class="ps-num">11m 30s</td><td class="ps-num">2,906 / 2,906</td><td><span class="ps-badge ps-badge-good">Passed</span></td></tr>
<tr><td class="ps-id">run_4816</td><td>Notifications</td><td>main</td><td class="ps-num">2m 51s</td><td class="ps-num">—</td><td><span class="ps-badge">Canceled</span></td></tr>
<tr><td class="ps-id">run_4815</td><td>Search indexer</td><td>main</td><td class="ps-num">7m 52s</td><td class="ps-num">612 / 612</td><td><span class="ps-badge ps-badge-good">Passed</span></td></tr>
<tr><td class="ps-id">run_4814</td><td>Web app</td><td>main</td><td class="ps-num">10m 58s</td><td class="ps-num">2,906 / 2,906</td><td><span class="ps-badge ps-badge-good">Passed</span></td></tr>
</tbody></table></div>
<p class="ps-table-meta"><span>8 of 142 runs</span><span>Sample data</span></p></main>
```

## Variant: Empty

No rows match the active filters; the columns stay in place and the row names the filters and offers to clear them.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Empty data table</h1><p class="ps-note">The columns stay in place and the empty row says why and what to do next.</p></header>
<div class="ps-table-region" tabindex="0" role="region" aria-label="Sample templates"><table class="ps-table ps-table-fixed"><caption>Sample templates and their review state</caption>
<thead><tr><th scope="col">Template</th><th scope="col" class="ps-num">Pages</th><th scope="col">Review</th></tr></thead>
<tbody><tr><td class="ps-table-message" colspan="3"><div><strong>No templates match these filters</strong><p>Review is Archived and Owner is Content team. None of the 18 templates meet both.</p><button class="ps-button" type="button">Clear filters</button></div></td></tr></tbody></table></div>
<p class="ps-table-meta"><span>0 of 18 templates</span><span>Sample data</span></p></main>
```

## Variant: Loading

Headers render at once while static placeholder rows hold the layout and a status line says what is loading.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Loading data table</h1><p class="ps-note">Headers render at once; placeholder rows hold the layout until records arrive.</p></header>
<div class="ps-table-region" tabindex="0" role="region" aria-label="Sample templates" aria-busy="true"><table class="ps-table ps-table-fixed ps-table-loading"><caption>Sample templates and their review state</caption>
<thead><tr><th scope="col">Template</th><th scope="col" class="ps-num">Pages</th><th scope="col">Review</th></tr></thead>
<tbody aria-hidden="true">
<tr><td><span class="ps-table-placeholder"></span></td><td class="ps-num"><span class="ps-table-placeholder"></span></td><td><span class="ps-table-placeholder"></span></td></tr>
<tr><td><span class="ps-table-placeholder"></span></td><td class="ps-num"><span class="ps-table-placeholder"></span></td><td><span class="ps-table-placeholder"></span></td></tr>
<tr><td><span class="ps-table-placeholder"></span></td><td class="ps-num"><span class="ps-table-placeholder"></span></td><td><span class="ps-table-placeholder"></span></td></tr>
</tbody></table></div>
<p class="ps-table-meta" role="status"><span>Loading templates</span><span>Sample data</span></p></main>
```

## Variant: Failed to load

The request failed; the table states the cause, confirms nothing changed, gives a request ID for support and offers a retry.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Data table that failed to load</h1><p class="ps-note">The request failed; the table names the cause and offers a retry.</p></header>
<div class="ps-table-region" tabindex="0" role="region" aria-label="Sample templates"><table class="ps-table ps-table-fixed"><caption>Sample templates and their review state</caption>
<thead><tr><th scope="col">Template</th><th scope="col" class="ps-num">Pages</th><th scope="col">Review</th></tr></thead>
<tbody><tr><td class="ps-table-message" colspan="3"><div><span class="ps-badge ps-badge-error">Not loaded</span><strong>Templates could not be loaded</strong><p>The request timed out after 30 seconds. Nothing was changed. If it keeps failing, share request <code>req_7f3a21c</code> with support.</p><button class="ps-button" type="button">Try again</button></div></td></tr></tbody></table></div>
<p class="ps-table-meta"><span>Last attempt <time datetime="2026-10-28T10:42">10:42 AM</time></span><span>Sample data</span></p></main>
```
