# Code block (code-block)

Kind: component. A file excerpt with a filename header, language label, line numbers, restrained highlighting, copy, line wrapping and collapse for long code.

Task: Read code an agent produced or quotes, copy it exactly, wrap long lines when needed and open the rest of a long file.

Elements: [text](text.md), [button](button.md).

Category: agent.

Native behavior: code-block. It needs pagesystem.js (see ../implementation.md).

## content

- Filename and language label.
- Source text with line numbers and a starting line.
- Optional diff lines marked as added or removed with old and new line numbers.
- Optional terminal session with commands and their output.
- Sample source is labeled as a sample.

## states

- collapsed to the first lines
- expanded
- long lines scrolling
- long lines wrapped
- copied
- clipboard blocked, code selected instead
- diff
- terminal

## responsive

- Long lines scroll inside the code region while line numbers stay in place; wrapping removes sideways scrolling.
- At narrow widths the Wrap and Copy controls become icon buttons with accessible names; Copied feedback stays visible.
- The code region is focusable so keyboard users can scroll it.

## checks

- Copy writes the exact source without line numbers; a diff copies the new version and a terminal copies only the commands.
- When the clipboard is unavailable or refused, the code is selected and the status says how to copy it.
- Copied feedback resets after two seconds and its timer is cleared on dispose.
- Highlighting is built from text nodes by a pure tokenizer; only keywords, strings and comments carry color.
- Added and removed lines are named in text for assistive technology, not only by color or sign.
- Collapse hides lines visually but never changes what Copy takes.

## HTML

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Code block</h1><p class="ps-note">Read a file excerpt with line numbers, copy it, wrap long lines or open the full file.</p></header>
<figure class="ps-code" data-ps-code-block data-language="ts" data-collapse="14" aria-labelledby="code-file">
<figcaption class="ps-code-head"><span class="ps-i ps-i-code" aria-hidden="true"></span><span class="ps-code-file" id="code-file">src/session.ts</span><span class="ps-code-lang">TypeScript</span><span class="ps-code-actions"><button class="ps-code-action" type="button" data-code-wrap aria-pressed="false"><span class="ps-i ps-i-wrap" aria-hidden="true"></span><span class="ps-code-action-label">Wrap</span></button><button class="ps-code-action" type="button" data-code-copy><span class="ps-i ps-i-duplicate" aria-hidden="true"></span><span class="ps-code-action-label">Copy</span></button></span></figcaption>
<div class="ps-code-body" id="code-code" tabindex="0" role="region" aria-label="Code: src/session.ts"><pre><code>
import { cookies } from &quot;./cookies&quot;;
import { verify } from &quot;./jwt&quot;;

/* Sessions live in an httpOnly cookie; nothing is read from local storage. */
const SESSION_COOKIE = &quot;session&quot;;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface Session {
  userId: string;
  expiresAt: number;
}

export async function getSession(): Promise&lt;Session | null&gt; {
  const value = cookies.get(SESSION_COOKIE);
  if (!value) return null;
  // verify() rejects expired or tampered values, so the decoded payload is trusted from here on.
  const payload = await verify(value, { audience: &quot;docs&quot;, issuer: &quot;docs-auth&quot;, clockTolerance: 30 });
  return { userId: payload.sub, expiresAt: payload.exp * 1000 };
}

export function setSession(value: string) {
  cookies.set(SESSION_COOKIE, value, { httpOnly: true, secure: true, sameSite: &quot;lax&quot;, maxAge: MAX_AGE_SECONDS });
}

