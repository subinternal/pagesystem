# Release planner (release-planner)

Kind: component. Adjust sequential phase durations and compare the derived completion time with a target.

Task: Adjust sequential phase durations and compare the derived completion time with a target.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: workflow.

Native behavior: release-planner. It needs pagesystem.js (see ../implementation.md).

## content

- Four ordered phases and owners.
- Duration bounds and a fourteen-day target.
- The release window with a buffer or overrun pill against the target
- A dashed target line tagged with its day

## states

- within target
- at target
- past target
- invalid duration
- saved
- discarded

## responsive

- Stack panels and editors on narrow screens.
- Keep essential text at body size and control targets readable under text enlargement.

## checks

- Phase boundaries and total derive from the same durations.
- Calendar days include weekends; this is not a working-day scheduler.
- Invalid input hides the chart rather than presenting stale dates.
- Phases are choosable bars; the chosen phase is in color with a pinned tip, the rest step back.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Release planner</h1><p class="ps-note">Adjust phase durations and see their effect on the release window.</p></header>
<section class="ps-instrument" data-ps-release-planner aria-label="Sample release planner"><header class="ps-instrument-header"><div><h2>Overview redesign</h2><p>Sequential phases · calendar days</p></div><span class="ps-note" data-release-dirty></span></header><form class="ps-instrument-body"><div class="ps-product-figure"><span>Release window</span><div><strong data-release-total></strong><span class="ps-delta" data-release-slack></span><small>against the day 14 target</small></div></div>
<div class="ps-release-chart" data-release-chart role="group" aria-label="Derived release sequence. Choose a phase to inspect it."></div><p class="ps-note">Each phase starts when the previous one ends. The dashed line is the target, including weekends.</p>
<div class="ps-field-pair" data-release-fields></div><p class="ps-workflow-status" data-release-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-release-discard>Discard changes</button><button class="ps-button ps-button-primary" type="submit">Save plan</button></div></form><footer class="ps-instrument-footer"><span>One to seven days per phase</span><span>Local planning sample</span></footer></section></main>
```

## Variant: Past target

A plan whose phases run two calendar days past the day-14 target, with the late phase marked on the sequence.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Release planner, past target</h1><p class="ps-note">A plan whose phases add up to more calendar days than the target allows, with the overrun shown on the sequence.</p></header>
<section class="ps-instrument ps-release-past" aria-label="Sample release planner past its target">
<header class="ps-instrument-header"><div><h2>Overview redesign</h2><p>Sequential phases · calendar days</p></div><span class="ps-note">Unsaved changes</span></header>
<div class="ps-instrument-body">
<div class="ps-product-figure"><span>Release window</span><div><strong>16 days</strong><span class="ps-delta" data-effect="bad" data-warning="true"><i class="ps-i ps-i-up" aria-hidden="true"></i>2 days past target</span><small>against the day 14 target</small></div></div>
<div class="ps-release-chart" data-focus="rollout" role="group" aria-label="Derived release sequence. Choose a phase to inspect it.">
<div class="ps-release-head" aria-hidden="true"><span></span><div><span class="ps-release-tag" style="left:66.667%">Target · day 14</span></div></div>
<button class="ps-release-row" type="button" data-phase="design" data-past="false" aria-pressed="false" tabindex="-1"><span><strong>Design sign-off</strong><small>Day 1–3 · Design</small></span><span class="ps-release-track" aria-hidden="true"><i class="ps-release-grid" style="left:0%" data-zero></i><i class="ps-release-grid" style="left:33.333%"></i><i class="ps-release-grid" style="left:66.667%"></i><i class="ps-release-grid" style="left:100%"></i><span class="ps-release-bar" data-phase="design" style="left:0%;width:14.286%">3</span><i class="ps-release-deadline" style="left:66.667%"></i></span></button>
<button class="ps-release-row" type="button" data-phase="build" data-past="false" aria-pressed="false" tabindex="-1"><span><strong>Implementation</strong><small>Day 4–10 · Engineering</small></span><span class="ps-release-track" aria-hidden="true"><i class="ps-release-grid" style="left:0%" data-zero></i><i class="ps-release-grid" style="left:33.333%"></i><i class="ps-release-grid" style="left:66.667%"></i><i class="ps-release-grid" style="left:100%"></i><span class="ps-release-bar" data-phase="build" style="left:14.286%;width:33.333%">7</span><i class="ps-release-deadline" style="left:66.667%"></i></span></button>
<button class="ps-release-row" type="button" data-phase="review" data-past="false" aria-pressed="false" tabindex="-1"><span><strong>Quality review</strong><small>Day 11–14 · Product</small></span><span class="ps-release-track" aria-hidden="true"><i class="ps-release-grid" style="left:0%" data-zero></i><i class="ps-release-grid" style="left:33.333%"></i><i class="ps-release-grid" style="left:66.667%"></i><i class="ps-release-grid" style="left:100%"></i><span class="ps-release-bar" data-phase="review" style="left:47.619%;width:19.048%">4</span><i class="ps-release-deadline" style="left:66.667%"></i></span></button>
<button class="ps-release-row" type="button" data-phase="rollout" data-past="true" aria-pressed="true"><span><strong>Staged rollout</strong><small>Day 15–16 · Engineering · past target</small></span><span class="ps-release-track" aria-hidden="true"><i class="ps-release-grid" style="left:0%" data-zero></i><i class="ps-release-grid" style="left:33.333%"></i><i class="ps-release-grid" style="left:66.667%"></i><i class="ps-release-grid" style="left:100%"></i><span class="ps-release-bar" data-phase="rollout" style="left:66.667%;width:9.524%">2</span><i class="ps-release-deadline" style="left:66.667%"></i></span></button>
<div class="ps-release-axis" aria-hidden="true"><span></span><div><span style="left:0%">Day 0</span><span style="left:33.333%">7</span><span style="left:66.667%">14</span><span style="left:100%" data-edge="end">21</span></div></div>
</div>
<p class="ps-product-warning">Rollout ends on day 16. Shorten a phase by two days in total, or agree a later target with Product.</p>
<div class="ps-field-pair">
<label class="ps-compact-field"><span>Design sign-off</span><input class="ps-input" type="number" min="1" max="7" step="1" required value="3"><small>Calendar days</small></label>
<label class="ps-compact-field"><span>Implementation</span><input class="ps-input" type="number" min="1" max="7" step="1" required value="7"><small>Calendar days</small></label>
<label class="ps-compact-field"><span>Quality review</span><input class="ps-input" type="number" min="1" max="7" step="1" required value="4"><small>Calendar days</small></label>
<label class="ps-compact-field"><span>Staged rollout</span><input class="ps-input" type="number" min="1" max="7" step="1" required value="2"><small>Calendar days</small></label>
</div>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Discard changes</button><button class="ps-button ps-button-primary" type="button">Save plan</button></div>
</div>
<footer class="ps-instrument-footer"><span>One to seven days per phase</span><span>Local planning sample</span></footer>
</section>
</main>
```

