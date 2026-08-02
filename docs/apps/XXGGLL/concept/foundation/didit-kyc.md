---
title: Didit KYC設定
sidebar_label: Didit KYC設定
sidebar_position: 5
draft: true
---

# Didit KYC設定

Diditは、有償VIP DMの本人確認に使う。

| 項目 | 仕様 |
| --- | --- |
| 対象 | 報酬額が0円より大きいVIP DM |
| 照合 | Diditの本人確認成立と、Profileの性別・生年月日・国籍の全一致 |
| 保存 | 確認マークだけを保存する |
| 削除 | 照合後にSessionを削除する。失敗時だけSession IDを再試行まで保持する |
| 表示 | 属性値、書類、照合結果はクリエイターへ表示しない |

Workflowは日本語のホスト型フローとし、ID確認、liveness、face match、性別、生年月日、国籍を返す。Webhookは `POST /api/didit/webhook` で受信し、署名を検証する。

`DIDIT_API_KEY`、`DIDIT_VIP_DM_WORKFLOW_ID`、`DIDIT_WEBHOOK_SECRET` はサーバー側環境変数だけに設定する。
