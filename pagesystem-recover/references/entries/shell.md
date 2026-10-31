# Page shell (shell)

Kind: component. A shared frame for navigation and content.

Task: Orient the visitor without competing with the page.

Elements: [link](link.md), [text](text.md).

Category: layout.

## content

- Site identity
- Navigation
- Main landmark

## states

- ready
- active navigation

## responsive

- Collapse navigation by wrapping, preserving all destinations.

## checks

- Skip link reaches main.
- One main landmark; logo is not a heading.

## HTML

```html
<a class="ps-skip" href="#main">Skip to content</a><header class="ps-nav"><strong>Northline</strong><nav class="ps-row" aria-label="Primary"><a href="#main" aria-current="page">Overview</a><a href="#notes">Notes</a></nav></header><main id="main" class="ps-stack"><h1 class="ps-heading">Workspace overview</h1><p>Three projects are active and two reviews are due this week.</p><section id="notes" class="ps-stack-tight"><h2 class="ps-subheading">Notes</h2><p class="ps-note">Last updated by Dana Ruiz on October 24.</p></section></main><footer><p class="ps-note">Northline · sample shell</p></footer>
```

## Variant: Side rail

Application frame with grouped side navigation and counts; the rail wraps above the content in a narrow container.

```html
<a class="ps-skip" href="#main">Skip to content</a>
<div class="ps-shell-frame">
  <div class="ps-shell-app">
    <header class="ps-shell-bar"><strong>Northline</strong><span class="ps-note">Sample workspace</span></header>
    <nav class="ps-shell-side" aria-label="Primary">
      <h2 id="nav-work">Work</h2>
      <ul aria-labelledby="nav-work">
        <li><a href="#main" aria-current="page">Projects <span class="ps-shell-count">12</span></a></li>
        <li><a href="#activity">Activity</a></li>
        <li><a href="#reviews">Reviews <span class="ps-shell-count">3</span></a></li>
      </ul>
      <h2 id="nav-workspace">Workspace</h2>
      <ul aria-labelledby="nav-workspace">
        <li><a href="#members">Members</a></li>
        <li><a href="#settings">Settings</a></li>
      </ul>
    </nav>
    <main id="main" class="ps-shell-main" tabindex="-1">
      <div class="ps-stack-tight"><h1 class="ps-heading">Projects</h1><p class="ps-note">Twelve active projects in the sample workspace. The side rail keeps every destination one step away.</p></div>
      <section id="activity" aria-labelledby="activity-title"><h2 id="activity-title">Activity</h2><p class="ps-note">Ava Lewis moved the website relaunch to review on 27 October.</p></section>
      <section id="reviews" aria-labelledby="reviews-title"><h2 id="reviews-title">Reviews</h2><p class="ps-note">Three briefs are waiting for an approver.</p></section>
      <section id="members" aria-labelledby="members-title"><h2 id="members-title">Members</h2><p class="ps-note">Eight people have access to this workspace.</p></section>
      <section id="settings" aria-labelledby="settings-title"><h2 id="settings-title">Settings</h2><p class="ps-note">Workspace name, billing contact and data retention.</p></section>
    </main>
  </div>
</div>
```

## Variant: Docs frame

Documentation frame with top-level navigation, an on-this-page contents list beside the content, and a footer.

```html
<a class="ps-skip" href="#main">Skip to content</a>
<div class="ps-shell-frame">
  <div class="ps-shell-docs">
    <header class="ps-shell-bar"><strong>Northline Docs</strong><nav class="ps-shell-nav" aria-label="Primary"><a href="#main" aria-current="page">Guides</a><a href="#reference">API reference</a><a href="#changelog">Changelog</a></nav></header>
    <nav class="ps-shell-toc" aria-labelledby="toc-title"><h2 id="toc-title">On this page</h2><ol><li><a href="#limits">Default limits</a></li><li><a href="#headers">Response headers</a></li><li><a href="#retry">Retrying requests</a></li></ol></nav>
    <main id="main" class="ps-shell-main" tabindex="-1">
      <div class="ps-stack-tight"><h1 class="ps-heading">Rate limits</h1><p class="ps-note">Sample documentation page inside a shared docs shell.</p></div>
      <section id="limits" aria-labelledby="limits-title"><h2 id="limits-title">Default limits</h2><p>Each API key can make 600 requests per minute. Bulk endpoints count as ten requests.</p></section>
      <section id="headers" aria-labelledby="headers-title"><h2 id="headers-title">Response headers</h2><p>Every response reports the remaining allowance and the time the window resets.</p></section>
      <section id="retry" aria-labelledby="retry-title"><h2 id="retry-title">Retrying requests</h2><p>When a request returns 429, wait until the reset time before retrying.</p></section>
      <section id="reference" aria-labelledby="reference-title"><h2 id="reference-title">API reference</h2><p>Endpoint details live in the reference section of this sample.</p></section>
      <section id="changelog" aria-labelledby="changelog-title"><h2 id="changelog-title">Changelog</h2><p>The limit for bulk endpoints changed on 14 October 2026.</p></section>
    </main>
    <footer class="ps-shell-foot"><p class="ps-note">Northline Docs · sample shell</p><a href="#main">Back to top</a></footer>
  </div>
</div>
```
