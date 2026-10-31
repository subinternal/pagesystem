# Implementation

Every entry's HTML is in its own file under entries/. Two shared files make them look and behave right. Both are
large: copy or link them into the project; do not read them whole.

- **pagesystem.css**: the design tokens and every component's styles. Link it once. To see one component's rules,
  search it for the component's class (for example `.ps-chat-input`) rather than reading the file.
- **pagesystem.js**: native behaviors for components that have them. Load it once and call
  `enhanceComponents(document)` after mounting; keep the disposer it returns and call it before replacing the
  subtree. Give repeated specimens unique IDs and radio group names. It makes no network requests and stores nothing.

Fonts: the tokens name Bricolage Grotesque, Instrument Sans and JetBrains Mono with system fallbacks. Use the host
project's own fonts by overriding the font tokens; never load fonts from a remote service.

These are local examples, not connected apps: replace sample data with the product's own, and keep each entry's
contract (its content, states, responsive behavior and checks) when adapting it.
