# Message (message)

Kind: component. Conversation turns with time and per-turn actions: copy, edit a sent prompt, and regenerate an answer with versions.

Task: Read a conversation, copy a turn, correct a sent prompt and ask for a different answer without losing the earlier one.

Elements: [button](button.md), [text](text.md).

Category: agent.

Native behavior: message. It needs pagesystem.js (see ../implementation.md).

## content

- The person's turns under a quiet You label, or the speaker's name in a team thread, in full ink at the same edge as the answers.
- Assistant answers as prose at the reading measure, with lists where the answer is a list.
- Time for every turn and an Edited note after a change.
- A version pager once an answer has been regenerated.

## states

- rest
- hover or focus reveal
- copied
- copy unavailable
- editing
- edited
- regenerating
- versioned
- failed
- recovered

## responsive

- A person's words and the answers keep the reading measure and wrap long words; a question and its answer sit close, with a larger gap before the next question.
- Actions keep their space so revealing them never moves the thread, and stay visible on touch screens.
- The time between people folds away until a tap or focus asks for it.

## checks

- Actions appear on hover and on keyboard focus, and the latest turn always shows them.
- Copy confirms with a check and a status message, or says when the browser blocks it.
- Edit opens a field with the text; Enter saves, Shift+Enter adds a line, Escape cancels and returns focus.
- Regenerate marks the turn busy, then adds a version; previous and next page between versions.
- A failed answer states the reason and offers retry, which restores the actions.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Message</h1><p class="ps-note">Show a person’s turns and an assistant’s answers, with time and the actions each turn supports.</p></header>
<section class="ps-conversation" data-ps-message data-message-autoplay aria-label="Sample conversation">
<ol class="ps-thread">
<li class="ps-message" data-from="user" data-message-id="m1"><span class="ps-message-who">You</span><div class="ps-message-bubble">A customer on the annual Team plan wants to cancel in month two. Do they get money back?</div><div class="ps-message-meta"><time datetime="2026-10-29T09:41">9:41 AM</time><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button><button class="ps-icon-action" type="button" data-message-action="edit" aria-label="Edit message"><span class="ps-i ps-i-edit" aria-hidden="true"></span></button></div></li>
<li class="ps-message" data-from="assistant" data-message-id="m2" data-message-sample="refund"><span class="ps-visually-hidden">Assistant said</span><div class="ps-message-body" data-message-text><p>Northwind’s policy depends on how long ago they paid:</p><ul><li>Within 14 days of purchase, the refund is full.</li><li>After 14 days, the unused months become account credit rather than a refund.</li></ul><p>Month two is past the window, so they would receive credit for the remaining ten months.</p></div><div class="ps-message-meta"><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button><button class="ps-icon-action" type="button" data-message-action="retry" aria-label="Regenerate response"><span class="ps-i ps-i-retry" aria-hidden="true"></span></button><time datetime="2026-10-29T09:41">9:41 AM</time></div></li>
<li class="ps-message" data-from="user" data-message-id="m3"><span class="ps-message-who">You</span><div class="ps-message-bubble">Can I make an exception for them?</div><div class="ps-message-meta"><time datetime="2026-10-29T09:43">9:43 AM</time><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button><button class="ps-icon-action" type="button" data-message-action="edit" aria-label="Edit message"><span class="ps-i ps-i-edit" aria-hidden="true"></span></button></div></li>
<li class="ps-message" data-from="assistant" data-message-id="m4"><span class="ps-visually-hidden">Assistant said</span><div class="ps-message-body" data-message-text><p>Yes, if a team lead approves it. Add the reason to the invoice note, then choose <strong>Refund</strong> and select <strong>Prorated</strong> so only the unused months are returned.</p></div><div class="ps-message-meta"><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button><button class="ps-icon-action" type="button" data-message-action="retry" aria-label="Regenerate response"><span class="ps-i ps-i-retry" aria-hidden="true"></span></button><time datetime="2026-10-29T09:43">9:43 AM</time></div></li>
</ol>
<p class="ps-conversation-foot">Sample support conversation. Copy, edit and regenerate work locally; nothing is sent.</p><p class="ps-visually-hidden" data-message-live role="status"></p>
</section></main>
```

## Variant: Team thread

Messages between people: grouped incoming bubbles with initials and names, and a tap that pins the time.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Team thread</h1><p class="ps-note">Messages between people: incoming turns carry the sender’s initials, and a tap pins the time.</p></header>
<section class="ps-conversation" data-ps-message aria-label="Sample team thread">
<ol class="ps-thread">
<li class="ps-message" data-from="other" data-message-id="t1" data-group-start><span class="ps-message-author">Maya Kovac</span><div class="ps-message-bubble" data-tappable>The Denver offsite venue confirmed 18 rooms for March 4–6.</div><div class="ps-message-reveal"><div class="ps-message-meta"><time datetime="2026-10-29T14:02">2:02 PM</time><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button></div></div></li>
<li class="ps-message" data-from="other" data-message-id="t2"><span class="ps-visually-hidden">Maya Kovac</span><div class="ps-message-bubble" data-tappable>They need the final headcount by Friday, or the hold drops to 12.</div><div class="ps-message-reveal"><div class="ps-message-meta"><time datetime="2026-10-29T14:02">2:02 PM</time><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button></div></div></li>
<li class="ps-message" data-from="user" data-message-id="t3" data-group-start><span class="ps-message-who">You</span><div class="ps-message-bubble" data-tappable>Thanks. I’ll send the list tomorrow morning once finance signs off.</div><div class="ps-message-reveal"><div class="ps-message-meta"><time datetime="2026-10-29T14:05">2:05 PM</time><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button><button class="ps-icon-action" type="button" data-message-action="edit" aria-label="Edit message"><span class="ps-i ps-i-edit" aria-hidden="true"></span></button></div></div></li>
<li class="ps-message" data-from="other" data-message-id="t4" data-group-start><span class="ps-message-author">Ray Santos</span><div class="ps-message-bubble" data-tappable>Add me to the airport transfer, I land at 10:20 AM.</div><div class="ps-message-reveal"><div class="ps-message-meta"><time datetime="2026-10-29T14:11">2:11 PM</time><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button></div></div></li>
</ol>
<p class="ps-conversation-foot">Sample thread between fictional colleagues. Copy and edit work locally.</p><p class="ps-visually-hidden" data-message-live role="status"></p>
</section></main>
```

