---
title: XXGGLL 画面台帳
sidebar_label: 画面台帳
sidebar_position: 2
draft: true
---

# XXGGLL 画面台帳

XXGGLLの全画面について、正規ルート、利用者、サーバー側read model、主要表示、操作、状態、遷移、受け入れ条件を一元管理する。
実装Issueは必ず本台帳の画面IDを参照し、未定義のルート、権限応答、空状態、操作を画面実装だけで追加しない。

## 1. 正本と文書の責務

| 順位 | 文書 | 正本とする内容 |
| --- | --- | --- |
| 1 | [要件](../core/requirements.md)とConcept | 業務ルール、金額、状態遷移、法務・安全境界 |
| 2 | 本台帳 | 正規ルート、画面責務、read model、画面状態、遷移、画面受け入れ条件 |
| 3 | Public・設定等の個別画面仕様 | 一画面内の情報構造、文言、詳細な操作順 |
| 4 | [UX](./ux.md) | シェル、利用者の中心導線、代表画面の意図 |
| 5 | [デザイン仕様](./design.md) | 共通部品の視覚結果、状態、画面モード、特殊効果の許可範囲 |
| 6 | [CSS実装仕様](./css.md) | import順、DOM、selector、token、breakpoint、CSS移行、実装受け入れ条件 |

下位文書が本台帳と異なるルート、遷移、権限応答を定義してはならない。個別画面仕様は本台帳の項目を複製せず、画面IDを参照して詳細だけを追加する。

## 2. 全画面共通の契約

### 2.1 read model

- 各画面は表に指定したサーバー側read modelだけから表示を組み立てる。
- ブラウザからaccount ID、Creator権限、adminフラグ、支払済みフラグを受け取り、本人性・認可・決済確定の根拠にしない。
- read modelは画面に不要な列を返さず、`Cache-Control: no-store`が必要な認証・取引・Ops応答へ共有cacheを使わない。
- 一覧と詳細、一般利用者とCreator管理、Creator管理とOpsは別read modelとする。クライアント側フィルタで権限境界を作らない。
- endpoint名とschemaを実装Issueで確定する場合も、本台帳の主対象、返却可能項目、禁止項目、状態を変更してはならない。

### 2.2 認証・認可・不存在

| 状態 | HTTP・画面 | 許可する導線 | 禁止 |
| --- | --- | --- | --- |
| Publicの正常表示 | `200` | 表で定義したPublic導線 | 認証済みデータ、内部ID、対象外の推薦 |
| 未認証で認証可能 | データを返さず`401`または`/sign-in`へ遷移 | 同一Originの許可済み`returnTo`、戻る | 任意URL、対象データの先行取得 |
| 保護対象の認可なし・不存在 | 同じ`404`応答と同じ画面 | 一般的なHomeまたは戻るだけ | `権限がありません`等の存在を示す説明、対象名、所有者、失敗理由 |
| 利用制限・機能gate | 対象の存在を知る本人に限り、影響と復帰条件を表示 | 安全な再確認、設定、問い合わせ | 未実装操作、成功表示、クライアントだけの解除 |
| 一時障害 | 対象を再送せずに再読込できる失敗状態 | 再読込、戻る、問い合わせ | 二重決済、二重送信、推定値による補完 |

ログインできることを示す`未認証`と、対象の存在を秘匿する`認可なし・不存在`を同じ画面状態名で扱わない。

### 2.3 共通状態

各動的画面は最低限、`loading`、`ready`、`empty`、`submitting`、`success`、`recoverable_error`、`restricted`を持つ。
外部決済・Webhookを伴う画面は`pending_external`、競合し得る更新は`conflict`、期限がある画面は`expired`を追加する。
表で`empty`が適用されない画面は、空のカードや0件のダミー一覧を表示しない。

### 2.4 Public共通ナビゲーション

次の表をPublicヘッダーの唯一の正本とする。

