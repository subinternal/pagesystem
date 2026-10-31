# Attachment (attachment)

Kind: component. File cards that show type, name and size, with remove, simulated upload progress and recovery from failure.

Task: See which files are attached, remove one, add another and recover a failed upload.

Elements: [button](button.md), [text](text.md).

Category: agent.

Native behavior: attachment. It needs pagesystem.js (see ../implementation.md).

## content

- File name in full, never truncated.
- Type and size, or the reason a file failed.
- Upload progress as a native progress bar with its percentage.
- A summary of ready files, total size and files that need attention.

## states

- ready
- uploading
- failed
- rejected
- removed
- empty

## responsive

- Cards wrap at 18rem each and a short last row shares the width; on narrow screens they drop to one column, and below 22rem the type tile gives way so the full file name fits.
- Inline chips wrap and keep the house control height.
- Long file names wrap inside the card rather than overflowing it.

## checks

- Every card has a remove button named after its file.
- A failed upload offers retry; a rejected file offers only remove and says why.
- Removing a file moves focus to the neighboring remove button, then to the add button or the set.
- Progress and results are announced through a polite status region.
- Type is shown in words as well as by icon; nothing depends on color.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Attachment</h1><p class="ps-note">Show each attached file with its type and size, and let it be removed or added to.</p></header>
<section class="ps-attachment-set" data-ps-attachment aria-labelledby="board-title">
<div class="ps-attachment-head"><div><h2 id="board-title">Board pack files</h2><p data-attachment-summary></p></div><button class="ps-button" type="button" data-attachment-add><span class="ps-i ps-i-plus" aria-hidden="true"></span>Add sample file</button></div>
<ul class="ps-attachments" data-attachment-list aria-labelledby="board-title"><li class="ps-attachment" data-name="q3-board-deck.pptx" data-size="4404019" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-file" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">q3-board-deck.pptx</span><span class="ps-attachment-meta"><span class="ps-attachment-type">PPTX · </span>4.2 MB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove q3-board-deck.pptx"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li>
<li class="ps-attachment" data-name="revenue-bridge.xlsx" data-size="319488" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-grid" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">revenue-bridge.xlsx</span><span class="ps-attachment-meta"><span class="ps-attachment-type">XLSX · </span>312 KB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove revenue-bridge.xlsx"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li>
<li class="ps-attachment" data-name="office-floorplan.png" data-size="1887437" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-image" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">office-floorplan.png</span><span class="ps-attachment-meta"><span class="ps-attachment-type">PNG · </span>1.8 MB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove office-floorplan.png"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li>
<li class="ps-attachment" data-name="audit-letter-signed.pdf" data-size="253952" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-file" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">audit-letter-signed.pdf</span><span class="ps-attachment-meta"><span class="ps-attachment-type">PDF · </span>248 KB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove audit-letter-signed.pdf"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li>
<li class="ps-attachment" data-name="customer-churn-notes.docx" data-size="88064" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-file" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">customer-churn-notes.docx</span><span class="ps-attachment-meta"><span class="ps-attachment-type">DOCX · </span>86 KB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove customer-churn-notes.docx"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li></ul>
<p class="ps-note">Sample files. Adding one simulates an upload; nothing leaves this page.</p><p class="ps-visually-hidden" data-attachment-live role="status"></p>
</section></main>
```

## Variant: Upload states

A ready file beside one uploading, one that failed with retry and one rejected for size.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Attachment upload states</h1><p class="ps-note">Uploading, failed and rejected files beside a ready one, each with the action that resolves it.</p></header>
<section class="ps-attachment-set" data-ps-attachment aria-labelledby="states-title">
<div class="ps-attachment-head"><div><h2 id="states-title">Expense receipts</h2><p data-attachment-summary></p></div></div>
<ul class="ps-attachments" data-attachment-list aria-labelledby="states-title"><li class="ps-attachment" data-name="hotel-lisbon-oct.pdf" data-size="421888" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-file" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">hotel-lisbon-oct.pdf</span><span class="ps-attachment-meta"><span class="ps-attachment-type">PDF · </span>412 KB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove hotel-lisbon-oct.pdf"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li>
<li class="ps-attachment" data-name="team-dinner-receipt.jpg" data-size="2411725" data-state="uploading" data-progress="48"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-image" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">team-dinner-receipt.jpg</span><span class="ps-attachment-progress"><progress max="100" value="48" aria-label="Uploading team-dinner-receipt.jpg"></progress><span>48%</span></span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove team-dinner-receipt.jpg"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li>
<li class="ps-attachment" data-name="taxi-airport.heic" data-size="3250586" data-state="error" data-error="Upload failed. Retry or remove."><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-alert" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">taxi-airport.heic</span><span class="ps-attachment-meta">Upload failed. Retry or remove.</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-retry aria-label="Retry taxi-airport.heic"><span class="ps-i ps-i-retry" aria-hidden="true"></span></button><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove taxi-airport.heic"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li>
<li class="ps-attachment" data-name="conference-recording.mov" data-size="327155712" data-state="error" data-error="Over the 25 MB limit. Remove it or share a link." data-retry="false"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-alert" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">conference-recording.mov</span><span class="ps-attachment-meta">Over the 25 MB limit. Remove it or share a link.</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove conference-recording.mov"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li></ul>
<p class="ps-note">Sample states. Retry runs a local simulated upload.</p><p class="ps-visually-hidden" data-attachment-live role="status"></p>
</section></main>
```

## Variant: Inline chips

Compact one-control-tall chips on a well, as used inside a composer or a sent message.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Inline attachments</h1><p class="ps-note">Compact chips for a composer or a sent message, one control tall.</p></header>
<section class="ps-attachment-set" data-ps-attachment aria-labelledby="inline-title">
<div class="ps-attachment-head"><div><h2 id="inline-title">Attached to this prompt</h2><p data-attachment-summary></p></div><button class="ps-button" type="button" data-attachment-add><span class="ps-i ps-i-plus" aria-hidden="true"></span>Add sample file</button></div>
<ul class="ps-attachments" data-layout="inline" data-attachment-list aria-labelledby="inline-title"><li class="ps-attachment" data-name="pricing-page-audit.pdf" data-size="1153434" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-file" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">pricing-page-audit.pdf</span><span class="ps-attachment-meta"><span class="ps-attachment-type">PDF · </span>1.1 MB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove pricing-page-audit.pdf"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li>
<li class="ps-attachment" data-name="checkout-funnel.png" data-size="700416" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-image" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">checkout-funnel.png</span><span class="ps-attachment-meta"><span class="ps-attachment-type">PNG · </span>684 KB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove checkout-funnel.png"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li>
<li class="ps-attachment" data-name="renewal-cohorts.csv" data-size="94208" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-grid" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">renewal-cohorts.csv</span><span class="ps-attachment-meta"><span class="ps-attachment-type">CSV · </span>92 KB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove renewal-cohorts.csv"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li></ul>
<p class="ps-note">Sample files. Remove a chip or add another; nothing is uploaded.</p><p class="ps-visually-hidden" data-attachment-live role="status"></p>
</section></main>
```