## Variant: Failed response

An answer that stopped partway, with the reason and a retry that loads the response and its actions.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Failed response</h1><p class="ps-note">An answer that stopped partway, with the reason and a retry that recovers it.</p></header>
<section class="ps-conversation" data-ps-message aria-label="Sample conversation with a failed response">
<ol class="ps-thread">
<li class="ps-message" data-from="user" data-message-id="f1"><span class="ps-message-who">You</span><div class="ps-message-bubble">Draft a short reply to the customer explaining the refund credit.</div><div class="ps-message-meta"><time datetime="2026-10-29T16:20">4:20 PM</time><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button><button class="ps-icon-action" type="button" data-message-action="edit" aria-label="Edit message"><span class="ps-i ps-i-edit" aria-hidden="true"></span></button></div></li>
<li class="ps-message" data-from="assistant" data-message-id="f2" data-message-sample="refund" data-state="error"><span class="ps-visually-hidden">Assistant said</span><div class="ps-message-body" data-message-text><p class="ps-message-error">The response stopped before it finished because the connection to the model was lost. Nothing was saved.</p><button class="ps-button" type="button" data-message-action="retry"><span class="ps-i ps-i-retry" aria-hidden="true"></span>Retry response</button></div><div class="ps-message-meta" hidden><button class="ps-icon-action" type="button" data-message-action="copy" aria-label="Copy message"><span class="ps-i ps-i-copy" aria-hidden="true"></span></button><button class="ps-icon-action" type="button" data-message-action="retry" aria-label="Regenerate response"><span class="ps-i ps-i-retry" aria-hidden="true"></span></button><time datetime="2026-10-29T16:20">4:20 PM</time></div></li>
</ol>
<p class="ps-conversation-foot">Sample failure. Retry loads a local sample answer.</p><p class="ps-visually-hidden" data-message-live role="status"></p>
</section></main>
```
