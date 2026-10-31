# Permission matrix (permission-matrix)

Kind: component. Compare role capabilities and edit sample access within explicit policy constraints.

Task: Compare role capabilities and edit sample access within explicit policy constraints.

Elements: [text](text.md), [button](button.md), [input](input.md), [badge](badge.md).

Category: input.

Native behavior: permission-matrix. It needs pagesystem.js (see ../implementation.md).

## content

- Five capabilities, three roles and allowed levels.
- Fixed owner access and restricted guest scope.

## states

- saved
- edited
- restricted option
- discarded

## responsive

- Stack panels and editors on narrow screens.
- Keep essential text at body size and control targets readable under text enlargement.

## checks

- Unavailable guest permissions cannot be selected.
- Owners retain full access.
- The table has native row/column headings and a labeled horizontal scroll region.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Permission matrix</h1><p class="ps-note">Compare role capabilities and edit access without losing the governing rules.</p></header>
<section class="ps-instrument" data-ps-permission-matrix aria-label="Sample role permissions"><header class="ps-instrument-header"><div><h2>Workspace access</h2><p>Northstar · sample policy</p></div><span class="ps-note" data-access-dirty></span></header><div class="ps-instrument-body"><p class="ps-note">Owners retain full access. Guests can view files and the design library; other capabilities remain unavailable.</p>
<div class="ps-access-region" tabindex="0" role="region" aria-label="Permission table, scroll horizontally on small screens"><table class="ps-access-table"><caption class="ps-visually-hidden">Capability access by role</caption><thead><tr><th scope="col">Capability</th><th scope="col">Owner</th><th scope="col">Member</th><th scope="col">Guest</th></tr></thead><tbody data-access-rows></tbody></table></div>
<div class="ps-access-summary"><h3>Effective access</h3><div data-access-summary></div></div><p class="ps-workflow-status" data-access-status role="status"></p><div class="ps-workflow-actions"><button class="ps-button" type="button" data-access-discard>Discard changes</button><button class="ps-button ps-button-primary" type="button" data-access-save>Save permissions</button></div></div><footer class="ps-instrument-footer"><span>Changes apply to this demo only</span><span>No account access changed</span></footer></section></main>
```

## Variant: Read only

What a member without edit rights sees: the policy as plain values, a summary of their own access and a request action.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Permission matrix, read only</h1><p class="ps-note">What a member sees: the same policy as plain values, with a route to ask for a change.</p></header>
<section class="ps-instrument ps-access-locked" aria-label="Sample role permissions, view only"><header class="ps-instrument-header"><div><h2>Workspace access</h2><p>Northstar · sample policy</p></div><span class="ps-product-label">View only</span></header><div class="ps-instrument-body"><p class="ps-note">Only owners can change access. Your role is Member; the owner of this sample workspace is Ana Ruiz.</p>
<div class="ps-access-region" tabindex="0" role="region" aria-label="Permission table, scroll horizontally on small screens"><table class="ps-access-table"><caption class="ps-visually-hidden">Capability access by role</caption><thead><tr><th scope="col">Capability</th><th scope="col">Owner</th><th scope="col">Member (you)</th><th scope="col">Guest</th></tr></thead><tbody><tr><th scope="row">Project files</th><td data-role="Owner">Edit</td><td data-role="Member (you)">Edit</td><td data-role="Guest">View</td></tr><tr><th scope="row">Design library</th><td data-role="Owner">Edit</td><td data-role="Member (you)">Edit</td><td data-role="Guest">View</td></tr><tr><th scope="row">Team members</th><td data-role="Owner">Manage</td><td data-role="Member (you)">View</td><td data-role="Guest"><span class="ps-access-none">None</span></td></tr><tr><th scope="row">Billing</th><td data-role="Owner">Manage</td><td data-role="Member (you)"><span class="ps-access-none">None</span></td><td data-role="Guest"><span class="ps-access-none">None</span></td></tr><tr><th scope="row">Audit history</th><td data-role="Owner">Export</td><td data-role="Member (you)">View</td><td data-role="Guest"><span class="ps-access-none">None</span></td></tr></tbody></table></div>
<div class="ps-access-summary"><h3>Your access</h3><p>You can edit project files and the design library, and view team members and audit history. Billing is not available to you.</p></div><div class="ps-workflow-actions"><button class="ps-button ps-button-primary" type="button">Request a change</button></div></div><footer class="ps-instrument-footer"><span>Last changed October 14 by Ana Ruiz</span><span>Sample policy</span></footer></section></main>
```

## Variant: Change review

