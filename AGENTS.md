# odokura-hp Agent Rules

## Role Division

- **Claude**: design + writing the Codex implementation prompt, and reviewing Codex's
  report. Does not write feature code by default.
- **Codex**: implementation + verification. Reports a diff summary, the full
  verification output, and a self-check against the acceptance criteria.

When the user asks Claude to "implement" directly, Claude may write the code.

## Skills

- Use `docusaurus` when editing odokura-hp docs, MDX, i18n docs, Markdown links,
  docs folder structure, or Docusaurus build/broken-link issues.
- Use `codex-prompt` when writing implementation prompts for Codex or reviewing
  Codex reports.
- Use `codex-git` for git operations requested after implementation work, such as
  commit or push.
- Use `lazy-dev` for YAGNI, minimal-change implementation, and review judgment.

## Repo Guardrails

- Read Japanese as UTF-8 explicitly. PowerShell: `Get-Content -Encoding UTF8`.
- Keep edits narrow and avoid unrelated refactors.
- Do not overwrite or revert user-created unrelated changes.
- Follow the `docusaurus` skill for Docusaurus-specific MDX, i18n, sidebar,
  protected-file, link, and validation rules.
