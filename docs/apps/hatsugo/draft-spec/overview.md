---
title: 仕様検討メモ 全体像
sidebar_label: 全体像・索引
draft: true
sidebar_position: 1
---

# 仕様検討メモ 全体像

Hatsu-go の仕様検討（draft）を分割管理するための索引。各テーマは単一目的のページに分け、必要な範囲だけを開けるようにする。

## テーマ一覧

| テーマ | 内容 | 状態 |
| --- | --- | --- |
| [初回メッセージ仕様](./onboarding-message.md) | 初回起動オンボーディングの文言と表示条件 | 実装済み・規定済み |
| [発語記録モデル（現行）](./record-model.md) | 現在の `SpeechRecord`・保存・グルーピング・編集ロックの as-is | 確定（現行の事実） |
| [発語記録の編集](./record-editing.md) | 登録済みの単語を編集可能にする（柔軟性） | 検討中 |
| [単語の集約](./word-grouping/index.md) | 表現と意味のずれ・二重登録を解く集約機能 | 検討中 |
| [検索・一覧性](./list-search.md) | 100件規模で探す・見渡すための検索／索引レール | 検討中 |
| [外向け文言（ストア）](./store-copy/) | ストア入力情報（iOS / Google Play・ja/en/tw）と審査・安全ライン | 規定済み |

## 「単語の集約」の構成

1. [概要](./word-grouping/index.md) — 背景・課題・目標・非目標
2. [重複判定基準](./word-grouping/dedup-levels.md) — 「同じ」を 4 レベルに分ける
3. [データモデル](./word-grouping/data-model.md) — surface / lemma / concept の 3 層
4. [集約 UX](./word-grouping/aggregation-ux.md) — いつ・どう束ねるか
5. [表示の方向性](./word-grouping/display.md)
6. [現行との比較検証](./word-grouping/comparison.md)
7. [ロードマップ・論点](./word-grouping/roadmap.md)

## 検討状況メモ

- 決定済み: 重複判定の正規化範囲（→ [重複判定基準](./word-grouping/dedup-levels.md)。`normalizeKey` は黙ってまとめ、`foldForSuggestion` は提案に留める）。
- MVP の方針: `lemma` と `concept` を最初から持ち、**明らかなもの（L0′ 正規化一致）だけ自動マージ・それ以外は確認**（粒度はユーザーが決める）。英語の簡単な活用と小さな curated 辞書から確認付きの提案を出す（→ [ロードマップ](./word-grouping/roadmap.md)）。
- 残課題は MVP 方針を確定済み: L1 は自動にしない（確認のまま）／多言語は手動マージのみ可・自動辞書は後段／集約 UI は単語詳細／意味の数はサマリーに出さない（各ページの「決定」節参照）。
- 実装は #58〜#62 に分割（GitHub）。#58 完了、#59/#60 並行着手中。
