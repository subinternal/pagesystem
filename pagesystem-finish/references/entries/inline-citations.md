# Inline citations (inline-citations)

Kind: component. Numbered markers inside a reply open a source preview on hover, focus or click, with the full source list at the end.

Task: Check where each claim in a reply comes from without leaving the text.

Elements: [text](text.md), [button](button.md), [link](link.md).

Category: agent.

Native behavior: inline-citations. It needs pagesystem.js (see ../implementation.md).

## content

- Reply paragraphs with a marker after each supported claim; one marker can cite several sources.
- A source list that owns every fact shown in the preview: publisher, title, summary and date.
- A preview card with paging when a marker cites more than one source, and a link to the source in the list.
- A label that the answer is a sample and the source details are illustrative.

## states

- closed
- hover preview
- focus preview
- pinned by click
- paged
- placed above when there is no room below
- source highlighted in list
- folded source list

## responsive

- The preview is placed under its marker and clamped inside the component, so it fits a narrow side panel or a phone width.
- Markers stay small in the line with a hit area extended to the house target; chips wrap with the text.

## checks

- Hover opens after a short delay and closes when the pointer leaves both marker and card; a click pins the card until clicked again, clicked outside or dismissed.
- Keyboard focus on a marker previews its source; Enter pins it and moves focus into the card; Escape closes and returns focus to the marker.
- Left and Right page through multiple sources; Tab past the card's last control continues to the next item after the marker.
- Markers expose aria-expanded and aria-controls, and their accessible names start with the visible text.
- Show in the source list opens a folded list, focuses the source and does not change the URL.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Inline citations</h1><p class="ps-note">Numbered markers inside a reply open a preview of each source on hover, focus or click, with the full list at the end.</p></header>
<section class="ps-cites" data-ps-inline-citations aria-labelledby="cites-question"><h2 class="ps-cites-question" id="cites-question"><span class="ps-cites-who" aria-hidden="true">You</span>What happened to Plymouth, the old capital of Montserrat?</h2>
<div class="ps-cites-body"><p>Soufrière Hills had been quiet for three centuries when it woke in July 1995 and began covering Plymouth, the capital, in ash.<button class="ps-cite" type="button" data-cite="1">1</button></p>
<p>In June 1997 pyroclastic flows reached the airport, and about two thirds of the island’s people left for good.<button class="ps-cite" type="button" data-cite="2 3 4">2–4</button></p>
<p>Plymouth was abandoned inside the exclusion zone. Government moved to Brades in the north, where it remains.<button class="ps-cite" type="button" data-cite="4">4</button></p></div>
<section class="ps-cites-sources" aria-labelledby="cites-sources-title"><h3 id="cites-sources-title">Sources</h3><ol><li id="cites-src-1" data-source="1"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>W</span><span data-source-publisher>Wikipedia</span></p><cite data-source-title>Soufrière Hills</cite><p data-source-summary>The volcano from its 1995 reawakening onward, with eruption dates and the exclusion zone.</p><p data-source-date>Revised 9 July 2026</p></li><li id="cites-src-2" data-source="2"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>M</span><span data-source-publisher>Montserrat Volcano Observatory</span></p><cite data-source-title>Activity reports, 1995 to present</cite><p data-source-summary>Weekly and special reports on dome growth, pyroclastic flows and ash fall.</p><p data-source-date>Updated 2 October 2026</p></li><li id="cites-src-3" data-source="3"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>S</span><span data-source-publisher>Smithsonian Global Volcanism Program</span></p><cite data-source-title>Soufrière Hills: eruptive history</cite><p data-source-summary>Dated eruptive episodes since 1995, including the June 1997 flows that reached the airport.</p><p data-source-date>Updated 14 March 2026</p></li><li id="cites-src-4" data-source="4"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>U</span><span data-source-publisher>UK Parliament briefing</span></p><cite data-source-title>Montserrat: population and recovery</cite><p data-source-summary>The fall in population after 1997 and the move of government services to the north.</p><p data-source-date>Published 3 May 2024</p></li></ol><p class="ps-cites-note">Sample answer. Source details are illustrative.</p></section>
<div class="ps-cite-card" id="cites-card" role="dialog" aria-labelledby="cites-card-title" tabindex="-1" data-cite-card hidden><div class="ps-cite-card-nav" data-card-nav hidden><button type="button" aria-label="Previous source" data-card-prev><span class="ps-i ps-i-left" aria-hidden="true"></span></button><button type="button" aria-label="Next source" data-card-next><span class="ps-i ps-i-right" aria-hidden="true"></span></button><span data-card-count>1 / 1</span></div><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-card-mark></span><span data-card-publisher></span></p><h3 id="cites-card-title" data-card-title>Source</h3><p data-card-summary></p><p data-card-date></p><a href="#cites-src-1" data-card-link>Show in the source list</a></div>
</section></main>
```

## Variant: Source chips

Each claim names its source in a small chip, with a count when several sources agree, and the list stays folded until asked for.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Inline citations, source chips</h1><p class="ps-note">Each claim names its source in a small chip, with a count when several sources agree; the list stays folded until asked for.</p></header>
<section class="ps-cites" data-ps-inline-citations aria-labelledby="chips-question"><h2 class="ps-cites-question" id="chips-question"><span class="ps-cites-who" aria-hidden="true">You</span>What happened to Plymouth, the old capital of Montserrat?</h2>
<div class="ps-cites-body"><p>Soufrière Hills had been quiet for three centuries when it woke in July 1995 and began covering Plymouth, the capital, in ash.<button class="ps-cite ps-cite-chip" type="button" data-cite="1"><span class="ps-cite-mark" aria-hidden="true">W</span>Wikipedia</button></p>
<p>In June 1997 pyroclastic flows reached the airport, and about two thirds of the island’s people left for good.<button class="ps-cite ps-cite-chip" type="button" data-cite="2 3 4"><span class="ps-cite-mark" aria-hidden="true">M</span>Observatory<span class="ps-cite-more"> +2</span></button></p></div>
<section class="ps-cites-sources" aria-label="Sources"><details><summary>4 sources</summary><ol><li id="chips-src-1" data-source="1"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>W</span><span data-source-publisher>Wikipedia</span></p><cite data-source-title>Soufrière Hills</cite><p data-source-summary>The volcano from its 1995 reawakening onward, with eruption dates and the exclusion zone.</p><p data-source-date>Revised 9 July 2026</p></li><li id="chips-src-2" data-source="2"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>M</span><span data-source-publisher>Montserrat Volcano Observatory</span></p><cite data-source-title>Activity reports, 1995 to present</cite><p data-source-summary>Weekly and special reports on dome growth, pyroclastic flows and ash fall.</p><p data-source-date>Updated 2 October 2026</p></li><li id="chips-src-3" data-source="3"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>S</span><span data-source-publisher>Smithsonian Global Volcanism Program</span></p><cite data-source-title>Soufrière Hills: eruptive history</cite><p data-source-summary>Dated eruptive episodes since 1995, including the June 1997 flows that reached the airport.</p><p data-source-date>Updated 14 March 2026</p></li><li id="chips-src-4" data-source="4"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>U</span><span data-source-publisher>UK Parliament briefing</span></p><cite data-source-title>Montserrat: population and recovery</cite><p data-source-summary>The fall in population after 1997 and the move of government services to the north.</p><p data-source-date>Published 3 May 2024</p></li></ol></details><p class="ps-cites-note">Sample answer. Source details are illustrative.</p></section>
<div class="ps-cite-card" id="chips-card" role="dialog" aria-labelledby="chips-card-title" tabindex="-1" data-cite-card hidden><div class="ps-cite-card-nav" data-card-nav hidden><button type="button" aria-label="Previous source" data-card-prev><span class="ps-i ps-i-left" aria-hidden="true"></span></button><button type="button" aria-label="Next source" data-card-next><span class="ps-i ps-i-right" aria-hidden="true"></span></button><span data-card-count>1 / 1</span></div><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-card-mark></span><span data-card-publisher></span></p><h3 id="chips-card-title" data-card-title>Source</h3><p data-card-summary></p><p data-card-date></p><a href="#chips-src-1" data-card-link>Show in the source list</a></div>
</section></main>
```

