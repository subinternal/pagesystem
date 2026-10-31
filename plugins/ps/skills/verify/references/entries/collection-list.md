# Collection list (collection-list)

Kind: component. Linked rows with enough context to choose.

Task: Choose a relevant item.

Elements: [link](link.md), [text](text.md), [badge](badge.md).

Category: navigation.

## content

- Titles
- Summaries
- Destinations

## states

- ready
- empty
- no-results

## responsive

- Rows stack; link labels wrap rather than truncate.

## checks

- Links have meaningful names and actual destinations.

## HTML

```html
<main class="ps-stack"><header class="ps-stack-tight"><p class="ps-kicker">Component / Navigation</p><h1 class="ps-heading">Collection list</h1><p class="ps-note">Linked rows, each with a short description to choose by.</p></header><ul class="ps-list"><li><a href="#structure">Exporting invoices</a><p class="ps-note">Download a month of invoices as CSV or PDF.</p></li><li><a href="#rhythm">Changing the billing contact</a><p class="ps-note">Send receipts and renewal notices to a different address.</p></li></ul><section id="structure" class="ps-stack-tight"><h2 class="ps-subheading">Exporting invoices</h2><p>In Billing, choose a month and select Export. CSV includes one row per line item; PDF includes one page per invoice.</p></section><section id="rhythm" class="ps-stack-tight"><h2 class="ps-subheading">Changing the billing contact</h2><p>In Billing, edit the billing contact field. The new address receives notices from the next invoice onward.</p></section></main>
```

## Variant: With metadata

Linked rows with a summary, a type label, author, date and reading time.

```html
<main class="ps-collection">
  <div class="ps-collection-head"><h1 class="ps-heading">Guides</h1><p class="ps-note">4 guides · sample library</p></div>
  <ul class="ps-collection-rows">
    <li><a href="#guide-import">Import contacts from a spreadsheet</a><p>Map columns, fix duplicate emails and review the import before it runs.</p><p class="ps-collection-meta"><span class="ps-badge">Guide</span><span>Ava Lewis</span><time datetime="2026-10-24">24 Oct 2026</time><span>6 min read</span></p></li>
    <li><a href="#guide-roles">Choose roles for a new team</a><p>What admins, editors and viewers can change, with a recommended starting setup.</p><p class="ps-collection-meta"><span class="ps-badge">Reference</span><span>Milo Chen</span><time datetime="2026-10-17">17 Oct 2026</time><span>4 min read</span></p></li>
    <li><a href="#guide-sso">Set up single sign-on with Okta</a><p>Connect your identity provider and require SSO for every member.</p><p class="ps-collection-meta"><span class="ps-badge">Guide</span><span>Priya Raman</span><time datetime="2026-10-02">2 Oct 2026</time><span>9 min read</span></p></li>
    <li><a href="#guide-api">Rotate an API key without downtime</a><p>Create the replacement key first, deploy it, then revoke the old one.</p><p class="ps-collection-meta"><span class="ps-badge">How-to</span><span>Milo Chen</span><time datetime="2026-09-21">21 Sep 2026</time><span>3 min read</span></p></li>
  </ul>
  <div class="ps-collection-dest">
    <section id="guide-import" aria-labelledby="guide-import-title"><h2 id="guide-import-title">Import contacts from a spreadsheet</h2><p>Sample destination for the first guide.</p></section>
    <section id="guide-roles" aria-labelledby="guide-roles-title"><h2 id="guide-roles-title">Choose roles for a new team</h2><p>Sample destination for the second guide.</p></section>
    <section id="guide-sso" aria-labelledby="guide-sso-title"><h2 id="guide-sso-title">Set up single sign-on with Okta</h2><p>Sample destination for the third guide.</p></section>
    <section id="guide-api" aria-labelledby="guide-api-title"><h2 id="guide-api-title">Rotate an API key without downtime</h2><p>Sample destination for the fourth guide.</p></section>
  </div>
</main>
```

## Variant: Compact

Dense single-line rows with an identifier and a trailing record count, for saved views or queues.

