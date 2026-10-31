# Type and space are structural rules

These rules apply before selecting a component or visual direction. They are part
of building, extracting, reviewing and polishing a page. The canonical house
values live in `src/tokens.css`; the roles below explain their use. Generated skill
references and exports invalidate whenever that source or this document changes.
An established host system takes precedence: map these roles to its tokens and
record a justified exception rather than silently importing another visual identity.

## Typography has a job

Assign a role before choosing a size. Use one sans family for the interface. Add a
second family only when the content direction warrants it. Reserve monospace for
identifiers, code, units and aligned data; it is not a default for navigation,
section labels or body copy. Use tabular numerals for changing or compared values.

| Role | Token | Treatment and use |
|---|---|---|
| Caption | `--text-caption` | Supplemental timestamps, chart ticks and metadata; never the only instruction or error |
| Label | `--text-label` | Compact control labels and supporting UI text; ordinary casing |
| Interface | `--text-ui` | Rows, menu choices and operational copy; `--leading-ui` |
| Body | `--text-body` | Reading text and editable inputs; `--leading-body` for prose |
| Lead | `--text-lead` | Brief introduction, not every paragraph |
| Panel title | `--text-title` | Title of a task or module; medium weight, `--leading-title` |
| Section | `--text-section` | Subdivision within a page; `--leading-heading` |
| Page | `--text-page` | Main page title; bounded fluid sizing |
| Display | `--text-display` | Optional expressive opening; not a dashboard heading or a substitute for content |

Use regular weight for text, medium for labels/titles, strong for emphasis. Avoid a
ladder of nearly indistinguishable weights. Keep body and small labels at normal
tracking. Tighten only larger headings using the heading roles; never compress
small text to make it fit. Multiline headings need clear leading, and body copy
needs a comfortable line length (`--prose-measure`). Short labels must still wrap
when translated. Do not use fixed heights on text blocks or truncate essential data.

Keep the browser root font size intact. Type tokens use rem; fluid sizes have rem
bounds. Space tokens retain CSS-pixel geometry so enlarging text does not also
double every nested gutter. Containers grow with their content. Inputs use at least the body role. Do not shrink type at mobile widths to
preserve a desktop composition. Reflow the composition. A semantic h1 may use the
panel-title role in a small exported specimen; HTML level and visual size are
separate decisions, with a logical heading outline in either case.

## Space describes relationships

Use the house spacing scale through semantic roles, or the established host's
mapped equivalent. Zero is valid. Pixel borders and genuine optical corrections
are not layout spacing. Do not create a new gap to fix one screenshot.

| Relationship | Role | Rule |
|---|---|---|
| Value to its caption | `--gap-caption` | Closest relationship; keep the pair together |
| Label to field, title to subtitle | `--gap-related` | Less space than between independent groups |
| Adjacent controls | `--gap-controls` | Align baselines and maintain distinct hit areas |
| Independent groups within a panel | `--gap-group` | Make the next task or topic apparent |
| Independent page sections | `--gap-section` | Follow page mode; not a repeated giant void |
| Viewport to content | `--page-gutter` | One shared left/right alignment for header, content and footer |
| Page top/bottom | `--page-inset` | Keep separate from horizontal gutters |
| Panel boundary to content | `--panel-inset` | Header, body and footer share the same content edge |
| Repeated row padding | `--row-inset` | Apply to siblings consistently, independent of content length |

Parents own sibling rhythm with gap. Padding separates content from its boundary;
margins separate independent blocks. Do not stack child margins and parent gaps
for the same relationship. Reset browser defaults deliberately. Nested panels do
not each inherit a full page gutter. Align text edges rather than outer icon boxes.
A change in spacing must explain grouping, hierarchy or state.

## Density is chosen, not improvised

The default is a balanced interface. `data-density="compact"` reduces panel, group
and row space for operational work. `data-density="open"` opens the rhythm for
reading and work presentation. Scope density to a region; do not force every page
into a dashboard or every dashboard into a marketing layout. Density never reduces
essential text size, focus visibility or the house control target. Native controls
are 36 CSS pixels tall for precise pointers and 44 for coarse (touch) input, at
default text settings, including icon buttons; `--control-height` switches with
`pointer: coarse`. This is our usability baseline, not a claim that every
accessibility standard requires those exact numbers.

