# Schedule controls (schedule-controls)

Kind: component. Set weekdays, channel limits, and operating hours with explicit validation.

Task: Set weekdays, channel limits, and operating hours with explicit validation.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: workflow.

Native behavior: schedule-controls. It needs pagesystem.js (see ../implementation.md).

## content

- Labeled synthetic records and task-specific controls.

## states

- enabled
- paused
- invalid
- unsaved
- saved

## responsive

- Wrap controls and preserve reading order at narrow widths.
- Keep essential labels and keyboard targets at enlarged text sizes.

## checks

- An enabled schedule needs at least one day.
- LinkedIn and combined channels are capped at 40; email at 100.
- The end must follow the start on the same day.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Schedule controls</h1><p class="ps-note">Define days, limits, and a valid operating window before saving.</p></header><section class="ps-instrument" data-ps-schedule-controls aria-label="Sample schedule editor"><header class="ps-instrument-header"><div><h2>Autopilot schedule</h2><p data-schedule-summary>Weekdays · UTC</p></div><span class="ps-note" data-schedule-dirty></span></header><form class="ps-instrument-body" novalidate><label class="ps-check-row">Enable schedule<input name="enabled" type="checkbox" checked></label><div class="ps-field-pair"><label class="ps-compact-field">Channel<select class="ps-input" name="channel"><option value="email">Email</option><option value="linkedin">LinkedIn</option><option value="both" selected>Both</option></select></label><label class="ps-compact-field">Daily limit<input class="ps-input" name="limit" type="number" value="25" min="1" max="40" step="1" required aria-describedby="schedule-cap"><span id="schedule-cap" data-schedule-cap></span></label></div>
<fieldset class="ps-weekday-options"><legend>Operating days</legend><label><input name="day" type="checkbox" value="0" checked>Mon</label><label><input name="day" type="checkbox" value="1" checked>Tue</label><label><input name="day" type="checkbox" value="2" checked>Wed</label><label><input name="day" type="checkbox" value="3" checked>Thu</label><label><input name="day" type="checkbox" value="4" checked>Fri</label><label><input name="day" type="checkbox" value="5">Sat</label><label><input name="day" type="checkbox" value="6">Sun</label></fieldset>
<div class="ps-field-pair"><label class="ps-compact-field">Start time · UTC<input class="ps-input" type="time" name="start" value="09:00" required></label><label class="ps-compact-field">End time · UTC<input class="ps-input" type="time" name="end" value="17:00" required></label></div><p class="ps-note">The operating window starts and ends on the same day.</p><label class="ps-check-row">Pause when someone replies<input name="pause" type="checkbox" checked></label><p class="ps-workflow-status" data-schedule-status role="status"></p><div class="ps-workflow-actions"><button type="button" class="ps-button" data-schedule-discard>Discard changes</button><button type="submit" class="ps-button ps-button-primary">Save schedule</button></div></form><footer class="ps-instrument-footer"><span>Sample settings</span><span>No activity scheduled</span></footer></section></main>
```

## Variant: Paused

A saved schedule switched off, keeping its days, hours and email limit for when it is enabled again.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Paused schedule</h1><p class="ps-note">A saved schedule that is switched off. Its days and hours are kept for when it is enabled again.</p></header><section class="ps-instrument" data-ps-schedule-controls aria-label="Sample paused schedule"><header class="ps-instrument-header"><div><h2>Renewal reminders</h2><p data-schedule-summary>Schedule paused</p></div><span class="ps-note" data-schedule-dirty></span></header><form class="ps-instrument-body" novalidate><label class="ps-check-row">Enable schedule<input name="enabled" type="checkbox"></label><p class="ps-note">Paused by Dana Okafor on October 21. Nothing is sent while the schedule is off.</p><div class="ps-field-pair"><label class="ps-compact-field">Channel<select class="ps-input" name="channel"><option value="email" selected>Email</option><option value="linkedin">LinkedIn</option><option value="both">Both</option></select></label><label class="ps-compact-field">Daily limit<input class="ps-input" name="limit" type="number" value="60" min="1" max="100" step="1" required aria-describedby="paused-cap"><span id="paused-cap" data-schedule-cap></span></label></div>
<fieldset class="ps-weekday-options"><legend>Operating days</legend><label><input name="day" type="checkbox" value="0">Mon</label><label><input name="day" type="checkbox" value="1" checked>Tue</label><label><input name="day" type="checkbox" value="2">Wed</label><label><input name="day" type="checkbox" value="3" checked>Thu</label><label><input name="day" type="checkbox" value="4">Fri</label><label><input name="day" type="checkbox" value="5">Sat</label><label><input name="day" type="checkbox" value="6">Sun</label></fieldset>
<div class="ps-field-pair"><label class="ps-compact-field">Start time · UTC<input class="ps-input" type="time" name="start" value="14:00" required></label><label class="ps-compact-field">End time · UTC<input class="ps-input" type="time" name="end" value="16:30" required></label></div><label class="ps-check-row">Pause when someone replies<input name="pause" type="checkbox" checked></label><p class="ps-workflow-status" data-schedule-status role="status"></p><div class="ps-workflow-actions"><button type="button" class="ps-button" data-schedule-discard>Discard changes</button><button type="submit" class="ps-button ps-button-primary">Save schedule</button></div></form><footer class="ps-instrument-footer"><span>Sample settings</span><span>Paused · no activity scheduled</span></footer></section></main>
```

