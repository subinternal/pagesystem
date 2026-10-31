# Capacity planner (capacity-planner)

Kind: component. Allocate hours across projects while preserving each person’s available capacity.

Task: Allocate hours across projects while preserving each person’s available capacity.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: workflow.

Native behavior: capacity-planner. It needs pagesystem.js (see ../implementation.md).

## content

- Four people with distinct weekly capacities.
- Three projects and a canonical hours matrix.
- Allocated, available and over-capacity figures
- One shared hour scale with each person's capacity marked

## states

- within capacity
- overbooked
- invalid hours
- unsaved
- saved
- discarded

## responsive

- Stack panels and editors on narrow screens.
- Keep essential text at body size and control targets readable under text enlargement.

## checks

- Project and person totals conserve allocated hours.
- Overbooked people are named and saving is blocked.
- Changing the selected person preserves their draft; discard restores saved allocations.
- Hours past capacity read in danger with the overrun in text.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Capacity planner</h1><p class="ps-note">Allocate a team's week, inspect the available hours, and resolve overbooking.</p></header>
<section class="ps-instrument" data-ps-capacity-planner aria-label="Sample team capacity"><header class="ps-instrument-header"><div><h2>The week ahead</h2><p>Sample team · November 2–8</p></div><span class="ps-note" data-capacity-dirty></span></header><form class="ps-instrument-body"><dl class="ps-metrics"><div><dt>Allocated this week</dt><dd><span data-capacity-total></span></dd></div><div><dt>Available</dt><dd data-capacity-available></dd></div><div><dt>Over capacity</dt><dd data-capacity-over></dd></div></dl><div class="ps-product-legend"><span><i data-project="0"></i>Website</span><span><i data-project="1"></i>Design system</span><span><i data-project="2"></i>Research</span></div><div class="ps-capacity-people" data-capacity-people></div><p class="ps-data-readout" data-capacity-warning></p>
<label class="ps-compact-field">Edit allocation for<select class="ps-input" data-capacity-person></select></label><div class="ps-product-fields" data-capacity-fields></div><p class="ps-workflow-status" data-capacity-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-capacity-discard>Discard changes</button><button class="ps-button ps-button-primary" type="submit" data-capacity-save>Save allocation</button></div></form><footer class="ps-instrument-footer"><span>Individual availability is respected</span><span>Local planning sample</span></footer></section></main>
```

## Variant: Overbooked

One person is allocated past their weekly capacity; the planner names them and blocks saving.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Capacity planner, overbooked</h1><p class="ps-note">One person is allocated past their weekly capacity; the planner names them and blocks saving until it is resolved.</p></header>
<section class="ps-instrument" aria-label="Sample team capacity with overbooking">
<header class="ps-instrument-header"><div><h2>The week ahead</h2><p>Sample team · November 2–8</p></div><span class="ps-note">Unsaved changes</span></header>
<div class="ps-instrument-body">
<dl class="ps-metrics"><div><dt>Allocated this week</dt><dd>132 / 136 h</dd></div><div><dt>Available</dt><dd>10 h</dd></div><div><dt>Over capacity</dt><dd data-warning="true">1 person</dd></div></dl>
<div class="ps-product-legend"><span><i data-project="0"></i>Website</span><span><i data-project="1"></i>Design system</span><span><i data-project="2"></i>Research</span></div>
<div class="ps-capacity-people" data-focus="0">
<div class="ps-capacity-person" data-over="true" data-selected><div class="ps-chart-caption"><strong>Maya Okafor</strong><span>38 / 32 h · 6 h over</span></div><div class="ps-capacity-track" aria-hidden="true"><b style="width:80%"></b><span data-project="0" style="left:0%;width:55%"></span><span data-project="1" style="left:55%;width:25%"></span><span data-project="2" style="left:80%;width:0%"></span><span data-over style="left:80%;width:15%"></span><i style="left:80%"></i></div><p class="ps-note">Design · 6 h over capacity</p></div>
<div class="ps-capacity-person" data-over="false"><div class="ps-chart-caption"><strong>Lena Hoffmann</strong><span>38 / 40 h</span></div><div class="ps-capacity-track" aria-hidden="true"><b style="width:100%"></b><span data-project="0" style="left:0%;width:40%"></span><span data-project="1" style="left:40%;width:45%"></span><span data-project="2" style="left:85%;width:10%"></span><span data-over style="left:100%;width:0%"></span><i style="left:100%"></i></div><p class="ps-note">Design · 2 h available</p></div>
<div class="ps-capacity-person" data-over="false"><div class="ps-chart-caption"><strong>Sam Chen</strong><span>36 / 40 h</span></div><div class="ps-capacity-track" aria-hidden="true"><b style="width:100%"></b><span data-project="0" style="left:0%;width:55%"></span><span data-project="1" style="left:55%;width:35%"></span><span data-project="2" style="left:90%;width:0%"></span><span data-over style="left:100%;width:0%"></span><i style="left:100%"></i></div><p class="ps-note">Engineering · 4 h available</p></div>
<div class="ps-capacity-person" data-over="false"><div class="ps-chart-caption"><strong>Theo Martin</strong><span>20 / 24 h</span></div><div class="ps-capacity-track" aria-hidden="true"><b style="width:60%"></b><span data-project="0" style="left:0%;width:10%"></span><span data-project="1" style="left:10%;width:0%"></span><span data-project="2" style="left:10%;width:40%"></span><span data-over style="left:60%;width:0%"></span><i style="left:60%"></i></div><p class="ps-note">Research · 4 h available</p></div>
<div class="ps-capacity-scale" aria-hidden="true"><span style="left:0%" data-edge="start">0</span><span style="left:25%" data-minor>10</span><span style="left:50%">20</span><span style="left:75%" data-minor>30</span><span style="left:100%" data-edge="end">40 h</span></div>
</div>
<p class="ps-data-readout" data-warning="true">Maya Okafor is 6 h over capacity. Move hours to Lena Hoffmann or Sam Chen, or reduce the Website allocation.</p>
<label class="ps-compact-field">Edit allocation for<select class="ps-input"><option selected>Maya Okafor</option><option>Lena Hoffmann</option><option>Sam Chen</option><option>Theo Martin</option></select></label>
<div class="ps-product-fields"><label class="ps-compact-field"><span>Website · hours</span><input class="ps-input" type="number" min="0" max="40" step="1" required value="22"></label><label class="ps-compact-field"><span>Design system · hours</span><input class="ps-input" type="number" min="0" max="40" step="1" required value="12"></label><label class="ps-compact-field"><span>Research · hours</span><input class="ps-input" type="number" min="0" max="40" step="1" required value="4"></label></div>
<p class="ps-workflow-status" role="status">Resolve overbooked people before saving.</p>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Discard changes</button><button class="ps-button ps-button-primary" type="button" disabled>Save allocation</button></div>
</div>
<footer class="ps-instrument-footer"><span>Individual availability is respected</span><span>Local planning sample</span></footer>
</section>
</main>
```