At narrow widths use the shared mobile gutter, stack controls or columns as the
content requires, and keep the related/group/section ordering. Do not hide body
overflow to mask broken layout. Dense tables and plots may scroll within a labeled
region; key actions and explanatory text must reflow. Avoid fixed viewport height.
Use container-aware layout when a component appears inside a narrow panel on a
wide page. Whitespace is intentional only when it supports the content hierarchy.

## The product shell is part of the system

Apply the same material, type hierarchy, edge treatment, padding and control roles
to navigation, library browsing, dialogs and examples. A polished component inside
an unrelated marketing template is an incomplete design system. Use a neutral
surface hierarchy and reserve accent color for categories, selection and status.
Borders explain boundaries; shadows explain elevation. Avoid repeated decorative
frames, gratuitous colored stages and oversized slogan typography.

Show a complete task early. Specific content and consequential interactions carry
the design: a selection should change its details, a diagram should explain the
same state as the controls, and recovery should actually work. Use a small number
of distinct, purposeful visual compositions. Adding many generic cards does not
establish a product's identity. These are qualitative review criteria, not claims
that source lint can certify aesthetic quality.

## Restraint and meaningful detail

Do not decorate sections with ordinals such as `03 / PRINCIPLES`, isolated counters
or serial prefixes. Use plain descriptive titles. Numbers belong to real ordered
steps, records, quantities or references. Keep chart color, units, legends and
controls consistent. A diagram must explain data or state. Do not substitute a
random graph, icon or illustration for a missing workflow. The user's product
panel references establish a craft direction, not permission to copy low-contrast
labels or assume the pictured controls are implemented.

## Plots name the reading task of every mark

Ruled (Oct 29): take some of chartd's chart principles, not all. Taken:

- **Ink budget.** A plot draws its data, one value scale, one locator for position
  and the names it needs. Any other mark must name the reading task it serves, or it
  is removed. Gridlines that do not sit at labeled values serve none.
- **Three structural ink levels**, always quieter than the data: `--plot-grid` (8%
  ink) for interior gridlines, `--plot-axis` (28%) for stubs, leaders and markers,
  and `--plot-baseline` (50%) for the zero line. One uniform axis color is how
  generated charts look.
- **Honest baselines.** A bar starts at true zero and the baseline is drawn. A scale
  that does not start at zero prints its starting value.
- **The scale is chosen, not stretched.** The top of the scale is a round value at or
  above the largest datum, with about four gridlines (one per ~48px of height). The
  unit is stated once, on the top value.
- **Time labels are qualified, then terse.** The first label carries the month, later
  labels drop it until the month changes, and labels thin by the space they have.
- **Hover only restates.** Everything a hover or inspector shows is also reachable
  without it: a readout, a table or a label in the markup.
- **Readouts do not move.** Figures use tabular numerals, so changing digits never
  shift their neighbors. A value the reader scrubs to changes at once; it never
  passes through numbers that were not measured.
- **Stacked segments separate by a gap of background** (`--plot-gap`), never by a
  stroke.
- **Direct labels where they fit.** With four or fewer series, a name at the data
  beats a detached key. A key stays when it is also the filter control, or when the
  same series repeat across many rows (capacity), where one key read once is cheaper
  than the same names repeated. A key draws each mark exactly as the plot does.

Ruled (Oct 29): charts follow the Mebius chart direction. Its anatomy, adopted:

- **Figures lead.** A chart opens with its headline figures: a caption, the figure in
  tabular numerals and, where a comparison is derived from the data, a delta pill that
  states the direction in its arrow and its text, never by color alone.
- **Focus and context.** The focused period or item (the one inspected, selected or
  current) carries full color with a quiet band behind it; marks outside the focus
  fall back to `--plot-context` gray where color is not what they encode. Its axis
  label is set in ink, the rest stay muted.
- **A pinned readout tip.** An inverse card beside the focused mark restates its date
  and values, with each series' swatch. It follows the inspected item, not only the
  pointer, so keyboard and touch readers get it too.
