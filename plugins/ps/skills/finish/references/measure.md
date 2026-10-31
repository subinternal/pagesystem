# Measure the page

[measure.js](measure.js) checks a rendered page against the foundations and returns JSON findings: content off the
page, headings and text that end on one word, labels that wrap, text contrast against the ground it actually sits on,
targets under WCAG's 24px floor (with its spacing exception) or under the house target (36px fine pointer, 44px
touch), unnamed controls, images without alt text, reading width past about 80 characters, text under 12px, heading
structure, and content clipped when text spacing is increased. It needs no dependencies, makes no requests and stores
nothing.

Run it inside the page, at a phone width (375) and a desk width (1440), in each theme the product supports, and once
with `{ textSpacing: true }`:

- **Playwright**: read this folder's `measure.js` as text, then
  `await page.evaluate(source + "\n;pagesystemMeasure({ pointer: 'coarse' })")`. Evaluating the text works under a
  strict Content Security Policy, where injecting a script tag is blocked.
- **A browser tool or console**: run the file's text, then `await pagesystemMeasure()`.

Each finding has a `rule`, a `severity` (`fail`: breakage such as a WCAG failure, content off the page or an unnamed
control; `warn`: below the house standard), the element's selector, its text and the measured numbers. `summary`
counts both; `notMeasured` lists what still needs a person or a keyboard: focus order and visibility, reduced motion,
meaning and hierarchy, and states not on screen.

Fix every `fail`. Fix each `warn` or name why it stands (a dense data table may keep a 36px row on touch, with its
reason). Run it again until the numbers are the ones you report. Report the counts before and after; never lower a
rule to make a report pass.
