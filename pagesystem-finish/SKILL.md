---
name: pagesystem-finish
description: Refine an implemented page within its existing design system, improving hierarchy, spacing, copy, focus, responsive behavior and motion. Use for a finishing pass without replacing product identity or architecture.
---
# Finish the page

Find the page's task, host tokens and shared components. Inspect the rendered page
before making changes. Identify the largest obstacle to reading or acting, then
fix that obstacle within the established system.

Keep heading order and visual hierarchy aligned. Move off-scale spacing onto host
tokens; use smaller intervals within groups and larger ones between groups. Prefer
parent gaps. Remove containers that add no meaningful boundary. Keep one primary
action per region and make link and button labels describe their result.

Check long labels, narrow widths, zoom, focus, form errors and empty states. Keep
controls reachable and status understandable without color. Use motion only to
explain a change; honor reduced motion and never gate content on animation.
Measure text contrast in supported themes rather than judging it by eye.

Keep this a finishing pass. Changes to content claims, primary workflow or the brand
need support from the user's scope and product evidence. Do not invent metrics,
reviews, customers or working features to make the page look complete.

Deliver the refined page, the inspected diff, the checks run and any remaining
limits. Preserve the earlier revision. An agent's design judgment is its own.

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
