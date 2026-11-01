# Relationship map (relationship-map)

Kind: component. A service's dependencies as a tree: direct ones beside the source, indirect ones beside their own parent, each with its kind and status in text.

Task: See what a service depends on, directly and indirectly, and which of those dependencies are degraded or at risk.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: data.

Native behavior: relationship-map. It needs pagesystem.js (see ../implementation.md).

## content

- The source service and a depth control for one or two hops
- Each service as a button naming itself, its kind and its status, laid out by distance from the source
- Hairline connectors from each service to the ones that depend on it
- Status as a dot and a word: degraded and at risk in the danger color, healthy muted
- A readout naming the selected service, its kind, status and what is happening
- Counts of visible services and of those degraded or at risk, and a sample label

## states

- two hops
- one hop
- service selected
- selection dropped to the source when a shallower depth hides it

## responsive

- Below 34rem of component width the tree becomes an outline: each list of dependencies indents under its parent with one rule beside it.
- Service names, kinds and statuses wrap inside their card; cards keep a control height so they stay easy to hit.

## checks

- Every service is reachable as a button whose text gives its name, kind and status; nothing depends on the drawing alone.
- The tree is one tab stop: arrows, Home and End move between services in reading order, and Enter or Space selects.
- Selecting a service presses it, marks it with the selected ring and names it in the readout.
- Changing depth recounts services and risks and drops a selection the new depth hides.
- Status is never color alone: the word is always shown beside the dot.
- Graph traversal handles cycles without duplicate nodes.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Relationship map</h1><p class="ps-note">Trace direct and indirect dependencies without losing the selected record.</p></header><section class="ps-instrument" data-ps-relationship-map aria-label="Sample dependency map"><header class="ps-instrument-header"><div><h2>Service dependencies</h2><p>From Public API · sample environment</p></div><label class="ps-compact-field">Depth<select class="ps-input" data-map-hops><option value="1">1 hop</option><option value="2" selected>2 hops</option></select></label></header><div class="ps-instrument-body"><div class="ps-map-tree" data-map-plot role="group" aria-label="Services by distance from Public API"></div><div class="ps-data-readout" data-map-detail aria-live="polite"></div></div><footer class="ps-instrument-footer"><span>Visible services <strong data-map-count></strong></span><span>Degraded or at risk <strong data-map-risk></strong></span><span>Sample topology</span></footer></section></main>
```

## Variant: Impact path

A failure followed outward from its source through direct and indirect dependents, laid out left to right and stacking vertically when narrow.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Relationship map, impact path</h1><p class="ps-note">Follow a failure outward from its source to every service that depends on it.</p></header><section class="ps-instrument" aria-labelledby="impact-title"><header class="ps-instrument-header"><div><h2 id="impact-title">Incident impact</h2><p>From Key store · sample environment</p></div><span class="ps-badge ps-badge-error">Open incident</span></header><div class="ps-instrument-body">
<div class="ps-impact-path">
<section class="ps-impact-tier" aria-labelledby="tier-source"><h3 id="tier-source">Source</h3><ul><li class="ps-impact-node" aria-current="true"><strong>Key store</strong><span>Database</span><span class="ps-badge ps-badge-error">Failed</span></li></ul></section>
<span class="ps-impact-link" aria-hidden="true"><span class="ps-i ps-i-right"></span></span>
<section class="ps-impact-tier" aria-labelledby="tier-direct"><h3 id="tier-direct">Direct dependents</h3><ul><li class="ps-impact-node"><strong>Identity</strong><span>Service</span><span class="ps-badge ps-map-status">Degraded</span></li></ul></section>
<span class="ps-impact-link" aria-hidden="true"><span class="ps-i ps-i-right"></span></span>
<section class="ps-impact-tier" aria-labelledby="tier-indirect"><h3 id="tier-indirect">Indirect dependents</h3><ul><li class="ps-impact-node"><strong>Public API</strong><span>Service</span><span class="ps-badge ps-map-status">Degraded</span></li><li class="ps-impact-node"><strong>Admin console</strong><span>Service</span><span class="ps-badge ps-map-status">At risk</span></li><li class="ps-impact-node"><strong>Mobile sync</strong><span>Worker</span><span class="ps-badge ps-map-status">At risk</span></li></ul></section>
</div>
<div class="ps-data-readout">Key store · Database · Failed. Credential reads have timed out since <time class="ps-impact-time" datetime="2026-10-28T14:02Z">2:02 PM UTC</time>. Identity is serving cached tokens, which expire after 15 minutes; new sign-ins through Public API, Admin console and Mobile sync fail after that.</div></div>
<footer class="ps-instrument-footer"><span>Affected services <strong>4</strong></span><span>Customer-facing <strong>2</strong></span><span>Sample topology</span></footer></section></main>
```

