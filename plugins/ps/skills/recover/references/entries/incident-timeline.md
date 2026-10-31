# Incident timeline (incident-timeline)

Kind: component. Inspect chronological evidence, confirm containment, and close a sample incident.

Task: Inspect chronological evidence, confirm containment, and close a sample incident.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: workflow.

Native behavior: incident-timeline. It needs pagesystem.js (see ../implementation.md).

## content

- Labeled synthetic records and task-specific controls.
- Each evidence row expands to show severity and the rule that flagged it, where it sits in the case window, its link to the previous evidence, the analyst note and the raw event.

## states

- investigating
- confirmation
- contained
- closed
- reset
- evidence detail open
- evidence detail closed

## responsive

- Wrap controls and preserve reading order at narrow widths.
- Keep essential labels and keyboard targets at enlarged text sizes.

## checks

- Confirm before containment; closing requires containment.
- Evidence selection updates a readable detail region and opens that row's detail card; rows carry aria-expanded and aria-controls, Escape closes the card and focus stays on the row, and replay still runs.
- Escape cancels confirmation and returns focus.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Incident timeline</h1><p class="ps-note">Review a chain of evidence, contain a sample session, and close the case.</p></header>
<section class="ps-instrument" data-ps-incident-timeline aria-label="Sample incident"><header class="ps-instrument-header"><div><h2>Case 2041</h2><p>Sample security investigation</p></div><span class="ps-case-label" data-case-status>Investigating</span></header><div class="ps-instrument-body">
<div class="ps-process-track" aria-label="Case progress"><span data-case-phase>Triage</span><span data-case-phase>Investigate</span><span data-case-phase>Contain</span><span data-case-phase>Close</span></div>
<div class="ps-case-verdict"><p class="ps-note">Working assessment</p><h3>Account takeover after a phishing click</h3><p class="ps-note">Five linked events · 12 minute window</p></div>
<div class="ps-evidence-list" data-case-events role="group" aria-label="Inspect evidence"></div><div class="ps-data-readout" data-case-evidence aria-live="polite"></div><p class="ps-workflow-status" data-case-message role="status"></p>
<div hidden data-case-records>
<dl data-case-record data-severity="Medium" data-score="52" data-rule="EML-031" data-rule-name="Link to a domain registered in the last 7 days" data-note="The sender domain was two days old. The mail filter scored the message as marketing, not phishing."><div><dt>event</dt><dd>email.link_click</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>host</dt><dd>WS-FIN-022</dd></div><div><dt>process</dt><dd>chrome.exe · pid 4412</dd></div><div><dt>sender</dt><dd>billing@inv0ice-review.sample</dd></div><div><dt>url</dt><dd>hxxps://inv0ice-review.sample/login</dd></div></dl>
<dl data-case-record data-severity="High" data-score="76" data-rule="IDN-207" data-rule-name="Push approved from a network never seen for this user" data-note="The user says they approved a prompt to make repeated requests stop."><div><dt>event</dt><dd>mfa.push.approve</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>ip</dt><dd>198.51.100.23</dd></div><div><dt>geo</dt><dd>Columbus, OH, US</dd></div><div><dt>factor</dt><dd>push · enrolled phone</dd></div></dl>
<dl data-case-record data-severity="High" data-score="81" data-rule="IDN-118" data-rule-name="Sign-in from a device with no trust record"><div><dt>event</dt><dd>session.create</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>ip</dt><dd>198.51.100.23</dd></div><div><dt>device</dt><dd>Linux · Firefox 131</dd></div><div><dt>trusted</dt><dd>false</dd></div><div><dt>session</dt><dd>ses_7Hq2Lw9c</dd></div></dl>
<dl data-case-record data-severity="Critical" data-score="94" data-rule="CLD-044" data-rule-name="Long-lived key created outside a change window" data-note="No change ticket references this key. Disable it together with the session."><div><dt>event</dt><dd>iam.create_access_key</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>ip</dt><dd>198.51.100.23</dd></div><div><dt>session</dt><dd>ses_7Hq2Lw9c</dd></div><div><dt>account</dt><dd>prod-482910</dd></div><div><dt>key_id</dt><dd>AKIASAMPLE7Q2X</dd></div></dl>
<dl data-case-record data-severity="High" data-score="72" data-rule="EDR-310" data-rule-name="Bulk archive download from a session under 15 minutes old" data-note="Checking the archive contents with the file owner."><div><dt>event</dt><dd>file.download</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>ip</dt><dd>198.51.100.23</dd></div><div><dt>session</dt><dd>ses_7Hq2Lw9c</dd></div><div><dt>host</dt><dd>ext-198-51-100-23</dd></div><div><dt>process</dt><dd>curl 8.4.0</dd></div><div><dt>file</dt><dd>q3-campaign-assets.zip · 2.1 GB</dd></div><div><dt>sha256</dt><dd>4b1d0c7e9a26f3c85e0d17b2a9c4f6e81d3b5a7c9e0f2a4c6e8b0d2f4a6c8e0b</dd></div></dl>
</div>
<div class="ps-workflow-actions"><button type="button" class="ps-replay" data-case-replay hidden><span class="ps-i ps-i-replay" aria-hidden="true"></span>Replay timeline</button><button type="button" class="ps-button" data-case-reset>Reset case</button><button type="button" class="ps-button ps-button-primary" data-case-action>Contain sample account</button></div></div>
<dialog class="ps-workflow-dialog" aria-labelledby="case-confirm-title"><h3 id="case-confirm-title">Contain this sample session?</h3><p>This changes only the demo case. A connected implementation would revoke the affected session before closing the case.</p><div class="ps-workflow-actions"><button type="button" class="ps-button" data-case-cancel autofocus>Keep investigating</button><button type="button" class="ps-button ps-button-primary" data-case-confirm>Confirm containment</button></div></dialog></section></main>
```

## Variant: Side panel

The live case in a narrow responder panel, with evidence, confirmed containment and closing all working.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Incident timeline in a side panel</h1><p class="ps-note">The live case in a narrow responder panel beside an alert queue. Evidence, containment and closing work as in the full view.</p></header>
<section class="ps-instrument ps-case-panel" data-ps-incident-timeline data-density="compact" aria-label="Sample incident in a side panel"><header class="ps-instrument-header"><div><h2>Case 2041</h2><p>Sample security investigation</p></div><span class="ps-case-label" data-case-status>Investigating</span></header><div class="ps-instrument-body">
<div class="ps-process-track" aria-label="Case progress"><span data-case-phase>Triage</span><span data-case-phase>Investigate</span><span data-case-phase>Contain</span><span data-case-phase>Close</span></div>
<div class="ps-case-verdict"><p class="ps-note">Working assessment</p><h3>Account takeover after a phishing click</h3><p class="ps-note">Five linked events · 12 minute window</p></div>
<div class="ps-evidence-list" data-case-events role="group" aria-label="Inspect evidence"></div><div class="ps-data-readout" data-case-evidence aria-live="polite"></div><p class="ps-workflow-status" data-case-message role="status"></p>
<div hidden data-case-records>
<dl data-case-record data-severity="Medium" data-score="52" data-rule="EML-031" data-rule-name="Link to a domain registered in the last 7 days" data-note="The sender domain was two days old. The mail filter scored the message as marketing, not phishing."><div><dt>event</dt><dd>email.link_click</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>host</dt><dd>WS-FIN-022</dd></div><div><dt>process</dt><dd>chrome.exe · pid 4412</dd></div><div><dt>sender</dt><dd>billing@inv0ice-review.sample</dd></div><div><dt>url</dt><dd>hxxps://inv0ice-review.sample/login</dd></div></dl>
<dl data-case-record data-severity="High" data-score="76" data-rule="IDN-207" data-rule-name="Push approved from a network never seen for this user" data-note="The user says they approved a prompt to make repeated requests stop."><div><dt>event</dt><dd>mfa.push.approve</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>ip</dt><dd>198.51.100.23</dd></div><div><dt>geo</dt><dd>Columbus, OH, US</dd></div><div><dt>factor</dt><dd>push · enrolled phone</dd></div></dl>
<dl data-case-record data-severity="High" data-score="81" data-rule="IDN-118" data-rule-name="Sign-in from a device with no trust record"><div><dt>event</dt><dd>session.create</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>ip</dt><dd>198.51.100.23</dd></div><div><dt>device</dt><dd>Linux · Firefox 131</dd></div><div><dt>trusted</dt><dd>false</dd></div><div><dt>session</dt><dd>ses_7Hq2Lw9c</dd></div></dl>
<dl data-case-record data-severity="Critical" data-score="94" data-rule="CLD-044" data-rule-name="Long-lived key created outside a change window" data-note="No change ticket references this key. Disable it together with the session."><div><dt>event</dt><dd>iam.create_access_key</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>ip</dt><dd>198.51.100.23</dd></div><div><dt>session</dt><dd>ses_7Hq2Lw9c</dd></div><div><dt>account</dt><dd>prod-482910</dd></div><div><dt>key_id</dt><dd>AKIASAMPLE7Q2X</dd></div></dl>
<dl data-case-record data-severity="High" data-score="72" data-rule="EDR-310" data-rule-name="Bulk archive download from a session under 15 minutes old" data-note="Checking the archive contents with the file owner."><div><dt>event</dt><dd>file.download</dd></div><div><dt>user</dt><dd>d.okafor@sample.test</dd></div><div><dt>ip</dt><dd>198.51.100.23</dd></div><div><dt>session</dt><dd>ses_7Hq2Lw9c</dd></div><div><dt>host</dt><dd>ext-198-51-100-23</dd></div><div><dt>process</dt><dd>curl 8.4.0</dd></div><div><dt>file</dt><dd>q3-campaign-assets.zip · 2.1 GB</dd></div><div><dt>sha256</dt><dd>4b1d0c7e9a26f3c85e0d17b2a9c4f6e81d3b5a7c9e0f2a4c6e8b0d2f4a6c8e0b</dd></div></dl>
</div>
<div class="ps-workflow-actions"><button type="button" class="ps-replay" data-case-replay hidden><span class="ps-i ps-i-replay" aria-hidden="true"></span>Replay timeline</button><button type="button" class="ps-button" data-case-reset>Reset case</button><button type="button" class="ps-button ps-button-primary" data-case-action>Contain sample account</button></div></div>
<dialog class="ps-workflow-dialog" aria-labelledby="panel-confirm-title"><h3 id="panel-confirm-title">Contain this sample session?</h3><p>This changes only the demo case. A connected implementation would revoke the affected session before closing the case.</p><div class="ps-workflow-actions"><button type="button" class="ps-button" data-case-cancel autofocus>Keep investigating</button><button type="button" class="ps-button ps-button-primary" data-case-confirm>Confirm containment</button></div></dialog></section></main>
```