```html
<main class="ps-collection" data-density="compact">
  <div class="ps-collection-head"><h1 class="ps-heading">Saved views</h1><p class="ps-note">Sample workspace</p></div>
  <ul class="ps-collection-rows ps-collection-compact">
    <li><span class="ps-collection-title"><a href="#view-overdue">Overdue invoices</a><span class="ps-collection-id">VIEW-12</span></span><span class="ps-collection-count">24 records</span></li>
    <li><span class="ps-collection-title"><a href="#view-renewals">Renewals in November</a><span class="ps-collection-id">VIEW-31</span></span><span class="ps-collection-count">9 records</span></li>
    <li><span class="ps-collection-title"><a href="#view-trials">Trials ending this week</a><span class="ps-collection-id">VIEW-07</span></span><span class="ps-collection-count">37 records</span></li>
    <li><span class="ps-collection-title"><a href="#view-churn">Accounts with no activity for 30 days</a><span class="ps-collection-id">VIEW-44</span></span><span class="ps-collection-count">112 records</span></li>
    <li><span class="ps-collection-title"><a href="#view-vip">Enterprise contacts</a><span class="ps-collection-id">VIEW-02</span></span><span class="ps-collection-count">1,208 records</span></li>
  </ul>
  <div class="ps-collection-dest">
    <section id="view-overdue" aria-labelledby="view-overdue-title"><h2 id="view-overdue-title">Overdue invoices</h2><p>Sample destination. Invoices past their due date, oldest first.</p></section>
    <section id="view-renewals" aria-labelledby="view-renewals-title"><h2 id="view-renewals-title">Renewals in November</h2><p>Sample destination. Contracts that renew next month.</p></section>
    <section id="view-trials" aria-labelledby="view-trials-title"><h2 id="view-trials-title">Trials ending this week</h2><p>Sample destination. Trials that end within seven days.</p></section>
    <section id="view-churn" aria-labelledby="view-churn-title"><h2 id="view-churn-title">Accounts with no activity for 30 days</h2><p>Sample destination. Accounts without a sign-in for 30 days.</p></section>
    <section id="view-vip" aria-labelledby="view-vip-title"><h2 id="view-vip-title">Enterprise contacts</h2><p>Sample destination. Every contact on an Enterprise plan.</p></section>
  </div>
</main>
```

## Variant: Empty

A collection with nothing saved yet, explaining what will appear and offering two ways to start.

```html
<main class="ps-collection">
  <div class="ps-collection-head"><h1 class="ps-heading">Saved reports</h1><p class="ps-note">0 reports</p></div>
  <section class="ps-collection-empty" aria-labelledby="empty-title">
    <h2 id="empty-title">No saved reports yet</h2>
    <p>Save a report from any chart to keep its filters and date range. Saved reports appear here for everyone in the workspace.</p>
    <div class="ps-header-actions"><a class="ps-button ps-button-primary" href="#templates">Start from a template</a><a class="ps-button" href="#how">How saving works</a></div>
  </section>
  <div class="ps-collection-dest">
    <section id="templates" aria-labelledby="templates-title"><h2 id="templates-title">Report templates</h2><p>Sample destination. Revenue by month, active accounts and support volume.</p></section>
    <section id="how" aria-labelledby="how-title"><h2 id="how-title">How saving works</h2><p>Sample destination. A saved report keeps its filters, grouping and date range.</p></section>
  </div>
</main>
```

## Variant: No results

A search that matches nothing, with a suggestion for broader terms and a link to browse everything.

```html
<main class="ps-collection">
  <div class="ps-collection-head"><h1 class="ps-heading">Templates</h1><p class="ps-note" role="status">0 of 18 templates match</p></div>
  <div class="ps-collection-search" role="search"><label class="ps-visually-hidden" for="template-query">Search templates</label><input id="template-query" class="ps-input" type="search" value="payroll" autocomplete="off"></div>
  <section class="ps-collection-empty" aria-labelledby="none-title">
    <h2 id="none-title">No templates match “payroll”</h2>
    <p>Templates are named by task. Try a broader word such as “finance” or “expenses”, or browse every template.</p>
    <div class="ps-header-actions"><a class="ps-button" href="#all-templates">Browse all 18 templates</a></div>
  </section>
  <div class="ps-collection-dest">
    <section id="all-templates" aria-labelledby="all-title"><h2 id="all-title">All templates</h2><p>Sample destination. Finance, hiring, onboarding and planning templates.</p></section>
  </div>
</main>
```
