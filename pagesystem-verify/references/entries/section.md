# Content section (section)

Kind: component. A heading and the content it actually describes.

Task: Understand a distinct part of a page.

Elements: [text](text.md), [separator](separator.md).

Category: layout.

## content

- Heading
- Body or structured content

## states

- ready
- long content

## responsive

- Reading text keeps a comfortable measure.

## checks

- Heading is descriptive; no skipped levels.

## HTML

```html
<main><section class="ps-prose" aria-labelledby="section-title"><h1 class="ps-heading" id="section-title">Data retention</h1><p>Project files are kept for as long as the workspace is active. Deleted files stay in the trash for 30 days and are then removed permanently.</p><p>When a workspace is closed, its owner can export all files for 90 days. After that, the data is deleted from active storage and from backups within a further 30 days.</p></section></main>
```

## Variant: With aside

Reading text with a supporting aside that sits beside it on wide containers and moves below on narrow ones.

```html
<main>
<div class="ps-section-frame">
  <section class="ps-section-split" aria-labelledby="retention-title">
    <div class="ps-prose">
      <h1 class="ps-heading" id="retention-title">Data retention</h1>
      <p>Northline keeps project files, comments and version history for as long as the workspace is active. When a workspace is closed, its data is kept for 90 days so an owner can reopen it, then deleted from primary storage.</p>
      <p>Backups follow their own 35-day cycle. A deleted file can therefore remain in an encrypted backup for up to 35 days after it leaves primary storage, but it cannot be restored individually from that copy.</p>
    </div>
    <aside class="ps-section-aside" aria-labelledby="retention-aside">
      <h2 id="retention-aside">Applies to</h2>
      <p>Business and Enterprise plans. Sample policy text.</p>
      <ul><li>Closed workspaces: 90 days</li><li>Backups: 35 days</li><li>Audit logs: 1 year</li></ul>
    </aside>
  </section>
</div>
</main>
```

## Variant: Term rows

A section whose content is term and value rows with optional notes, for limits, specifications or settings.

```html
<main>
<div class="ps-section-frame">
  <section class="ps-section-structured" aria-labelledby="limits-title">
    <header><h1 class="ps-heading" id="limits-title">Upload limits</h1><p>Limits apply per file and per workspace. Larger files can be sent through the desktop app, which uploads in parts.</p></header>
    <dl class="ps-section-rows">
      <div><dt>Single file, browser</dt><dd>2 GB<span>Uploads pause and resume if the connection drops.</span></dd></div>
      <div><dt>Single file, desktop app</dt><dd>50 GB</dd></div>
      <div><dt>Files per upload</dt><dd>500</dd></div>
      <div><dt>Workspace storage</dt><dd>1 TB on Business<span>Enterprise storage is set in the contract.</span></dd></div>
    </dl>
    <p class="ps-note">Sample limits, last reviewed 20 October 2026.</p>
  </section>
</div>
</main>
```