export function clearSession() {
  cookies.delete(SESSION_COOKIE);
}
</code></pre></div>
<div class="ps-code-foot" data-code-foot hidden><span data-code-shown></span><button class="ps-code-action ps-code-more" type="button" data-code-more aria-expanded="false" aria-controls="code-code"><span data-code-more-label>Show all lines</span><span class="ps-i ps-i-chevron" aria-hidden="true"></span></button></div>
<p class="ps-visually-hidden" role="status" data-code-status></p>
</figure>
<p class="ps-note">Sample source.</p>
</main>
```

## Variant: Diff

The change an agent made to a file, with added and removed lines, old and new line numbers and a change count; Copy takes the new version.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Code block diff</h1><p class="ps-note">The change an agent made to a file, with old and new line numbers. Copy takes the new version.</p></header>
<figure class="ps-code" data-ps-code-block data-language="ts" data-diff data-old-start="12" data-new-start="12" aria-labelledby="code-diff-file">
<figcaption class="ps-code-head"><span class="ps-i ps-i-code" aria-hidden="true"></span><span class="ps-code-file" id="code-diff-file">src/session.ts</span><span class="ps-code-lang">TypeScript</span><span class="ps-code-stats"><span class="ps-visually-hidden">3 lines added, 1 removed</span><span data-sign="+" aria-hidden="true">+3</span><span data-sign="-" aria-hidden="true">−1</span></span><span class="ps-code-actions"><button class="ps-code-action" type="button" data-code-wrap aria-pressed="false"><span class="ps-i ps-i-wrap" aria-hidden="true"></span><span class="ps-code-action-label">Wrap</span></button><button class="ps-code-action" type="button" data-code-copy><span class="ps-i ps-i-duplicate" aria-hidden="true"></span><span class="ps-code-action-label">Copy</span></button></span></figcaption>
<div class="ps-code-body" id="code-diff-code" tabindex="0" role="region" aria-label="Code: src/session.ts"><pre><code>
 export function getSession() {
-  return readStoredSession();
+  const value = cookies.get(&quot;session&quot;);
+  if (!value) throw new Error(&quot;no session&quot;);
+  return value;
 }
</code></pre></div>

<p class="ps-visually-hidden" role="status" data-code-status></p>
</figure>
<p class="ps-note">Sample change.</p>
</main>
```

## Variant: Terminal

Commands an agent ran and what they printed, on the terminal surface without line numbers; Copy takes the commands only.

```html
<main><header class="ps-stack-tight"><p class="ps-kicker">Component / Agents</p><h1 class="ps-heading">Terminal output</h1><p class="ps-note">Commands an agent ran and what they printed. Copy takes the commands only, without the output.</p></header>
<figure class="ps-code" data-ps-code-block data-language="shell" data-surface="terminal" data-line-numbers="false" data-code-autoplay aria-labelledby="code-shell-file">
<figcaption class="ps-code-head"><span class="ps-i ps-i-code" aria-hidden="true"></span><span class="ps-code-file" id="code-shell-file">~/projects/docs</span><span class="ps-code-lang">Shell</span><span class="ps-code-actions"><button class="ps-code-action" type="button" data-kit-replay hidden><span class="ps-i ps-i-replay" aria-hidden="true"></span><span class="ps-code-action-label">Replay</span></button><button class="ps-code-action" type="button" data-code-wrap aria-pressed="false"><span class="ps-i ps-i-wrap" aria-hidden="true"></span><span class="ps-code-action-label">Wrap</span></button><button class="ps-code-action" type="button" data-code-copy><span class="ps-i ps-i-duplicate" aria-hidden="true"></span><span class="ps-code-action-label">Copy</span></button></span></figcaption>
<div class="ps-code-body" id="code-shell-code" tabindex="0" role="region" aria-label="Code: ~/projects/docs"><pre><code>
$ npm run build
&gt; docs@2.4.0 build
&gt; node scripts/build-index.mjs &amp;&amp; next build
Indexed 412 pages in 1.8 s
$ npm run test -- --filter search
# 38 tests, 0 failures
PASS lib/rank.test.ts (24 tests)
PASS app/api/search/route.test.ts (14 tests)
</code></pre></div>

<p class="ps-visually-hidden" role="status" data-code-status></p>
</figure>
<p class="ps-note">Sample session.</p>
</main>
```
