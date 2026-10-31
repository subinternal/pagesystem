# Link (link)

Kind: element. A destination with a useful name.

Task: Navigate to a known destination.

Semantic HTML: a[href].

## content

- Meaningful content and an accessible name where applicable

## states

- default
- hover
- focus
- visited

## responsive

- Inherit host typography and colors.
- Do not clip content or focus indicators.

## checks

- Destination exists and link text names it.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Element</p><h1 class="ps-heading">Link</h1><p class="ps-note">An inline link inside a sentence and a standalone link whose text names where it goes.</p></header>
<div class="ps-stack"><p>Seats are billed monthly. If you need to change a plan mid-cycle, read how <a class="ps-link" href="#destination">proration is calculated</a> before you confirm.</p><p><a class="ps-link" href="#destination">View the proration rules</a> <span class="ps-i ps-i-down" aria-hidden="true"></span></p><section id="destination" class="ps-stack-tight"><h2 class="ps-subheading">Proration rules</h2><p>Added seats are charged for the days left in the cycle. Removed seats are credited on the next invoice.</p></section></div></main>
```