| 表示 | 正規遷移先 | モバイルでの扱い |
| --- | --- | --- |
| `XXGGLLの流れ` | `/flow` | 常に1クリックで到達可能 |
| `ファンに残るもの` | `/fans` | 共通Publicメニュー内 |
| `クリエイターに分かること` | `/creators` | 共通Publicメニュー内 |
| `費用` | `/pricing` | 共通Publicメニュー内 |
| `安全性` | `/safety` | 共通Publicメニュー内 |
| `ログイン`または`ホームへ` | `/sign-in`または`/home` | セッション状態で一方だけ表示 |

`/#fans`、`/#creators`、`/#security`はトップ本文内の補助アンカーとして残してよいが、ヘッダーの正規遷移先にしない。
Publicヘッダーに汎用Fan開始、公開カタログ、検索、Creator一覧、人気、ランキングを追加しない。

### 2.5 認証ルートの互換性

正規の認証画面は`/sign-in`だけとする。旧`/account`は画面を表示せず、未認証者を`/sign-in`、認証済み利用者を`/fan/settings`へ同一Originで移動する。
許可済みの相対`returnTo`だけを未認証側の移動に引き継ぎ、外部URL、Opsルート、別の個別取得対象へ変更された値は破棄する。

## 3. Public画面

| ID | ルート | 主対象・read model | 正常表示と主操作 | 空・失敗・権限 | 受け入れ |
| --- | --- | --- | --- | --- | --- |
| `SC-P01` | `/` | 静的な製品説明 | Fanに残る関係記録とCreatorの匿名集計を示し、`/flow`、`/start/creator`、認証領域へ進む | 実データ取得を前提にせず、部分障害でも公開一覧を代替表示しない | [Publicトップ](./public-homepage.md)の`PH-*` |
| `SC-P02` | `/flow` | 静的な利用フロー | 発行、取得、記録、振り返り、匿名集計を一方向に示す | 実取引、実在利用者、確定操作を表示しない | [フロー](./public-flow.md)の`PF-*` |
| `SC-P03` | `/fans` | 静的なFan向け説明 | 保有、来歴、活動、共有、要対応を説明し、`/flow`または認証領域へ進む | 汎用取得、公開一覧、Creator検索を表示しない | 表示順、境界、共通ナビをDOM検査する |
| `SC-P04` | `/creators` | 静的なCreator向け説明 | 発行管理と匿名集計を説明し、`/start/creator`へ進む | 個人Fan一覧、直接営業、実績保証を表示しない | 表示順、境界、CTAをDOM検査する |
| `SC-P05` | `/pricing` | 静的な費用説明 | Fan支払、Creator報酬、精算、停止、返金を区別する | `B-01`未解決中は購入可能表示と手数料仮定を禁止する | [費用](./public-costs.md)の`PC-*` |
| `SC-P06` | `/safety` | 静的な安全性説明 | 認証、決済委譲、プロフィール開示、前保有者情報、Ops境界を説明する | 防御の詳細値、秘密値、完全安全の保証を表示しない | 表示事実をSecurity正本と照合する |
| `SC-P07` | `/start/fan` | Fan開始方法の静的説明 | Creatorから案内された個別リンクを開く必要があることを説明する | URL入力、公開一覧、推薦、汎用取得CTAを置かない。案内リンクがない場合は説明だけで終了する | 個別リンク以外から購入対象へ到達できないことを検査する |
| `SC-P08` | `/start/creator` | `RM-CreatorStart` | 未認証は認証、登録途中はプロフィール・規約、登録済みは`/home`の発行開始へ進む | 重複登録、権限失効、保存失敗を分け、途中状態を破棄しない | 状態別の次画面と二重Creator作成防止をE2E確認する |
| `SC-P09` | `/entry/[publicLinkId]` | `RM-PublicEntry` | 対象、ランク、価格、残数、取得条件、役務境界を表示し、同じ対象の確認へ進む | 無効、取消、期限切れ、停止、非公開は同じ`404`。他対象を推薦しない | 生token非記録、状態別同一404、同一対象復帰を確認する |
| `SC-P10` | `/entry/[publicLinkId]/confirm` | `RM-AcquisitionQuote` | 対象、価格、手数料、合計、通貨、期限、継続、停止、返金条件を示し、一度だけ確定する | 在庫切れ、予約期限切れ、決済失敗、`pending_external`、競合を分ける。`B-01`中は確定不可 | quote整合性、冪等性、再課金防止、期限、B-01 gateをE2E確認する |
| `SC-P11` | `/sign-in` | `RM-AuthRequest` | 認証目的と検証済み復帰先を示し、ログイン、登録、OAuth、再設定の一つを進める | account列挙を避け、再送制限、OAuth取消、期限切れ、無効`returnTo`を扱う | session再発行、許可済み復帰先、外部URL拒否を確認する |

