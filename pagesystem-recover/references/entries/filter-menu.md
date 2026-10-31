# Faceted filter (filter-menu)

Kind: component. Search, narrow, and remove filters without losing the thread.

Task: Find records by combining a text query with multiple independent facets.

Elements: [text](text.md), [input](input.md), [button](button.md).

Category: navigation.

Native behavior: filter-menu. It needs pagesystem.js (see ../implementation.md).

## content

- Named facet groups with native checkbox labels and counts.
- Removable selected chips, a clear action and actual matching records.
- A live result count and a useful no-results state.

## states

- No filters, one or multiple selections, text query, no match and cleared.
- Use OR within a group and AND across groups.
- Changing a facet preserves the query; clear resets both.

## responsive

- Groups become one column in narrow containers.
- Filename text wraps; results retain owner and type context.

## checks

- Checkboxes and chip removal work with keyboard and touch.
- Removing a chip moves focus to the next chip or search.
- Counts derive from the same records as the results.
- Emit pagesystem:filter with query, types, owners and matching IDs.
- Repeated filtering must not accumulate detached-node listeners.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Discovery</p><h1 class="ps-heading">Faceted file browser</h1><p class="ps-note">Combine facets, remove individual filters, and see the matching records immediately.</p></header>

<div data-ps-filter-menu class="ps-filter-root ps-rich-surface">
  <div class="ps-rich-toolbar"><div><p class="ps-rich-label">Working collection</p><h2 class="ps-subheading">Project files</h2></div><span class="ps-badge">Sample</span></div>
  <label class="ps-visually-hidden" for="facet-query">Search files</label><input id="facet-query" class="ps-input" type="search" placeholder="Search by filename…" autocomplete="off" data-filter-query>
  <details class="ps-facet-panel" open><summary>Filters <span data-facet-count>0 selected</span></summary><div class="ps-facet-groups">
    <fieldset><legend>File type</legend><label><input type="checkbox" name="types" value="design">Design <span>2</span></label><label><input type="checkbox" name="types" value="document">Document <span>2</span></label><label><input type="checkbox" name="types" value="image">Image <span>2</span></label></fieldset>
    <fieldset><legend>Owner</legend><label><input type="checkbox" name="owners" value="ava">Ava Lewis <span>3</span></label><label><input type="checkbox" name="owners" value="milo">Milo Chen <span>3</span></label></fieldset>
  </div></details>
  <div class="ps-filter-selections" data-filter-chips role="group" aria-label="Selected filters"></div><div class="ps-rich-toolbar"><p class="ps-note" data-filter-count role="status">6 files</p><button type="button" class="ps-text-action" data-filter-clear>Clear all</button></div>
  <ul class="ps-filter-results" aria-label="Matching files">
    <li data-record="brand" data-name="Brand explorations" data-type="design" data-owner="ava"><span class="ps-record-icon ps-tone-violet" aria-hidden="true"><span class="ps-i ps-i-shape"></span></span><span>Brand explorations<small>Design · Ava Lewis</small></span><span class="ps-record-meta">FIG</span></li>
    <li data-record="brief" data-name="Project brief" data-type="document" data-owner="ava"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Project brief<small>Document · Ava Lewis</small></span><span class="ps-record-meta">DOC</span></li>
    <li data-record="cover" data-name="Campaign cover" data-type="image" data-owner="milo"><span class="ps-record-icon ps-tone-warm" aria-hidden="true"><span class="ps-i ps-i-image"></span></span><span>Campaign cover<small>Image · Milo Chen</small></span><span class="ps-record-meta">PNG</span></li>
    <li data-record="flow" data-name="Onboarding flow" data-type="design" data-owner="milo"><span class="ps-record-icon ps-tone-violet" aria-hidden="true"><span class="ps-i ps-i-shape"></span></span><span>Onboarding flow<small>Design · Milo Chen</small></span><span class="ps-record-meta">FIG</span></li>
    <li data-record="notes" data-name="Workshop notes" data-type="document" data-owner="milo"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Workshop notes<small>Document · Milo Chen</small></span><span class="ps-record-meta">DOC</span></li>
    <li data-record="mood" data-name="Material study" data-type="image" data-owner="ava"><span class="ps-record-icon ps-tone-warm" aria-hidden="true"><span class="ps-i ps-i-image"></span></span><span>Material study<small>Image · Ava Lewis</small></span><span class="ps-record-meta">JPG</span></li>
  </ul><div class="ps-filter-empty" data-filter-empty hidden><strong>No files match yet.</strong><p>Remove a filter or try a different filename.</p></div>