- **A reference line** may mark the focused value or a target across the plot, dashed
  at `--plot-axis`, with its value tagged at the scale's edge.
- **Tall, softly rounded bars** with clear gaps, and unit meters (a row of small cells)
  for budgets and limits.

Not adopted: its gradient sheens on bars and areas and its colored hero backgrounds.
Fills stay flat; an area under a line is the line's color at low strength.

Not taken: chartd's warm paper ground, pill-shaped controls and selection fills,
colored double focus rings, guided tours and preset restyling. Its rule that
charts carry no container also stays out, because Pagesystem's plots live inside
instrument panels.

## Acceptance and evidence

Before calling a page complete:

- Map its type roles, density, spacing relationships, gutters and reading widths to
  the canonical tokens. Identify every intentional exception and its reason.
- Inspect 375 and 1440 pixel widths in both supported themes, keyboard operation
  and reduced motion. Also inspect the actual narrow panel width, not just viewport.
- Increase browser default text size and test 200% text enlargement. At the
  equivalent 320 CSS-pixel viewport, check reflow; permit local data-region scroll
  only where the content needs two dimensions. A narrow viewport alone does not
  prove a browser zoom pass.
- Override text spacing (line height 1.5, paragraph spacing 2em, letter spacing
  .12em, word spacing .16em) and verify no clipped or lost content/actions.
- Test long titles, long values, missing data and validation messages. Compare
  measured sibling padding and gutter edges; inspect hierarchy visually as well.
- Record automated violations separately from visual judgments and untested
  states. A token lint pass is not proof of good typography, accessible contrast
  or a coherent composition. Never lower a rule just to make a report pass.

Fix the shared role first when several siblings drift. Re-run affected states and
one unaffected sibling. Keep the acceptance criteria and prior evidence intact;
a new review does not silently resolve an earlier unresolved finding.

## Surfaces and states are roles too

An edge is one hairline ring plus a short drop (`--edge`, `--edge-hover`), not a
1px border stacked on a shadow. Shadow means elevation; never use it to show that
something is chosen. Inner panels sit on `--well` without a border, and inner
radii step down with depth (16, 12 or 8 outside; 8 or 6 inside; 4 for marks).
Do not nest a bordered tray inside a bordered card.

Interactive states are ink at fixed strengths, so they follow a host's ink and
both themes: `--fill-hover`, `--fill-selected`, `--fill-pressed`, `--line-control`
for inputs and checkboxes, `--line-hover`. `--raised` is the surface that sits
above a track; it lightens in dark mode where `--surface` would read as sunken.

| Target | Hover | Selected | Pressed |
|---|---|---|---|
| Row or option | `--fill-hover` | `--fill-selected`, ink text | `--fill-pressed` |
| Choice card | `--line-hover` | ink border, no shadow | ink border |
| Segment | `--fill-hover` | `--raised` with `--edge` | same |
| Data mark | none | ink border; series color stays data | none |
| Button | `--edge-hover` | n/a | `scale(.97)` over `--press` |

Accent marks completion and value only: native checks and ranges, progress and
focus. It is never a selected fill, a side stripe or a tinted pill. Hover answers
in `--hover` (90ms); presses and indicators settle in `--press` on `--ease-out`.
Keyboard-initiated changes are not animated. Headline figures use the interface
face with tabular figures; monospace is for times, identifiers, code and axes.

## Implementation premises and bounds

Ruled: the user requires type, margins, padding and spacing in the fundamental
rules, rejects decorative section numbering, and prefers detailed product modules.
Observed: the repository already owns tokens in one CSS source and generates four
skill packages. Reuse that pipeline; a second JSON scale would duplicate facts.
House role values are authored defaults, not measured constants from the reference
images. Host adaptation and visual quality require judgment.

Dependency order: define roles and these rules; check source; wire consumers and
skill generation; test built artifacts and rendered layouts. Foundation source
lint is O(B) in stylesheet bytes with bounded declaration patterns; build adds one
shared document to each of four fixed skill outputs. No network or runtime storage.
