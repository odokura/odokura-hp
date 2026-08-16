---
title: XXGGLL 構想
sidebar_label: 全体像・索引
draft: true
sidebar_position: 1
---

# XXGGLL 構想

XXGGLL（シギル）は、ユーザーがクリエイターへの応援を公式な支援関係として記録し、
取得・保有・表示できる番号付きデジタル証票である。すべてのランクで、取得だけではクリエイターに
個別の応答・制作・提供義務を発生させない。購入・利用に本人確認は不要で、ユーザーは同意した属性と
応援意思をクリエイターへ届けられる。

## 索引

構想の全ページはここから参照する。配下カテゴリには索引ページを作らない。

| 分野 | ページ |
|---|---|
| サービスの目的・設計原則 | [コンセプト](./foundation/concept.md) |
| 体験の世界観・視覚モチーフ | [世界観コンセプト](./foundation/worldview.md) |
| ランク・発行上限・主体 | [ランク・発行上限](./foundation/ranks.md) |
| 属性共有・同意・決済事業者確認 | [属性開示・決済事業者確認](./foundation/identity-disclosure.md) |
| 証票・個人支援記録・応援表現 | [関係記録・コンテンツ](./benefits/content.md) |
| 固定コンテンツ・追加商品・VIP・ExtraVIP個別サービス | [コンテンツ・追加商品・個別サービス](./benefits/templates.md) |
| 一般ユーザーの体験・関係の時系列 | [一般ユーザーとの関係](./general/relationship-general.md) |
| 状態遷移・在庫・猶予期間 | [取引ルール](./general/transaction-general.md) |
| 価格・発行数 | [価格・発行数の算出](./general/pricing.md) |
| 一般クリエイターの作業 | [一般クリエイター](./general/creator-general.md) |
| VIP・ExtraVIP固有のユーザーフロー | [VIP・ExtraVIPユーザーとの関係](./vip/relationship-vip.md) |
| VIPとの連絡・希望受付・合意管理 | [VIPコンシェルジュ運用](./vip/vip-concierge.md) |
| VIPクリエイターの認定・対応 | [VIPクリエイター](./vip/creator-vip.md) |

## 確定した設計原則

- XXGGLL本体は「応援決済＋関係証票＋同意制プロフィール」とする。
- すべてのランクで、XXGGLL取得だけではクリエイター役務を発生させない。
- 外部案内リンクの閲覧、待機、一次・二次購入、継続支援、出品、属性共有、VIP DMの利用に本人確認を要求しない。無料証票はPublic Betaの提供対象にしない。
- クリエイター報酬の受領時だけ、Stripe Connectが求める本人確認・事業者確認・振込先確認をStripe上で行う。
- 証票来歴は譲渡できるが、個人支援履歴、属性、メッセージは譲渡しない。
- 一次支援、継続支援、二次流通価格、クリエイターロイヤリティを分けて記録する。
- VIP・ExtraVIPでは、双方合意・別契約時だけ個別役務を発生させる。
- 追加商品とVIP・ExtraVIP個別サービスはXXGGLL本体から分離する。
- クリエイターへの通知は集計・週次ダイジェストを既定とし、個別返信を要求しない。
