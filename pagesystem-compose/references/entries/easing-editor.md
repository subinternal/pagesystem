# Easing editor (easing-editor)

Kind: component. Edit a cubic Bézier curve with native controls and an interruptible motion preview.

Task: Edit a cubic Bézier curve with native controls and an interruptible motion preview.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: input.

Native behavior: easing-editor. It needs pagesystem.js (see ../implementation.md).

## content

- Task-specific inputs, sample context and visible feedback.

## states

- preset
- custom
- previewing
- reduced motion

## responsive

- Stack related fields at narrow widths.
- Preserve text enlargement, keyboard access and visible labels.

## checks

- Control values stay within zero and one.
- Starting a new preview cancels the old animation.
- Reduced motion keeps the sample still while retaining exact curve values.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Easing editor</h1><p class="ps-note">Shape a transition with precise control points and a repeatable motion preview.</p></header><section class="ps-instrument" data-ps-easing-editor aria-label="Transition curve editor"><header class="ps-instrument-header"><div><h2>Transition curve</h2><p>Position over time · 240 ms</p></div><label class="ps-compact-field">Preset<select class="ps-input" data-ease-preset><option value="standard">Ease in out</option><option value="enter">Enter</option><option value="exit">Exit</option><option value="linear">Linear</option><option value="custom">Custom</option></select></label></header><div class="ps-instrument-body">
<svg class="ps-easing-plot" viewBox="0 0 400 280" role="img" aria-label="Cubic Bézier curve from starting position to ending position. Exact control values are below."><path class="ps-easing-grid" d="M40 40H360M40 90H360M40 140H360M40 190H360M40 240H360M40 40V240M120 40V240M200 40V240M280 40V240M360 40V240" fill="none"/><path class="ps-easing-handle" d="M40 240L360 40" fill="none"/><line class="ps-easing-handle" x1="40" y1="240" data-ease-first-line/><line class="ps-easing-handle" x1="360" y1="40" data-ease-second-line/><path class="ps-easing-curve" data-ease-curve/><circle r="6" class="ps-easing-control" data-ease-first/><circle r="6" class="ps-easing-control" data-ease-second/></svg>
<div class="ps-field-pair"><label class="ps-easing-input">First point · X<input data-ease-point type="range" min="0" max="1" step="0.01" value="0.42"><output>0.42</output></label><label class="ps-easing-input">First point · Y<input data-ease-point type="range" min="0" max="1" step="0.01" value="0"><output>0.00</output></label><label class="ps-easing-input">Second point · X<input data-ease-point type="range" min="0" max="1" step="0.01" value="0.58"><output>0.58</output></label><label class="ps-easing-input">Second point · Y<input data-ease-point type="range" min="0" max="1" step="0.01" value="1"><output>1.00</output></label></div>
<code class="ps-code-readout" data-ease-code></code><div class="ps-easing-track" data-ease-track aria-hidden="true"><i class="ps-easing-dot" data-ease-dot></i></div><div class="ps-workflow-actions"><span class="ps-note">Reduced motion respected</span><button class="ps-button ps-button-primary" type="button" data-ease-preview>Preview motion</button></div><p class="ps-workflow-status" data-ease-status role="status"></p></div></section></main>
```

## Variant: Inspector panel

A narrow side-panel editor that starts from the Enter preset, with its controls in one column.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Easing editor, inspector panel</h1><p class="ps-note">A narrow side-panel editor that starts from the Enter preset.</p></header>
<section class="ps-instrument ps-easing-inspector" data-ps-easing-editor data-density="compact" aria-label="Transition curve inspector"><header class="ps-instrument-header"><div><h2>Panel enters</h2><p>Opacity and position · 240 ms</p></div><label class="ps-compact-field">Preset<select class="ps-input" data-ease-preset><option value="standard">Ease in out</option><option value="enter" selected>Enter</option><option value="exit">Exit</option><option value="linear">Linear</option><option value="custom">Custom</option></select></label></header><div class="ps-instrument-body">
<svg class="ps-easing-plot" viewBox="0 0 400 280" role="img" aria-label="Cubic Bézier curve from starting position to ending position. Exact control values are below."><path class="ps-easing-grid" d="M40 40H360M40 140H360M40 240H360M40 40V240M200 40V240M360 40V240" fill="none"/><path class="ps-easing-handle" d="M40 240L360 40" fill="none"/><line class="ps-easing-handle" x1="40" y1="240" data-ease-first-line/><line class="ps-easing-handle" x1="360" y1="40" data-ease-second-line/><path class="ps-easing-curve" data-ease-curve/><circle r="7" class="ps-easing-control" data-ease-first/><circle r="7" class="ps-easing-control" data-ease-second/></svg>
<div class="ps-easing-inspector-fields"><label class="ps-easing-input">First point · X<input data-ease-point type="range" min="0" max="1" step="0.01" value="0.16"><output>0.16</output></label><label class="ps-easing-input">First point · Y<input data-ease-point type="range" min="0" max="1" step="0.01" value="1"><output>1.00</output></label><label class="ps-easing-input">Second point · X<input data-ease-point type="range" min="0" max="1" step="0.01" value="0.3"><output>0.30</output></label><label class="ps-easing-input">Second point · Y<input data-ease-point type="range" min="0" max="1" step="0.01" value="1"><output>1.00</output></label></div>
<code class="ps-code-readout" data-ease-code></code><div class="ps-easing-track" data-ease-track aria-hidden="true"><i class="ps-easing-dot" data-ease-dot></i></div><button class="ps-button" type="button" data-ease-preview>Preview motion</button><p class="ps-workflow-status" data-ease-status role="status"></p></div></section></main>
```

## Variant: Reduced motion

