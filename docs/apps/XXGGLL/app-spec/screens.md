---
title: XXGGLL 画面・コンソール構成
sidebar_label: 画面・コンソール構成
sidebar_position: 6
draft: true
---

# XXGGLL 画面・コンソール構成

本ページは、利用者別の画面一覧と、単一の管理画面のロール別出し分けを扱う**画面構成の正本**である。各画面内の
操作フロー・状態遷移は構想の該当ページを正本とし、ビジュアルデザインと詳細なワイヤーフレームはスコープ外
とする。想定運用規模は小規模であり、役割ごとに専任コンソールを分けない（[アーキテクチャ](./architecture.md)）。

## 一般・VIP・ExtraVIPユーザー向け（Webクライアント）

| 画面 | 目的 | 扱うデータ・権限 | 関連する構想ページ |
| --- | --- | --- | --- |
| 発見・クリエイター一覧 | 閲覧、クリエイター・ランクの比較。アカウント不要 | 公開カタログのみ | [一般ユーザーとの関係](../concept/general/relationship-general.md) |
| 待機登録 | 通知先だけで待機リストへ登録 | 通知先（ハッシュ化保存） | [価格・発行数の算出](../concept/general/pricing.md) |
| アカウント作成・ログイン | 最小限の情報でアカウント作成。年齢確認・本人確認なし | account | [属性開示・決済事業者確認](../concept/foundation/identity-disclosure.md) |
| 購入最終確認(一次発行・二次流通) | 規約へのリンク・同意チェック、支払済み期限、次回決済日、年額、自動更新の有無、停止期限、停止画面への導線を表示する。同意後にだけ取得を確定する。二次流通では運営が定めた再発行価格を支払う | certificate、issuance_reservation、secondary_listing、ledger_entry、terms_acceptance監査ログ | [取引ルール](../concept/general/transaction-general.md)、[二次流通](../concept/general/secondary-market.md) |
| 保有証票一覧・タイムライン | 保有証票、来歴、支援履歴、証票支援累計額の確認 | 自分のcertificate（boost_total_amountを含む）、支援集計 | [関係記録・コンテンツ](../concept/benefits/content.md) |
| 証票支援 | 保有中の証票へ追加の支援決済を行う | ledger_entry（certificate_boost）、certificate.boost_total_amount | [関係記録・コンテンツ](../concept/benefits/content.md) |
| 属性共有設定 | 共有先・項目・目的の選択、撤回 | attribute_share_consent（自分の分） | [属性開示・決済事業者確認](../concept/foundation/identity-disclosure.md) |
| 継続支援管理 | 支払済み期限、次回決済日、年額、自動更新の状態を確認し、自動継続の停止・再開または自主返還を行う。プログラム終了時は更新停止と終了後の閲覧継続を表示する | certificate.support_paid_until、auto_renew_enabled、next_renewal_at、ledger_entry | [取引ルール](../concept/general/transaction-general.md) |
| 再発行申込み | 保有証票の再発行申込み。運営提示の再発行価格、付与予定クレジット額、失効日を確認する | secondary_listing | [二次流通](../concept/general/secondary-market.md) |
| 再発行クレジット | 再発行クレジットの残高、利用履歴、失効予定日を確認する | reissue_credit_entry | [二次流通](../concept/general/secondary-market.md) |
| VIP・ExtraVIP招待受諾 | 招待の確認・承諾・辞退 | vip_invite（自分宛て） | [VIP・ExtraVIPユーザーとの関係](../concept/vip/relationship-vip.md) |
| VIPコンシェルジュ専用スレッド | 希望共有、匿名打診への同意、条件確認 | concierge_case/message（自分の分） | [VIPコンシェルジュ運用](../concept/vip/vip-concierge.md) |
| 通報・ブロック | 不適切なコンテンツ・メッセージの通報 | moderation_report | [関係記録・コンテンツ](../concept/benefits/content.md) |

## クリエイター向け（Webダッシュボード）

