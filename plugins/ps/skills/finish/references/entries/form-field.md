# Form field (form-field)

Kind: component. A visible label, useful help, and a specific error.

Task: Enter one piece of information correctly.

Elements: [text](text.md), [input](input.md).

Category: input.

## content

- Label
- Input
- Help
- Error when invalid

## states

- empty
- editing
- invalid
- disabled

## responsive

- Inputs fill their container; help wraps.

## checks

- Label is programmatically associated.
- Errors use aria-describedby and aria-invalid.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Form field</h1><p class="ps-note">A labeled email input with help text, shown in its default and error states.</p></header><div class="ps-field"><label for="email">Email address</label><input id="email" class="ps-input" type="email" autocomplete="email" aria-describedby="email-help" placeholder="you@example.com"><p id="email-help" class="ps-note">We send review requests and status changes to this address.</p></div><div class="ps-field"><label for="email-invalid">Email address · error example</label><input id="email-invalid" class="ps-input" type="email" autocomplete="email" value="not-an-address" aria-invalid="true" aria-describedby="email-error"><p id="email-error" class="ps-error">Enter an email address with an @ and a domain.</p></div><p class="ps-note">Editable specimens. No values are sent or saved.</p></main>
```

## Variant: Prefix and unit

Fields with a fixed prefix or trailing unit drawn inside the input edge, such as a workspace address, a currency amount and a timeout in minutes with an error.

```html
<main><h1 class="ps-heading">Fields with a fixed prefix or unit.</h1>
<div class="ps-field"><label for="workspace-slug">Workspace address</label><div class="ps-affix"><span class="ps-affix-text" id="workspace-prefix">pagesystem.app/</span><input id="workspace-slug" class="ps-input" type="text" inputmode="url" autocapitalize="none" spellcheck="false" value="northstar-studio" aria-describedby="workspace-prefix workspace-help"></div><p id="workspace-help" class="ps-note">Lowercase letters, numbers and hyphens. People you invite open the workspace at this address.</p></div>
<div class="ps-field"><label for="monthly-budget">Monthly budget</label><div class="ps-affix"><span class="ps-affix-text" id="budget-currency">$</span><input id="monthly-budget" class="ps-input ps-numeric" type="text" inputmode="decimal" value="2,400" aria-describedby="budget-currency budget-unit budget-help"><span class="ps-affix-text" id="budget-unit">per month</span></div><p id="budget-help" class="ps-note">Spending pauses for the rest of the month once this amount is reached.</p></div>
<div class="ps-field"><label for="session-timeout">Session timeout</label><div class="ps-affix"><input id="session-timeout" class="ps-input ps-numeric" type="text" inputmode="numeric" value="90" aria-invalid="true" aria-describedby="timeout-unit timeout-error"><span class="ps-affix-text" id="timeout-unit">minutes</span></div><p id="timeout-error" class="ps-error">Choose a timeout from 5 to 60 minutes.</p></div>
<p class="ps-note">Sample settings. Values are editable and are not saved.</p></main>
```

## Variant: Inline labels

Settings rows with labels in a column beside their controls, which move above the controls when the container is narrower than 34rem.

```html
<main><h1 class="ps-heading">Labels beside their fields.</h1>
<div class="ps-field-rows">
<div class="ps-field ps-field-inline"><label for="profile-name">Display name</label><div class="ps-field-control"><input id="profile-name" class="ps-input" type="text" autocomplete="name" value="Ana Silva" aria-describedby="profile-name-help"><p id="profile-name-help" class="ps-note">Shown beside your comments and review decisions.</p></div></div>
<div class="ps-field ps-field-inline"><label for="profile-zone">Time zone</label><div class="ps-field-control"><select id="profile-zone" class="ps-input" aria-describedby="profile-zone-help"><option>America/New_York (UTC−5)</option><option>America/Chicago (UTC−6)</option><option>America/Los_Angeles (UTC−8)</option></select><p id="profile-zone-help" class="ps-note">Due dates and digest emails use this zone.</p></div></div>
<div class="ps-field ps-field-inline"><label for="profile-email">Notification email</label><div class="ps-field-control"><input id="profile-email" class="ps-input" type="email" autocomplete="email" value="ana.silva@northstar" aria-invalid="true" aria-describedby="profile-email-error"><p id="profile-email-error" class="ps-error">Add the domain ending, for example northstar.studio.</p></div></div>
</div>
<p class="ps-note">Sample profile settings. Labels move above their fields when the container is narrow.</p></main>
```

## Variant: Read-only and disabled

A selectable read-only ID next to a disabled, admin-managed field, each with help text saying why it cannot be changed.

```html
<main><h1 class="ps-heading">Values you can see but not change.</h1>
<div class="ps-field ps-field-locked"><label for="workspace-id">Workspace ID</label><input id="workspace-id" class="ps-input ps-input-id" type="text" value="ws_7Hq2kD9xLm" readonly aria-describedby="workspace-id-help"><p id="workspace-id-help" class="ps-note">Read-only. Select it to copy, and include it when you contact support.</p></div>
<div class="ps-field ps-field-locked"><label for="billing-email">Billing email</label><input id="billing-email" class="ps-input" type="email" value="finance@northstar.studio" disabled aria-describedby="billing-email-help"><p id="billing-email-help" class="ps-note">Managed by your organization. Ask an owner, such as Priya Raman, to change it.</p></div>
<p class="ps-note">Sample account details. Read-only values stay focusable and selectable; disabled values are skipped by Tab and are not submitted.</p></main>
```
