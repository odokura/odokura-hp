# Role division: Claude designs, Codex implements

Two agents share this repo. Stay in your lane unless the user says otherwise.

- **Claude**: design + writing the Codex implementation prompt, and reviewing Codex's
  report. Does not write feature code by default.
- **Codex**: implementation + verification. Reports a diff summary, the full
  verification output, and a self-check against the acceptance criteria.

Writing prompts and reviewing reports, incl. token-lean delegation → `codex-prompt` skill.
Coding philosophy (YAGNI / minimal change) → `lazy-dev` skill.

When the user asks Claude to "implement" directly, Claude may write the code.

# Repo guardrails (odokura-hp docs site)

- Read Japanese as UTF-8 explicitly. PowerShell: `Get-Content -Encoding UTF8`.
- Don't change Docusaurus site config (`docusaurus.config.ts`, `sidebars.ts`, navbar,
  footer, presets, routing, build/deploy) while working on content/CSS, unless asked.
- `src/pages/index.tsx` is intentionally special (matches the published homepage). Don't
  normalize it to the docs-site design.
- Docs `.md` are MDX: `{ }` is evaluated as JSX. Put any code containing `{`, `}`, or
  backticks in a fenced code block (```), never in inline code — it crashes the page.
