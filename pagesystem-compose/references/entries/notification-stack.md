# Notification stack (notification-stack)

Kind: component. Contextual updates, a card at a time, with a way back.

Task: Review, inspect and dismiss notifications while retaining undo.

Elements: [text](text.md), [input](input.md), [button](button.md).

Category: feedback.

Native behavior: notification-stack. It needs pagesystem.js (see ../implementation.md).

## content

- Stable unique notification IDs, source context, title and useful detail.
- Only the front card is interactive or exposed to assistive technology.
- An explicit empty state and repeatable sample reset.

## states

- Front, stacked, expanded detail, dismissed, restored and all caught up.
- Undo reverses the most recent dismissal in original source order.
- Repeated dismissal of an already removed card has no effect.

## responsive

- Cards grow with content; long context does not clip.
- The undo row wraps; targets remain touch sized.

## checks

- Hidden cards are inert and aria-hidden, not just visually covered.
- Dismissal moves focus to the next dismiss control or the replay action.
- No automatic expiry: the user controls removal.
- Pointer changes use a short arrival transition; keyboard and reduced-motion changes are immediate.
- Emit pagesystem:notifications with remaining and dismissed IDs.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Feedback</p><h1 class="ps-heading">Notification stack</h1><p class="ps-note">Review one update at a time, open its context, dismiss it, or bring it back.</p></header>

<section data-ps-notification-stack class="ps-notification-root" aria-label="Sample notifications">
  <div class="ps-rich-toolbar"><span class="ps-rich-label">Your inbox</span><span class="ps-note" data-notice-count></span></div>
  <div class="ps-notice-deck">
    <article data-notice="collection" class="ps-notice-card"><div class="ps-notice-top"><span class="ps-notice-avatar" aria-hidden="true">AL</span><div><strong>Ava Lewis</strong><p>Shared with you · sample</p></div><button type="button" data-notice-dismiss class="ps-icon-button" aria-label="Dismiss shared collection">×</button></div><h2>A collection was shared</h2><p>Ava shared 12 references for the project. Review the collection and its context.</p><div class="ps-notice-attachment"><span class="ps-file-symbol" aria-hidden="true"><span class="ps-i ps-i-folder"></span></span><span>Early directions<small>Collection · 12 references</small></span><span class="ps-i ps-i-up-right" aria-hidden="true"></span></div><details><summary>View context</summary><p>Sample collection from a teammate. A connected app would open the collection; this example only reveals its context.</p></details></article>
    <article data-notice="export" class="ps-notice-card"><div class="ps-notice-top"><span class="ps-notice-avatar ps-avatar-accent" aria-hidden="true"><span class="ps-i ps-i-down"></span></span><div><strong>Export complete</strong><p>Files · sample</p></div><button type="button" data-notice-dismiss class="ps-icon-button" aria-label="Dismiss export update">×</button></div><h2>Reference pack prepared</h2><p>Your collection has been packaged for review. Everything is in one place, with the original filenames intact.</p><div class="ps-notice-attachment"><span class="ps-file-symbol" aria-hidden="true"><span class="ps-i ps-i-package"></span></span><span>Reference pack<small>ZIP archive · sample metadata</small></span></div><details><summary>View context</summary><p>This is a sample notification. No archive was created or downloaded.</p></details></article>
    <article data-notice="welcome" class="ps-notice-card"><div class="ps-notice-top"><span class="ps-notice-avatar ps-avatar-warm" aria-hidden="true">MC</span><div><strong>Milo Chen</strong><p>Team activity · sample</p></div><button type="button" data-notice-dismiss class="ps-icon-button" aria-label="Dismiss teammate update">×</button></div><h2>Milo joined the workspace</h2><p>Milo joined the project workspace. Introductions and useful context make the first day a little easier.</p><div class="ps-notice-attachment"><span class="ps-file-symbol" aria-hidden="true"><span class="ps-i ps-i-users"></span></span><span>Project workspace<small>Member access · sample</small></span></div><details><summary>View context</summary><p>Sample team activity. Dismissing this card does not change anyone’s access.</p></details></article>
  </div>
  <div class="ps-notice-empty" data-notice-empty hidden><span aria-hidden="true"><span class="ps-i ps-i-check"></span></span><h2>All caught up.</h2><p>No sample updates remaining.</p><button type="button" class="ps-button" data-notice-reset>Replay sample</button></div>
  <div class="ps-notice-bottom"><p class="ps-note" data-notice-status role="status"></p><button type="button" class="ps-text-action" data-notice-undo disabled>Undo dismissal</button></div>
