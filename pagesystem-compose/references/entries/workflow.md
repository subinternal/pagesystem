# Workflow (workflow)

Kind: system. A focused sequence with a recoverable next step.

Task: Complete a task without losing my progress.

Composition: opening ([page-header](page-header.md)) → fields ([form-field](form-field.md)) → feedback ([feedback](feedback.md)) → actions ([action-bar](action-bar.md)).

## content

- Task and completion condition
- Fields with labels and help
- Validation
- Completion and recovery route

## states

- editing: values retained
- invalid: errors attached to fields
- submitting: bounded pending state
- success: confirm actual outcome
- error: retry retains values

## responsive

- Fields use the available width.
- Action order matches DOM order and thumb reach.

## checks

- One page title and ordered headings.
- Keyboard order follows reading order.
- Source HTML contains the answer; no script is needed to read it.
- Text contrast and focus must be measured in both themes.

## HTML

```html
<main class="ps-page" id="main"><header class="ps-stack"><p class="ps-kicker">Project brief / sample workflow</p><h1 class="ps-title">Start with the work.</h1><p class="ps-lead">A short brief gives the next decision a useful starting point.</p></header><section class="ps-stack" aria-labelledby="brief"><h2 class="ps-heading" id="brief">Your project</h2><div class="ps-field"><label for="project-name">Project name</label><input class="ps-input" id="project-name" name="project-name" autocomplete="off" placeholder="Website refresh" aria-describedby="project-help"><p class="ps-note" id="project-help">Use a name your team will recognize.</p></div><div class="ps-field"><label for="project-purpose">What needs to change?</label><textarea class="ps-input" id="project-purpose" name="project-purpose" rows="4" aria-describedby="purpose-help"></textarea><p class="ps-note" id="purpose-help">Describe the audience and the task the page needs to support.</p></div></section><section class="ps-panel ps-stack" id="completion"><h2 class="ps-subheading">This is a form specimen.</h2><p>Fields are editable, but nothing is submitted or stored. Connect validation and a save action in your application.</p><div class="ps-row"><button class="ps-button ps-button-primary" type="button" disabled>Save brief · demo only</button><a href="#main">Back to the brief</a></div></section></main>
```
