---
title: 開発環境 全体像
sidebar_label: 全体像
draft: true
sidebar_position: 1
---

# 開発環境 全体像

`draft: true` を付けた社内向けメモ。Docusaurus の開発表示では確認できるが、本番ビルドでは生成対象から外れる。

ODOKURA では現在 2 つのリポジトリを Claude Code と Codex CLI の併用で開発している。

| リポジトリ | 内容 | スタック |
| --- | --- | --- |
| `odokura-hp`（このリポジトリ） | 会社HP・Hatsu-go 紹介・規約・仕様メモを載せる Docusaurus サイト | Docusaurus 3 / React 19 / TypeScript |
| `hatsugo-note` | Hatsu-go 本体（子どもの発語記録アプリ） | Expo / React Native / TypeScript |

両リポジトリとも Claude Code と Codex CLI を併用し、役割分担も Claude 設計・Codex 実装に統一している。詳細は各ページを参照。

- [odokura-hp の開発環境](./odokura-hp.md)
- [hatsugo-note の開発環境](./hatsugo-note.md)

## 役割分担の比較

| | odokura-hp | hatsugo-note |
| --- | --- | --- |
| 設計・プロンプト作成 | Claude | Claude |
| 実装 | Codex | Codex |
| レビュー | Claude | Claude |
| git操作（実装フェーズ以降） | Codex に一言で指示 | Codex に一言で指示 |
| issue管理 | Claude（`gh` で直接） | Claude（`gh` で直接） |

両リポジトリとも同じ役割分担（Claude 設計・Codex 実装）を採用している。以前はリポジトリごとに逆の分担だったが、2026-06-28 以降 hatsugo-note 側も統一した。

## 共通する点

- どちらのリポジトリも `.claude/` (Claude Code 設定・skills) と Codex 向け設定を併設している。
- どちらも GitHub issue を作業単位にしている（`gh issue` で作成・参照）。
- どちらも「仕様/ルールをまず文書化し、実装はそれに合わせる」順序を踏む。
  - odokura-hp: `docs/spec`（`draft: true` の社内限定仕様）→ 実装
  - hatsugo-note: `AGENTS.md` / `CLAUDE.md` → 実装