## Variant: Hours matrix

Every person and project in one editable grid whose row and column totals add up to the same week.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Capacity planner, hours matrix</h1><p class="ps-note">Every person and project in one editable grid, with row and column totals that always add up to the same week.</p></header>
<section class="ps-instrument ps-capacity-matrix" data-density="compact" aria-label="Sample team capacity matrix">
<header class="ps-instrument-header"><div><h2>The week ahead</h2><p>Sample team · November 2–8</p></div><span class="ps-note">Saved locally</span></header>
<div class="ps-instrument-body">
<dl class="ps-metrics"><div><dt>Allocated this week</dt><dd>126 / 136 h</dd></div><div><dt>Available</dt><dd>10 h</dd></div><div><dt>Over capacity</dt><dd data-warning="false">0 people</dd></div></dl>
<div class="ps-capacity-table-region">
<table class="ps-capacity-table">
<caption class="ps-visually-hidden">Weekly hours by person and project</caption>
<thead><tr><th scope="col">Person</th><th scope="col">Website</th><th scope="col">Design system</th><th scope="col">Research</th><th scope="col" class="ps-capacity-num">Assigned</th><th scope="col" class="ps-capacity-num">Available</th></tr></thead>
<tbody>
<tr><th scope="row"><strong>Maya Okafor</strong><small>Design</small></th><td data-label="Website"><input class="ps-input" type="number" min="0" max="40" step="1" required value="18" aria-label="Maya Okafor, Website hours"></td><td data-label="Design system"><input class="ps-input" type="number" min="0" max="40" step="1" required value="10" aria-label="Maya Okafor, Design system hours"></td><td data-label="Research"><input class="ps-input" type="number" min="0" max="40" step="1" required value="4" aria-label="Maya Okafor, Research hours"></td><td data-label="Assigned" class="ps-capacity-num">32 / 32 h</td><td data-label="Available" class="ps-capacity-num">0 h</td></tr>
<tr><th scope="row"><strong>Lena Hoffmann</strong><small>Design</small></th><td data-label="Website"><input class="ps-input" type="number" min="0" max="40" step="1" required value="16" aria-label="Lena Hoffmann, Website hours"></td><td data-label="Design system"><input class="ps-input" type="number" min="0" max="40" step="1" required value="18" aria-label="Lena Hoffmann, Design system hours"></td><td data-label="Research"><input class="ps-input" type="number" min="0" max="40" step="1" required value="4" aria-label="Lena Hoffmann, Research hours"></td><td data-label="Assigned" class="ps-capacity-num">38 / 40 h</td><td data-label="Available" class="ps-capacity-num">2 h</td></tr>
<tr><th scope="row"><strong>Sam Chen</strong><small>Engineering</small></th><td data-label="Website"><input class="ps-input" type="number" min="0" max="40" step="1" required value="22" aria-label="Sam Chen, Website hours"></td><td data-label="Design system"><input class="ps-input" type="number" min="0" max="40" step="1" required value="14" aria-label="Sam Chen, Design system hours"></td><td data-label="Research"><input class="ps-input" type="number" min="0" max="40" step="1" required value="0" aria-label="Sam Chen, Research hours"></td><td data-label="Assigned" class="ps-capacity-num">36 / 40 h</td><td data-label="Available" class="ps-capacity-num">4 h</td></tr>
<tr><th scope="row"><strong>Theo Martin</strong><small>Research</small></th><td data-label="Website"><input class="ps-input" type="number" min="0" max="40" step="1" required value="4" aria-label="Theo Martin, Website hours"></td><td data-label="Design system"><input class="ps-input" type="number" min="0" max="40" step="1" required value="0" aria-label="Theo Martin, Design system hours"></td><td data-label="Research"><input class="ps-input" type="number" min="0" max="40" step="1" required value="16" aria-label="Theo Martin, Research hours"></td><td data-label="Assigned" class="ps-capacity-num">20 / 24 h</td><td data-label="Available" class="ps-capacity-num">4 h</td></tr>
</tbody>
<tfoot><tr><th scope="row">Project total</th><td data-label="Website">60 h</td><td data-label="Design system">42 h</td><td data-label="Research">24 h</td><td data-label="Assigned" class="ps-capacity-num">126 / 136 h</td><td data-label="Available" class="ps-capacity-num">10 h</td></tr></tfoot>
</table>
</div>
<p class="ps-note">Project totals and person totals are both drawn from these twelve cells, so they always agree.</p>
<p class="ps-workflow-status" role="status"></p>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Discard changes</button><button class="ps-button ps-button-primary" type="button">Save allocation</button></div>
</div>
<footer class="ps-instrument-footer"><span>Individual availability is respected</span><span>Local planning sample</span></footer>
</section>
</main>
```

## Variant: Unplanned week

A new week with nothing allocated yet, showing everyone's full availability and an option to copy last week.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Capacity planner, unplanned week</h1><p class="ps-note">A new week before anything is allocated, showing each person's full availability and a quick way to start from last week.</p></header>
<section class="ps-instrument" aria-label="Sample team capacity with no allocation">
<header class="ps-instrument-header"><div><h2>The week ahead</h2><p>Sample team · November 9–15</p></div><span class="ps-note">Not planned yet</span></header>
<div class="ps-instrument-body">
<dl class="ps-metrics"><div><dt>Allocated this week</dt><dd>0 / 136 h</dd></div><div><dt>Available</dt><dd>136 h</dd></div><div><dt>Over capacity</dt><dd data-warning="false">0 people</dd></div></dl>
<div class="ps-capacity-start"><div><p><strong>Start from last week</strong></p><p class="ps-note">November 2–8 allocated 126 h across Website, Design system and Research. Copying keeps each person within their capacity.</p></div><button class="ps-button" type="button">Copy 126 h from last week</button></div>
<div class="ps-capacity-people">
<div class="ps-capacity-person" data-over="false"><div class="ps-chart-caption"><strong>Maya Okafor</strong><span>0 / 32 h</span></div><div class="ps-capacity-track" aria-hidden="true"><b style="width:80%"></b><i style="left:80%"></i></div><p class="ps-note">Design · 32 h available</p></div>
<div class="ps-capacity-person" data-over="false"><div class="ps-chart-caption"><strong>Lena Hoffmann</strong><span>0 / 40 h</span></div><div class="ps-capacity-track" aria-hidden="true"><b style="width:100%"></b><i style="left:100%"></i></div><p class="ps-note">Design · 40 h available</p></div>
<div class="ps-capacity-person" data-over="false"><div class="ps-chart-caption"><strong>Sam Chen</strong><span>0 / 40 h</span></div><div class="ps-capacity-track" aria-hidden="true"><b style="width:100%"></b><i style="left:100%"></i></div><p class="ps-note">Engineering · 40 h available</p></div>
<div class="ps-capacity-person" data-over="false"><div class="ps-chart-caption"><strong>Theo Martin</strong><span>0 / 24 h</span></div><div class="ps-capacity-track" aria-hidden="true"><b style="width:60%"></b><i style="left:60%"></i></div><p class="ps-note">Research · 24 h available</p></div>
<div class="ps-capacity-scale" aria-hidden="true"><span style="left:0%" data-edge="start">0</span><span style="left:25%" data-minor>10</span><span style="left:50%">20</span><span style="left:75%" data-minor>30</span><span style="left:100%" data-edge="end">40 h</span></div>
</div>
<label class="ps-compact-field">Edit allocation for<select class="ps-input"><option selected>Maya Okafor</option><option>Lena Hoffmann</option><option>Sam Chen</option><option>Theo Martin</option></select></label>
<div class="ps-product-fields"><label class="ps-compact-field"><span>Website · hours</span><input class="ps-input" type="number" min="0" max="40" step="1" required value="0"></label><label class="ps-compact-field"><span>Design system · hours</span><input class="ps-input" type="number" min="0" max="40" step="1" required value="0"></label><label class="ps-compact-field"><span>Research · hours</span><input class="ps-input" type="number" min="0" max="40" step="1" required value="0"></label></div>
<div class="ps-workflow-actions"><button class="ps-button" type="button" disabled>Discard changes</button><button class="ps-button ps-button-primary" type="button">Save allocation</button></div>
</div>
<footer class="ps-instrument-footer"><span>Individual availability is respected</span><span>Local planning sample</span></footer>
</section>
</main>
```