## 4. Home・Fan画面

| ID | ルート | 主対象・read model | 正常表示と主操作 | 空・失敗・権限 | 受け入れ |
| --- | --- | --- | --- | --- | --- |
| `SC-F01` | `/home` | `RM-Home` | 本人の保有`certificate`、要対応、管理可能な`issuance_program`を表示し、一件を開く | 保有なしは「Creatorから案内された個別リンクを開いてください」と`/start/fan`への説明リンクだけを示す。Creator未登録者へ発行勧誘を出さない | 他人の対象、公開一覧、活動グラフを返さないことを確認する |
| `SC-F02` | `/fan/supports` | `RM-SupportList` | 本人の証票を更新時刻降順、一件一行で表示して詳細へ進む | 0件は取得方法の説明だけ。取得失敗時に空と表示しない | 一覧と詳細のread model分離、安定順序、ページングを確認する |
| `SC-F03` | `/fan/supports/[id]` | `RM-SupportDetail` | 現在状態、期限、取得時点、次操作、連続来歴、本人記録を表示する | 認可なしと不存在は同じ`404`。更新競合、決済反映待ち、操作失敗は現在状態を再取得する | 前保有者情報の不在、状態別の一操作、冪等性を確認する |
| `SC-F04` | `/fan/catalog` | `RM-EntitledCatalog` | 現在の有料保有先に紐づく提供物だけを表示し、一件を開く | 有効利用権なし・対象外直接URLは同じ`404`。0件は提供物なしと基準時刻を示す | クライアントfilterなしで利用権を検証する |
| `SC-F05` | `/fan/messages` | `RM-EntitledThreadList` | 有効利用権または本人の担当ケースだけを更新時刻降順で表示する | 利用権なしは対象を返さない。0件と取得失敗を分ける | 他人・失効後のthread不在、ページングを確認する |
| `SC-F06` | `/fan/messages/[id]` | `RM-EntitledThread` | 本人が閲覧できる会話、状態、通報・送信可能性を表示する | 認可なしと不存在は同じ`404`。送信失敗時は未送信を維持し二重送信しない | 利用権再照合、通報・停止、本文のlog不出力を確認する |
| `SC-F07` | `/fan/activity` | `RM-AccountActivity` | Creator別の活動記録、金額区分、返金・取消、利用区分を表示する | 0件は取得後に記録されることを示す。未確認額を推定しない | Homeと別read model、本人限定、金額区分を確認する |
| `SC-F08` | `/fan/profile` | `RM-OwnProfile` | 最初からプロフィールを編集でき、[プロフィール画面](./profile.md)の共有チェックだけは一操作で即時保存する | 保有0件でも保存可、開示先0件を示す。共有失敗は確定値へ戻し、項目失敗は入力を維持する | 新規だけ共有既定、既存未共有維持、ownerへの開示、staff・前保有者への不開示、競合・監査を確認する |
| `SC-F09` | `/fan/settings` | `RM-AccountSettings` | 現在値、セキュリティ、共有状態、アカウント操作の入口を表示する | 取得失敗を空値にしない。未提供操作を完了可能に見せない | [設定画面](./settings.md)の受け入れ条件 |
| `SC-F10` | `/fan/settings/security` | `RM-AccountSecurity` | パスワード、OAuth方法、通常sessionを確認・変更する | 再認証期限切れ、最後の認証方法解除、session競合、失敗を扱う | [設定画面](./settings.md)の受け入れ条件 |

