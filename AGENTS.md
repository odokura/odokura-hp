# odokura-hp Agent Rules

## Development and Review

- **Codex** independently performs specification checks, design, issue creation,
  implementation, review, and verification.
- Before and after implementation, Codex checks the applicable specification and
  acceptance criteria. Completion reports include a diff summary, full verification
  output, and an acceptance-criteria self-check.

## Skills

- Use `docusaurus` when editing odokura-hp docs, MDX, i18n docs, Markdown links,
  docs folder structure, or Docusaurus build/broken-link issues.
- Use `codex-prompt` when writing implementation prompts for Codex or reviewing
  Codex reports.
- Use `spec-review` when reviewing an implementation repo (neteclay, hatsugo-note)
  against `docs/apps/<app>/draft-spec`.
- Use `codex-git` for git operations requested after implementation work, such as
  commit or push.
- Use `lazy-dev` for YAGNI, minimal-change implementation, and review judgment.

## Repo Guardrails

- Read Japanese as UTF-8 explicitly. PowerShell: `Get-Content -Encoding UTF8`.
- Keep edits narrow and avoid unrelated refactors.
- Do not overwrite or revert user-created unrelated changes.
- Follow the `docusaurus` skill for Docusaurus-specific MDX, i18n, sidebar,
  protected-file, link, and validation rules.

## GitHub CLI authentication diagnosis

- Read GitHub repository, issue, and pull-request metadata through the connected
  GitHub app first. Use local `gh` only when the connector does not cover the
  required work, such as current-branch discovery or GitHub Actions log inspection.
- Do not label a single `gh` REST/GraphQL failure as an authentication failure.
  In the current runtime, verify authentication with `gh auth status`,
  `gh api user --jq .login`, and `gh api graphql -f query='{ viewer { login } }'`.
  If the two API checks succeed, report the failing command, endpoint, or GraphQL
  field as a request-specific failure; do not suggest `gh auth login`, re-login,
  or copying credentials. Do not use the GraphQL `viewerPermission` field as an
  authentication check.