With reduced motion on, the preview stays still and the curve is shown as positions sampled at fixed times.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Easing editor, reduced motion</h1><p class="ps-note">With reduced motion on, the preview stays still and the curve is read as sampled positions instead.</p></header>
<section class="ps-instrument ps-easing-still" aria-label="Transition curve with reduced motion"><header class="ps-instrument-header"><div><h2>Transition curve</h2><p>Enter preset · 240 ms</p></div><span class="ps-badge">Reduced motion on</span></header><div class="ps-instrument-body">
<svg class="ps-easing-plot" viewBox="0 0 400 280" role="img" aria-labelledby="still-curve-label"><title id="still-curve-label">Enter curve: position rises steeply, then settles. Sampled positions are listed in the table below.</title><path class="ps-easing-grid" d="M40 40H360M40 90H360M40 140H360M40 190H360M40 240H360M40 40V240M120 40V240M200 40V240M280 40V240M360 40V240" fill="none"/><path class="ps-easing-handle" d="M40 240L360 40" fill="none"/><line class="ps-easing-handle" x1="40" y1="240" x2="91.2" y2="40"/><line class="ps-easing-handle" x1="360" y1="40" x2="136" y2="40"/><path class="ps-easing-curve" d="M 40 240 C 91.2 40, 136 40, 360 40"/><circle r="6" class="ps-easing-control" cx="91.2" cy="40"/><circle r="6" class="ps-easing-control" cx="136" cy="40"/><g class="ps-easing-samples"><circle r="4" cx="80" cy="124.6"/><circle r="4" cx="120" cy="74.8"/><circle r="4" cx="200" cy="45.6"/><circle r="4" cx="280" cy="40.4"/></g></svg>
<div class="ps-easing-sample-region" role="region" aria-labelledby="still-samples-title" tabindex="0"><table class="ps-easing-samples-table"><caption id="still-samples-title">Position at each moment</caption><thead><tr><th scope="col">30 ms</th><th scope="col">60 ms</th><th scope="col">120 ms</th><th scope="col">180 ms</th><th scope="col">240 ms</th></tr></thead><tbody><tr><td>57.7%</td><td>82.6%</td><td>97.2%</td><td>99.8%</td><td>100%</td></tr></tbody></table></div>
<code class="ps-code-readout">cubic-bezier(0.16, 1, 0.3, 1)</code>
<div class="ps-easing-track ps-easing-track-still" aria-hidden="true"><i class="ps-easing-dot"></i></div>
<div class="ps-workflow-actions"><span class="ps-note">Values stay exact</span><button class="ps-button ps-button-primary" type="button">Preview motion</button></div><p class="ps-workflow-status" role="status">Preview stays still because reduced motion is enabled. The curve and values remain available.</p></div></section></main>
```

## Variant: Preset list

Pick a named motion token by its curve thumbnail, value and duration, and open the full editor only for a custom curve.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Easing editor, preset list</h1><p class="ps-note">Choose a named motion token first; open the full curve editor only for a custom curve.</p></header>
<section class="ps-instrument ps-easing-presets" data-density="compact" aria-labelledby="ease-token-title"><header class="ps-instrument-header"><div><h2 id="ease-token-title">Motion token</h2><p>Dialog open · sample design system</p></div><span class="ps-note">4 tokens</span></header><div class="ps-instrument-body">
<fieldset class="ps-easing-choices"><legend class="ps-visually-hidden">Easing for dialog open</legend>
<label class="ps-easing-choice"><input type="radio" name="ease-token" value="standard"><svg viewBox="0 0 48 48" aria-hidden="true"><path class="ps-easing-mini-base" d="M6 42L42 6"/><path class="ps-easing-mini" d="M6 42C21.1 42 26.9 6 42 6"/></svg><span><strong>Standard</strong><small>Moves within the screen</small></span><code>cubic-bezier(0.42, 0, 0.58, 1)</code><span class="ps-easing-duration">240 ms</span></label>
<label class="ps-easing-choice"><input type="radio" name="ease-token" value="enter" checked><svg viewBox="0 0 48 48" aria-hidden="true"><path class="ps-easing-mini-base" d="M6 42L42 6"/><path class="ps-easing-mini" d="M6 42C11.8 6 16.8 6 42 6"/></svg><span><strong>Enter</strong><small>Dialogs, menus and toasts arriving</small></span><code>cubic-bezier(0.16, 1, 0.3, 1)</code><span class="ps-easing-duration">240 ms</span></label>
<label class="ps-easing-choice"><input type="radio" name="ease-token" value="exit"><svg viewBox="0 0 48 48" aria-hidden="true"><path class="ps-easing-mini-base" d="M6 42L42 6"/><path class="ps-easing-mini" d="M6 42C31.2 42 36.2 42 42 6"/></svg><span><strong>Exit</strong><small>Elements leaving the screen</small></span><code>cubic-bezier(0.7, 0, 0.84, 0)</code><span class="ps-easing-duration">160 ms</span></label>
<label class="ps-easing-choice"><input type="radio" name="ease-token" value="linear"><svg viewBox="0 0 48 48" aria-hidden="true"><path class="ps-easing-mini-base" d="M6 42L42 6"/><path class="ps-easing-mini" d="M6 42L42 6"/></svg><span><strong>Linear</strong><small>Progress and scrubbing only</small></span><code>cubic-bezier(0, 0, 1, 1)</code><span class="ps-easing-duration">Varies</span></label>
</fieldset>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Edit custom curve</button><button class="ps-button ps-button-primary" type="button">Apply token</button></div>
</div><footer class="ps-instrument-footer"><span>Tokens from the sample motion scale</span><span>Reduced motion skips the movement</span></footer></section></main>
```