## Variant: Outline

The same dependency data as an expandable text tree for narrow panels and screen-reader users, with the status on every row.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Relationship map, outline</h1><p class="ps-note">The same dependencies as an expandable text tree for narrow panels and screen readers.</p></header><section class="ps-instrument ps-map-outline-panel" aria-labelledby="outline-title"><header class="ps-instrument-header"><div><h2 id="outline-title">Service dependencies</h2><p>From Public API · 2 hops</p></div></header><div class="ps-instrument-body">
<ul class="ps-map-outline" aria-label="Dependencies of Public API">
<li><p class="ps-map-outline-row ps-map-outline-root"><strong>Public API</strong><span>Service</span><span class="ps-badge ps-map-status">Degraded</span></p>
<ul>
<li><details open><summary class="ps-map-outline-row"><strong>Identity</strong><span>Service</span><span class="ps-badge">Healthy</span></summary><ul><li><p class="ps-map-outline-row"><strong>Key store</strong><span>Database</span><span class="ps-badge">Healthy</span></p></li></ul></details></li>
<li><details open><summary class="ps-map-outline-row"><strong>Billing</strong><span>Service</span><span class="ps-badge ps-map-status">Degraded</span></summary><ul><li><p class="ps-map-outline-row"><strong>Ledger</strong><span>Database</span><span class="ps-badge ps-map-status">At risk</span></p></li><li><p class="ps-map-outline-row"><strong>Mail worker</strong><span>Worker</span><span class="ps-badge">Healthy</span></p></li></ul></details></li>
<li><details><summary class="ps-map-outline-row"><strong>Search</strong><span>Service</span><span class="ps-badge">Healthy</span></summary><ul><li><p class="ps-map-outline-row"><strong>Search index</strong><span>Database</span><span class="ps-badge">Healthy</span></p></li></ul></details></li>
<li><details open><summary class="ps-map-outline-row"><strong>Event bus</strong><span>Queue</span><span class="ps-badge ps-map-status">At risk</span></summary><ul><li><p class="ps-map-outline-row"><strong>Webhooks</strong><span>Worker</span><span class="ps-badge ps-map-status">At risk</span></p></li><li><p class="ps-map-outline-row"><strong>Archive</strong><span>Database</span><span class="ps-badge">Healthy</span></p></li></ul></details></li>
</ul></li></ul></div>
<footer class="ps-instrument-footer"><span>Visible services <strong>11</strong></span><span>Degraded or at risk <strong>5</strong></span><span>Sample topology</span></footer></section></main>
```

## Variant: No dependencies yet

A newly registered service shown on its own, with an explanation of when its dependencies will appear.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Data</p><h1 class="ps-heading">Relationship map, no dependencies yet</h1><p class="ps-note">Show a newly registered service before any traced request has revealed its dependencies.</p></header><section class="ps-instrument" aria-labelledby="new-title"><header class="ps-instrument-header"><div><h2 id="new-title">Service dependencies</h2><p>From Report builder · sample environment</p></div></header><div class="ps-instrument-body"><svg class="ps-map-plot ps-map-plot-single" viewBox="0 0 500 220" aria-hidden="true"><circle class="ps-map-orbit" cx="250" cy="110" r="80" fill="none"/><g class="ps-map-node" data-selected="true"><circle cx="250" cy="110" r="27"/><text x="250" y="114" text-anchor="middle">Rb</text></g></svg>
<div class="ps-data-empty" role="status"><p class="ps-data-empty-title">No dependencies observed</p><p>Report builder was registered with tracing at <time class="ps-impact-time" datetime="2026-10-28T14:20Z">2:20 PM UTC</time> and has not made an outbound call yet. Services it calls, and services that call it, appear here after the first traced request.</p></div></div>
<footer class="ps-instrument-footer"><span>Visible services <strong>1</strong></span><span>Degraded or at risk <strong>0</strong></span><span>Sample topology</span></footer></section></main>
```
