# Source connections (source-connections)

Kind: component. A connection map with source activity, resumable sync and recovery controls.

Task: Inspect source readiness, recover interrupted connections and understand combined coverage.

Elements: [button](button.md), [text](text.md), [badge](badge.md).

Category: workflow.

Native behavior: source-connections. It needs pagesystem.js (see ../implementation.md).

## content

- Source identity and category color
- Connection state and progress
- Activity history and sample contribution weights
- An explicit description of demo behavior

## states

- connected
- disconnected
- syncing
- paused
- authorization expired

## responsive

- The source grid uses three columns when space allows and two in narrow containers.
- The inspector and controls wrap without hiding source state.
- The diagram remains supplementary to textual status and native controls.

## checks

- Source cards and diagram reflect the same state.
- Pause and resume preserve progress; disconnect prevents stale ticks from reconnecting a source.
- Only connected sources contribute coverage and event rate.
- Reset and unmount cancel active demo timers.
- Source selection works with keyboard and status does not depend on color.
- No network or account connections are made.
- Coverage reads as unit cells backed by a native progress value for assistive technology.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Connections</p><h1 class="ps-heading">Source connections</h1><p class="ps-note">Inspect a source, resume a sync, recover a connection or disconnect it.</p></header>
<section class="ps-connections" data-ps-source-connections aria-label="Source connections demo">
<header class="ps-connections-header"><div class="ps-connection-heading"><span class="ps-connection-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3v4m6-4v4M7 7h10v4a5 5 0 0 1-10 0V7Zm5 9v5"/></svg></span><div><h2>Sources</h2><p>Connect your stack</p></div></div><span class="ps-connection-count" data-connection-count>2 of 6 connected</span></header>
<div class="ps-connection-scene"><svg viewBox="0 0 600 176" class="ps-connection-diagram" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><g data-source-port="identity" data-status="connected" class="ps-port ps-source-identity"><path class="ps-link" d="M50 46 C50 96 300 86 300 128" /><circle class="ps-node" cx="50" cy="38" r="7" /><text class="ps-port-label" x="50" y="16" text-anchor="middle">Identity</text></g><g data-source-port="endpoint" data-status="connected" class="ps-port ps-source-endpoint"><path class="ps-link" d="M150 46 C150 96 300 86 300 128" /><circle class="ps-node" cx="150" cy="38" r="7" /><text class="ps-port-label" x="150" y="16" text-anchor="middle">Endpoint</text></g><g data-source-port="cloud" data-status="paused" class="ps-port ps-source-cloud"><path class="ps-link" d="M250 46 C250 96 300 86 300 128" /><circle class="ps-node" cx="250" cy="38" r="7" /><text class="ps-port-label" x="250" y="16" text-anchor="middle">Cloud</text></g><g data-source-port="email" data-status="disconnected" class="ps-port ps-source-email"><path class="ps-link" d="M350 46 C350 96 300 86 300 128" /><circle class="ps-node" cx="350" cy="38" r="7" /><text class="ps-port-label" x="350" y="16" text-anchor="middle">Email</text></g><g data-source-port="network" data-status="disconnected" class="ps-port ps-source-network"><path class="ps-link" d="M450 46 C450 96 300 86 300 128" /><circle class="ps-node" cx="450" cy="38" r="7" /><text class="ps-port-label" x="450" y="16" text-anchor="middle">Network</text></g><g data-source-port="saas" data-status="error" class="ps-port ps-source-saas"><path class="ps-link" d="M550 46 C550 96 300 86 300 128" /><circle class="ps-node" cx="550" cy="38" r="7" /><text class="ps-port-label" x="550" y="16" text-anchor="middle">SaaS</text></g><rect class="ps-hub" x="230" y="128" width="140" height="36" rx="8" /><text class="ps-hub-label" x="300" y="151" text-anchor="middle">Workspace</text></svg><div class="ps-scene-caption"><span>Source map</span><span data-connection-rate>8,000 events / day</span></div></div>
<div class="ps-source-grid">
<button type="button" class="ps-source-card ps-source-identity" data-source="identity" data-status="connected" data-progress="100" data-weight="24" data-rate="4100" data-history="6,8,9,14,23,39,64,89,76,65,58,42,35,32,25,17,12,9,8,6" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Identity</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Connected</span></button>
<button type="button" class="ps-source-card ps-source-endpoint" data-source="endpoint" data-status="connected" data-progress="100" data-weight="21" data-rate="3900" data-history="23,25,19,31,24,39,51,63,69,79,65,72,81,73,65,50,40,34,28,18" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Endpoint</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Connected</span></button>
<button type="button" class="ps-source-card ps-source-cloud" data-source="cloud" data-status="paused" data-progress="64" data-weight="18" data-rate="2460" data-history="6,7,7,8,7,8,7,9,8,9,10,12,22,48,71,88,74,55,31,14" aria-pressed="true"><span class="ps-source-name"><i></i><strong>Cloud</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Sync paused · 64%</span></button>
<button type="button" class="ps-source-card ps-source-email" data-source="email" data-status="disconnected" data-progress="0" data-weight="12" data-rate="1840" data-history="5,6,8,10,17,29,55,65,72,59,81,62,43,28,19,10,8,7,6,5" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Email</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Not connected</span></button>
<button type="button" class="ps-source-card ps-source-network" data-source="network" data-status="disconnected" data-progress="0" data-weight="14" data-rate="2680" data-history="41,73,79,51,34,22,18,16,13,11,11,12,13,14,13,12,12,14,13,19" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Network</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Not connected</span></button>
<button type="button" class="ps-source-card ps-source-saas" data-source="saas" data-status="error" data-progress="0" data-weight="11" data-rate="1120" data-history="7,8,10,12,16,21,31,54,77,82,79,67,52,33,24,19,12,10,8,6" aria-pressed="false"><span class="ps-source-name"><i></i><strong>SaaS</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Authorization expired</span></button>
</div>
<div class="ps-source-inspector"><div><h3 data-connection-title>Cloud</h3><p data-connection-detail>Backfill paused at 64%. Resume to finish importing the sample history.</p></div><div class="ps-connection-actions"><button type="button" class="ps-button" data-connection-disconnect>Disconnect</button><button type="button" class="ps-button ps-button-primary" data-connection-action>Resume sync</button></div></div>
<footer class="ps-connection-footer"><div class="ps-coverage"><span>Coverage</span><progress data-connection-coverage max="100" value="45" aria-label="Sample source coverage"></progress><strong data-connection-percent>45%</strong></div><div class="ps-connection-actions"><button type="button" class="ps-text-action" data-connection-replay hidden>Replay</button><button type="button" class="ps-text-action" data-connection-reset>Reset demo</button></div></footer>
<p class="ps-connection-disclosure">Interactive sample. Coverage uses sample source weights; no accounts are connected.</p>
<p class="ps-visually-hidden" data-connection-announcement role="status"></p>
</section></main>
```

## Variant: First run

A new workspace with all six sources disconnected and zero coverage, where each source is connected from its card.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Connections</p><h1 class="ps-heading">Source connections before setup</h1><p class="ps-note">A new workspace with nothing connected yet. Coverage starts at zero and each source can be connected from its card.</p></header>
<section class="ps-connections" data-ps-source-connections aria-label="Source connections, first run">
<header class="ps-connections-header"><div class="ps-connection-heading"><span class="ps-connection-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3v4m6-4v4M7 7h10v4a5 5 0 0 1-10 0V7Zm5 9v5"/></svg></span><div><h2>Sources</h2><p>Nothing connected yet</p></div></div><span class="ps-connection-count" data-connection-count>0 of 6 connected</span></header>
<div class="ps-connection-scene"><svg viewBox="0 0 600 176" class="ps-connection-diagram" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><g data-source-port="identity" data-status="disconnected" class="ps-port ps-source-identity"><path class="ps-link" d="M50 46 C50 96 300 86 300 128" /><circle class="ps-node" cx="50" cy="38" r="7" /><text class="ps-port-label" x="50" y="16" text-anchor="middle">Identity</text></g><g data-source-port="endpoint" data-status="disconnected" class="ps-port ps-source-endpoint"><path class="ps-link" d="M150 46 C150 96 300 86 300 128" /><circle class="ps-node" cx="150" cy="38" r="7" /><text class="ps-port-label" x="150" y="16" text-anchor="middle">Endpoint</text></g><g data-source-port="cloud" data-status="disconnected" class="ps-port ps-source-cloud"><path class="ps-link" d="M250 46 C250 96 300 86 300 128" /><circle class="ps-node" cx="250" cy="38" r="7" /><text class="ps-port-label" x="250" y="16" text-anchor="middle">Cloud</text></g><g data-source-port="email" data-status="disconnected" class="ps-port ps-source-email"><path class="ps-link" d="M350 46 C350 96 300 86 300 128" /><circle class="ps-node" cx="350" cy="38" r="7" /><text class="ps-port-label" x="350" y="16" text-anchor="middle">Email</text></g><g data-source-port="network" data-status="disconnected" class="ps-port ps-source-network"><path class="ps-link" d="M450 46 C450 96 300 86 300 128" /><circle class="ps-node" cx="450" cy="38" r="7" /><text class="ps-port-label" x="450" y="16" text-anchor="middle">Network</text></g><g data-source-port="saas" data-status="disconnected" class="ps-port ps-source-saas"><path class="ps-link" d="M550 46 C550 96 300 86 300 128" /><circle class="ps-node" cx="550" cy="38" r="7" /><text class="ps-port-label" x="550" y="16" text-anchor="middle">SaaS</text></g><rect class="ps-hub" x="230" y="128" width="140" height="36" rx="8" /><text class="ps-hub-label" x="300" y="151" text-anchor="middle">Workspace</text></svg><div class="ps-scene-caption"><span>Source map</span><span data-connection-rate>0 events / day</span></div></div>
<div class="ps-source-grid">
<button type="button" class="ps-source-card ps-source-identity" data-source="identity" data-status="disconnected" data-progress="0" data-weight="24" data-rate="4100" data-history="6,8,9,14,23,39,64,89,76,65,58,42,35,32,25,17,12,9,8,6" aria-pressed="true"><span class="ps-source-name"><i></i><strong>Identity</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Not connected</span></button>
<button type="button" class="ps-source-card ps-source-endpoint" data-source="endpoint" data-status="disconnected" data-progress="0" data-weight="21" data-rate="3900" data-history="23,25,19,31,24,39,51,63,69,79,65,72,81,73,65,50,40,34,28,18" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Endpoint</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Not connected</span></button>
<button type="button" class="ps-source-card ps-source-cloud" data-source="cloud" data-status="disconnected" data-progress="0" data-weight="18" data-rate="2460" data-history="6,7,7,8,7,8,7,9,8,9,10,12,22,48,71,88,74,55,31,14" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Cloud</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Not connected</span></button>
<button type="button" class="ps-source-card ps-source-email" data-source="email" data-status="disconnected" data-progress="0" data-weight="12" data-rate="1840" data-history="5,6,8,10,17,29,55,65,72,59,81,62,43,28,19,10,8,7,6,5" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Email</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Not connected</span></button>
<button type="button" class="ps-source-card ps-source-network" data-source="network" data-status="disconnected" data-progress="0" data-weight="14" data-rate="2680" data-history="41,73,79,51,34,22,18,16,13,11,11,12,13,14,13,12,12,14,13,19" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Network</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Not connected</span></button>
<button type="button" class="ps-source-card ps-source-saas" data-source="saas" data-status="disconnected" data-progress="0" data-weight="11" data-rate="1120" data-history="7,8,10,12,16,21,31,54,77,82,79,67,52,33,24,19,12,10,8,6" aria-pressed="false"><span class="ps-source-name"><i></i><strong>SaaS</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Not connected</span></button>
</div>
<div class="ps-source-inspector"><div><h3 data-connection-title>Identity</h3><p data-connection-detail>Connect this sample source to include its events and extend coverage.</p></div><div class="ps-connection-actions"><button type="button" class="ps-button" data-connection-disconnect>Disconnect</button><button type="button" class="ps-button ps-button-primary" data-connection-action>Connect source</button></div></div>
<footer class="ps-connection-footer"><div class="ps-coverage"><span>Coverage</span><progress data-connection-coverage max="100" value="0" aria-label="Sample source coverage"></progress><strong data-connection-percent>0%</strong></div><div class="ps-connection-actions"><button type="button" class="ps-text-action" data-connection-replay hidden>Replay</button><button type="button" class="ps-text-action" data-connection-reset>Reset demo</button></div></footer>
<p class="ps-connection-disclosure">Interactive sample. Start with the highest-weight source; no accounts are connected.</p>
<p class="ps-visually-hidden" data-connection-announcement role="status"></p>
</section></main>
```

