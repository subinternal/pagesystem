# Pagesystem skills

Four agent skills for designing, reviewing and finishing web pages with explicit page contracts, shared tokens and
reusable components. They come from [Pagesystem](https://pagesystem.dev), a library of page systems, components and
elements by Subinternal.

| Skill | Use it to |
|---|---|
| `pagesystem-compose` | Design or rebuild a coherent set of web pages using explicit page contracts, shared tokens and reusable components. Use for page templates, site structure or a new kind of page; not for isolated copy edits. |
| `pagesystem-verify` | Review a rendered page or template against its task, page contract, accessibility, responsive behavior and state handling. Use for an evidence-based page-system audit; do not edit unless fixes are requested. |
| `pagesystem-recover` | Recover a page system from an existing product by inventorying page types, tokens, repeated components and behavioral contracts. Use when consolidating inconsistent templates or establishing a reusable library. |
| `pagesystem-finish` | Refine an implemented page within its existing design system, improving hierarchy, spacing, copy, focus, responsive behavior and motion. Use for a finishing pass without replacing product identity or architecture. |

## Install

**Claude Code**, as the `ps` plugin, which gives `/ps:compose`, `/ps:verify`, `/ps:recover` and `/ps:finish`:

```
/plugin marketplace add subinternal/pagesystem
/plugin install ps@pagesystem
```

**Any agent**, as standalone folders: copy a skill's whole folder into the place your agent reads skills from.

```sh
git clone --depth 1 https://github.com/subinternal/pagesystem.git
cp -R pagesystem/pagesystem-finish ~/.claude/skills/   # Claude Code (or .claude/skills/ in a project)
cp -R pagesystem/pagesystem-finish ~/.codex/skills/    # Codex
cp -R pagesystem/pagesystem-finish .agents/skills/      # agents that read .agents/skills/
```

Each skill is standalone; install one or all four. Then ask your agent for the job, for example "finish this page"
or "verify the pricing page against its contract".

## How a skill is laid out

A skill is a folder an agent reads a little at a time, so it works in agents with small context windows too:

- `SKILL.md`: what to do, in under forty lines.
- `references/foundations.md`: the typography, spacing and density rules every page follows.
- `references/catalog.md`: one line for every page system, component and element.
- `references/entries/<id>.md`: one entry's contract (task, content, states, responsive behavior, acceptance checks),
  its HTML and its variants.
- `references/implementation.md`: how to use the two shared files below.
- `references/pagesystem.css` and `references/pagesystem.js`: the shared stylesheet and native behaviors, to copy or
  link into a project, not to read whole.

No file an agent is told to read is longer than 2,000 lines. The skills make no network requests, need no server,
and keep the host product's own identity: the house palette is an example, not a requirement.

## License

Apache License 2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE). These folders are generated from the Pagesystem
library by Subinternal; changes are made there and published here.
