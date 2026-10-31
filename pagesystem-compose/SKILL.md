---
name: pagesystem-compose
description: Design or rebuild a coherent set of web pages using explicit page contracts, shared tokens and reusable components. Use for page templates, site structure or a new kind of page; not for isolated copy edits.
---
# Pagesystem

Build a usable page and the shared decisions that make its siblings coherent.

1. Read the repository instructions, product context, current layouts and one
   working sibling. Establish the audience, task and content source. Ask only for
   material gaps; retain authorization already given by the user.
2. Choose the closest page contract: landing, service, editorial, collection,
   workspace, detail or workflow. Name its task and mode: persuade, read or operate.
   Adapt it when real content needs another structure; do not force a template.
3. Write the contract before implementation: required content, regions in reading
   order, states, responsive behavior and evidence that would establish success.
4. Reuse the host's tokens and components. If none exist, derive a small scale and
   name section, heading, card and control spacing. Put sibling rhythm on parents.
5. Build semantic source HTML. One main landmark and page title, ordered headings,
   meaningful links, native controls, named regions, and a useful next step. Public
   pages answer their question early and link to related content. Produce metadata
   and structured data from the same facts only when those facts are supplied.
6. Implement the states this application needs, including missing data and failed
   actions. Keep entered values on recoverable errors. Do not turn a static sample
   into a claim that a backend exists. Parse external inputs at the boundary.
7. Verify the actual page at phone and desktop widths, keyboard focus, long content,
   empty/error conditions and both themes if supported. Check contrast from computed
   colors. Distinguish source checks, browser checks and qualitative judgment.
8. Deliver a usable artifact and a concise report of changes, evidence and limits.
   Preserve revisions and inspect the diff. Publishing follows the user's existing
   scope; model approval never represents the person's approval.

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
