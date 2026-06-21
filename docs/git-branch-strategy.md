# Hatsu-go Git Branch Strategy

## 1. 目的

この文書は、Hatsu-go の開発で Git ブランチをどう使うかを定義する。

目的は次のとおり。

- `main` を常に「今リリースしてもよい状態」に保つ
- `ver.1` 系の保守と `ver.2` 以降の開発を混ぜない
- 不具合修正、新機能、審査対応、内部整理を分離し、レビューしやすくする
- Claude と Codex を使う前提でも、差分が混ざらない運用にする

## 2. 基本方針

- `main` で直接作業しない
- すべての作業は `main` または `release/v1` から切った作業ブランチで行う
- 1 ブランチ 1 目的を守る
- バグ修正と新機能、審査対応と UI 改善を同じブランチに混ぜない
- マージ前に最低限 `typecheck` を通す
- 共有設定、backup、審査対応のような重い変更は `test` と `lint` まで確認する

## 3. ブランチの役割

### 3.1 `main`

`main` は現行開発の本線とする。

- `ver.2` 以降の開発を入れる
- 常に「今出してよい状態」を保つ
- 作業途中の変更や checkpoint を直接積まない

### 3.2 `release/v1`

`release/v1` は `ver.1` 系の保守ブランチとする。

- バグ修正
- 軽微な UI 修正
- 必要最小限の安定化

次のような変更は入れない。

- `ver.2` 仕様の新機能
- 大きな設計変更
- 実験的変更

### 3.3 作業ブランチ

日常の開発は次のプレフィックスを使う。

- `fix/*`
  - 不具合修正
  - 審査差し戻し対応
  - 回帰修正
- `feat/*`
  - 新機能
  - 仕様追加
  - 大きめの UX 改善
- `chore/*`
  - 内部整理
  - DEV 限定化
  - 設定や依存の整理
- `docs/*`
  - ドキュメントのみ
- `release/*`
  - リリース前の束ね調整が必要なときだけ使う

## 4. ブランチ名の付け方

短く、目的が分かる名前にする。

例:

- `fix/play-policy-media-permission`
- `fix/chart-resize`
- `fix/home-share-guard`
- `feat/share-presets`
- `feat/remove-achievements`
- `chore/dev-only-milestones`
- `docs/git-branch-strategy`

避けるべき名前:

- `work`
- `tmp`
- `test`
- `feature/update`
- 何を直すブランチか分からない抽象名

## 5. 標準手順

### 5.1 作業開始

まず `main` を最新にする。

```powershell
git switch main
git pull origin main
```

`ver.1` 保守の場合は `release/v1` から始める。

```powershell
git switch release/v1
git pull origin release/v1
```

### 5.2 issue を作る

作業は原則 issue 単位で進める。

- まず issue を作る
- issue の目的を 1 つに絞る
- issue の内容に合わせてブランチを切る

### 5.3 ブランチを切る

例:

```powershell
git switch -c fix/chart-resize
```

### 5.4 実装する

- Claude に実装させる場合も、そのブランチでだけ触る
- 別件を思いついても同じブランチに混ぜない
- 途中で方針が変わったら、必要に応じて issue とブランチを分け直す

### 5.5 差分を確認する

```powershell
git status
git diff --stat
```

確認点:

- 目的外のファイルが混ざっていないか
- 削除が意図どおりか
- 生成物を誤って含めていないか

### 5.6 検証する

最低限:

```powershell
npm.cmd run typecheck
```

必要に応じて:

```powershell
npm.cmd run test -- --runInBand
npm.cmd run lint
```

### 5.7 コミットする

```powershell
git add -A
git commit -m "fix: prevent share before settings load"
```

コミットメッセージも 1 目的に対応させる。

### 5.8 push する

```powershell
git push -u origin fix/chart-resize
```

### 5.9 マージ後

```powershell
git switch main
git pull origin main
git branch -d fix/chart-resize
```

次の作業は、また `main` から新しいブランチを切る。

## 6. Claude / Codex を使う場合の運用

Hatsu-go では、実装を Claude、レビューや issue 整理を Codex に寄せることがある。
その場合も、Git の単位は変えない。

### 6.1 役割分担

- Claude
  - 実装
  - テスト実行
  - 修正対応
- Codex
  - issue 文面作成
  - Claude 向けプロンプト作成
  - レビュー
  - 修正用プロンプト作成
  - issue close

### 6.2 標準フロー

1. issue を作る
2. `main` から作業ブランチを切る
3. Codex に Claude 用プロンプトを書かせる
4. Claude に実装させる
5. Codex にレビューさせる
6. findings があれば Codex に修正用プロンプトを書かせる
7. Claude に修正させる
8. 問題がなくなるまで 5〜7 を繰り返す
9. 検証が通ったら push する
10. Codex に issue を close させる

### 6.3 注意点

- Claude の作業が途中でも `main` へ直接積まない
- Codex のレビューが終わる前に混ぜない
- 「checkpoint 用コミット」は本線の代わりではない
- 審査対応、不具合修正、仕様変更はなるべく別ブランチに分ける

## 7. こういう時は分ける

次の組み合わせは、同じブランチに入れない。

- 審査対応 + 新機能
- バグ修正 + UI 改善
- 実績削除 + 共有設定改善
- グラフ修正 + ストア設定修正
- DEV 限定化 + ユーザー向け仕様変更

今回の Hatsu-go で実際に分けるなら、最低でも次の単位が望ましい。

- `fix/play-policy-media-permission`
- `fix/chart-and-home-share-guard`
- `feat/share-settings-refresh`
- `feat/remove-achievements`
- `chore/dev-only-milestones`

## 8. hotfix の扱い

`ver.1` に緊急修正が必要な場合は、`release/v1` から切る。

例:

```powershell
git switch release/v1
git pull origin release/v1
git switch -c fix/v1-crash-on-startup
```

修正後は `release/v1` に戻し、必要なら `main` にも別途反映する。

## 9. 例外

次のような例外はある。

- ドキュメントだけの微修正
- typo 修正だけ
- ローカル専用の一時検証

ただし、少しでもコード変更が入るなら、基本はブランチを切る。

## 10. 要約

- `main` は常に出せる状態に保つ
- 作業は必ず目的ごとのブランチで行う
- 1 ブランチ 1 目的を守る
- Claude/Codex を使っても Git の単位は崩さない
- 混ざりそうなら早めにブランチを分ける