## Variant: Invalid duration

A phase duration outside 1–7 days hides the sequence instead of showing stale dates.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Release planner, invalid duration</h1><p class="ps-note">A duration outside the allowed range hides the sequence instead of showing dates that no longer hold.</p></header>
<section class="ps-instrument" aria-label="Sample release planner with an invalid duration">
<header class="ps-instrument-header"><div><h2>Overview redesign</h2><p>Sequential phases · calendar days</p></div><span class="ps-note">Unsaved changes</span></header>
<div class="ps-instrument-body">
<div class="ps-product-figure"><span>Release window</span><div><strong>—</strong><span class="ps-delta" data-effect="neutral">Check durations</span><small>against the day 14 target</small></div></div>
<div class="ps-release-withheld"><p><strong>Sequence hidden until every phase has 1 to 7 days</strong></p><p class="ps-note">Saved plan: 11 days, ending on day 11 with 3 days of buffer.</p></div>
<div class="ps-field-pair">
<label class="ps-compact-field"><span>Design sign-off</span><input class="ps-input" type="number" min="1" max="7" step="1" required value="2"><small>Calendar days</small></label>
<div class="ps-compact-field"><label for="release-invalid-build">Implementation</label><input class="ps-input" id="release-invalid-build" type="number" min="1" max="7" step="1" required value="9" aria-invalid="true" aria-describedby="release-invalid-build-error"><small class="ps-error" id="release-invalid-build-error">Use 1 to 7 days. Split longer work into another phase.</small></div>
<label class="ps-compact-field"><span>Quality review</span><input class="ps-input" type="number" min="1" max="7" step="1" required value="3"><small>Calendar days</small></label>
<label class="ps-compact-field"><span>Staged rollout</span><input class="ps-input" type="number" min="1" max="7" step="1" required value="1"><small>Calendar days</small></label>
</div>
<p class="ps-workflow-status" role="status">Each phase needs 1–7 calendar days.</p>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Discard changes</button><button class="ps-button ps-button-primary" type="button">Save plan</button></div>
</div>
<footer class="ps-instrument-footer"><span>One to seven days per phase</span><span>Local planning sample</span></footer>
</section>
</main>
```

## Variant: Date table

The saved plan as real calendar dates, read-only, for people who follow the release but do not edit it.

```html
<main>
<header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Release planner, date table</h1><p class="ps-note">The saved plan read as calendar dates for people who follow the release but do not edit it.</p></header>
<section class="ps-instrument" aria-label="Sample saved release plan">
<header class="ps-instrument-header"><div><h2>Overview redesign</h2><p>Starts Monday, November 2 · calendar days</p></div><span class="ps-note">Saved by Sam Chen, October 27</span></header>
<div class="ps-instrument-body">
<dl class="ps-release-facts">
<div><dt>Release day</dt><dd>Thu, Nov 12</dd></div>
<div><dt>Target</dt><dd>Sun, Nov 15</dd></div>
<div><dt>Buffer</dt><dd>3 days</dd></div>
</dl>
<div class="ps-release-table-region">
<table class="ps-release-table">
<caption class="ps-visually-hidden">Release phases with calendar dates</caption>
<thead><tr><th scope="col">Phase</th><th scope="col">Owner</th><th scope="col">Dates</th><th scope="col" class="ps-release-num">Duration</th></tr></thead>
<tbody>
<tr><th scope="row"><span class="ps-release-key" data-phase="design" aria-hidden="true"></span>Design sign-off</th><td data-label="Owner">Design</td><td data-label="Dates"><time datetime="2026-11-02">Mon, Nov 2</time> to <time datetime="2026-11-03">Tue, Nov 3</time></td><td data-label="Days" class="ps-release-num">2 days</td></tr>
<tr><th scope="row"><span class="ps-release-key" data-phase="build" aria-hidden="true"></span>Implementation</th><td data-label="Owner">Engineering</td><td data-label="Dates"><time datetime="2026-11-04">Wed, Nov 4</time> to <time datetime="2026-11-08">Sun, Nov 8</time></td><td data-label="Days" class="ps-release-num">5 days</td></tr>
<tr><th scope="row"><span class="ps-release-key" data-phase="review" aria-hidden="true"></span>Quality review</th><td data-label="Owner">Product</td><td data-label="Dates"><time datetime="2026-11-09">Mon, Nov 9</time> to <time datetime="2026-11-11">Wed, Nov 11</time></td><td data-label="Days" class="ps-release-num">3 days</td></tr>
<tr><th scope="row"><span class="ps-release-key" data-phase="rollout" aria-hidden="true"></span>Staged rollout</th><td data-label="Owner">Engineering</td><td data-label="Dates"><time datetime="2026-11-12">Thu, Nov 12</time></td><td data-label="Days" class="ps-release-num">1 day</td></tr>
</tbody>
<tfoot><tr><th scope="row">Total</th><td data-label="Owner"></td><td data-label="Dates">Nov 2 to Nov 12</td><td data-label="Days" class="ps-release-num">11 days</td></tr></tfoot>
</table>
</div>
<p class="ps-note">Dates count weekends. Implementation runs through Saturday and Sunday, November 7 and 8.</p>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Copy dates</button><button class="ps-button ps-button-primary" type="button">Edit plan</button></div>
</div>
<footer class="ps-instrument-footer"><span>Read-only view</span><span>Local planning sample</span></footer>
</section>
</main>
```
