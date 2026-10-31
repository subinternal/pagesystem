# Command menu (command-menu)

Kind: component. A searchable workspace, with every action a few keys away.

Task: Find and select a command without losing the current task.

Elements: [text](text.md), [input](input.md), [button](button.md).

Category: navigation.

Native behavior: command-menu. It needs pagesystem.js (see ../implementation.md).

## content

- A native modal dialog with an explicit trigger and close button.
- Grouped command names, descriptions and searchable keywords.
- An honest local selection result and a host integration event.

## states

- Closed, open, filtering, no results and selected.
- Opening clears the previous query; preset triggers supply a query.
- Escape or backdrop dismissal restores trigger focus.

## responsive

- The dialog stays within the available viewport; results scroll locally.
- At phone widths descriptions wrap and the close control stays reachable.

## checks

- Ctrl/Cmd K opens the first command menu in the document.
- Arrow keys wrap through filtered options; Enter selects; composition input is not intercepted.
- Native modal focus stays inside until dismissed; selection returns focus.
- Emit pagesystem:command with {id,label}; the host decides what action to perform.
- Keyboard search and navigation have no entrance delays.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Navigation</p><h1 class="ps-heading">Command menu</h1><p class="ps-note">Searchable commands with groups, keyboard selection and a native modal.</p></header>

<div data-ps-command-menu class="ps-command-root">
  <div class="ps-command-home ps-rich-surface">
    <div class="ps-rich-heading"><span class="ps-app-icon" aria-hidden="true">⌘</span><div><strong>Workspace</strong><p>Projects, files and people</p></div></div>
    <button type="button" class="ps-command-launch" data-command-open><span><span class="ps-i ps-i-search" aria-hidden="true"></span> Search commands…</span><kbd>⌘ / Ctrl K</kbd></button>
    <p class="ps-rich-label">Quick access</p><div class="ps-quick-actions"><button type="button" data-command-preset="project"><span class="ps-i ps-i-folder" aria-hidden="true"></span>Projects</button><button type="button" data-command-preset="file"><span class="ps-i ps-i-file" aria-hidden="true"></span>Files</button><button type="button" data-command-preset="team"><span class="ps-i ps-i-users" aria-hidden="true"></span>People</button></div>
    <p class="ps-note" data-command-status role="status">Sample workspace · commands emit a local selection.</p>
  </div>
  <dialog class="ps-command-dialog" aria-labelledby="command-title">
    <div class="ps-dialog-heading"><h2 id="command-title">Go anywhere</h2><button type="button" class="ps-icon-button" data-command-close aria-label="Close command menu">×</button></div>
    <label class="ps-visually-hidden" for="command-query">Search commands</label><div class="ps-command-search"><span class="ps-i ps-i-search" aria-hidden="true"></span><input id="command-query" type="search" placeholder="What would you like to do?" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="command-options"></div>
    <div id="command-options" role="listbox" aria-label="Commands" class="ps-command-options">
      <div role="group" aria-label="Workspace" data-command-group><p class="ps-rich-label" aria-hidden="true">Workspace</p>
        <button id="command-project" type="button" role="option" aria-selected="false" tabindex="-1" data-command="new-project" data-keywords="create start project"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-package"></span></span><span>New project<small>Create a project workspace</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="command-files" type="button" role="option" aria-selected="false" tabindex="-1" data-command="recent-files" data-keywords="open document file"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Recent files<small>Your latest working documents</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="command-team" type="button" role="option" aria-selected="false" tabindex="-1" data-command="invite-teammate" data-keywords="people team person invite"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-users"></span></span><span>Invite teammate<small>Invite a member to the workspace</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
      </div>
      <div role="group" aria-label="Preferences" data-command-group><p class="ps-rich-label" aria-hidden="true">Preferences</p>
        <button id="command-appearance" type="button" role="option" aria-selected="false" tabindex="-1" data-command="appearance" data-keywords="theme color dark light"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-contrast"></span></span><span>Appearance<small>Theme and display preferences</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="command-shortcuts" type="button" role="option" aria-selected="false" tabindex="-1" data-command="shortcuts" data-keywords="keyboard keys help"><span class="ps-command-icon" aria-hidden="true">⌘</span><span>Keyboard shortcuts<small>Available keyboard commands</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="command-help" type="button" role="option" aria-selected="false" tabindex="-1" data-command="help" data-keywords="support guide help"><span class="ps-command-icon" aria-hidden="true">?</span><span>Help center<small>Find an answer</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
      </div>
    </div><p class="ps-command-empty" data-command-empty hidden>No commands found. Try “file”, “team”, or “theme”.</p>
    <footer class="ps-command-footer"><span data-command-count role="status"></span><span><kbd>↑↓</kbd> move <kbd>↵</kbd> select <kbd>esc</kbd> close</span></footer>
  </dialog>