## Variant: Contained

Containment confirmed and the revoking event in the evidence, with a required resolution note before the case can close.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Contained, ready to close</h1><p class="ps-note">Containment is confirmed. Closing asks for a short resolution note so the record explains what was done. Static state.</p></header>
<section class="ps-instrument" aria-label="Sample contained incident"><header class="ps-instrument-header"><div><h2>Case 2041</h2><p>Sample security investigation</p></div><span class="ps-case-label">Contained</span></header><div class="ps-instrument-body">
<div class="ps-process-track" aria-label="Case progress"><span data-done="true">Triage</span><span data-done="true">Investigate</span><span data-done="true">Contain</span><span>Close</span></div>
<div class="ps-case-verdict"><p class="ps-note">Working assessment</p><h3>Account takeover after a phishing click</h3><p class="ps-note">Six linked events · 19 minute window</p></div>
<div class="ps-evidence-list" role="group" aria-label="Inspect evidence">
<button type="button" class="ps-evidence-row ps-source-email" aria-pressed="false"><time>09:12</time><i></i><span>Invoice link opened</span></button>
<button type="button" class="ps-evidence-row ps-source-identity" aria-pressed="false"><time>09:14</time><i></i><span>MFA request approved</span></button>
<button type="button" class="ps-evidence-row ps-source-identity" aria-pressed="false"><time>09:15</time><i></i><span>New device signed in</span></button>
<button type="button" class="ps-evidence-row ps-source-cloud" aria-pressed="false"><time>09:21</time><i></i><span>Access key created</span></button>
<button type="button" class="ps-evidence-row ps-source-endpoint" aria-pressed="false"><time>09:24</time><i></i><span>Archive downloaded</span></button>
<button type="button" class="ps-evidence-row ps-source-identity" aria-pressed="true"><time>09:31</time><i></i><span>Session revoked and key disabled</span></button>
</div><div class="ps-data-readout">09:31 · Identity. All sessions for the sample account were revoked and the new access key was disabled.</div>
<label class="ps-compact-field">Resolution note<textarea class="ps-input ps-case-note" name="resolution" rows="3" required aria-describedby="contained-note-hint">Phishing click led to an approved MFA push. Sessions revoked, key disabled, password reset requested.</textarea><span id="contained-note-hint">Saved with the closed case. Required to close.</span></label>
<p class="ps-workflow-status" role="status">Sample session contained at 09:31. Review the note, then close the case.</p>
<div class="ps-workflow-actions"><button type="button" class="ps-button">Reset case</button><button type="button" class="ps-button ps-button-primary">Close sample case</button></div></div></section></main>
```

## Variant: Closed record

A read-only closed case with key times, time to contain, the resolution note and the full evidence chain.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Workflow</p><h1 class="ps-heading">Closed case record</h1><p class="ps-note">A closed incident shown read only: the outcome, key times, resolution note and the full evidence chain. Static state.</p></header>
<section class="ps-instrument" aria-label="Sample closed incident"><header class="ps-instrument-header"><div><h2>Case 2041</h2><p>Sample security investigation · closed by Sam Ortiz</p></div><span class="ps-case-label">Closed</span></header><div class="ps-instrument-body">
<div class="ps-process-track" aria-label="Case progress, all phases complete"><span data-done="true">Triage</span><span data-done="true">Investigate</span><span data-done="true">Contain</span><span data-done="true">Close</span></div>
<div class="ps-case-verdict"><p class="ps-note">Outcome</p><h3>Account takeover after a phishing click</h3></div>
<dl class="ps-case-facts">
<div><dt>First event</dt><dd><time>09:12</time></dd></div>
<div><dt>Contained</dt><dd><time>09:31</time></dd></div>
<div><dt>Closed</dt><dd><time>10:05</time></dd></div>
<div><dt>Time to contain</dt><dd>19 min</dd></div>
</dl>
<div class="ps-data-readout ps-case-resolution"><p class="ps-note">Resolution note</p><p>Phishing click led to an approved MFA push. Sessions revoked, key disabled, password reset requested. The downloaded archive held public marketing files only.</p></div>
<div class="ps-case-chain"><p class="ps-note" id="closed-chain-title">Evidence chain · six events</p><ol class="ps-case-log" aria-labelledby="closed-chain-title">
<li class="ps-source-email"><time>09:12</time><i></i><span>Invoice link opened</span></li>
<li class="ps-source-identity"><time>09:14</time><i></i><span>MFA request approved</span></li>
<li class="ps-source-identity"><time>09:15</time><i></i><span>New device signed in</span></li>
<li class="ps-source-cloud"><time>09:21</time><i></i><span>Access key created</span></li>
<li class="ps-source-endpoint"><time>09:24</time><i></i><span>Archive downloaded</span></li>
<li class="ps-source-identity"><time>09:31</time><i></i><span>Session revoked and key disabled</span></li>
</ol></div>
<div class="ps-workflow-actions"><button type="button" class="ps-button">Reopen case</button></div></div><footer class="ps-instrument-footer"><span>Sample record</span><span>No accounts were changed</span></footer></section></main>
```
