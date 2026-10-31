# Collection (collection)

Kind: system. Help someone find the right item, then open it.

Task: Find an item in a set I can understand.

Composition: opening ([page-header](page-header.md)) → filter ([form-field](form-field.md)) → items ([collection-list](collection-list.md)) → feedback ([feedback](feedback.md)).

## content

- Collection scope
- Item titles, summaries and destinations
- Filter or grouping criteria

## states

- ready: matching items
- empty: collection has no items
- no-results: clear filters
- error: explain recovery without losing query

## responsive

- Rows wrap at content boundaries.
- Filter and result count stay next to the list.

## checks

- One page title and ordered headings.
- Keyboard order follows reading order.
- Source HTML contains the answer; no script is needed to read it.
- Text contrast and focus must be measured in both themes.

## HTML

```html
<main class="ps-page" id="main"><header class="ps-stack"><p class="ps-kicker">The reference shelf / sample collection</p><h1 class="ps-title">Small guides.<br>Useful decisions.</h1><p class="ps-lead">Three starting points for a more coherent website.</p></header><section class="ps-stack" aria-labelledby="guides"><h2 class="ps-heading" id="guides">Browse the guides</h2><p class="ps-note">Three sample records. Open a guide for its short answer.</p><details><summary>Start with the page's job</summary><p>Write the visitor's task before choosing a layout. A page exists to help someone do or understand something.</p></details><details><summary>Find your spacing scale</summary><p>Count the recurring intervals, name their roles, and keep related items closer together than unrelated groups.</p></details><details><summary>Build the empty state</summary><p>Explain why there is nothing here and give a useful next step. An empty filtered list needs a different response from a new account.</p></details></section><aside class="ps-panel"><p class="ps-note">All guides are included in this specimen. No search service or pagination is connected.</p></aside></main>
```