</div></main>
```

## Variant: Filter bar

Facets always visible in one row above the results, for collections with few filter values.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Discovery</p><h1 class="ps-heading">Filter bar</h1><p class="ps-note">Facets stay visible in one row above the results, for collections with few filter values.</p></header>

<div data-ps-filter-menu class="ps-filter-root ps-filter-bar ps-rich-surface">
  <div class="ps-rich-toolbar"><div><p class="ps-rich-label">Legal</p><h2 class="ps-subheading">Contract files</h2></div><span class="ps-badge">Sample</span></div>
  <div class="ps-filter-topline"><label class="ps-visually-hidden" for="contract-query">Search contract files</label><input id="contract-query" class="ps-input" type="search" placeholder="Search by filename…" autocomplete="off" data-filter-query><span class="ps-note" data-facet-count>0 selected</span></div>
  <div class="ps-facet-groups">
    <fieldset><legend>Type</legend><label><input type="checkbox" name="types" value="agreement">Agreement <span>0</span></label><label><input type="checkbox" name="types" value="amendment">Amendment <span>0</span></label><label><input type="checkbox" name="types" value="nda">NDA <span>0</span></label></fieldset>
    <fieldset><legend>Owner</legend><label><input type="checkbox" name="owners" value="priya">Priya Raman <span>0</span></label><label><input type="checkbox" name="owners" value="jonas">Jonas Weber <span>0</span></label></fieldset>
  </div>
  <div class="ps-filter-selections" data-filter-chips role="group" aria-label="Selected filters"></div><div class="ps-rich-toolbar"><p class="ps-note" data-filter-count role="status">6 files</p><button type="button" class="ps-text-action" data-filter-clear>Clear all</button></div>
  <ul class="ps-filter-results" aria-label="Matching contract files">
    <li data-record="acme-msa" data-name="Acme master services agreement" data-type="agreement" data-owner="priya"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Acme master services agreement<small>Agreement · Priya Raman</small></span><span class="ps-record-meta">PDF</span></li>
    <li data-record="acme-a2" data-name="Acme amendment 2 pricing" data-type="amendment" data-owner="priya"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Acme amendment 2, pricing<small>Amendment · Priya Raman</small></span><span class="ps-record-meta">PDF</span></li>
    <li data-record="harbor-nda" data-name="Harbor Freight mutual NDA" data-type="nda" data-owner="jonas"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Harbor Freight mutual NDA<small>NDA · Jonas Weber</small></span><span class="ps-record-meta">DOCX</span></li>
    <li data-record="lumen-msa" data-name="Lumen Labs services agreement" data-type="agreement" data-owner="jonas"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Lumen Labs services agreement<small>Agreement · Jonas Weber</small></span><span class="ps-record-meta">PDF</span></li>
    <li data-record="lumen-a1" data-name="Lumen Labs amendment 1 term" data-type="amendment" data-owner="jonas"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Lumen Labs amendment 1, term<small>Amendment · Jonas Weber</small></span><span class="ps-record-meta">PDF</span></li>
    <li data-record="orbit-nda" data-name="Orbit Health NDA" data-type="nda" data-owner="priya"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Orbit Health NDA<small>NDA · Priya Raman</small></span><span class="ps-record-meta">PDF</span></li>
  </ul><div class="ps-filter-empty" data-filter-empty hidden><strong>No contract files match.</strong><p>Remove a filter or search a different filename.</p></div>
</div></main>
```

## Variant: Side panel

Search and facets in a panel beside the results, moving above them in a narrow container.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Discovery</p><h1 class="ps-heading">Filter side panel</h1><p class="ps-note">Search and facets in a panel beside the results; the panel moves above them in a narrow container.</p></header>

<div class="ps-filter-frame">
<div data-ps-filter-menu class="ps-filter-root ps-filter-split ps-rich-surface">
  <div class="ps-filter-side">
    <label class="ps-visually-hidden" for="asset-query">Search assets</label><input id="asset-query" class="ps-input" type="search" placeholder="Search assets…" autocomplete="off" data-filter-query>
    <div class="ps-facet-groups">
      <p class="ps-facet-head">Filters <span data-facet-count>0 selected</span></p>
      <fieldset><legend>Format</legend><label><input type="checkbox" name="types" value="photo">Photo <span>0</span></label><label><input type="checkbox" name="types" value="video">Video <span>0</span></label><label><input type="checkbox" name="types" value="vector">Vector <span>0</span></label></fieldset>
      <fieldset><legend>Uploaded by</legend><label><input type="checkbox" name="owners" value="sofia">Sofia Marin <span>0</span></label><label><input type="checkbox" name="owners" value="dev">Dev Patel <span>0</span></label><label><input type="checkbox" name="owners" value="lena">Lena Ortiz <span>0</span></label></fieldset>
    </div>
  </div>
  <div class="ps-filter-main">
    <div class="ps-rich-toolbar"><h2 class="ps-subheading">Brand assets</h2><span class="ps-badge">Sample</span></div>
    <div class="ps-filter-selections" data-filter-chips role="group" aria-label="Selected filters"></div>
    <div class="ps-rich-toolbar"><p class="ps-note" data-filter-count role="status">7 files</p><button type="button" class="ps-text-action" data-filter-clear>Clear all</button></div>
    <ul class="ps-filter-results" aria-label="Matching assets">
      <li data-record="hq" data-name="Office exterior morning" data-type="photo" data-owner="sofia"><span class="ps-record-icon ps-tone-warm" aria-hidden="true"><span class="ps-i ps-i-image"></span></span><span>Office exterior, morning<small>Photo · Sofia Marin</small></span><span class="ps-record-meta">JPG</span></li>
      <li data-record="team" data-name="Team portrait 2026" data-type="photo" data-owner="lena"><span class="ps-record-icon ps-tone-warm" aria-hidden="true"><span class="ps-i ps-i-image"></span></span><span>Team portrait 2026<small>Photo · Lena Ortiz</small></span><span class="ps-record-meta">JPG</span></li>
      <li data-record="launch" data-name="Product launch cut 30 seconds" data-type="video" data-owner="dev"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-video"></span></span><span>Product launch cut, 30 seconds<small>Video · Dev Patel</small></span><span class="ps-record-meta">MP4</span></li>
      <li data-record="onboard" data-name="Onboarding walkthrough" data-type="video" data-owner="sofia"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-video"></span></span><span>Onboarding walkthrough<small>Video · Sofia Marin</small></span><span class="ps-record-meta">MOV</span></li>
      <li data-record="logo" data-name="Primary logo" data-type="vector" data-owner="lena"><span class="ps-record-icon ps-tone-violet" aria-hidden="true"><span class="ps-i ps-i-shape"></span></span><span>Primary logo<small>Vector · Lena Ortiz</small></span><span class="ps-record-meta">SVG</span></li>
      <li data-record="icons" data-name="Interface icon set" data-type="vector" data-owner="dev"><span class="ps-record-icon ps-tone-violet" aria-hidden="true"><span class="ps-i ps-i-shape"></span></span><span>Interface icon set<small>Vector · Dev Patel</small></span><span class="ps-record-meta">SVG</span></li>
      <li data-record="booth" data-name="Conference booth" data-type="photo" data-owner="dev"><span class="ps-record-icon ps-tone-warm" aria-hidden="true"><span class="ps-i ps-i-image"></span></span><span>Conference booth<small>Photo · Dev Patel</small></span><span class="ps-record-meta">JPG</span></li>
    </ul><div class="ps-filter-empty" data-filter-empty hidden><strong>No assets match.</strong><p>Remove a filter or try a different name.</p></div>
  </div>