</section></main>
```

## Variant: System updates

Build, deploy and usage updates in one stack, each with a status avatar and a reference.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Feedback</p><h1 class="ps-heading">System updates</h1><p class="ps-note">Deploy, build and usage updates in the same stack, each with its status and a reference.</p></header>

<section data-ps-notification-stack class="ps-notification-root" aria-label="Sample system updates">
  <div class="ps-rich-toolbar"><span class="ps-rich-label">Billing service</span><span class="ps-note" data-notice-count></span></div>
  <div class="ps-notice-deck">
    <article data-notice="build" class="ps-notice-card"><div class="ps-notice-top"><span class="ps-notice-avatar ps-notice-avatar-danger" aria-hidden="true">!</span><div><strong>Build failed</strong><p>CI · main · 6 minutes ago</p></div><button type="button" data-notice-dismiss class="ps-icon-button" aria-label="Dismiss failed build">×</button></div><h2>Tests failed on main</h2><p>2 of 418 tests failed in the invoice rounding suite. The last passing commit is still deployed.</p><div class="ps-notice-attachment ps-notice-plain"><span class="ps-file-symbol" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>Commit 4f2a9c1<small><span class="ps-notice-mono">fix: round proration per line</span></small></span></div><details><summary>View failing tests</summary><p>prorates annual upgrade to the cent; rounds credit notes half up. Sample output; no build ran.</p></details></article>
    <article data-notice="deploy" class="ps-notice-card"><div class="ps-notice-top"><span class="ps-notice-avatar ps-avatar-accent" aria-hidden="true"><span class="ps-i ps-i-check"></span></span><div><strong>Deploy finished</strong><p>Production · 41 minutes ago</p></div><button type="button" data-notice-dismiss class="ps-icon-button" aria-label="Dismiss finished deploy">×</button></div><h2>Version 2.31.0 is live</h2><p>Rolled out to all regions in 7 minutes with no failed health checks.</p><div class="ps-notice-attachment ps-notice-plain"><span class="ps-file-symbol" aria-hidden="true"><span class="ps-i ps-i-package"></span></span><span>Release 2.31.0<small>14 changes · 3 contributors</small></span></div><details><summary>View context</summary><p>Sample deploy. Nothing was released.</p></details></article>
    <article data-notice="usage" class="ps-notice-card"><div class="ps-notice-top"><span class="ps-notice-avatar ps-notice-avatar-neutral" aria-hidden="true">80</span><div><strong>Usage</strong><p>Plan limits · today</p></div><button type="button" data-notice-dismiss class="ps-icon-button" aria-label="Dismiss usage update">×</button></div><h2>80% of monthly API calls used</h2><p>At the current rate the limit is reached on November 4. Requests over the limit return 429 until the cycle resets.</p><details><summary>View context</summary><p>Sample usage: 4.0 million of 5 million calls.</p></details></article>
  </div>
  <div class="ps-notice-empty" data-notice-empty hidden><span aria-hidden="true"><span class="ps-i ps-i-check"></span></span><h2>No open updates.</h2><p>Deploys, builds and usage are quiet.</p><button type="button" class="ps-button" data-notice-reset>Replay sample</button></div>
  <div class="ps-notice-bottom"><p class="ps-note" data-notice-status role="status"></p><button type="button" class="ps-text-action" data-notice-undo disabled>Undo dismissal</button></div>
</section></main>
```

