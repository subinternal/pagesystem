# Service (service)

Kind: system. An answer, credible evidence, and a clear way forward.

Task: Understand one service and decide whether to inquire.

Composition: opening ([page-header](page-header.md)) → answer ([answer](answer.md)) → scope ([collection-list](collection-list.md)) → proof ([record-summary](record-summary.md)) → inquiry ([action-bar](action-bar.md)).

## content

- Service and audience
- Direct answer and scope
- Evidence, constraints and process
- Contact route

## states

- ready: service available
- unavailable: show an alternative contact route

## responsive

- Scope lists become one column.
- Contact actions remain readable and reachable.

## checks

- One page title and ordered headings.
- Keyboard order follows reading order.
- Source HTML contains the answer; no script is needed to read it.
- Text contrast and focus must be measured in both themes.

## HTML

```html
<main class="ps-page" id="main">
  <header class="ps-stack"><p class="ps-kicker">Northline studio / sample service page</p><h1 class="ps-title">A clearer website.<br>A stronger start.</h1><p class="ps-lead">Web design for small teams whose work has outgrown their website.</p><div class="ps-row"><a class="ps-button ps-button-primary" href="#contact">Discuss your project <span class="ps-i ps-i-up-right" aria-hidden="true"></span></a><a class="ps-link" href="#scope">See what is included</a></div></header>
  <section class="ps-prose" aria-labelledby="answer"><h2 class="ps-heading" id="answer">What does the engagement include?</h2><p>We turn your existing content into a clear, accessible website: a shared page structure, reusable components, and a small set of templates your team can maintain. The engagement starts with a content review and ends with a documented handover.</p></section>
  <section class="ps-stack" id="scope" aria-labelledby="scope-title"><h2 class="ps-heading" id="scope-title">Built around the work you do.</h2><ol class="ps-list"><li><h3 class="ps-subheading">Find the structure</h3><p class="ps-note">Audience, content inventory, page types, and the routes between them.</p></li><li><h3 class="ps-subheading">Build the shared parts</h3><p class="ps-note">A considered type scale, useful components, and layouts that hold on a phone.</p></li><li><h3 class="ps-subheading">Make it yours to run</h3><p class="ps-note">A working site, checked templates, and a practical editing guide.</p></li></ol></section>
  <section class="ps-panel ps-stack" aria-labelledby="facts"><h2 class="ps-subheading" id="facts">A defined scope, from the start.</h2><dl class="ps-facts"><div><dt>Format</dt><dd>One focused engagement</dd></div><div><dt>Handover</dt><dd>Source + documentation</dd></div><div><dt>Scope</dt><dd>Agreed before work</dd></div></dl><p class="ps-note">Example studio and offer. Replace with your own verified details.</p></section>
  <section class="ps-stack" id="contact" aria-labelledby="contact-title"><h2 class="ps-heading" id="contact-title">Start with what needs to change.</h2><p>Describe your current website, your audience, and the work it needs to do.</p><p class="ps-note">Sample contact destination. Connect your real contact form before publishing.</p></section>
</main>
```
