# Chat input (chat-input)

Kind: component. A prompt field for an agent that grows as it wraps, carries files and names the model before sending.

Task: Write a prompt for an agent, attach files and choose the model, then send it or stop a response in progress.

Elements: [button](button.md), [input](input.md), [text](text.md).

Category: agent.

Native behavior: chat-input. It needs pagesystem.js (see ../implementation.md).

## content

- Prompt text with a visible placeholder and a send hint.
- Attached files as inline chips with type icon, name, size and remove.
- Model choice as a native select.
- Status line that confirms each local action and labels the sample.

## states

- empty
- typing
- expanded
- with files
- add menu open
- sent
- responding
- stopped

## responsive

- Rests as a single pill and opens into a stacked layout once the prompt wraps, holds a line break or carries a file; below 22rem of component width it rests stacked, since a pill that narrow cannot hold the placeholder.
- File chips wrap onto new lines; the prompt stays at body size at 375 wide.
- The prompt grows with its content up to about eight lines, then scrolls inside the field.

## checks

- Send stays disabled until there is text or a file.
- Enter sends; Shift+Enter adds a line; Enter during composition does nothing.
- The add menu opens with Enter, Space or Down, moves with arrows, Home and End, and Escape closes it and returns focus to the button.
- Removing a chip moves focus to the next chip or back to the prompt.
- While responding the send button becomes stop; Enter does not stop or send, and stopping keeps the draft.
- Sending emits pagesystem:chat-input with the text, model and files; nothing leaves the page.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Chat input</h1><p class="ps-note">Write a prompt for an agent, attach files and choose the model before sending.</p></header>
<section class="ps-chat-input" data-ps-chat-input aria-label="Sample chat input">
<ol class="ps-thread" data-chat-log aria-label="Sent prompts" hidden></ol>
<form class="ps-chat-input-form">
<ul class="ps-attachments" data-layout="inline" data-chat-files aria-label="Attached files" hidden></ul>
<label class="ps-visually-hidden" for="chat-prompt">Prompt</label>
<textarea id="chat-prompt" name="prompt" rows="1" maxlength="4000" placeholder="Ask anything" aria-describedby="chat-status"></textarea>
<button class="ps-icon-action" type="button" data-chat-add aria-label="Add files" aria-haspopup="menu" aria-expanded="false" aria-controls="chat-menu"><span class="ps-i ps-i-plus" aria-hidden="true"></span></button>
<label class="ps-visually-hidden" for="chat-model">Model</label>
<select class="ps-chat-input-model" id="chat-model" name="model"><option value="opus-5.5">Opus 5.5</option><option value="sonnet-5.5">Sonnet 5.5</option><option value="haiku-5.5">Haiku 5.5</option></select>
<button class="ps-chat-send" type="submit" data-chat-send aria-label="Send message" disabled><span class="ps-i ps-i-up" aria-hidden="true"></span></button>
<div class="ps-chat-input-menu" id="chat-menu" role="menu" aria-label="Add files" data-chat-menu hidden><div role="group" aria-label="Sample files"><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-name="pricing-page-audit.pdf" data-size="1153434"><span class="ps-i ps-i-file" aria-hidden="true"></span><span>pricing-page-audit.pdf</span><small>1.1 MB</small></button><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-name="checkout-funnel.png" data-size="700416"><span class="ps-i ps-i-image" aria-hidden="true"></span><span>checkout-funnel.png</span><small>684 KB</small></button><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-name="renewal-cohorts.csv" data-size="94208"><span class="ps-i ps-i-grid" aria-hidden="true"></span><span>renewal-cohorts.csv</span><small>92 KB</small></button></div><hr><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-chat-device><span class="ps-i ps-i-folder" aria-hidden="true"></span><span>Choose from this device</span></button></div>
</form>
<p class="ps-chat-input-note" id="chat-status" data-chat-status role="status">Enter to send, Shift+Enter for a new line. Sample only: nothing is sent.</p>
</section></main>
```

## Variant: With files

A wrapped draft carrying two files, so the input has opened into its stacked layout with send enabled.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Chat input with files</h1><p class="ps-note">A draft that has wrapped onto several lines and carries two files, so the input has opened into its stacked layout.</p></header>
<section class="ps-chat-input" data-ps-chat-input aria-label="Sample chat input">
<ol class="ps-thread" data-chat-log aria-label="Sent prompts" hidden></ol>
<form class="ps-chat-input-form" data-expanded>
<ul class="ps-attachments" data-layout="inline" data-chat-files aria-label="Attached files"><li class="ps-attachment" data-name="pricing-page-audit.pdf" data-size="1153434" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-file" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">pricing-page-audit.pdf</span><span class="ps-attachment-meta"><span class="ps-attachment-type">PDF · </span>1.1 MB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove pricing-page-audit.pdf"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li><li class="ps-attachment" data-name="checkout-funnel.png" data-size="700416" data-state="ready"><span class="ps-attachment-media" aria-hidden="true"><span class="ps-i ps-i-image" aria-hidden="true"></span></span><span class="ps-attachment-text"><span class="ps-attachment-name">checkout-funnel.png</span><span class="ps-attachment-meta"><span class="ps-attachment-type">PNG · </span>684 KB</span></span><span class="ps-attachment-actions"><button class="ps-icon-action" type="button" data-attachment-remove aria-label="Remove checkout-funnel.png"><span class="ps-i ps-i-close" aria-hidden="true"></span></button></span></li></ul>
<label class="ps-visually-hidden" for="draft-prompt">Prompt</label>
<textarea id="draft-prompt" name="prompt" rows="1" maxlength="4000" placeholder="Ask anything" aria-describedby="draft-status">Compare the two pricing pages against the funnel export. Which plan descriptions lose the most people between pricing and checkout, and what would you change first?</textarea>
<button class="ps-icon-action" type="button" data-chat-add aria-label="Add files" aria-haspopup="menu" aria-expanded="false" aria-controls="draft-menu"><span class="ps-i ps-i-plus" aria-hidden="true"></span></button>
<label class="ps-visually-hidden" for="draft-model">Model</label>
<select class="ps-chat-input-model" id="draft-model" name="model"><option value="opus-5.5">Opus 5.5</option><option value="sonnet-5.5">Sonnet 5.5</option><option value="haiku-5.5">Haiku 5.5</option></select>
<button class="ps-chat-send" type="submit" data-chat-send aria-label="Send message"><span class="ps-i ps-i-up" aria-hidden="true"></span></button>
<div class="ps-chat-input-menu" id="draft-menu" role="menu" aria-label="Add files" data-chat-menu hidden><div role="group" aria-label="Sample files"><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-name="pricing-page-audit.pdf" data-size="1153434"><span class="ps-i ps-i-file" aria-hidden="true"></span><span>pricing-page-audit.pdf</span><small>1.1 MB</small></button><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-name="checkout-funnel.png" data-size="700416"><span class="ps-i ps-i-image" aria-hidden="true"></span><span>checkout-funnel.png</span><small>684 KB</small></button><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-name="renewal-cohorts.csv" data-size="94208"><span class="ps-i ps-i-grid" aria-hidden="true"></span><span>renewal-cohorts.csv</span><small>92 KB</small></button></div><hr><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-chat-device><span class="ps-i ps-i-folder" aria-hidden="true"></span><span>Choose from this device</span></button></div>
</form>
<p class="ps-chat-input-note" id="draft-status" data-chat-status role="status">Enter to send, Shift+Enter for a new line. Sample only: nothing is sent.</p>
</section></main>
```

