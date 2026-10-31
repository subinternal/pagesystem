# Workspace (workspace)

Kind: system. Put the working set and its current state first.

Task: Inspect work, find what needs attention and act.

Composition: frame ([shell](shell.md)) → opening ([page-header](page-header.md)) → records ([data-table](data-table.md)) → feedback ([feedback](feedback.md)) → actions ([action-bar](action-bar.md)).

## content

- Workspace scope
- Current records and status
- Filters
- Named actions and feedback

## states

- loading: retain column geometry
- ready: current data
- empty: first useful action
- error: retry without discarding filters

## responsive

- Tables scroll locally with accessible labels.
- Actions stack; important status never disappears.

## checks

- One page title and ordered headings.
- Keyboard order follows reading order.
- Source HTML contains the answer; no script is needed to read it.
- Text contrast and focus must be measured in both themes.

## HTML

```html
<main class="ps-page" id="main"><nav class="ps-nav" aria-label="Workspace"><strong>Northline / sample workspace</strong><a href="#records">Projects</a></nav><header class="ps-stack"><p class="ps-kicker">Workspace</p><h1 class="ps-title">The work in view.</h1><p class="ps-lead">Three projects, with one ready for review.</p></header><section class="ps-stack" id="records" aria-labelledby="projects"><h2 class="ps-heading" id="projects">Current projects</h2><div class="ps-table-region" tabindex="0" role="region" aria-label="Sample projects table"><table class="ps-table"><caption>Sample data · three projects</caption><thead><tr><th scope="col">Project</th><th scope="col">Owner</th><th scope="col">Status</th></tr></thead><tbody><tr><td>Service pages</td><td>Alex</td><td><span class="ps-badge ps-badge-good">Ready for review</span></td></tr><tr><td>Reference library</td><td>Morgan</td><td><span class="ps-badge">In progress</span></td></tr><tr><td>Contact flow</td><td>Sam</td><td><span class="ps-badge">Planned</span></td></tr></tbody></table></div></section><section class="ps-panel ps-stack" id="review"><h2 class="ps-subheading">A review needs a decision.</h2><p>Service pages are ready for a content and keyboard pass. This is sample state, not a live project feed.</p><a href="#records">Return to the working set</a></section></main>
```
