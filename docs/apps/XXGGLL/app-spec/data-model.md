---
title: XXGGLL データモデル
sidebar_label: データモデル
sidebar_position: 6
draft: true
---

# XXGGLL データモデル

## アカウントとクリエイター

| テーブル | 内容 |
| --- | --- |
| `account` | 認証、ロール、状態 |
| `user_profile` | Profileと本人確認マーク |
| `creator_profile` | クリエイターの公開表示名 |
| `vip_invite` | VIP招待 |

## 証票と取引

| テーブル | 内容 |
| --- | --- |
| `issuance_program` / `certificate` / `certificate_event` | 発行枠、証票、来歴 |
| `issuance_reservation` | 一次発行の仮押さえ |
| `secondary_listing` | 再発行の出品と仮押さえ |
| `subscription` / `reissue_credit` | 継続支援と再発行クレジット |
| `ledger_entry` | 決済・報酬・返金の台帳 |
| `payout_request` | クリエイター出金申請 |

## 属性共有と安全

| テーブル | 内容 |
| --- | --- |
| `attribute_share_consent` | 属性共有の同意と撤回 |
| `report` | 通報 |
| `audit_log_entry` | 追記専用監査ログ |
| `kyc_session_cleanup` | 削除再試行中のDidit Session ID |

## VIP DM

| テーブル | 内容 |
| --- | --- |
| `vip_dm_offering` / `vip_dm_access` | DM枠と利用権 |
| `vip_dm_message` | メッセージ、報酬額、手数料、請求対象月 |
| `vip_dm_billing_account` / `vip_dm_monthly_invoice` | Stripe顧客、カード登録、月次請求 |
| `vip_dm_fee_policy` | 手数料パターン |

KYCの書類、属性値、照合結果、Webhook本文、Session ID、履歴は保存しない。`kyc_session_cleanup` は削除失敗時だけSession IDを保持し、削除成功後に消す。