Unsaved edits listed one per row with old and new levels, and each role's access after saving, before the save is confirmed.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Permission matrix, change review</h1><p class="ps-note">Unsaved edits listed one per row, with their effect on each role, before they are saved.</p></header>
<section class="ps-instrument" aria-label="Review sample permission changes"><header class="ps-instrument-header"><div><h2>Review access changes</h2><p>Northstar · sample policy</p></div><span class="ps-note">3 unsaved changes</span></header><div class="ps-instrument-body">
<div class="ps-access-region" tabindex="0" role="region" aria-label="Pending changes, scroll horizontally on small screens"><table class="ps-access-table ps-access-changes"><caption class="ps-visually-hidden">Pending permission changes</caption><thead><tr><th scope="col">Capability</th><th scope="col">Role</th><th scope="col">Saved</th><th scope="col">New</th></tr></thead><tbody>
<tr><th scope="row">Billing</th><td data-role="Role">Member</td><td data-role="Saved"><span class="ps-access-was">None</span></td><td data-role="New"><strong>View</strong></td></tr>
<tr><th scope="row">Audit history</th><td data-role="Role">Member</td><td data-role="Saved"><span class="ps-access-was">View</span></td><td data-role="New"><strong>Export</strong></td></tr>
<tr><th scope="row">Project files</th><td data-role="Role">Guest</td><td data-role="Saved"><span class="ps-access-was">View</span></td><td data-role="New"><strong>None</strong></td></tr>
</tbody></table></div>
<div class="ps-access-summary"><h3>Effective access after saving</h3><div><p>Member: project files, design library, team members, billing, audit history.</p><p>Guest: design library.</p></div></div>
<p class="ps-workflow-status" role="status">Guests lose access to project files. Links they already opened stop working on their next visit.</p>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Back to editing</button><button class="ps-button ps-button-primary" type="button">Save 3 changes</button></div></div><footer class="ps-instrument-footer"><span>Changes apply to this demo only</span><span>No account access changed</span></footer></section></main>
```

## Variant: Checkbox grid

A compact grid of allowed or not-allowed capabilities for four roles, with owner and guest limits enforced as disabled boxes.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Input</p><h1 class="ps-heading">Permission matrix, checkbox grid</h1><p class="ps-note">A dense on-or-off grid for policies where each capability is simply allowed or not.</p></header>
<section class="ps-instrument ps-access-grid" data-density="compact" aria-label="Sample role capabilities"><header class="ps-instrument-header"><div><h2>Role capabilities</h2><p>Northstar · 4 roles · sample policy</p></div><span class="ps-note">Saved locally</span></header><div class="ps-instrument-body">
<ul class="ps-access-rules"><li id="toggle-owner-rule">Owners keep every capability.</li><li id="toggle-guest-rule">Guests can only view files.</li></ul>
<div class="ps-access-region" tabindex="0" role="region" aria-label="Capability grid, scroll horizontally on small screens"><table class="ps-access-table ps-access-toggle-table"><caption class="ps-visually-hidden">Capabilities allowed for each role</caption><thead><tr><th scope="col">Capability</th><th scope="col">Owner</th><th scope="col">Admin</th><th scope="col">Editor</th><th scope="col">Guest</th></tr></thead><tbody>
<tr><th scope="row">View files</th><td><label class="ps-access-check"><input type="checkbox" aria-label="View files, Owner" checked disabled aria-describedby="toggle-owner-rule"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="View files, Admin" checked></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="View files, Editor" checked></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="View files, Guest" checked></label></td></tr>
<tr><th scope="row">Edit files</th><td><label class="ps-access-check"><input type="checkbox" aria-label="Edit files, Owner" checked disabled aria-describedby="toggle-owner-rule"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Edit files, Admin" checked></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Edit files, Editor" checked></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Edit files, Guest" disabled aria-describedby="toggle-guest-rule"></label></td></tr>
<tr><th scope="row">Invite people</th><td><label class="ps-access-check"><input type="checkbox" aria-label="Invite people, Owner" checked disabled aria-describedby="toggle-owner-rule"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Invite people, Admin" checked></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Invite people, Editor"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Invite people, Guest" disabled aria-describedby="toggle-guest-rule"></label></td></tr>
<tr><th scope="row">Manage billing</th><td><label class="ps-access-check"><input type="checkbox" aria-label="Manage billing, Owner" checked disabled aria-describedby="toggle-owner-rule"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Manage billing, Admin" checked></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Manage billing, Editor"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Manage billing, Guest" disabled aria-describedby="toggle-guest-rule"></label></td></tr>
<tr><th scope="row">Export audit log</th><td><label class="ps-access-check"><input type="checkbox" aria-label="Export audit log, Owner" checked disabled aria-describedby="toggle-owner-rule"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Export audit log, Admin" checked></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Export audit log, Editor"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Export audit log, Guest" disabled aria-describedby="toggle-guest-rule"></label></td></tr>
<tr><th scope="row">Delete projects</th><td><label class="ps-access-check"><input type="checkbox" aria-label="Delete projects, Owner" checked disabled aria-describedby="toggle-owner-rule"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Delete projects, Admin"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Delete projects, Editor"></label></td><td><label class="ps-access-check"><input type="checkbox" aria-label="Delete projects, Guest" disabled aria-describedby="toggle-guest-rule"></label></td></tr>
</tbody></table></div>
<div class="ps-workflow-actions"><button class="ps-button" type="button">Discard changes</button><button class="ps-button ps-button-primary" type="button">Save capabilities</button></div></div><footer class="ps-instrument-footer"><span>Changes apply to this demo only</span><span>No account access changed</span></footer></section></main>
```
