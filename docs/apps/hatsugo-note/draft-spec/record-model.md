---
title: 発語記録モデル（現行仕様）
sidebar_label: 発語記録モデル（現行）
draft: true
sidebar_position: 3
---

# 発語記録モデル（現行仕様）

現在実装されている発語記録の仕様（as-is）。[単語の集約](./word-grouping/index.md)の前提・比較対象として整理する。

## データモデル

`SpeechRecord`（`types/record.ts`）:

| フィールド | 型 | 役割 |
| --- | --- | --- |
| `id` | string | レコード識別子 |
| `word` | string | **実際に言ったことば（surface）。グルーピングの実質キー** |
| `recordedAt` | string | `YYYY-MM-DD`「いつ話したか」。並び順には使わない |
| `videoUri` | string \| null | 添付動画 |
| `speechStatus` | enum | `speech_only` / `understood_only` / `understood` / `multi_word` |
| `memo?` | string | メモ |
| `createdAt?` | string | ISO 8601。登録順ソート用 |
| `updatedAt?` | string | ISO 8601。更新順ソート用 |
| `phraseSource?` | string | 二語文以上で登録した場合の元フレーズ |

`concept`（意味のまとまり）や `lemma`（基本形）は**持たない**。語は surface 一層のみ。

## 保存（`storage/records.ts`）

- AsyncStorage キー `speech_records` に**フラットな配列**で保存。
- `saveRecord`: 末尾に push。**重複排除はしない**。同じ `word` を何度でも追加できる（＝同じ単語の複数の観測を別レコードとして蓄積する設計）。
- `appendRecords`: 二語文を分割した複数レコードを 1 回の read/write でまとめて追加。
- `updateRecord` / `deleteRecord`: `id` 単位。
- マイグレーション: 旧 status（`maybe` → `speech_only`）の置換、`createdAt` / `updatedAt` の補完。

## 編集（現行）

編集画面（`app/modal.tsx`）では、**`word` と `phraseSource` はロック表示で編集できない**（lockBox／鍵アイコン）。編集できるのは日付・動画・発語状態・メモのみ。`updateRecord` は呼ばれるが、`word` は state が変わらないため実質固定。

→ 一度登録した単語そのものは直せない。この制約は[発語記録の編集](./record-editing.md)で見直す。

## 入力と二語文の分割（`lib/word.ts`）

- `splitMultiWord`: 半角／全角スペースで分割し、trim・空要素除去。
  - 例: `ママ だいすき` → `["ママ", "だいすき"]`
- 分割された各語は**個別レコード**になり、`phraseSource` に元フレーズを保持する。

## 集約（表示上のグルーピング）

現行の「単語ごとのまとまり」は **surface（`word`）の完全一致**で作る。

- ホーム（`app/(tabs)/index.tsx`）`latestPerWord`: `word` が同一のものを 1 つにまとめ、最新を代表として表示。
- 単語詳細（`app/word-detail.tsx`）: `all.filter(r => r.word === word)` で完全一致したレコードを日付降順に表示。

→ グルーピングキー＝ `word` 文字列そのまま。**正規化（大文字小文字・全角半角・かな／カナ）はしない**。

## 現行で起きること（課題の所在）

1. **意味が同じ別表現は別単語になる**: `パパ` / `おとうさん`、`わんわん` / `いぬ` は別 `word` → 別タイル。互いにリンクできない。
2. **二重登録**: 異なる surface で同じ意味を登録すると、別レコード・別グループとして並ぶ。意味単位での重複を防げない。
3. **表記ゆれも別単語**: `ぱぱ` / `パパ`、`car` / `cars` は別 `word`。
4. **ソート軸が日付・登録順のみ**: 意味カテゴリで束ねて並べ替えることはできない（concept が無いため）。

補足: 「同じ surface を複数回記録」した場合は、詳細では 1 グループにまとまり、ホームでも 1 タイルになる（＝意図どおりの履歴蓄積で、これは重複ではない）。問題は「**異なる surface だが同じ意味・同じ語**」のケース。
