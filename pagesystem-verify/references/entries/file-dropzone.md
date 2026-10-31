# File dropzone (file-dropzone)

Kind: component. A considered home for files, previews and recoverable errors.

Task: Select local images or PDFs and prepare a bounded queue for a host application.

Elements: [text](text.md), [input](input.md), [button](button.md).

Category: input.

Native behavior: file-dropzone. It needs pagesystem.js (see ../implementation.md).

## content

- A native multiple file picker plus a pointer drop target.
- Filename, size, reading state, preview, removal and retry.
- An explicit local-only label and the accepted formats and limits.

## states

- Empty, dragging, reading, ready, unsupported, oversized, full, read/decode failure and removed.
- Validate actual file signatures, not just filename or declared MIME.
- Up to five files, 10 MiB each; failed files remain removable/retryable.
- Cancel pending reads and ignore late callbacks on removal or unmount.

## responsive

- Filenames wrap without shifting remove controls off-screen.
- The picker provides the complete alternative to drag and drop.

## checks

- Accept PNG/JPEG/WebP/PDF signatures; reject empty and unsupported data.
- Image decoding failure is distinct from a successful byte read.
- Progress comes from FileReader events, never a simulated upload.
- Emit pagesystem:files with items {id,file,status,mime}; File objects remain local unless a host explicitly sends them.
- No remote destination, persistence or automatic upload exists.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Files</p><h1 class="ps-heading">File preparation</h1><p class="ps-note">A local file queue with previews, content validation, limits and recoverable errors.</p></header>

<div data-ps-file-dropzone class="ps-files-root ps-rich-surface">
  <div class="ps-rich-toolbar"><div><p class="ps-rich-label">Project materials</p><h2 class="ps-subheading">Project files</h2></div><span class="ps-badge" data-file-count>0 / 5</span></div>
  <div class="ps-file-drop" data-file-drop><div class="ps-file-art" aria-hidden="true"><span class="ps-i ps-i-up"></span></div><strong>Drop files here</strong><p>Prepare images and documents<br>for your project.</p><button type="button" class="ps-button" data-file-pick>Choose files <span class="ps-i ps-i-up" aria-hidden="true"></span></button><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple hidden aria-label="Choose local files"><span class="ps-note">PNG, JPG, WebP or PDF · 10 MiB each</span></div>
  <p class="ps-file-message" data-file-message role="status">Up to five files. Prepared on this device; nothing uploads.</p><ul data-file-list class="ps-file-list" aria-label="Selected files"></ul>
</div></main>
```

## Variant: Mixed queue

A queue showing one file ready, one still reading with progress, and one rejected with its reason, Retry and Remove.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Files</p><h1 class="ps-heading">A queue in mixed states</h1><p class="ps-note">One file ready, one still reading and one rejected with a way to recover.</p></header>

<div class="ps-files-root ps-rich-surface">
  <div class="ps-rich-toolbar"><div><p class="ps-rich-label">Expense claim</p><h2 class="ps-subheading">Receipts</h2></div><span class="ps-badge">3 / 5</span></div>
  <div class="ps-file-drop ps-file-drop-inline"><div class="ps-file-art" aria-hidden="true"><span class="ps-i ps-i-up"></span></div><div class="ps-file-drop-copy"><strong>Drop more receipts</strong><span class="ps-note">PNG, JPG, WebP or PDF · 10 MiB each</span></div><button type="button" class="ps-button">Choose files <span class="ps-i ps-i-up" aria-hidden="true"></span></button></div>
  <p class="ps-file-message" role="status">One file needs attention. Prepared on this device; nothing uploads.</p>
  <ul class="ps-file-list" aria-label="Selected files">
    <li class="ps-file-row"><span class="ps-record-icon ps-file-type" aria-hidden="true">PDF</span><div class="ps-file-copy"><strong>invoice-2026-10-northwind-catering.pdf</strong><span>412.6 KiB · Ready locally</span></div><div class="ps-file-actions"><button class="ps-icon-button" type="button" aria-label="Remove invoice-2026-10-northwind-catering.pdf">×</button></div></li>
    <li class="ps-file-row"><span class="ps-record-icon ps-file-type" aria-hidden="true">JPG</span><div class="ps-file-copy"><strong>taxi-lisbon-airport.jpg</strong><span>Reading on this device…</span><progress max="1" value="0.62" aria-label="Reading taxi-lisbon-airport.jpg"></progress></div><div class="ps-file-actions"><button class="ps-icon-button" type="button" aria-label="Remove taxi-lisbon-airport.jpg">×</button></div></li>
    <li class="ps-file-row ps-file-row-failed"><span class="ps-record-icon ps-file-type" aria-hidden="true">HEIC</span><div class="ps-file-copy"><strong>hotel-folio.heic</strong><span class="ps-file-error">Unsupported content. Choose PNG, JPG, WebP or PDF.</span></div><div class="ps-file-actions"><button class="ps-text-action" type="button" aria-label="Retry hotel-folio.heic">Retry</button><button class="ps-icon-button" type="button" aria-label="Remove hotel-folio.heic">×</button></div></li>
  </ul>
</div>
<p class="ps-note">Static sample of the queue. Sample filenames; nothing is read or uploaded.</p></main>
```