## 5. Creator管理画面

Creator管理の全read modelは、現在のaccount、Creator membership、permission、対象Creatorを要求ごとにサーバーで結合確認する。
共通シェル、サイドメニュー、旧route移行は[Creator管理](./creator-management/overview.md)を正本とする。

| ID | ルート | 主対象・read model | 正常表示と主操作 | 空・失敗・権限 | 受け入れ |
| --- | --- | --- | --- | --- | --- |
| `SC-S01` | `/studio` | `RM-ManagedCreatorList` | 一人だけなら概要へ移動し、複数なら一人を選ぶ | Creator未登録は開始状態、0件の権限失効はHomeへ戻す。対象外Creatorを示さない | 0・1・複数件とowner/staffを確認する |
| `SC-S02` | `/studio/[creatorId]` | `RM-CreatorOverview` | 要対応最大3件、定義済み最大4指標、最近の発行を表示し、一つの業務へ進む | 認可なしと不存在は同じ`404`。区画失敗を0件・0円にしない | [概要画面](./creator-management/dashboard.md)の受け入れ条件 |
| `SC-S03` | `/studio/[creatorId]/programs` | `RM-IssuanceProgramList` | 一件一行で状態、ランク、発行数、現在保有、要対応を表示する | 0件はownerにだけ発行開始を示し、staffには説明だけを示す | [発行プログラム](./creator-management/programs.md)の受け入れ条件 |
| `SC-S04` | `/studio/[creatorId]/programs/new` | `RM-IssuanceDraftStart` | ownerが種類・ランク・上限・価格方式を確認し、一度だけ下書きを作成する | 二重送信は同じ下書きを返す。権限失効、規約未同意、競合を分ける | [発行プログラム](./creator-management/programs.md)の受け入れ条件 |
| `SC-S05` | `/studio/[creatorId]/programs/[programId]` | `RM-IssuanceProgramDetail` | 状態、条件、発行数、公開、終了、owner限定の現在保有者を区画分けする | 他Creator・権限なしは同じ`404`。部分保存を禁止し、競合時は再取得する | [発行プログラム](./creator-management/programs.md)の受け入れ条件 |
| `SC-S06` | `/studio/[creatorId]/audience` | `RM-CreatorAudienceV1` | 母集団、地域、ランク、確認済み支払額帯、保有期間、任意プロフィール、グッズ傾向を集計で表示する | 5人未満と補完推測可能なセルを抑制し、個人行・生件数・応援文で代替しない | [ファン全体の傾向](./creator-management/audience.md)の受け入れ条件 |
| `SC-S07` | `/studio/[creatorId]/messages` | `RM-CreatorThreadList` | 別契約と安全要件を満たして機能gateが有効な場合だけ、`messages_manage`範囲のスレッドとケースを表示する。Audienceからは遷移させない | gate無効、permissionなし、不存在は同じ`404`。停止中は送信不可 | 対象Creator固定、Audience応答との分離、通報・停止、本文log不出力を確認する |
| `SC-S08` | `/studio/[creatorId]/revenue` | `RM-CreatorRevenue` | 取引区分、確認中、精算可能、申請中、送金済みを分け、ownerだけが可能額内で申請する | 0円、90日未経過、保留、本人確認未完了、申請競合、送金失敗を分ける | [収益・精算](./creator-management/revenue.md)の受け入れ条件 |
| `SC-S09` | `/studio/[creatorId]/settings` | `RM-CreatorSettings` | ownerが公開状態、規約同意、owner/staff権限を責務別に表示する | staff・他Creatorは同じ`404`。秘密値・銀行・本人確認書類を返さない | [設定・権限](./creator-management/settings.md)の受け入れ条件 |
| `SC-S10` | `/studio/[creatorId]/offerings`、`/studio/[creatorId]/offerings/[offeringId]` | `RM-CreatorOfferingList`、`RM-CreatorOfferingDetail` | XXGGLLとは別契約の提供物を一件ずつ管理する | 発行プログラムとroute・型・一覧を共有しない。権限なしと不存在は同じ`404` | [別契約の提供物](./creator-management/offerings.md)の受け入れ条件 |