</div></main>
```

## Variant: Toolbar trigger

A compact search trigger in an application toolbar that opens the palette with issue and navigation commands.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Navigation</p><h1 class="ps-heading">Command menu in an app toolbar</h1><p class="ps-note">A compact search trigger in the toolbar opens the same modal palette.</p></header>

<div data-ps-command-menu class="ps-command-root ps-stack">
  <div class="ps-command-toolbar">
    <strong>Billing service · Issues</strong>
    <button type="button" class="ps-command-launch" data-command-open><span><span class="ps-i ps-i-search" aria-hidden="true"></span> Search or run a command</span><kbd>Ctrl K</kbd></button>
  </div>
  <section class="ps-command-stage" aria-labelledby="issues-title">
    <h2 id="issues-title">Open issues</h2>
    <div class="ps-table-region" role="region" aria-label="Open issues table" tabindex="0"><table class="ps-table"><thead><tr><th scope="col">ID</th><th scope="col">Title</th><th scope="col">Assignee</th></tr></thead><tbody><tr><td>BIL-218</td><td>Proration rounds down on annual upgrades</td><td>Milo Chen</td></tr><tr><td>BIL-214</td><td>Invoice PDF misses VAT number</td><td>Ava Lewis</td></tr><tr><td>BIL-209</td><td>Retry webhook after card update</td><td>Unassigned</td></tr></tbody></table></div>
    <p class="ps-note" data-command-status role="status">Sample tracker · commands emit a local selection.</p>
  </section>
  <dialog class="ps-command-dialog" aria-labelledby="command-title">
    <div class="ps-dialog-heading"><h2 id="command-title">Billing service</h2><button type="button" class="ps-icon-button" data-command-close aria-label="Close command menu">×</button></div>
    <label class="ps-visually-hidden" for="command-query">Search commands</label><div class="ps-command-search"><span class="ps-i ps-i-search" aria-hidden="true"></span><input id="command-query" type="search" placeholder="Search issues and commands" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="command-options"></div>
    <div id="command-options" role="listbox" aria-label="Commands" class="ps-command-options">
      <div role="group" aria-label="Issues" data-command-group><p class="ps-rich-label" aria-hidden="true">Issues</p>
        <button id="command-new" type="button" role="option" aria-selected="false" tabindex="-1" data-command="new-issue" data-keywords="create add bug report"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-up-right"></span></span><span>Create issue<small>New issue in Billing service</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="command-assign" type="button" role="option" aria-selected="false" tabindex="-1" data-command="assign-me" data-keywords="assign owner take mine"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-check"></span></span><span>Assign to me<small>Take the selected issue</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="command-status" type="button" role="option" aria-selected="false" tabindex="-1" data-command="change-status" data-keywords="status progress done close"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-right"></span></span><span>Change status<small>Backlog, in progress, in review or done</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
      </div>
      <div role="group" aria-label="Go to" data-command-group><p class="ps-rich-label" aria-hidden="true">Go to</p>
        <button id="command-inbox" type="button" role="option" aria-selected="false" tabindex="-1" data-command="go-inbox" data-keywords="notifications inbox mentions"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-right"></span></span><span>Inbox<small>Mentions and review requests</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="command-mine" type="button" role="option" aria-selected="false" tabindex="-1" data-command="go-mine" data-keywords="my issues assigned"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-right"></span></span><span>My issues<small>Everything assigned to you</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="command-cycle" type="button" role="option" aria-selected="false" tabindex="-1" data-command="go-cycle" data-keywords="sprint cycle iteration current"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-right"></span></span><span>Current cycle<small>Cycle 42 · ends November 7</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
      </div>
    </div><p class="ps-command-empty" data-command-empty hidden>No commands found. Try “assign”, “status” or “inbox”.</p>
    <footer class="ps-command-footer"><span data-command-count role="status"></span><span class="ps-command-key"><kbd><span class="ps-i ps-i-up" aria-hidden="true"></span><span class="ps-i ps-i-down" aria-hidden="true"></span><span class="ps-visually-hidden">Up and down arrows</span></kbd> move <kbd>Enter</kbd> select <kbd>Esc</kbd> close</span></footer>
  </dialog>
</div></main>
```

## Variant: Record actions

A searchable actions menu scoped to one selected invoice, including a destructive action.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Navigation</p><h1 class="ps-heading">Record actions menu</h1><p class="ps-note">Actions scoped to one selected record, searchable and keyboard driven.</p></header>

