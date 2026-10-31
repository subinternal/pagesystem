# Page header (page-header)

Kind: component. Title, context, and one clear priority.

Task: Explain where I am and what this page is for.

Elements: [text](text.md), [link](link.md).

Category: layout.

## content

- Title
- Short description
- Optional primary action

## states

- ready
- long title

## responsive

- Title wraps; action stacks after description.

## checks

- Heading level belongs to the page outline.

## HTML

```html
<main><header class="ps-stack"><p class="ps-kicker">Project / Website relaunch</p><h1 class="ps-title">Website relaunch brief</h1><p class="ps-lead">Scope, owners and dates for moving the marketing site to the new content system by January 15.</p><a href="#next" class="ps-button ps-button-primary">Review open decisions <span class="ps-i ps-i-up-right" aria-hidden="true"></span></a></header><p id="next" class="ps-note">Three decisions are open: the domain cutover date, the redirect owner and the launch freeze window.</p></main>
```

## Variant: Record header

Breadcrumb, title and description with two actions, plus status, owner and update metadata for a record page.

```html
<main>
<div class="ps-header-frame">
  <header class="ps-header-record">
    <nav class="ps-crumbs" aria-label="Breadcrumb"><ol><li><a href="#scope">Projects</a></li><li><a href="#scope">Website relaunch</a></li><li><span aria-current="page">Brief</span></li></ol></nav>
    <div class="ps-header-main">
      <div class="ps-stack-tight"><h1 class="ps-title">Website relaunch brief</h1><p class="ps-lead">Scope, audience and launch criteria for the spring site update.</p></div>
      <div class="ps-header-actions"><a class="ps-button" href="#history">View history</a><a class="ps-button ps-button-primary" href="#scope">Request review</a></div>
    </div>
    <dl class="ps-header-meta"><div><dt>Status</dt><dd>Draft</dd></div><div><dt>Owner</dt><dd>Ava Lewis</dd></div><div><dt>Updated</dt><dd><time datetime="2026-10-27">27 Oct 2026</time></dd></div><div><dt>Reviewers</dt><dd>2 assigned</dd></div></dl>
  </header>
</div>
<section id="scope" class="ps-stack-tight" aria-labelledby="scope-title"><h2 class="ps-subheading" id="scope-title">Scope</h2><p class="ps-note">Sample record. The header carries location, status and the two actions this page supports.</p></section>
<section id="history" class="ps-stack-tight" aria-labelledby="history-title"><h2 class="ps-subheading" id="history-title">History</h2><p class="ps-note">Six revisions since 3 October 2026.</p></section>
</main>
```

## Variant: Centered search

Centered help-center header with a search form and links to popular topics.

```html
<main>
<div class="ps-header-frame">
  <header class="ps-header-centered">
    <p class="ps-kicker">Help center</p>
    <h1 class="ps-title">Billing and invoices</h1>
    <p class="ps-lead">Payment methods, invoices, tax details and plan changes for Northline workspaces.</p>
    <form class="ps-header-search" role="search" aria-label="Billing help"><label class="ps-visually-hidden" for="help-query">Search billing help</label><input id="help-query" class="ps-input" type="search" placeholder="Search billing articles" autocomplete="off"><button class="ps-button ps-button-primary" type="submit">Search</button></form>
    <ul class="ps-header-topics" aria-label="Popular topics"><li><a href="#invoices">Download an invoice</a></li><li><a href="#tax">Add a VAT number</a></li><li><a href="#plans">Change plans</a></li></ul>
  </header>
</div>
<section id="invoices" class="ps-stack-tight" aria-labelledby="invoices-title"><h2 class="ps-subheading" id="invoices-title">Download an invoice</h2><p class="ps-note">Sample article. Invoices are listed under Settings, then Billing.</p></section>
<section id="tax" class="ps-stack-tight" aria-labelledby="tax-title"><h2 class="ps-subheading" id="tax-title">Add a VAT number</h2><p class="ps-note">Sample article. Tax details apply to the next invoice.</p></section>
<section id="plans" class="ps-stack-tight" aria-labelledby="plans-title"><h2 class="ps-subheading" id="plans-title">Change plans</h2><p class="ps-note">Sample article. Plan changes are prorated by day.</p></section>
</main>
```

## Variant: Long title

A long title wrapping at a readable measure, with an identifier, a deadline in the description and actions after it.

```html
<main>
<div class="ps-header-frame">
  <header class="ps-header-long">
    <div class="ps-header-status"><span class="ps-badge">SEC-0412</span><span>Security review · Q4 2026</span></div>
    <h1 class="ps-title">Quarterly access review for contractors with production database permissions</h1>
    <p class="ps-lead">Confirm or revoke 23 contractor accounts before 15 November 2026. Unreviewed accounts lose access on that date.</p>
    <div class="ps-header-actions"><a class="ps-button ps-button-primary" href="#accounts">Start review</a><a class="ps-button" href="#policy">Read the policy</a></div>
  </header>
</div>
<section id="accounts" class="ps-stack-tight" aria-labelledby="accounts-title"><h2 class="ps-subheading" id="accounts-title">Accounts to review</h2><p class="ps-note">Sample review. The title wraps at a readable measure, and the actions follow the description.</p></section>
<section id="policy" class="ps-stack-tight" aria-labelledby="policy-title"><h2 class="ps-subheading" id="policy-title">Access policy</h2><p class="ps-note">Contractor access is reviewed every quarter.</p></section>
</main>
```
