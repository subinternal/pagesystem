# Reading (reading)

Kind: system. A calm reading column with a useful way through.

Task: Learn something and find the supporting source.

Composition: opening ([page-header](page-header.md)) → lead ([answer](answer.md)) → body ([section](section.md)) → related ([collection-list](collection-list.md)).

## content

- Title and direct opening
- Author and dates
- Headed body
- Sources and related reading

## states

- ready: published content
- updated: show the revision date
- withdrawn: preserve a clear correction notice

## responsive

- Reading measure stays near 65 characters.
- Wide figures and tables scroll within their own region.

## checks

- One page title and ordered headings.
- Keyboard order follows reading order.
- Source HTML contains the answer; no script is needed to read it.
- Text contrast and focus must be measured in both themes.

## HTML

```html
<main class="ps-page" id="main"><header class="ps-stack"><p class="ps-kicker">Field guide / sample article</p><h1 class="ps-title">Spacing is part of the sentence.</h1><p class="ps-lead">How proximity tells a reader what belongs together.</p><p class="ps-note">Pagesystem reading sample · October 27, 2026</p></header><section class="ps-prose"><h2 class="ps-heading">Why does spacing change meaning?</h2><p>Readers use distance to understand relationships. A heading placed close to its paragraph feels attached to it; a larger gap signals a new idea. Consistent spacing lets the structure speak before a person reads every word.</p></section><section class="ps-prose"><h2 class="ps-heading">Start with relationships.</h2><p>Choose a small gap inside a group and a larger gap between groups. Put that spacing on the parent, so each sibling follows the same rhythm.</p><p>A border is useful when it marks a boundary. When two paragraphs simply belong together, proximity is usually enough.</p></section><section class="ps-prose"><h2 class="ps-heading">Give the intervals a name.</h2><p>Record the section gap, heading gap, and control spacing as tokens. These roles make the decision reusable without asking every page to invent it again.</p></section><section class="ps-stack" id="related"><h2 class="ps-heading">Keep reading</h2><ul class="ps-list"><li><a href="#main">Review the spacing argument</a><p class="ps-note">Revisit the relationship between distance and meaning.</p></li></ul></section></main>
```