<div data-ps-command-menu class="ps-command-root ps-stack">
  <section class="ps-command-record" aria-labelledby="record-title">
    <h2 id="record-title"><span>INV-2041</span>Acme Corporation</h2>
    <button type="button" class="ps-button" data-command-open>Actions <kbd>Ctrl K</kbd></button>
    <dl><div><dt>Amount</dt><dd>$4,820.00</dd></div><div><dt>Due</dt><dd>Oct 14, 2026</dd></div><div><dt>Status</dt><dd>Overdue by 14 days</dd></div></dl>
  </section>
  <p class="ps-note" data-command-status role="status">Sample invoice · actions emit a local selection.</p>
  <dialog class="ps-command-dialog" aria-labelledby="command-title">
    <div class="ps-dialog-heading"><h2 id="command-title">Actions for INV-2041</h2><button type="button" class="ps-icon-button" data-command-close aria-label="Close actions">×</button></div>
    <label class="ps-visually-hidden" for="command-query">Search actions</label><div class="ps-command-search"><span class="ps-i ps-i-search" aria-hidden="true"></span><input id="command-query" type="search" placeholder="Filter actions" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="command-options"></div>
    <div id="command-options" role="listbox" aria-label="Invoice actions" class="ps-command-options">
      <div role="group" aria-label="Collect" data-command-group><p class="ps-rich-label" aria-hidden="true">Collect</p>
        <button id="action-remind" type="button" role="option" aria-selected="false" tabindex="-1" data-command="send-reminder" data-keywords="email remind chase follow up"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-up-right"></span></span><span>Send reminder<small>Email billing@acme.example a payment link</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="action-payment" type="button" role="option" aria-selected="false" tabindex="-1" data-command="record-payment" data-keywords="paid mark payment bank transfer"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-check"></span></span><span>Record payment<small>Mark paid by bank transfer or check</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
      </div>
      <div role="group" aria-label="Document" data-command-group><p class="ps-rich-label" aria-hidden="true">Document</p>
        <button id="action-pdf" type="button" role="option" aria-selected="false" tabindex="-1" data-command="download-pdf" data-keywords="pdf download print export"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-down"></span></span><span>Download PDF<small>Invoice with current VAT details</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="action-duplicate" type="button" role="option" aria-selected="false" tabindex="-1" data-command="duplicate" data-keywords="copy duplicate new"><span class="ps-command-icon" aria-hidden="true"><span class="ps-i ps-i-right"></span></span><span>Duplicate as draft<small>Same lines, new invoice number</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
        <button id="action-void" type="button" role="option" aria-selected="false" tabindex="-1" data-command="void" data-keywords="void cancel delete" class="ps-command-danger"><span class="ps-command-icon" aria-hidden="true">×</span><span>Void invoice<small>Cancels the balance; the number is kept</small></span><span class="ps-command-enter ps-i ps-i-return" aria-hidden="true"></span></button>
      </div>
    </div><p class="ps-command-empty" data-command-empty hidden>No matching actions. Try “remind”, “pdf” or “void”.</p>
    <footer class="ps-command-footer"><span data-command-count role="status"></span><span class="ps-command-key"><kbd><span class="ps-i ps-i-up" aria-hidden="true"></span><span class="ps-i ps-i-down" aria-hidden="true"></span><span class="ps-visually-hidden">Up and down arrows</span></kbd> move <kbd>Enter</kbd> select <kbd>Esc</kbd> close</span></footer>
  </dialog>
</div></main>
```

## Variant: No results

The open palette after a query that matches nothing, with guidance on where that action actually lives.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Navigation</p><h1 class="ps-heading">Command menu with no results</h1><p class="ps-note">The open palette after a query that matches nothing, drawn inline as a static state.</p></header>

<section class="ps-command-root ps-command-dialog ps-command-inline" aria-labelledby="command-title">
  <div class="ps-dialog-heading"><h2 id="command-title">Go anywhere</h2></div>
  <div class="ps-command-search"><span class="ps-i ps-i-search" aria-hidden="true"></span><label class="ps-visually-hidden" for="command-query">Search commands</label><input id="command-query" type="search" value="refund" readonly autocomplete="off"></div>
  <div class="ps-command-empty"><strong>No commands match “refund”.</strong><p>Refunds are issued from an invoice. Open the invoice, then choose Record refund from its actions menu.</p></div>
  <footer class="ps-command-footer"><span>0 commands</span><span class="ps-command-key"><kbd>Esc</kbd> close</span></footer>
</section></main>
```
