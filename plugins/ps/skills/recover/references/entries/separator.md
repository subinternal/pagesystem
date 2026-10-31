# Separator (separator)

Kind: element. A boundary with a reason to exist.

Task: Recognize a thematic change.

Semantic HTML: hr.

## content

- Meaningful content and an accessible name where applicable

## states

- default

## responsive

- Inherit host typography and colors.
- Do not clip content or focus indicators.

## checks

- Use space for simple grouping; hr for a thematic break.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Element</p><h1 class="ps-heading">Separator</h1><p class="ps-note">A rule between two unrelated groups of account settings; related items use spacing alone.</p></header>
<div class="ps-stack"><section class="ps-stack-tight" aria-labelledby="profile-heading"><h2 class="ps-subheading" id="profile-heading">Profile</h2><p>Name, photo and the email address used to sign in.</p></section><hr class="ps-rule"><section class="ps-stack-tight" aria-labelledby="notifications-heading"><h2 class="ps-subheading" id="notifications-heading">Notifications</h2><p>Which events send email, and how often a digest is sent.</p></section></div></main>
```
