# Chat history (chat-history)

Kind: component. Past conversations grouped by day, with search, rename and delete with undo, and a question index that jumps through a long thread.

Task: Find a past conversation, keep the list tidy, and move through a long thread by the questions you asked.

Elements: [text](text.md), [button](button.md), [input](input.md).

Category: agent.

Native behavior: chat-history. It needs pagesystem.js (see ../implementation.md).

## content

- Conversation titles with their time or date, grouped as Today, Yesterday, Previous 7 days and Earlier.
- The selected conversation's transcript: the person's questions as bubbles and the replies as plain text.
- A count of conversations and search matches, and a status line that names what was renamed or deleted.
- A label that the conversations are sample data and nothing is stored or sent.
- Each row has a details disclosure showing the last two turns trimmed, the model, the token split and cost, the files and tools used, and when it was last active.

## states

- selected
- hover and focus actions
- renaming
- empty title rejected
- deleted with undo
- undone
- search filtered
- no search matches
- no conversations
- question index open
- jumped to question
- details open

## responsive

- The rail and thread sit side by side when the component is at least 44rem wide and stack inside narrower hosts, using a container query rather than the viewport.
- Titles wrap instead of truncating; times keep a reserved slot so titles never run under the row actions.
- The transcript scrolls inside its own labeled region; the page body never scrolls sideways.

## checks

- Up and Down move selection through visible rows, Home and End reach the ends, and only the selected row and its actions are in the tab order.
- F2 renames and Delete removes the focused row; Enter commits a rename, Escape cancels it, and an empty title keeps the old one.
- Delete moves focus to the neighboring row and Undo restores the conversation in its original position and selection.
- Search matches titles and message text, and an empty result offers Clear search.
- Your questions makes the transcript inert, focuses the first question, Escape returns focus to the toggle, and choosing a question scrolls to it and focuses it.
- Row actions appear on hover, focus or selection, so touch users reach them by selecting a row.
- The details disclosure has aria-expanded and aria-controls and opening the thread stays the row's main action; one card is open at a time, and Escape closes it with focus kept on the button.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Chat history</h1><p class="ps-note">Find a past conversation by day or search, rename or delete it with undo, and jump between your own questions.</p></header>
<section class="ps-chats" data-ps-chat-history aria-label="Sample chat history"><div class="ps-chats-layout">
<div class="ps-chats-rail"><div class="ps-chats-search"><span class="ps-i ps-i-search" aria-hidden="true"></span><label class="ps-visually-hidden" for="chats-search">Search conversations</label><input class="ps-input" id="chats-search" type="search" placeholder="Search conversations" autocomplete="off" data-chat-search></div>
<nav class="ps-chats-nav" aria-label="Conversations" data-chat-list></nav>
<div class="ps-chats-empty" data-chat-empty hidden><p data-chat-empty-text>No conversations match.</p><button class="ps-button" type="button" data-chat-clear>Clear search</button></div>
<div class="ps-chats-status"><p role="status" data-chat-status></p><button class="ps-button" type="button" data-chat-undo hidden>Undo</button></div>
<p class="ps-chats-count" data-chat-count></p></div>
<article class="ps-chats-thread" data-chat-thread aria-labelledby="chats-thread-title"><header class="ps-chats-thread-head"><div><h2 id="chats-thread-title" data-chat-title>Conversation</h2><p data-chat-meta></p></div><button class="ps-button ps-chats-toggle" type="button" aria-pressed="false" aria-controls="chats-questions" data-chat-questions-toggle><span class="ps-i ps-i-history" aria-hidden="true"></span>Your questions</button></header>
<div class="ps-chats-stage"><div class="ps-chats-transcript" role="region" aria-label="Transcript" tabindex="0" data-chat-transcript></div>
<div class="ps-chats-questions" id="chats-questions" role="group" aria-label="Your questions in this conversation" data-chat-questions hidden><ol data-chat-question-list></ol></div></div></article></div>
<p class="ps-chats-foot">Sample conversations. Nothing is stored or sent.</p></section></main>
```

## Variant: Question index

A single long conversation where one button gathers the person's questions into a column and jumps to any of them.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Chat history, question index</h1><p class="ps-note">One long conversation, where a single button gathers your questions into a column and jumps to any of them.</p></header>
<section class="ps-chats ps-chats-thread-only" data-ps-chat-history data-chat-selected="domain" aria-label="Sample conversation with a question index"><div class="ps-chats-layout">
<article class="ps-chats-thread" data-chat-thread aria-labelledby="chatq-title"><header class="ps-chats-thread-head"><div><h2 id="chatq-title" data-chat-title>Conversation</h2><p data-chat-meta></p></div><button class="ps-button ps-chats-toggle" type="button" aria-pressed="false" aria-controls="chatq-questions" data-chat-questions-toggle><span class="ps-i ps-i-history" aria-hidden="true"></span>Your questions</button></header>
<div class="ps-chats-stage"><div class="ps-chats-transcript" role="region" aria-label="Transcript" tabindex="0" data-chat-transcript></div>
<div class="ps-chats-questions" id="chatq-questions" role="group" aria-label="Your questions in this conversation" data-chat-questions hidden><ol data-chat-question-list></ol></div></div></article></div>
<p class="ps-chats-foot">Sample conversation. Nothing is stored or sent.</p></section></main>
```

## Variant: Sidebar rail

The conversation list on its own at compact density, sized for an app sidebar, with search, rename and delete with undo.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Chat history, sidebar rail</h1><p class="ps-note">The conversation list on its own, sized for an app sidebar, with search, rename and delete with undo.</p></header>
<section class="ps-chats ps-chats-solo" data-ps-chat-history data-density="compact" aria-label="Sample conversation rail"><div class="ps-chats-layout">
<div class="ps-chats-rail"><div class="ps-chats-search"><span class="ps-i ps-i-search" aria-hidden="true"></span><label class="ps-visually-hidden" for="rail-search">Search conversations</label><input class="ps-input" id="rail-search" type="search" placeholder="Search" autocomplete="off" data-chat-search></div>
<nav class="ps-chats-nav" aria-label="Conversations" data-chat-list></nav>
<div class="ps-chats-empty" data-chat-empty hidden><p data-chat-empty-text>No conversations match.</p><button class="ps-button" type="button" data-chat-clear>Clear search</button></div>
<div class="ps-chats-status"><p role="status" data-chat-status></p><button class="ps-button" type="button" data-chat-undo hidden>Undo</button></div>
<p class="ps-chats-count" data-chat-count></p></div></div></section></main>
```
