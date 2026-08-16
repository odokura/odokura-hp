---
title: XXGGLL 画面仕様
sidebar_label: 概要
sidebar_position: 1
draft: true
---

# XXGGLL 画面仕様

このカテゴリは、利用者の体験を「何を理解し、何を操作し、何を記録するか」と「それをどう見せるか」に分けて定義する。
製品の意味と世界観は[世界観コンセプト](../../concept/foundation/worldview.md)が正本であり、ここでは画面へ落とす契約だけを扱う。

## 文書の責務

| 文書 | この文書だけが決めること | 決めないこと |
| --- | --- | --- |
| [画面台帳](./screen-catalog.md) | ルート、主対象、read model、権限、状態、遷移、画面ごとの受け入れ条件 | 色、装飾、実装手順 |
| [UX](./ux.md) | 利用者の問い、情報構造、導線、画面群の責務、境界の伝え方 | CSS、コンポーネントの細部、証拠保存 |
| [デザイン仕様](./design.md) | 視覚結果、共通部品の状態、画面モード、特殊効果の許可範囲 | CSSファイル構成、利用者導線、変更手順 |
| [CSS実装仕様](./css.md) | import順、CSSファイル責務、DOM、selector、token、状態、breakpoint、特殊効果の宣言、移行順 | 利用者の導線、業務状態の意味、レビュー判定 |
| [デザイン運用](./design-operations.md) | 変更記録、リスク分類、検証証拠、合否、独立レビュー、release gate、切り戻し | 新しい視覚ルール、画面の業務契約、CSSの値 |
| 個別画面仕様 | その画面固有の目的、表示順、文言、状態差分 | 共通部品、共通状態、権限、CSSの再定義 |

## 画面別メニュー

| 対象 | 正本 |
| --- | --- |
| Creator owner / staff | [Creator管理](./creator-management/overview.md) → [概要画面](./creator-management/dashboard.md) / [発行プログラム](./creator-management/programs.md) / [ファン全体の傾向](./creator-management/audience.md) / [収益・精算](./creator-management/revenue.md) / [別契約の提供物](./creator-management/offerings.md) / [設定・権限](./creator-management/settings.md) |
| Fan | [プロフィール](./profile.md) / [設定](./settings.md)。保有・活動の個別仕様は画面台帳から参照する |
| Public | [トップ](./public-homepage.md) / [流れ](./public-flow.md) / [費用](./public-costs.md) |
| 全画面共通 | [画面台帳](./screen-catalog.md) / [UX](./ux.md) / [デザイン仕様](./design.md) / [CSS実装仕様](./css.md) |

旧Creator管理シェル名はこのカテゴリの製品概念・シェル名・表示ラベルとして使わない。Creatorが発行・集計・収益を扱う画面群は、機能責務として「Creator管理」と呼ぶ。
既存の`/studio`はURL移行が完了するまでの技術的互換ルートであり、UI上のブランドではない。

## 変更目的から読む順序

| 目的 | 確認順 |
| --- | --- |
| 世界観・視覚方針 | [世界観コンセプト](../../concept/foundation/worldview.md) → [デザイン仕様](./design.md) |
| 新しい画面・導線 | [画面台帳](./screen-catalog.md) → [UX](./ux.md) → 個別画面仕様 → [デザイン仕様](./design.md) |
| Creator管理・集計 | [Creator管理](./creator-management/overview.md) → 対象画面仕様 → [画面台帳](./screen-catalog.md) → [デザイン仕様](./design.md) |
| CSS・共通部品 | [デザイン仕様](./design.md) → [CSS実装仕様](./css.md) → 実装CSS → [デザイン運用](./design-operations.md) |
| 権限・状態・API | [画面台帳](./screen-catalog.md) → `core` / `security`の正本 → 個別画面仕様 |
| 変更の確認・release | 影響する正本 → [デザイン運用](./design-operations.md) |

## 正本の原則

- 1つの決定を複数の文書へ複製しない。要約は正本へリンクする。
- 画面台帳の状態・認可・read modelを、UXやデザイン仕様で言い換えて別仕様にしない。
- 世界観はコンセプト、体験はUX、視覚結果はデザイン仕様、CSSの書き方はCSS実装仕様、実施方法と証拠はデザイン運用が所有する。
- 仕様が競合した場合、実装者が見た目やURLから勝手に選ばない。正本を更新し、受け入れ条件を同時に直す。
- 既存コードが仕様と異なる場合、コードを正しい根拠にせず、差分を`NOT VERIFIED`または移行課題として記録する。

## 直近レビューへの対応

| 項目 | 結果 |
| --- | --- |
| 対象 | 世界観、UX、デザイン仕様、デザイン運用、画面台帳の責務境界とCreator管理の呼称 |
| 判定 | CSS実装仕様とデザイン運用の再構成後に、独立レビューで確定する |
| 対応 | デザイン仕様は視覚結果、CSS実装仕様は実装契約、デザイン運用は変更管理と合否へ分離した。独立レビューで検出した旧デザインID参照、重複token、panel modifier、未定義glow tokenも修正した |
| 残件 | 既存実装の`/studio` URL、可視ラベル、CSSセレクタ、旧tokenの移行は、仕様更新とは別の実装作業として残る。移行前の現行CSSは合格扱いにしない |
