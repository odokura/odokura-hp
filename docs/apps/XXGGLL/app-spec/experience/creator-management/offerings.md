---
title: Creator管理 別契約の提供物
sidebar_label: 別契約の提供物
sidebar_position: 6
draft: true
---

# Creator管理 別契約の提供物

## 1. 境界

別契約の提供物は、XXGGLLの取得だけでは発生しない商品・サービスを管理する機能である。発行プログラム、証票の状態、Creator報酬と同じ対象にしない。

| 項目 | 仕様 |
| --- | --- |
| 画面ID | `SC-S10` |
| 一覧ルート | `/studio/[creatorId]/offerings` |
| 詳細ルート | `/studio/[creatorId]/offerings/[offeringId]` |
| read model | `RM-CreatorOfferingList`、`RM-CreatorOfferingDetail` |
| 利用者 | owner、`offers_manage`を持つstaff |

## 2. 一覧

ページ名は「別契約の提供物」、説明は「XXGGLLとは別に成立する商品・サービスの状態を確認できます。」とする。主操作は機能gateと作成permissionが有効な場合だけ「提供物を作成」とする。

一件一行で次を表示する。

- 名称と契約種別。
- 下書き、法務確認中、公開可能、公開中、受付終了、履行中、完了、停止の状態。
- 申込数 / 上限。上限なしは「上限なし」とする。
- 受付期限と、次に必要な対応。
- 更新時刻。

価格は通貨を含めるが、発行プログラムの価格、Creator報酬、Fan全体の支払額と合算しない。公開中以外をFanに見せず、Creator管理での存在を公開可否と誤認させない。

## 3. 詳細と操作

詳細は「契約条件 → 公開条件 → 申込状態 → 履行状態 → 取消・返金境界 → 変更履歴」の順にする。一つの確定操作だけを有効にし、編集、公開、停止、履行完了を同時に送信しない。

- 法務確認、権利確認、価格、数量、期限、履行条件が確定するまで公開不可。
- XXGGLLの状態変更だけで成立済み別契約を取消・完了しない。
- 申込者の情報は契約履行に必要な最小項目だけを、契約担当permissionの範囲で返す。Audienceへ流用しない。
- 契約が成立していない見込み客一覧、Creator横断検索、CSVを提供しない。
- 公開・停止・取消・返金はversion競合と冪等性をserverで検証する。

## 4. 契約メッセージ

`/studio/[creatorId]/messages`は、成立済みの別契約またはVIP・ExtraVIPの運営調整に必要なthreadだけを扱う機能gate付き画面である。一般の保有者が保存した`support_expression`を受信箱として並べない。

- 一件一`service_engagement`または`concierge_case`に結び付け、対象Creatorと`messages_manage`を要求ごとに確認する。
- 一覧は相手の連絡先ではなく、契約名、ケース状態、要対応、期限、最終更新を返す。
- 本文の送信、通報、停止は別commandにし、client送信IDで二重送信を防ぐ。
- 利用権失効、契約終了、通報停止、permission失効後は送信不可とし、既存threadをAudienceや営業リストへ転用しない。
- gate無効、permissionなし、不存在は同じ`404`にする。本文をaccess log、error、analyticsへ出さない。

## 5. 旧ルート移行

旧`/studio/[creatorId]/offers`は本画面へ移す。旧`/offers/[programId]`は提供物の子routeではなく、[発行プログラム](./programs.md)の正規routeへ移す。旧URLの認可済み転送条件は[Creator管理概要](./overview.md)に従う。

## 6. 受け入れ条件

- 発行プログラムと別契約の提供物が同じ一覧、route、型、IDで混在しない。
- 下書き、法務確認中、公開中、受付終了、履行中、停止で表示と許可操作が一致する。
- permissionなしstaff、他Creator、認可失効は同じ`404`で対象を示さない。
- XXGGLL終了後も成立済み契約の履行・精算状態が失われない。
- 申込競合、上限到達、期限切れ、二重確定、返金反映待ちをE2Eで確認する。
- Audienceから契約メッセージへ遷移せず、Audience APIにthread件数・本文・表示名が含まれない。