## Variant: Needs attention

Two expired authorizations and a paused backfill, with only the three healthy sources counted in coverage.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Connections</p><h1 class="ps-heading">Sources that need attention</h1><p class="ps-note">Two authorizations have expired and one backfill is paused. Only the three healthy sources count toward coverage.</p></header>
<section class="ps-connections" data-ps-source-connections aria-label="Source connections needing attention">
<header class="ps-connections-header"><div class="ps-connection-heading"><span class="ps-connection-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3v4m6-4v4M7 7h10v4a5 5 0 0 1-10 0V7Zm5 9v5"/></svg></span><div><h2>Sources</h2><p>3 sources need attention</p></div></div><span class="ps-connection-count" data-connection-count>3 of 6 connected</span></header>
<div class="ps-connection-scene"><svg viewBox="0 0 600 176" class="ps-connection-diagram" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><g data-source-port="identity" data-status="connected" class="ps-port ps-source-identity"><path class="ps-link" d="M50 46 C50 96 300 86 300 128" /><circle class="ps-node" cx="50" cy="38" r="7" /><text class="ps-port-label" x="50" y="16" text-anchor="middle">Identity</text></g><g data-source-port="endpoint" data-status="connected" class="ps-port ps-source-endpoint"><path class="ps-link" d="M150 46 C150 96 300 86 300 128" /><circle class="ps-node" cx="150" cy="38" r="7" /><text class="ps-port-label" x="150" y="16" text-anchor="middle">Endpoint</text></g><g data-source-port="cloud" data-status="paused" class="ps-port ps-source-cloud"><path class="ps-link" d="M250 46 C250 96 300 86 300 128" /><circle class="ps-node" cx="250" cy="38" r="7" /><text class="ps-port-label" x="250" y="16" text-anchor="middle">Cloud</text></g><g data-source-port="email" data-status="error" class="ps-port ps-source-email"><path class="ps-link" d="M350 46 C350 96 300 86 300 128" /><circle class="ps-node" cx="350" cy="38" r="7" /><text class="ps-port-label" x="350" y="16" text-anchor="middle">Email</text></g><g data-source-port="network" data-status="connected" class="ps-port ps-source-network"><path class="ps-link" d="M450 46 C450 96 300 86 300 128" /><circle class="ps-node" cx="450" cy="38" r="7" /><text class="ps-port-label" x="450" y="16" text-anchor="middle">Network</text></g><g data-source-port="saas" data-status="error" class="ps-port ps-source-saas"><path class="ps-link" d="M550 46 C550 96 300 86 300 128" /><circle class="ps-node" cx="550" cy="38" r="7" /><text class="ps-port-label" x="550" y="16" text-anchor="middle">SaaS</text></g><rect class="ps-hub" x="230" y="128" width="140" height="36" rx="8" /><text class="ps-hub-label" x="300" y="151" text-anchor="middle">Workspace</text></svg><div class="ps-scene-caption"><span>Source map</span><span data-connection-rate>10,680 events / day</span></div></div>
<div class="ps-source-grid">
<button type="button" class="ps-source-card ps-source-identity" data-source="identity" data-status="connected" data-progress="100" data-weight="24" data-rate="4100" data-history="6,8,9,14,23,39,64,89,76,65,58,42,35,32,25,17,12,9,8,6" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Identity</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Connected</span></button>
<button type="button" class="ps-source-card ps-source-endpoint" data-source="endpoint" data-status="connected" data-progress="100" data-weight="21" data-rate="3900" data-history="23,25,19,31,24,39,51,63,69,79,65,72,81,73,65,50,40,34,28,18" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Endpoint</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Connected</span></button>
<button type="button" class="ps-source-card ps-source-cloud" data-source="cloud" data-status="paused" data-progress="64" data-weight="18" data-rate="2460" data-history="6,7,7,8,7,8,7,9,8,9,10,12,22,48,71,88,74,55,31,14" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Cloud</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Sync paused · 64%</span></button>
<button type="button" class="ps-source-card ps-source-email" data-source="email" data-status="error" data-progress="0" data-weight="12" data-rate="1840" data-history="5,6,8,10,17,29,55,65,72,59,81,62,43,28,19,10,8,7,6,5" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Email</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Authorization expired</span></button>
<button type="button" class="ps-source-card ps-source-network" data-source="network" data-status="connected" data-progress="100" data-weight="14" data-rate="2680" data-history="41,73,79,51,34,22,18,16,13,11,11,12,13,14,13,12,12,14,13,19" aria-pressed="false"><span class="ps-source-name"><i></i><strong>Network</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Connected</span></button>
<button type="button" class="ps-source-card ps-source-saas" data-source="saas" data-status="error" data-progress="0" data-weight="11" data-rate="1120" data-history="7,8,10,12,16,21,31,54,77,82,79,67,52,33,24,19,12,10,8,6" aria-pressed="true"><span class="ps-source-name"><i></i><strong>SaaS</strong><span data-source-indicator aria-hidden="true"></span></span><svg class="ps-source-chart" viewBox="0 0 160 48" aria-hidden="true"></svg><span class="ps-source-meta" data-source-status>Authorization expired</span></button>
</div>
<div class="ps-source-inspector"><div><h3 data-connection-title>SaaS</h3><p data-connection-detail>Authorization expired. Reconnect to restore access to this sample source.</p></div><div class="ps-connection-actions"><button type="button" class="ps-button" data-connection-disconnect>Disconnect</button><button type="button" class="ps-button ps-button-primary" data-connection-action>Reconnect</button></div></div>
<footer class="ps-connection-footer"><div class="ps-coverage"><span>Coverage</span><progress data-connection-coverage max="100" value="59" aria-label="Sample source coverage"></progress><strong data-connection-percent>59%</strong></div><div class="ps-connection-actions"><button type="button" class="ps-text-action" data-connection-replay hidden>Replay</button><button type="button" class="ps-text-action" data-connection-reset>Reset demo</button></div></footer>
<p class="ps-connection-disclosure">Interactive sample. Expired sources stop contributing until reconnected; no accounts are connected.</p>
<p class="ps-visually-hidden" data-connection-announcement role="status"></p>
</section></main>
```

## Variant: Compact list

The six sources as divided rows for a narrow settings panel, with status in words and only the action each row needs.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Connections</p><h1 class="ps-heading">Source list for a settings panel</h1><p class="ps-note">The same six sources as a compact list for a narrow settings panel, without the map or activity charts. Each row states its status in words and offers only the action it needs. Static state.</p></header>
<section class="ps-connections ps-source-list-panel" aria-labelledby="list-sources-title">
<header class="ps-source-list-header"><div><h2 id="list-sources-title">Sources</h2><p>3 of 6 connected · 9,840 events / day</p></div></header>
<div class="ps-source-list-coverage"><div class="ps-coverage"><span>Coverage</span><progress max="100" value="57" aria-label="Sample source coverage"></progress><strong>57%</strong></div></div>
<ul class="ps-source-rows">
<li class="ps-source-identity" data-status="connected"><i aria-hidden="true"></i><span class="ps-source-row-text"><strong>Identity</strong><span>Connected · 4,100 events / day</span></span></li>
<li class="ps-source-endpoint" data-status="connected"><i aria-hidden="true"></i><span class="ps-source-row-text"><strong>Endpoint</strong><span>Connected · 3,900 events / day</span></span></li>
<li class="ps-source-cloud" data-status="paused"><i aria-hidden="true"></i><span class="ps-source-row-text"><strong>Cloud</strong><span>Sync paused at 64%</span></span><button type="button" class="ps-text-action">Resume<span class="ps-visually-hidden"> Cloud sync</span></button></li>
<li class="ps-source-email" data-status="connected"><i aria-hidden="true"></i><span class="ps-source-row-text"><strong>Email</strong><span>Connected · 1,840 events / day</span></span></li>
<li class="ps-source-network" data-status="disconnected"><i aria-hidden="true"></i><span class="ps-source-row-text"><strong>Network</strong><span>Not connected</span></span><button type="button" class="ps-text-action">Connect<span class="ps-visually-hidden"> Network</span></button></li>
<li class="ps-source-saas" data-status="error"><i aria-hidden="true"></i><span class="ps-source-row-text"><strong>SaaS</strong><span>Authorization expired on October&nbsp;24</span></span><button type="button" class="ps-text-action">Reconnect<span class="ps-visually-hidden"> SaaS</span></button></li>
</ul>
<p class="ps-connection-disclosure">Sample sources and weights. No accounts are connected.</p>
</section></main>
```
