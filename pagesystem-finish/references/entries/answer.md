# Answer block (answer)

Kind: component. The useful answer comes before its explanation.

Task: Get the answer without searching the page.

Elements: [text](text.md), [link](link.md).

Category: layout.

## content

- Question heading
- Direct answer
- Optional supporting source

## states

- ready
- uncertain: state the limitation

## responsive

- Paragraph remains readable at narrow widths.

## checks

- The first paragraph answers its heading.
- Claims retain sources and uncertainty.

## HTML

```html
<main><section class="ps-prose" aria-labelledby="question"><h1 class="ps-heading" id="question">How do I change the billing email?</h1><p>Open Settings, choose Billing, and edit the billing contact field. Receipts and renewal notices go to the new address from the next invoice. Past invoices are not sent again, but you can download them from the same page.</p><p class="ps-note">Available to workspace owners and billing admins.</p></section></main>
```

## Variant: With sources

A direct answer with inline numbered references to a source list quoting the supporting text.

```html
<main>
<section class="ps-prose" aria-labelledby="question">
  <h1 class="ps-heading" id="question">How long are deleted projects kept?</h1>
  <p>Deleted projects stay in the trash for 30 days, then they are permanently removed.<span class="ps-answer-cite"><a href="#source-1" aria-label="Source 1">1</a></span></p>
  <p>During those 30 days a workspace admin can restore the whole project, including comments and version history. After permanent removal, encrypted backups may hold a copy for up to 35 more days, but projects cannot be restored from backups.<span class="ps-answer-cite"><a href="#source-2" aria-label="Source 2">2</a></span></p>
  <section class="ps-answer-sources" aria-labelledby="sources-title">
    <h2 id="sources-title">Sources</h2>
    <ol>
      <li id="source-1"><cite>Retention policy, section 4.2</cite> · updated 12 Sep 2026<blockquote><p>Items in the trash are permanently deleted after 30 days.</p></blockquote></li>
      <li id="source-2"><cite>Backup and recovery overview</cite> · updated 2 Oct 2026<blockquote><p>Backups are retained for 35 days and are used only for disaster recovery.</p></blockquote></li>
    </ol>
    <p class="ps-note">Sample answer with sample sources.</p>
  </section>
</section>
</main>
```

## Variant: Uncertain

An answer that separates what is confirmed from what is not, and says what it was checked against.

```html
<main>
<section class="ps-prose" aria-labelledby="question">
  <h1 class="ps-heading" id="question">Does a workspace export include comment history?</h1>
  <p>Yes for documents; not yet confirmed for design files. Document exports include every resolved and open comment. Design file exports were not covered by the release notes we checked.</p>
  <dl class="ps-answer-split">
    <div><dt><span class="ps-answer-mark ps-answer-mark-done" aria-hidden="true"><span class="ps-i ps-i-check"></span></span>Confirmed</dt><dd>Documents: comments, replies and resolution state, in the export’s JSON file.</dd></div>
    <div><dt><span class="ps-answer-mark" aria-hidden="true">?</span>Not confirmed</dt><dd>Design files: the export format lists layers and versions but does not mention comments.</dd></div>
  </dl>
  <p class="ps-answer-checked">Sample answer. Checked against export format v3 release notes, 21 October 2026.</p>
</section>
</main>
```

## Variant: With steps

A direct answer followed by short numbered steps for completing the task.

```html
<main>
<section class="ps-prose" aria-labelledby="question">
  <h1 class="ps-heading" id="question">How do I transfer workspace ownership?</h1>
  <p>The current owner transfers ownership from Settings, then Members. The new owner must already be an admin of the workspace.</p>
  <ol class="ps-answer-steps">
    <li><span>Open <strong>Settings</strong> and choose <strong>Members</strong>.</span></li>
    <li><span>Find the admin who will become owner and open their row menu.</span></li>
    <li><span>Choose <strong>Make owner</strong> and confirm with your password.</span></li>
  </ol>
  <p class="ps-note">A workspace has exactly one owner. After the transfer you remain an admin. Sample answer.</p>
</section>
</main>
```