| 画面 | 目的 | 扱うデータ・権限 | 関連する構想ページ |
| --- | --- | --- | --- |
| 提供者オンボーディング | 本人確認・正規提供者確認・精算先登録、クリエイター利用規約への同意 | creator_profile、audit_log_entry | [一般クリエイター](../concept/general/creator-general.md) |
| プログラム作成 | 発行上限・価格モードの一回設定 | issuance_program | [価格・発行数の算出](../concept/general/pricing.md) |
| 任意固定コンテンツ登録 | ランクごと最大3件の素材登録 | fixed_content_asset | [任意提供・個別役務](../concept/benefits/templates.md) |
| S1別商品出品 | 数量上限・価格・期限を設定して別商品を出品する。証票取得を条件にしてもよいが、自動発生させない | s1_offering | [任意提供・個別役務](../concept/benefits/templates.md) |
| 属性受入設定 | 受け取る属性カテゴリ、自由記述の可否を設定 | attribute_share_consent（受入設定） | [一般クリエイター](../concept/general/creator-general.md) |
| 支援者集計ダッシュボード | 人数・ランク別・支援額帯・継続期間・関心タグの集計 | 集計ビュー（個別非表示が既定） | 同上 |
| 個別プロフィール閲覧 | 任意で同意済み属性を個別に閲覧 | attribute_share_consent（同意済みのみ） | 同上 |
| クリエイター報酬・受取内訳 | XXGGLL本体のクリエイター報酬とS1/S2別契約対価を分け、対象取引、確定額、精算可能日、確認中・取消し・精算済みを表示 | ledger_entry（自分宛て分）、payment_review（状態のみ） | [取引ルール](../concept/general/transaction-general.md) |
| 出金申請 | 決済確定日から90日を経て確認中でない精算可能額を確認し、出金申請する。初回申請時はStripeのホスト型オンボーディング（本人確認・口座確認・サービス契約同意）へ遷移する。海外はStripeが有効と判定した国・通貨・経路だけを案内する | ledger_entry、payout_request、creator_profile.stripe_connected_account_id、payout_country、stripe_payouts_enabled_at | [アーキテクチャ](./architecture.md) |
| VIP受入設定 | 四半期受入上限、属性カテゴリ、匿名打診の可否 | issuance_program（VIP）、vip設定 | [VIPクリエイター](../concept/vip/creator-vip.md) |
| ExtraVIP匿名打診対応 | 匿名条件の検討可否・見送りの回答 | concierge_case（匿名段階） | 同上 |
| スタッフ権限管理 | 事務所・提供者スタッフの閲覧範囲を設定 | creator_staff_member | [VIPクリエイター](../concept/vip/creator-vip.md) |

## 管理画面（単一・ロール別出し分け）

一般利用者・クリエイター向け画面とはログインセッションを分ける。役割ごとに別コンソールは用意せず、単一の
管理画面内でadminロールが以下すべてにアクセスする（[アーキテクチャ](./architecture.md)の非目標）。

| 機能領域 | 内容 | 関連する構想ページ |
| --- | --- | --- |
| VIPコンシェルジュ対応 | ケース一覧・状態管理、希望受付、匿名打診、条件調整 | [VIPコンシェルジュ運用](../concept/vip/vip-concierge.md) |
| 台帳・精算 | 台帳照会、返金、クリエイター精算状況の確認 | [取引ルール](../concept/general/transaction-general.md) |
| S1/S2契約管理 | `s1_offering`の公開状況、`service_engagement`の状態確認、履行不能時の代替・返金対応 | [任意提供・個別役務](../concept/benefits/templates.md) |
| 任意固定コンテンツ審査 | `fixed_content_asset`の公開前レビュー、権利・安全上の問題による停止 | [関係記録・コンテンツ](../concept/benefits/content.md) |
| 通報・調査 | 通報キュー、調査中アカウントの一時停止、強制失効の起票 | 同上「調査・違反」 |
| プログラム管理 | プログラム終了の確定、証票の運営回収状況の確認 | 同上 |
| 監査ログ参照 | 全操作ログの横断参照 | [セキュリティ](./security.md) |

運営が拡大した場合は、機能領域ごとに `ops_role` を分けて画面上の表示・操作範囲を絞ることができるが、
MVPでは分割しない（[要件](./requirements.md)の権限マトリクス）。

## 権限との対応

- 各画面の表示・操作可否は、[要件](./requirements.md)の権限マトリクスとサーバー側の認可判定を一致させる。
  フロントエンドの表示制御はUI上の利便性であり、認可の最終判定はサーバー側で行う。
- クリエイター向け画面には、法的氏名・住所・本人確認書類・決済カード情報を表示する項目を一切設けない
  （[セキュリティ](./security.md)の「個人情報・属性データの保護」）。
