# Detail (detail)

Kind: system. One record, its evidence, and the actions it permits.

Task: Understand one record and change it with confidence.

Composition: opening ([page-header](page-header.md)) → facts ([record-summary](record-summary.md)) → history ([collection-list](collection-list.md)) → feedback ([feedback](feedback.md)) → actions ([action-bar](action-bar.md)).

## content

- Record identity
- Current status
- Facts and history
- Permitted next actions

## states

- ready: current record
- not-found: route back to the collection
- read-only: explain permissions
- saving: prevent duplicate submission
- error: retain entered work

## responsive

- Facts become a definition list on narrow screens.
- The record title may wrap without hiding actions.

## checks

- One page title and ordered headings.
- Keyboard order follows reading order.
- Source HTML contains the answer; no script is needed to read it.
- Text contrast and focus must be measured in both themes.

## HTML

```html
<main class="ps-page" id="main"><header class="ps-stack"><p class="ps-kicker">Project / sample record</p><h1 class="ps-title">Service pages</h1><p class="ps-lead">A clearer route from understanding the offer to making an inquiry.</p><span class="ps-badge ps-badge-good">Ready for review</span></header><section class="ps-stack"><h2 class="ps-heading">The record</h2><dl class="ps-facts"><div><dt>Owner</dt><dd>Alex</dd></div><div><dt>Updated</dt><dd>October 27, 2026</dd></div><div><dt>Scope</dt><dd>Three templates</dd></div></dl></section><section class="ps-stack" id="history"><h2 class="ps-heading">What changed</h2><ul class="ps-list"><li><h3 class="ps-subheading">A direct answer leads</h3><p class="ps-note">Scope now appears before the project inquiry.</p></li><li><h3 class="ps-subheading">Shared components carry the rhythm</h3><p class="ps-note">Headers, evidence blocks and actions use the same spacing roles.</p></li></ul></section><section class="ps-panel ps-stack"><h2 class="ps-subheading">Review the work, then record a decision.</h2><p>Sample record. No approval has been granted or saved.</p><a href="#history">Read the changes</a></section></main>
```