## Variant: Side panel

An assistant answer in a narrow help panel citing internal documents, where the preview fits the panel width.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Inline citations, side panel</h1><p class="ps-note">An assistant answer in a narrow help panel, citing internal documents; the preview fits the panel width.</p></header>
<section class="ps-cites ps-cites-panel" data-ps-inline-citations data-density="compact" aria-labelledby="panel-question"><h2 class="ps-cites-question" id="panel-question"><span class="ps-cites-who" aria-hidden="true">You</span>How long are deleted projects kept?</h2>
<div class="ps-cites-body"><p>Deleted projects stay in the trash for 30 days, then they are removed for good.<button class="ps-cite" type="button" data-cite="1">1</button></p>
<p>Until then a workspace admin can restore the whole project, including comments and version history.<button class="ps-cite" type="button" data-cite="3">3</button> Backups keep a copy for 35 more days, but projects cannot be restored from them.<button class="ps-cite" type="button" data-cite="2">2</button></p></div>
<section class="ps-cites-sources" aria-labelledby="panel-sources-title"><h3 id="panel-sources-title">Sources</h3><ol><li id="panel-src-1" data-source="1"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>R</span><span data-source-publisher>Retention policy</span></p><cite data-source-title>Section 4.2, deleted projects</cite><p data-source-summary>Items in the trash are permanently deleted after 30 days.</p><p data-source-date>Updated 12 September 2026</p></li><li id="panel-src-2" data-source="2"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>B</span><span data-source-publisher>Backup and recovery</span></p><cite data-source-title>How backups are kept</cite><p data-source-summary>Encrypted backups are kept for 35 days and are used only for disaster recovery.</p><p data-source-date>Updated 2 October 2026</p></li><li id="panel-src-3" data-source="3"><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-source-mark>A</span><span data-source-publisher>Admin guide</span></p><cite data-source-title>Restore a deleted project</cite><p data-source-summary>Workspace admins can restore a project from the trash, with its comments and history.</p><p data-source-date>Updated 20 October 2026</p></li></ol><p class="ps-cites-note">Sample answer citing fictional internal documents.</p></section>
<div class="ps-cite-card" id="panel-card" role="dialog" aria-labelledby="panel-card-title" tabindex="-1" data-cite-card hidden><div class="ps-cite-card-nav" data-card-nav hidden><button type="button" aria-label="Previous source" data-card-prev><span class="ps-i ps-i-left" aria-hidden="true"></span></button><button type="button" aria-label="Next source" data-card-next><span class="ps-i ps-i-right" aria-hidden="true"></span></button><span data-card-count>1 / 1</span></div><p class="ps-cites-pub"><span class="ps-cite-mark" aria-hidden="true" data-card-mark></span><span data-card-publisher></span></p><h3 id="panel-card-title" data-card-title>Source</h3><p data-card-summary></p><p data-card-date></p><a href="#panel-src-1" data-card-link>Show in the source list</a></div>
</section></main>
```
