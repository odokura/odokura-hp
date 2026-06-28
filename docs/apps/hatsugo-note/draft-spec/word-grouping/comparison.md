---
title: 現行との比較検証
sidebar_label: 現行との比較検証
draft: true
sidebar_position: 6
---

# 現行仕様との比較検証

詳細は[発語記録モデル（現行仕様）](../record-model.md)。

| 観点 | 現行（as-is） | 集約後（to-be） |
| --- | --- | --- |
| グルーピングキー | surface（`word`）完全一致のみ | `conceptId` → `lemma` → 正規化 surface の順で集約（surface は保持） |
| `パパ` ↔ `おとうさん` | 別単語・別タイル | 同 concept にまとめ可能 |
| `car` ↔ `cars` | 別単語 | 同 lemma にまとめ可能 |
| 入力ゆれ `Car` / `car` | 別単語 | 正規化一致で黙ってまとめ（L0′） |
| 表記ゆれ `ぱぱ` / `パパ` | 別単語 | 近似一致を任意提案でまとめ（L1） |
| 二重登録（異 surface 同義） | 防げない | concept でまとめて回避 |
| 同 surface の複数記録 | 1 グループ（履歴） | 変わらず 1 グループ |
| ソート軸 | 日付・登録順のみ | 意味カテゴリ軸が増える |
| 入力負担 | surface のみ（軽い） | surface のみ維持（concept は補助） |

## 現行から増える要素（ギャップ）

- データ: `SpeechRecord` に `conceptId?` / `lemma?` を追加。`LexicalConcept` / `LexicalVariant` のストアを新設（→ [データモデル](./data-model.md)）。
- ロジック: ホーム `latestPerWord` と単語詳細の「`word` 完全一致」前提を、`conceptId` があればそれ優先・なければ surface（必要なら正規化）でまとめる形に拡張。
- UX: 手動集約・解除の導線、登録時の任意提案（→ [集約 UX](./aggregation-ux.md)）。

## マイグレーション方針

- **破壊的変更なし。** 追加は任意フィールドのみ。`conceptId` 未設定の既存レコードは従来どおり surface 単位で表示される。
- 既存の二重登録（`パパ` / `おとうさん` 等）は、後から手動 or 提案で `conceptId` を付与して束ねる。自動では束ねない。
- 表示ロジックの変更は段階導入する（まず下地、表示は据え置き）ことで、既存ユーザーの見え方が突然変わるのを避ける（→ [ロードマップ](./roadmap.md)）。