## Variant: Compact

A single-row drop target that fits between form fields and has the same validation, limits and queue as the full dropzone.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Files</p><h1 class="ps-heading">Attachments inside a form</h1><p class="ps-note">A single-row drop target that sits between other fields, with the same validation and queue.</p></header>

<div data-ps-file-dropzone class="ps-files-root ps-files-compact">
  <div class="ps-rich-toolbar"><h2 class="ps-subheading">Attachments</h2><span class="ps-badge" data-file-count>0 / 5</span></div>
  <div class="ps-file-drop ps-file-drop-inline" data-file-drop><div class="ps-file-art" aria-hidden="true"><span class="ps-i ps-i-up"></span></div><div class="ps-file-drop-copy"><strong>Drop files or choose them</strong><span class="ps-note">PNG, JPG, WebP or PDF · 10 MiB each</span></div><button type="button" class="ps-button" data-file-pick>Choose files</button><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple hidden aria-label="Choose local files"></div>
  <p class="ps-file-message" data-file-message role="status">Up to five files. Prepared on this device; nothing uploads.</p><ul data-file-list class="ps-file-list" aria-label="Attached files"></ul>
</div></main>
```

## Variant: Full queue

The five-file limit reached: the picker is disabled with an explanation until a file is removed.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Files</p><h1 class="ps-heading">A full queue</h1><p class="ps-note">At the five-file limit, adding is unavailable until a file is removed.</p></header>

<div class="ps-files-root ps-rich-surface">
  <div class="ps-rich-toolbar"><div><p class="ps-rich-label">Brand review</p><h2 class="ps-subheading">Reference images</h2></div><span class="ps-badge">5 / 5</span></div>
  <div class="ps-file-drop ps-file-drop-inline ps-file-drop-full"><div class="ps-file-art" aria-hidden="true"><span class="ps-i ps-i-check"></span></div><div class="ps-file-drop-copy"><strong>Queue is full</strong><span class="ps-note" id="queue-full-help">Remove a file to add another.</span></div><button type="button" class="ps-button" disabled aria-describedby="queue-full-help">Choose files</button></div>
  <p class="ps-file-message" role="status">5 of 5 files ready. Prepared on this device; nothing uploads.</p>
  <ul class="ps-file-list" aria-label="Selected files">
    <li class="ps-file-row"><span class="ps-record-icon ps-file-type" aria-hidden="true">PNG</span><div class="ps-file-copy"><strong>homepage-hero-desktop.png</strong><span>2.4 MiB · Ready locally</span></div><div class="ps-file-actions"><button class="ps-icon-button" type="button" aria-label="Remove homepage-hero-desktop.png">×</button></div></li>
    <li class="ps-file-row"><span class="ps-record-icon ps-file-type" aria-hidden="true">PNG</span><div class="ps-file-copy"><strong>homepage-hero-mobile.png</strong><span>1.1 MiB · Ready locally</span></div><div class="ps-file-actions"><button class="ps-icon-button" type="button" aria-label="Remove homepage-hero-mobile.png">×</button></div></li>
    <li class="ps-file-row"><span class="ps-record-icon ps-file-type" aria-hidden="true">WEBP</span><div class="ps-file-copy"><strong>product-grid.webp</strong><span>684.0 KiB · Ready locally</span></div><div class="ps-file-actions"><button class="ps-icon-button" type="button" aria-label="Remove product-grid.webp">×</button></div></li>
    <li class="ps-file-row"><span class="ps-record-icon ps-file-type" aria-hidden="true">JPG</span><div class="ps-file-copy"><strong>team-offsite-lisbon.jpg</strong><span>3.8 MiB · Ready locally</span></div><div class="ps-file-actions"><button class="ps-icon-button" type="button" aria-label="Remove team-offsite-lisbon.jpg">×</button></div></li>
    <li class="ps-file-row"><span class="ps-record-icon ps-file-type" aria-hidden="true">PDF</span><div class="ps-file-copy"><strong>brand-guidelines-v3.pdf</strong><span>8.2 MiB · Ready locally</span></div><div class="ps-file-actions"><button class="ps-icon-button" type="button" aria-label="Remove brand-guidelines-v3.pdf">×</button></div></li>
  </ul>
</div>
<p class="ps-note">Static sample of the full state. Sample filenames and sizes.</p></main>
```
