---
name: verify
description: Review a rendered page or template against its task, page contract, accessibility, responsive behavior and state handling. Use for an evidence-based page-system audit; do not edit unless fixes are requested.
---
# Review a page system

Establish the page's task and existing design contract before judging the surface.
Read its source and inspect representative rendered states. Review desktop, phone,
keyboard, long content, no data and failure where applicable. If no browser is
available, report that limit; do not call source inspection a rendered pass.

For an entire site, use Pagesystem's local browser runner when this repository is
available: `npm run audit:site -- <site-url> --max 25`. Supply a URL inventory for
unlinked pages and authored journeys for menus, dialogs, filters or forms. The
runner writes `audit.json`, a self-contained `report.html`, and a proposed
`plan.json`. Read coverage and failed checks before interpreting findings. Confirm
candidate template groups against shared source; never infer that similar markup
proves a shared implementation. Resolve the plan's contract IDs against the catalog
revision it names. Use existing browser tooling when the runner is unavailable;
do not claim to have run it or fetched a remote plan.

Review in this order:
- Purpose and content: the opening answers the task, evidence is traceable, and the
  next action is understandable. Label sample data and unimplemented features.
- Structure: one main, one page title, ordered headings, real destinations, useful
  internal relationships and a reading order that survives small screens.
- Shared rules: tokens, section rhythm, widths, repeated controls, grouping by
  proximity and justified containers. Measure drift from the host's own scale.
- Behavior: native controls, visible focus, labels and errors, recoverable actions,
  duplicate-submission handling, reduced motion, and state expressed in words.
- Access: computed text contrast, zoom, local table overflow and source-visible
  content. State what was measured and what was only observed.

Stage all findings in one review pass. For each, record severity, the exact quoted
text or accessible name that anchors it, observed behavior, impact, and a concrete
fix. A screenshot is supporting evidence, not an unanchored replacement. If the
quoted text changes, leave the thread open until explicitly resolved. Do not mark
the user's approval or convert an uncertain judgment into a pass.

Deliver prioritized findings with evidence and the untested states. When fixes are
requested, verify each affected shared component and one sibling page after editing.

Read [the foundations](references/foundations.md) before making or reviewing visual
decisions. Typography, line length, density, page gutters, panel padding and sibling
spacing are required parts of the contract. Map roles to the host's tokens; do not
make up values per component. Do not add decorative section numbers such as
`03 / PRINCIPLES`; number only real steps, records, quantities or references.

Read [the catalog](references/catalog.md), a one-line index of every page system,
component and element, then open only the entry files you need: each holds one
entry's contract, HTML and variants. Read [the implementation guide](references/implementation.md)
before shipping components: it explains the shared stylesheet and behaviors, which
are copied into the project, never read whole. All are generated from the Pagesystem library.
Preserve the host product's visual identity; the house palette is an example,
not a requirement. Do not claim access to a Pagesystem MCP server: it is not built.

Measure the rendered page with [measure.js](references/measure.js), as [the measure guide](references/measure.md)
explains: at 375 and 1440 wide, in each theme, and with text spacing increased. Fix every failure; fix or justify
each warning. Report the counts before and after alongside the checks a script cannot make.