## Variant: Single update

One notification with no stack behind it; dismissing it shows the empty state and undo restores it.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Feedback</p><h1 class="ps-heading">Single notification</h1><p class="ps-note">One update with no stack behind it; dismissing it shows the empty state, and undo brings it back.</p></header>

<section data-ps-notification-stack class="ps-notification-root" aria-label="Sample notification">
  <div class="ps-rich-toolbar"><span class="ps-rich-label">Payments</span><span class="ps-note" data-notice-count></span></div>
  <div class="ps-notice-deck">
    <article data-notice="paid" class="ps-notice-card"><div class="ps-notice-top"><span class="ps-notice-avatar ps-avatar-accent" aria-hidden="true"><span class="ps-i ps-i-check"></span></span><div><strong>Payment received</strong><p>Invoices · 12 minutes ago</p></div><button type="button" data-notice-dismiss class="ps-icon-button" aria-label="Dismiss payment update">×</button></div><h2>Acme Corporation paid INV-2041</h2><p>$4,820.00 arrived by bank transfer, 14&nbsp;days after the due date. The invoice is marked paid and the reminder schedule has stopped.</p><div class="ps-notice-attachment ps-notice-plain"><span class="ps-file-symbol" aria-hidden="true"><span class="ps-i ps-i-file"></span></span><span>INV-2041<small>Paid · Oct 28, 2026</small></span></div><details><summary>View context</summary><p>Sample payment. No money moved.</p></details></article>
  </div>
  <div class="ps-notice-empty" data-notice-empty hidden><span aria-hidden="true"><span class="ps-i ps-i-check"></span></span><h2>All caught up.</h2><p>No payment updates remaining.</p><button type="button" class="ps-button" data-notice-reset>Replay sample</button></div>
  <div class="ps-notice-bottom"><p class="ps-note" data-notice-status role="status"></p><button type="button" class="ps-text-action" data-notice-undo disabled>Undo dismissal</button></div>
</section></main>
```

## Variant: Caught up

The empty inbox after everything is read, with earlier updates still listed and reachable.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Feedback</p><h1 class="ps-heading">All caught up</h1><p class="ps-note">The empty inbox, with earlier updates still reachable. A static state.</p></header>

<section class="ps-notification-root ps-stack" aria-labelledby="inbox-title">
  <div class="ps-rich-toolbar"><h2 class="ps-rich-label" id="inbox-title">Your inbox</h2><span class="ps-note">0 updates</span></div>
  <div class="ps-notice-empty"><span aria-hidden="true"><span class="ps-i ps-i-check"></span></span><h3 class="ps-heading">All caught up.</h3><p>You have read all 14 updates from this week.</p><a href="#earlier">See earlier updates</a></div>
  <section id="earlier" class="ps-notice-history" aria-labelledby="earlier-title">
    <h3 id="earlier-title">Earlier this week</h3>
    <ul>
      <li><span class="ps-notice-avatar" aria-hidden="true">AL</span><div>Ava Lewis shared Early directions<p>Collection · 12 references</p></div><time datetime="2026-10-27T16:05">Mon 4:05 PM</time></li>
      <li><span class="ps-notice-avatar ps-avatar-accent" aria-hidden="true"><span class="ps-i ps-i-check"></span></span><div>Version 2.31.0 is live<p>Production deploy</p></div><time datetime="2026-10-27T11:40">Mon 11:40 AM</time></li>
      <li><span class="ps-notice-avatar ps-avatar-warm" aria-hidden="true">MC</span><div>Milo Chen joined the workspace<p>Member access</p></div><time datetime="2026-10-26T09:12">Sun 9:12 AM</time></li>
    </ul>
  </section>
</section></main>
```
