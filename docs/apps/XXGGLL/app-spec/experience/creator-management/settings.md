---
title: Creator管理 設定・権限
sidebar_label: 設定・権限
sidebar_position: 7
draft: true
---

# Creator管理 設定・権限

## 1. 画面契約

| 項目 | 仕様 |
| --- | --- |
| 画面ID | `SC-S09` |
| ルート | `/studio/[creatorId]/settings` |
| read model | `RM-CreatorSettings` |
| 利用者 | ownerだけ |
| 目的 | Creator公開状態、規約同意、owner、staff権限を確認・変更する |

staffには本画面を表示しない。staff本人の現在permissionは各Creator画面の共通対象バーに読取表示する。

## 2. 表示区画

ページ名は「設定・権限」、説明は「Creatorの公開状態、同意、staffの権限を確認・変更できます。」とする。ownerの設定とFan本人のアカウント設定を混同させない。

1. Creator公開状態: 表示名、公開状態、正規提供者確認状態。
2. 規約・契約: 同意済み版、同意時刻、再同意要否。
3. owner: 現在のowner。変更機能が未提供なら変更可能に見せない。
4. staff: account、付与permission、状態、付与・失効時刻。
5. 危険操作: staff失効、Creator終了などを通常設定から分離する。

Stripe口座、本人確認書類、OAuth token、session、パスワード、監査log全文を返さない。Fanプロフィールの共有設定、発行条件、出金申請をこの画面へ混ぜない。

## 3. staff権限

既存の列挙済みpermissionだけを選択できる。

| permission | 許可範囲 | 許可しないこと |
| --- | --- | --- |
| `audience_read` | 個人との対応を排した集計の読取 | 現在保有者個人、CSV、メッセージ |
| `offers_manage` | 別契約の提供物の管理 | 発行プログラムの個人開示、出金、権限変更 |
| `revenue_read` | Creator報酬と精算状態の読取 | 出金申請、口座・本人確認情報 |
| `messages_manage` | 別途有効化された契約対象のthread管理 | Audienceへの個人メッセージ混在、連絡先export |

発行プログラムの作成・変更をstaffへ委任する場合は、`offers_manage`を流用しない。新しい`programs_manage`をデータ制約、認可、画面台帳、migrationと同時に追加するまでowner限定とする。

## 4. 更新

- permissionの変更はstaff一人の一permissionずつ行い、変更前後、actor、対象Creator、対象account、理由、時刻を監査する。
- 表示時versionと確定時versionが異なる場合は全体を再取得し、部分成功にしない。
- owner自身のowner権限、最後のowner、実行中の自分のsessionをUIだけで無効化できない。
- permission失効は新しい要求へ即時反映し、既存のpage cache、prefetch、長時間requestも確定前に再照合する。
- staff招待やaccount検索が未定義の場合、メール入力や任意account検索を仮実装しない。

## 5. 状態と受け入れ条件

- owner、staff、他Creator、owner失効、最後のowner、同時更新を確認する。
- staff permissionを外した直後、対象ナビ、画面、API、mutationが全て拒否される。
- 存在しないaccountと権限のないaccountを外部応答から区別できない。
- 設定取得失敗時に空のstaff一覧を表示せず、全更新操作を無効化する。
- 監査にpermission変更の前後は残すが、秘密値、メール本文、session IDは残さない。