## 6. Ops画面

Ops画面は完全一致する専用Ops Originでだけ動作し、通常sessionでは利用できない。`/ops/sign-in`と事前認可済み`/ops/enroll`以外の画面は、有効な専用Ops sessionがなければ同じ`404`を返す。`GET /ops/health`は画面ではなく、[セキュリティ基本設計](../security/basic-design.md)の最小監視応答だけを返す。

| ID | ルート | テンプレート・read model | 正常表示と主操作 | 空・失敗・権限 | 受け入れ |
| --- | --- | --- | --- | --- | --- |
| `SC-O01` | `/ops/sign-in` | `T-OpsSignIn`、`RM-OpsAuthStart` | 登録済みパスキーによる利用者検証だけを開始する | credential有無、失効、署名、challenge、UV失敗を同じ外部応答にする。通常認証を表示しない | Origin、RP ID、UV、challenge一回性、session分離を確認する |
| `SC-O02` | `/ops/enroll` | `T-OpsEnrollment`、`RM-OpsEnrollment` | 一回限りlink、開始browser Cookie、未消費challengeがそろう場合だけパスキーを登録する | 欠落、期限切れ、消費済み、browser不一致、対象不一致を同じ`404`にする | 原子的消費、再利用拒否、旧credential一括失効、監査を確認する |
| `SC-O03` | `/ops` | `T-Operation`、`RM-OpsQueue` | 優先度、対象、理由、期限、影響、状態で一件を選ぶ | 0件は最終更新時刻を表示。取得失敗時は操作不能にする | 通常session拒否、安定順序、件数上限を確認する |
| `SC-O04` | `/ops/users` | `T-Operation`、`RM-OpsUserSearch` | 最小識別情報で一人を検索・選択する | 0件・複数件・入力不正を分け、一覧に詳細個人情報を出さない | 検索rate limit、ページング、詳細閲覧前の最小項目を確認する |
| `SC-O05` | `/ops/users/[id]` | `T-Operation`、`RM-OpsUserDetail` | Home、保有、プロフィール、設定、Creator管理対象を読取専用で確認する | 不存在・admin以外・session失効は同じ`404`。取得失敗時は更新操作を出さない | なりすまし・更新API不在、詳細閲覧監査を確認する |
| `SC-O06` | `/ops/creators` | `T-Operation`、`RM-OpsCreatorSearch` | Creator名・ID・owner連絡先で一人を検索・選択する | 0件・複数件・入力不正を分け、一覧には比較用最小項目だけを出す | 検索rate limit、ページング、詳細閲覧前の最小項目を確認する |
| `SC-O07` | `/ops/creators/[id]` | `T-Operation`、`RM-OpsCreatorDetail` | 概要、発行、[Audience V1](./creator-management/audience.md)と同じ定義・抑制済み集計、収益、owner/staffを読取専用で確認する | 不存在・admin以外・session失効は同じ`404`。Ops用の非抑制セル、秘密値、個人Fan一覧を返さない | Creator session不発行、Audienceと同じsnapshot・抑制、更新API不在、閲覧監査を確認する |
| `SC-O08` | `/ops/reviews` | `T-Operation`、`RM-OpsReviewCases` | 公開審査、通報、例外判断を一件ずつ開き、根拠と結果を記録する | 証拠不足、競合、対象状態変更、再認証期限切れでは確定しない | 一件処理、再認証、冪等性、監査を確認する |
| `SC-O09` | `/ops/payouts` | `T-Operation`、`RM-OpsPaymentCases` | 精算、返金、送金を一件ずつ確認し、一操作だけ確定する | 外部反映待ち、金額不整合、重複event、競合、再認証期限切れを分ける | 台帳整合性、二重実行防止、再認証、監査を確認する |
| `SC-O10` | `/ops/audit` | `T-Operation`、`RM-OpsAudit` | actor、対象、event、時刻、request IDで追記専用記録を検索・閲覧する | 0件と取得失敗を分け、本文・秘密値・認証情報を表示しない | 安定順序、期間上限、ページング、export不在を確認する |