## Variant: Responding

The agent is answering the last prompt: send has become stop, and the next prompt can be drafted but not sent.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Chat input while responding</h1><p class="ps-note">While the agent answers, the send button becomes stop and the next prompt can be drafted without sending it.</p></header>
<section class="ps-chat-input" data-ps-chat-input data-chat-state="responding" aria-label="Sample chat input">
<ol class="ps-thread" data-chat-log aria-label="Sent prompts"><li class="ps-message" data-from="user"><div class="ps-message-bubble">Summarize last week’s failed payments by card network and flag anything above 2%.</div><div class="ps-message-meta"><time datetime="2026-10-29T09:41">9:41 AM</time><span data-message-note>To Opus 5.5</span></div></li></ol>
<form class="ps-chat-input-form">
<ul class="ps-attachments" data-layout="inline" data-chat-files aria-label="Attached files" hidden></ul>
<label class="ps-visually-hidden" for="busy-prompt">Prompt</label>
<textarea id="busy-prompt" name="prompt" rows="1" maxlength="4000" placeholder="Ask anything" aria-describedby="busy-status">Then split it by country</textarea>
<button class="ps-icon-action" type="button" data-chat-add aria-label="Add files" aria-haspopup="menu" aria-expanded="false" aria-controls="busy-menu"><span class="ps-i ps-i-plus" aria-hidden="true"></span></button>
<label class="ps-visually-hidden" for="busy-model">Model</label>
<select class="ps-chat-input-model" id="busy-model" name="model"><option value="opus-5.5">Opus 5.5</option><option value="sonnet-5.5">Sonnet 5.5</option><option value="haiku-5.5">Haiku 5.5</option></select>
<button class="ps-chat-send" type="submit" data-chat-send aria-label="Stop response"><span class="ps-i ps-i-stop" aria-hidden="true"></span></button>
<div class="ps-chat-input-menu" id="busy-menu" role="menu" aria-label="Add files" data-chat-menu hidden><div role="group" aria-label="Sample files"><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-name="pricing-page-audit.pdf" data-size="1153434"><span class="ps-i ps-i-file" aria-hidden="true"></span><span>pricing-page-audit.pdf</span><small>1.1 MB</small></button><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-name="checkout-funnel.png" data-size="700416"><span class="ps-i ps-i-image" aria-hidden="true"></span><span>checkout-funnel.png</span><small>684 KB</small></button><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-name="renewal-cohorts.csv" data-size="94208"><span class="ps-i ps-i-grid" aria-hidden="true"></span><span>renewal-cohorts.csv</span><small>92 KB</small></button></div><hr><button class="ps-chat-input-option" type="button" role="menuitem" tabindex="-1" data-chat-device><span class="ps-i ps-i-folder" aria-hidden="true"></span><span>Choose from this device</span></button></div>
</form>
<p class="ps-chat-input-note" id="busy-status" data-chat-status role="status">Opus 5.5 is responding. Stop it to send the next prompt.</p>
</section></main>
```