</div>
</div></main>
```

## Variant: No results

A query and two facets that match nothing, with removable chips and an explanation of how the filters combine.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Discovery</p><h1 class="ps-heading">Filter with no results</h1><p class="ps-note">A query and two facets that match nothing, with the filters still visible and removable.</p></header>

<div data-ps-filter-menu class="ps-filter-root ps-rich-surface">
  <div class="ps-rich-toolbar"><div><p class="ps-rich-label">Working collection</p><h2 class="ps-subheading">Project files</h2></div><span class="ps-badge">Sample</span></div>
  <label class="ps-visually-hidden" for="facet-query">Search files</label><input id="facet-query" class="ps-input" type="search" value="budget" placeholder="Search by filename…" autocomplete="off" data-filter-query>
  <details class="ps-facet-panel"><summary>Filters <span data-facet-count>2 selected</span></summary><div class="ps-facet-groups">
    <fieldset><legend>File type</legend><label><input type="checkbox" name="types" value="spreadsheet">Spreadsheet <span>0</span></label><label><input type="checkbox" name="types" value="document">Document <span>0</span></label><label><input type="checkbox" name="types" value="image" checked>Image <span>0</span></label></fieldset>
    <fieldset><legend>Owner</legend><label><input type="checkbox" name="owners" value="ava">Ava Lewis <span>0</span></label><label><input type="checkbox" name="owners" value="milo" checked>Milo Chen <span>0</span></label></fieldset>
  </div></details>
  <div class="ps-filter-selections" data-filter-chips role="group" aria-label="Selected filters"></div><div class="ps-rich-toolbar"><p class="ps-note" data-filter-count role="status">0 files</p><button type="button" class="ps-text-action" data-filter-clear>Clear all</button></div>
  <ul class="ps-filter-results" aria-label="Matching files">
    <li data-record="budget" data-name="Q4 budget" data-type="spreadsheet" data-owner="ava"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-grid"></span></span><span>Q4 budget<small>Spreadsheet · Ava Lewis</small></span><span class="ps-record-meta">XLSX</span></li>
    <li data-record="budget-notes" data-name="Budget review notes" data-type="document" data-owner="milo"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Budget review notes<small>Document · Milo Chen</small></span><span class="ps-record-meta">DOC</span></li>
    <li data-record="cover" data-name="Campaign cover" data-type="image" data-owner="milo"><span class="ps-record-icon ps-tone-warm" aria-hidden="true"><span class="ps-i ps-i-image"></span></span><span>Campaign cover<small>Image · Milo Chen</small></span><span class="ps-record-meta">PNG</span></li>
    <li data-record="forecast" data-name="Hiring forecast" data-type="spreadsheet" data-owner="milo"><span class="ps-record-icon" aria-hidden="true"><span class="ps-i ps-i-grid"></span></span><span>Hiring forecast<small>Spreadsheet · Milo Chen</small></span><span class="ps-record-meta">XLSX</span></li>
  </ul><div class="ps-filter-empty" data-filter-empty><strong>No files match this search and these filters.</strong><p>Remove a filter above or clear the search. Filters within a group widen the results; filters across groups narrow them.</p></div>
</div></main>
```