## 7. 高リスク画面の状態遷移

### 7.1 取得確認

```text
ready
→ submitting
→ pending_external
→ success

ready / submitting
→ expired | conflict | recoverable_error
→ 新しいquoteをサーバーから取得
```

- `submitting`以降は同じidempotency keyを使い、新しい決済を自動作成しない。
- `pending_external`では成功と表示せず、同じ取引状態を再確認する。
- `expired`と`conflict`では古い金額・在庫・期限による再送を禁止する。
- `B-01`が解除されるまで`ready`から`submitting`へ進めない。

### 7.2 Creator管理の作成・公開・精算

- 下書き作成は一回の操作から一件だけ作成し、通信再送時は既存の下書きへ戻す。
- 公開・終了・権限変更・出金申請は、表示時のversionと確定時のversionが異なる場合に`conflict`とし、全体を再取得する。
- Stripe hosted onboardingから戻っただけでは精算可能と表示せず、serverとWebhookで確定したcapabilityを再取得する。
- メッセージ送信はclient生成の送信IDで二重表示を防ぎ、server未確定の本文を送信済みにしない。

### 7.3 Opsの認証・登録

```text
sign-in: idle → challenge_issued → verifying → authenticated
                                  → generic_failure

enroll: preauthorized → challenge_issued → registering → completed
                                                    → generic_not_found
```

- `generic_failure`と`generic_not_found`の画面・応答からaccount、credential、登録記録、失効理由を区別できないようにする。
- challengeは一回限りとし、戻る・再読込・複数tabで同じchallengeを再利用しない。
- 成功後だけ専用Ops sessionを再取得し、通常sessionを昇格させない。

### 7.4 Opsの更新操作

```text
case_ready
→ reauthentication_required
→ confirmation_ready
→ submitting
→ pending_external | completed
→ audit_confirmed
```

- 対象、理由、影響、金額、現在状態、取消可否を確認するまで確定操作を有効にしない。
- 5分以内の専用パスキー再認証、現在のsession・credential・admin role、対象versionを確定トランザクション内で再照合する。
- 外部反映待ちを失敗として再実行せず、provider eventと台帳を再確認する。
- 完了表示には監査event IDと結果時刻を含めるが、秘密値やprovider credentialを含めない。

## 8. 一覧・検索画面の共通条件

- 既定順は`updated_at DESC, id DESC`相当の安定順序とし、同時更新でも重複・欠落しないcursor paginationを使う。
- 初期上限は50件とし、画面が必要とする最小項目だけを返す。全件展開と無制限検索を行わない。
- 検索入力は正規化、長さ上限、許可文字、rate limitをサーバーで適用する。
- `0件`、`検索条件に一致しない`、`取得失敗`を別状態にする。
- Opsの検索実行と詳細閲覧は別eventとし、個人・Creatorの詳細閲覧だけでなく、過剰な検索試行も監査またはsecurity eventへ残す。

## 9. 画面Issueの完了条件

各画面Issueは、次を全て満たすまで完了にしない。

1. 画面ID、対象ルート、参照する要件ID、read model名をIssueへ記載する。
2. 表に定義した正常、空、失敗、権限、期限、競合のうち該当状態をtestへ対応付ける。
3. 禁止情報がDOM、server response、log、analytics、cacheへ出ないことを確認する。
4. 320px、390px、1440px、キーボード、focus、forced colors、reduced motionで主要操作を確認する。
5. 画面遷移、更新後のserver確定値、再読込後の状態、二重操作防止を確認する。
6. 未解決の業務ルールまたは外部運用Gateがあれば、画面だけを無効化せずサーバー側機能gateを確認する。