## Variant: Side panel

An email-only schedule in a narrow compact panel, with every field stacked and the 100‑per‑day cap shown.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Schedule in a side panel</h1><p class="ps-note">The same controls in a narrow settings panel, with fields stacked and an email-only limit.</p></header><section class="ps-instrument ps-schedule-narrow" data-ps-schedule-controls data-density="compact" aria-label="Sample email schedule"><header class="ps-instrument-header"><div><h2>Trial follow-up</h2><p data-schedule-summary>3 days per week · UTC</p></div><span class="ps-note" data-schedule-dirty></span></header><form class="ps-instrument-body" novalidate><label class="ps-check-row">Enable schedule<input name="enabled" type="checkbox" checked></label><div class="ps-field-pair"><label class="ps-compact-field">Channel<select class="ps-input" name="channel"><option value="email" selected>Email</option><option value="linkedin">LinkedIn</option><option value="both">Both</option></select></label><label class="ps-compact-field">Daily limit<input class="ps-input" name="limit" type="number" value="80" min="1" max="100" step="1" required aria-describedby="narrow-cap"><span id="narrow-cap" data-schedule-cap></span></label></div>
<fieldset class="ps-weekday-options"><legend>Operating days</legend><label><input name="day" type="checkbox" value="0">Mon</label><label><input name="day" type="checkbox" value="1" checked>Tue</label><label><input name="day" type="checkbox" value="2" checked>Wed</label><label><input name="day" type="checkbox" value="3" checked>Thu</label><label><input name="day" type="checkbox" value="4">Fri</label><label><input name="day" type="checkbox" value="5">Sat</label><label><input name="day" type="checkbox" value="6">Sun</label></fieldset>
<div class="ps-field-pair"><label class="ps-compact-field">Start time · UTC<input class="ps-input" type="time" name="start" value="07:30" required></label><label class="ps-compact-field">End time · UTC<input class="ps-input" type="time" name="end" value="11:00" required></label></div><label class="ps-check-row">Pause when someone replies<input name="pause" type="checkbox" checked></label><p class="ps-workflow-status" data-schedule-status role="status"></p><div class="ps-workflow-actions"><button type="button" class="ps-button" data-schedule-discard>Discard changes</button><button type="submit" class="ps-button ps-button-primary">Save schedule</button></div></form><footer class="ps-instrument-footer"><span>Sample settings</span><span>No activity scheduled</span></footer></section></main>
```

## Variant: Invalid

A failed save with an over-cap LinkedIn limit, no operating days and an end before the start, each named beside its field.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Schedule with errors</h1><p class="ps-note">A save attempt that failed validation. Each problem is named beside its field and summarized before the actions. Static state.</p></header><section class="ps-instrument ps-schedule-invalid" aria-label="Sample schedule with validation errors"><header class="ps-instrument-header"><div><h2>Partner outreach</h2><p>0 days per week · 18:00–09:00 · UTC</p></div><span class="ps-note">Unsaved changes</span></header><form class="ps-instrument-body" novalidate><label class="ps-check-row">Enable schedule<input name="enabled" type="checkbox" checked></label><div class="ps-field-pair"><label class="ps-compact-field">Channel<select class="ps-input" name="channel"><option value="email">Email</option><option value="linkedin" selected>LinkedIn</option><option value="both">Both</option></select></label><label class="ps-compact-field">Daily limit<input class="ps-input" name="limit" type="number" value="55" min="1" max="40" step="1" required aria-invalid="true" aria-describedby="invalid-limit-error"><span id="invalid-limit-error" class="ps-error">Choose a daily limit from 1 to 40. LinkedIn allows 40 per&nbsp;day.</span></label></div>
<fieldset class="ps-weekday-options" aria-describedby="invalid-days-error"><legend>Operating days</legend><label><input name="day" type="checkbox" value="0" aria-invalid="true">Mon</label><label><input name="day" type="checkbox" value="1" aria-invalid="true">Tue</label><label><input name="day" type="checkbox" value="2" aria-invalid="true">Wed</label><label><input name="day" type="checkbox" value="3" aria-invalid="true">Thu</label><label><input name="day" type="checkbox" value="4" aria-invalid="true">Fri</label><label><input name="day" type="checkbox" value="5" aria-invalid="true">Sat</label><label><input name="day" type="checkbox" value="6" aria-invalid="true">Sun</label><p id="invalid-days-error" class="ps-error">Choose at least one operating day.</p></fieldset>
<div class="ps-field-pair"><label class="ps-compact-field">Start time · UTC<input class="ps-input" type="time" name="start" value="18:00" required></label><label class="ps-compact-field">End time · UTC<input class="ps-input" type="time" name="end" value="09:00" required aria-invalid="true" aria-describedby="invalid-end-error"><span id="invalid-end-error" class="ps-error">End time must be later on the same day.</span></label></div><label class="ps-check-row">Pause when someone replies<input name="pause" type="checkbox" checked></label><div class="ps-schedule-summary" role="alert"><p>Three settings need attention before this schedule can be saved.</p></div><div class="ps-workflow-actions"><button type="button" class="ps-button">Discard changes</button><button type="submit" class="ps-button ps-button-primary">Save schedule</button></div></form><footer class="ps-instrument-footer"><span>Sample settings</span><span>Not saved · no activity scheduled</span></footer></section></main>
```
