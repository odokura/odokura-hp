---
title: データモデル
sidebar_label: データモデル
draft: true
sidebar_position: 3
---

# データモデル

## モデル：3 層で考える

集約は、次の 3 層を区別すると無理なく扱える。

1. **surface** — 実際に発話された形
2. **lemma** — 基本形 / 代表形（任意）
3. **concept** — 意味上のまとまり（任意）

| surface | lemma | concept |
| --- | --- | --- |
| `cars` | `car` | vehicle |
| `パパ` | `パパ` | father |
| `わんわん` | `いぬ` | dog |

この区別があると、「同じ意味だが別語」「同じ語の複数形・活用形」「幼児語と通常語」をすべて同じ枠組みで扱える（→ [重複判定基準](./dedup-levels.md)）。

## 発語レコードへの追加（後方互換・任意）

現行 `SpeechRecord` に `conceptId?` / `lemma?` を**任意フィールドとして追加**する。未設定のレコードは従来どおり surface 単位で扱う（後方互換）。

```ts
interface SpeechRecord {
  // …現行フィールド…
  conceptId?: string;  // 所属する concept（任意）
  lemma?: string;      // 基本形 / 代表形（任意）
  yomi?: string;       // 見出し名/単語入力時の読み（任意・自動推定）
}
```

- `lemma` は**レコードに文字列で持つ**だけ（マスタを持たない）。lemma グループは `lemma` の文字列一致で作る。
- `conceptId` は次の concept マスタを参照する。
- `yomi` は見出し名/単語入力時のキー入力から自動推定した読み。ユーザーが手動編集できる。

## 概念マスタ（MVP は最小）

concept は「ユーザーが束ねた意味グループ」。MVP では **`id` と `label` だけの最小マスタ**を持つ。`locale` や variant 種別、辞書連携は将来拡張に回す。

```ts
interface LexicalConcept {
  id: string;     // 例: "concept_1719500000000-x8a2"
  label: string;  // グループの表示名（ユーザーが決められる）
  yomi?: string;  // 見出しラベルの読み（任意・自動推定）
}
```

- 新しい AsyncStorage キー（例: `lexical_concepts`）に配列で保存する。
- **なぜマスタを持つか**: `label` を保存しないと、グループ名が「どのレコードが最新か」で揺れてしまう。ユーザーがグループ名を決められるよう、最小の `{id, label}` だけ持つ。

### conceptId の採番ルール

- 形式は既存レコード ID と同じ流儀: `concept_${Date.now()}-${rand}`。
- **新規グループ作成時**（2 語を初めて束ねる）に 1 つ採番し、対象レコード全件の `conceptId` を揃える。`label` の既定値は「束ね先（マージ先）の surface」。ユーザーは編集可。
- **既存グループへ追加時**は、そのグループの `conceptId` を再利用する（新規採番しない）。

### マージ / 解除のライフサイクル

- **マージ**: 対象レコードの `conceptId` を同じ値にする。surface レコード自体は変更しない（非破壊）。
- **フォールドイン（normalizeKey の取り込み）**: あるレコードに `conceptId` を新規付与するとき、**同じ [`normalizeKey`](./dedup-levels.md) を持ち、まだ `conceptId` を持たない既存レコードがあれば、それらにも同じ `conceptId` を付与する**。
  - なぜ必要か: [グルーピングの優先順位](#グルーピングの優先順位)は `conceptId` 一致を最優先するため、同じ正規化表記でも一方だけ `conceptId` を持つと**別グループに分裂し、同じ見出しが一覧に複数行表示される**（例: `いぬ`（無印）と `いぬ`（`わんわん` concept に参加、表示名が同じ）が別行になる）。フォールドインしないと、L0′ で本来 1 つのはずの表記が分裂したまま残る。
  - 適用箇所: 新規 concept 作成時・既存 concept への参加時のどちらも対象（[集約 UX](./aggregation-ux.md) の入力時提案・手動集約の両方）。
- **解除**: 対象レコードの `conceptId` を外す。
- **孤児の掃除**: ある `conceptId` を参照するレコードが **1 件以下**になったら、その concept は意味を持たないので、残った 1 件の `conceptId` を外し、`lexical_concepts` から該当エントリを削除する。

## グルーピングの優先順位

表示上の「ひとまとまり」は次の順で決める。

1. `conceptId` が同じ → 同一グループ（表示名は `LexicalConcept.label`）。
2. それ以外で `lemma` が同じ → 同一グループ（**表示名は `lemma`＝基本形**）。
3. それ以外は surface を [`normalizeKey`](./dedup-levels.md) で正規化した値が同じものをまとめる（L0′）。表示名は代表 surface（最新更新のもの）。

→ 表示名（見出しラベル）の優先順位は **`concept.label` ＞ `lemma`（基本形）＞ 代表 surface**。concept・lemma は固定の名前を持ち、それ以外だけ最新 surface で揺れる。

## 保存・バックアップ・移行

- `SpeechRecord` への `conceptId?` / `lemma?` 追加は**任意フィールドのみ**で、既存データの移行は不要（後方互換）。
- `lexical_concepts` を**新規ストアとして追加**する。バックアップ・復元の対象に含める（→ 既存 backup 仕様に 1 キー追加）。
- 復元時、参照先 concept が欠けた `conceptId`（ダングリング）は、表示時に無視して**次の優先度（`lemma` → 正規化 surface）へフォールバック**する（壊さない）。

## 将来の拡張

辞書・多言語・表現バリエーションを扱う段階で、マスタを次のように拡張する。

```ts
interface LexicalConcept {
  id: string;
  label: string;
  locale?: 'ja' | 'en' | 'zh-Hant';
}

interface LexicalVariant {
  conceptId: string;
  surface: string;
  lemma?: string;
  variantType?: 'baby_talk' | 'family_term' | 'standard' | 'approximation' | 'plural' | 'inflected';
}
```
