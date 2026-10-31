# Streaming text (streaming-text)

Kind: component. A reply that arrives a few words at a time, with pause, replay and pace, announcing completion rather than every word.

Task: Read a reply while it is still arriving, and pause, stop or replay it without losing your place.

Elements: [text](text.md), [button](button.md), [input](input.md).

Category: agent.

Native behavior: streaming-text. It needs pagesystem.js (see ../implementation.md).

## content

- The complete reply in the markup: headings, paragraphs, lists, inline code and a code block, so it reads in full without script.
- A status line and a word count that follow the stream.
- Controls for pause or stop, replay or regenerate, and an optional pace.
- A label that the reply is sample text streamed locally and no model is called.

## states

- complete
- streaming
- paused
- resumed
- stopped and incomplete
- replayed
- reduced motion

## responsive

- The toolbar sits above the reply so its controls stay put while the reply grows, and wraps under the status at narrow widths.
- Code blocks scroll sideways inside their own frame; prose wraps at the reading measure.

## checks

- DOM updates are batched to about twenty a second regardless of pace, and every timer is cleared on dispose.
- The reply is aria-busy while streaming; a polite live region announces start, pause, stop and completion, never individual words.
- With reduced motion the final text is shown at once and replay shows it again in full.
- Pause freezes the count, Resume continues from the same word, Stop keeps the partial reply and labels it incomplete.
- When Pause or Stop disappears with focus on it, focus moves to Replay or Regenerate.
- New words fade in from transparent in one ink color; there is no hue sweep, caret or shimmer.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Streaming text</h1><p class="ps-note">A reply that arrives a few words at a time, which you can pause, replay or slow down.</p></header>
<section class="ps-stream" data-ps-streaming-text data-stream-autoplay aria-label="Sample streaming reply"><div class="ps-stream-bar"><div class="ps-stream-status"><p class="ps-stream-state" data-stream-state>Reply complete</p><p class="ps-stream-progress" data-stream-progress></p></div>
<div class="ps-stream-controls"><label class="ps-stream-pace">Pace<select class="ps-input" data-stream-pace><option value="44">Slow</option><option value="28" selected>Steady</option><option value="16">Quick</option><option value="10">Fast</option></select></label><button class="ps-button" type="button" data-stream-toggle><span class="ps-i ps-i-pause" aria-hidden="true"></span>Pause</button><button class="ps-button" type="button" data-stream-replay><span class="ps-i ps-i-replay" aria-hidden="true"></span>Replay</button></div></div>
<article class="ps-stream-reply" aria-label="Reply" data-stream-reply><h2>Why a typo runs a train</h2>
<p>Mistype <code>ls</code> as <code>sl</code> and a steam locomotive crosses the terminal instead, at its own unhurried pace.</p>
<p>Toyoda Masashi wrote it in 1993 as a cure for that exact slip. It is one C file that draws the train with curses, a frame at a time, from one edge of the window to the other.</p>
<ul><li>Slow on purpose: it takes its time, and Ctrl-C will not stop it.</li><li>It has options: <code>-l</code> for a smaller train, <code>-F</code> to make it fly, <code>-a</code> for passengers calling for help.</li><li>It is everywhere: Debian and Homebrew both package it.</li></ul>
<figure class="ps-stream-code" data-stream-atom><figcaption>Terminal</figcaption><pre><code>brew install sl &amp;&amp; sl -F</code></pre></figure>
<p>There is no way to cut it short, which is the point. The train crosses once and leaves on its own.</p></article>
<p class="ps-visually-hidden" role="status" data-stream-live></p>
<p class="ps-stream-note">Sample reply, streamed locally. No model is called.</p></section></main>
```

## Variant: In a message

A reply streaming under the question that asked for it, where Stop keeps what has arrived and Regenerate starts again.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Streaming text, in a message</h1><p class="ps-note">A reply streaming under the question that asked for it, with Stop to keep what has arrived and Regenerate to start again.</p></header>
<section class="ps-stream" data-ps-streaming-text data-stream-autoplay data-stream-ms="22" aria-label="Sample message with a streaming reply"><div class="ps-stream-bar"><div class="ps-stream-status"><p class="ps-stream-state" data-stream-state>Reply complete</p><p class="ps-stream-progress" data-stream-progress></p></div>
<div class="ps-stream-controls"><button class="ps-button" type="button" data-stream-stop><span class="ps-i ps-i-stop" aria-hidden="true"></span>Stop</button><button class="ps-button" type="button" data-stream-replay><span class="ps-i ps-i-replay" aria-hidden="true"></span>Regenerate</button></div></div>
<div class="ps-stream-turn"><p class="ps-stream-ask">What changed in the 2.4 release, in plain terms?</p>
<article class="ps-stream-reply" aria-label="Reply" data-stream-reply><p>Three things you will notice, and one you will not:</p>
<ul><li>Exports are faster. Large workspaces export in about a third of the time, because files are written in parallel.</li><li>Comments can be resolved from the notification itself, without opening the document.</li><li>Shared links now expire after 30 days by default. Owners can still choose “never”.</li></ul>
<p>Behind the scenes, sign-in moved to a new session service. Nothing changes for you unless you use single sign-on, in which case your admin should confirm the new callback address.</p></article></div>
<p class="ps-visually-hidden" role="status" data-stream-live></p>
<p class="ps-stream-note">Sample release notes for a fictional product. Stop keeps the partial reply.</p></section></main>
```

## Variant: Summary card

A short meeting summary streaming into a narrow side panel, with Replay as the only control.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Streaming text, summary card</h1><p class="ps-note">A short meeting summary streaming into a narrow side panel, with Replay as the only control.</p></header>
<section class="ps-stream ps-stream-summary" data-ps-streaming-text data-stream-autoplay data-stream-ms="36" aria-label="Sample streaming summary"><div class="ps-stream-bar"><div class="ps-stream-status"><p class="ps-stream-state" data-stream-state>Reply complete</p><p class="ps-stream-progress" data-stream-progress></p></div>
<div class="ps-stream-controls"><button class="ps-button" type="button" data-stream-replay><span class="ps-i ps-i-replay" aria-hidden="true"></span>Replay</button></div></div>
<article class="ps-stream-reply" aria-label="Summary of the design review" data-stream-reply><h2>Design review, 28 October</h2>
<p>The team chose the two-column settings layout and dropped the tabbed version, which hid billing too deep.</p>
<p>Open question: whether audit logs belong under Security or Workspace. Ana will bring both options on Friday.</p></article>
<p class="ps-visually-hidden" role="status" data-stream-live></p>
<p class="ps-stream-note">Sample summary of fictional notes.</p></section></main>
```
