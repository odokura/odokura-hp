---
title: hatsugo-note の開発環境
sidebar_label: hatsugo-note
draft: true
sidebar_position: 3
---

# hatsugo-note の開発環境

Hatsu-go 本体（子どもの発語記録アプリ）リポジトリの開発環境メモ。リポジトリ本体は `odokura-hp` とは別（このサイトには含まれない）。

## スタック

- Expo ~54 / React Native 0.81 / React 19 / TypeScript ~5.9
- ルーティング: `expo-router`
- 永続化: AsyncStorage（`storage/` 経由）
- テスト: Jest（`jest-expo`）

## 主なコマンド

```bash
npm install
npm start          # Expo 開発サーバー
npm run android     # Android dev build（Windows での基本確認ルート）
npm run web          # ブラウザ確認（ネイティブ機能は動かない）
npm run typecheck
npm run lint
npm test
```

`expo-dev-client` と Expo Go 非対応のネイティブモジュール（`react-native-iap`、`react-native-zip-archive` 等）を使うため、**Expo Go ではフル動作しない**。Windows での動作確認は Android dev build が基本。

### Android dev build の前提

- JDK 17
- Android SDK（`android/local.properties` の `sdk.dir`）
- `adb` が PATH 上にあること
- 実機（USBデバッグ有効）またはエミュレータ

## ビルド・リリース

- EAS クラウドビルド（`development` / `preview` / `production` の 3 プロファイル）と Android ローカル dev build は別物。用途・コマンドの詳細は hatsugo-note リポジトリの `README.md` を参照する。
- iOS は Windows 機にネイティブ `ios/` が無いため、EAS クラウドビルド以外の選択肢が無い。
- ストア提出（`eas submit`）は **Claude・Codex のどちらも実行しない**。常にユーザー本人が実行する（`AGENTS.md` の「Git と安全性」と一致）。
- バージョン番号（`app.json` の `version`）の手動更新は、ユーザーまたは依頼を受けた Codex が行ってよい。ただし、`eas submit` を含むストア提出操作自体は対象外。

## Claude / Codex の役割分担

`AGENTS.md` に正本がある。

- **Claude**: 設計 + Codex 向け実装プロンプトの執筆 + Codex の報告のレビュー。原則として feature code は書かない。
- **Codex**: 実装 + 検証。diff サマリ・検証コマンドの全出力・受け入れ条件ごとの自己チェックを報告する。
- ユーザーが「実装して」と直接 Claude に頼んだ場合は、Claude がコードを書いてよい。

hatsugo-note リポジトリ自体に `.claude/skills/` は無い。Claude が hatsugo-note 向けに書く実装プロンプトは、odokura-hp の `codex-prompt` skill の形式（対象ファイル / 背景 / やってほしいこと / 制約 / 検証）を踏襲する。

標準フロー:

1. issue を作る
2. `main` から作業ブランチを切る
3. Claude が Codex 用プロンプトを書く
4. Codex が実装・検証する
5. Claude が Codex の報告と差分をレビューする
6. findings があれば Claude が修正用プロンプトを書く
7. Codex が修正・検証する
8. 問題がなくなるまで 5〜7 を繰り返す
9. 検証が通ったら push する
10. Claude が issue を close する

## ブランチ運用

- `main` で直接作業しない。`fix/*` `feat/*` `chore/*` `docs/*` `release/*` のプレフィックスで作業ブランチを切る。
- 1ブランチ1目的（バグ修正と新機能を混ぜない等）。
- マージ前に最低限 `typecheck`。`lib/` `storage/` や日付処理・設定保存を変更した場合は `test` も。
- `ver.1` 系の保守は `release/v1` から、`ver.2` 以降の開発は `main` から。

## Codex のサンドボックス制約

`.codex/rules/repo.rules` で次を制限している。

- `git reset --hard` / `git clean -fd` 系: 禁止
- `eas submit`（ストア提出）: 禁止
- `git push`: 許可するが毎回確認を挟む（prompt）
- `gh issue` の view/list/create/edit/close: 許可

`.codex/config.toml` ではネットワークアクセス無効のワークスペース書き込みサンドボックスで動作する。

## ディレクトリ構成

```text
app/                    # expo-router の画面
components/             # 共通UIと表示ロジック
constants/              # テーマ、課金、チャート定数など
hooks/                  # theme / membership などの hook
i18n/locales/           # ja / en / zh-Hant
lib/                    # 純粋寄りロジック、バックアップ、日付処理など
storage/                # AsyncStorage アクセス
types/                  # 型定義（中心は types/record.ts の SpeechRecord）
```

## 実装ルール

- ルーティングは `expo-router`、永続化は `storage/` を通す
- 文言は `t()` 経由。新規キー追加時は `en.ts` `ja.ts` `zh-Hant.ts` を揃える
- パス参照は `@/` を優先
- UIでの一時しのぎより `lib/` や `storage/` の責務で解決できるか先に検討する

詳細はリポジトリ側の `README.md` / `AGENTS.md` / `CLAUDE.md` を参照（このサイトの外）。
