---
title: XXGGLL データモデル
sidebar_label: データモデル
sidebar_position: 5
draft: true
---

# XXGGLL データモデル

本ページは、業務上の記録と、それをサーバー側で強制するデータ構造を定める。

## 人が確認するモデル

| 記録 | 何を表すか | 誰が確認・変更できるか | 変更の扱い |
| --- | --- | --- | --- |
| アカウント | ログイン主体と利用状態 | 本人は自分の設定、adminは必要な停止だけ | 状態変更は監査する |
| プロフィール | 本人が入力した許可済み属性 | 本人だけが変更。クリエイターは同意済み項目だけ読取 | 値変更は開示先を増やさない |
| クリエイター・プログラム | クリエイターと発行するXXGGLL | 所属クリエイターと許可済みスタッフ。Opsは審査・停止 | 公開・終了は監査する |
| 関係時点スナップショット | 現保有者の取得日時と、その時点で正規連携元から確認したXフォロワー数 | 本人は自分の記録、Creatorは認可済み集計、Opsは必要時だけ | 取得時点の追記後は上書きしない。取得失敗を推定値で補完しない |
| グッズ購入登録 | XXGGLL発行コードで本人が登録した対象商品、購入元、登録日時 | 本人と認可済み集計だけ。譲渡先へ引き継がない | コードは一回限り。生コードを保存・記録しない |
| 証票・来歴 | 誰がどのXXGGLLを保有し、どの状態になったか | 保有者は自分の分、クリエイターは匿名集計、adminは運用範囲 | 現在状態と来歴を同時に記録する |
| 決済試行・台帳 | 購入要求、外部決済、当事者別の金額 | 支払者は自分の記録、クリエイターは自分の報酬、adminは全件 | 取消しは新しい行で記録し、確定済み行を書き換えない |
| 出金申請・配分 | クリエイターの出金要求と予約済み報酬 | クリエイター本人とadmin | 同じ報酬を複数申請へ使わない |
| 属性開示同意 | 本人がどの項目をどのクリエイターへ開示するか | 本人だけが同意・撤回。クリエイターは有効な同意だけ読取 | 譲渡・失効・終了・撤回で即時終了する |
| 追加商品・個別サービス | XXGGLLとは別の申込み・契約・決済 | 契約当事者、所属クリエイター、admin | 証票の終了と独立して履行・取消・返金する |
| 監査ログ | 重大操作の証跡 | adminは読取のみ | 追記専用。更新・削除しない |

## 保存方針

- 正本はサーバー側の単一リレーショナルDB（PostgreSQL）。
- 証票の来歴・同意の撤回・監査ログは、更新ではなく追記で表現し、過去の状態を上書きしない。
- 法的氏名、住所、生年月日、電話番号、カード情報、銀行口座情報、本人確認書類の原本は、いかなるテーブルにも
  平文で保存しない（[属性開示・決済事業者確認](../concept/foundation/identity-disclosure.md)の
  「共有しない情報」）。
- 金額は最小通貨単位の整数またはNUMERICで保存し、通貨コードを分離する。
- コントロールの強制条件、失敗時の扱い、監査・テストは[コントロール仕様](./controls.md)に従う。

### JSONに保存する値

| 記録 | 許可するキー | 禁止する値 | 検証 |
| --- | --- | --- | --- |
| `account_profile.field_values` | `display_name`、`age_range`、`region`、`occupation`、`interests`、`support_reason`、`activity_history`、`preferred_name`、`free_text` | 住所、電話番号、メールアドレス、SNS ID、生年月日、金融情報、要配慮個人情報 | キー、型、最大長、私的連絡先パターンをサーバーで検証する |
| `additional_offering.terms` | 内容、価格、数量上限、申込期限、取消・返金条件 | 購入者の連絡先・本人確認情報 | 公開前に必須キー・型を検証する |
| `service_engagement.terms` | 提供内容、対象人数、回数、時間、期限、連絡手段、価格、変更・取消・返金条件、禁止事項、利用権 | 当事者以外の個人情報、決済カード・口座情報 | 契約確定前に必須キー・型を検証する。確定後は内容を上書きしない |
| `audit_log_entry.detail` | 操作ごとに[コントロール仕様](./controls.md)の「監査ログの必須内容」で定めた識別子・結果 | メールアドレス、メッセージ本文、秘密値、カード・口座情報、本人確認書類 | 操作別スキーマをサーバーで検証する |

## 主要エンティティ

| エンティティ | 役割 | 引き継ぎ（譲渡時） |
| --- | --- | --- |
| account | 利用者・運営担当者共通のアカウント。ユーザーランク、運営ロール、状態を持つ | — |
| account_contact | メールアドレス等の認証・通知先 | 引き継がない |
| auth_identity | メール認証・OAuth等のログイン識別子 | 引き継がない |
| auth_token | メール確認・パスワード再設定・OAuth stateの短期トークン | 引き継がない |
| auth_session | ログイン中の端末セッション | 引き継がない |
| account_profile | 利用者がプロフィール画面で入力する許可済み項目。値の保有と開示同意を分離する | 引き継がない |
| creator_profile | クリエイター。オーナーアカウントへの参照、Stripe Connected Accountと精算可否を持つ | — |
| creator_staff_member | クリエイターがオーナー以外に許可したスタッフの最小権限アクセス | — |
| creator_staff_permission | スタッフに付与した列挙済み操作権限 | — |
| issuance_program | クリエイター×ランクごとの発行上限・価格モード | — |
| public_entry_link | 公開中の有料発行プログラム一件を指す外部案内リンク。生トークンは保存せず、ハッシュ・状態・期限・取消時刻を持つ | — |
| issuance_reservation | 一次発行の15分仮押さえ | — |
| certificate | 証票本体。番号・ランク・現保有者・状態・証票支援累計額 | 引き継ぐ |
| certificate_event | 証票の来歴（発行・譲渡・継続・回収・終了・アーカイブ）。追記専用 | 公開可能な部分だけ引き継ぐ |
| ledger_entry | 台帳。決済、クリエイター報酬、再発行クレジットの付与根拠を1行1件で記録 | 引き継がない |
| reissue_credit_entry | 再発行クレジットの付与・利用・失効を追記で記録する台帳 | 引き継がない |
| payment_review | 不正利用・異議申立て・公的機関の要請に係る決済確認と保留期限を記録する | 引き継がない |
| payout_request | クリエイターが、蓄積したクリエイター報酬・別契約対価の出金を申請する記録 | 引き継がない |
| payout_allocation | 出金申請が予約・精算する台帳行と金額 | 引き継がない |
| stripe_webhook_event | Stripe WebhookのイベントID・種別・処理結果。本文は保存しない | — |
| payment_attempt | 購入要求、冪等キー、Stripe Payment Intent、決済状態 | — |
| attribute_share_consent | 項目単位の属性共有同意・撤回 | 引き継がない |
| support_expression | 現保有者が証票ごとに保存する応援表現とクリエイターへの明示共有設定 | 引き継がない |
| secondary_listing | 前保有者による再発行申込みと、新保有者に対する在庫仮押さえ | — |
| waitlist_entry | 待機リスト登録と簡易重複防止用の指紋 | — |
| fixed_content_asset | 固定コンテンツの登録 | 公開時に定めた範囲で引き継ぐ |
| vip_invite | VIP・ExtraVIP招待の審査・決定 | — |
| concierge_case / concierge_message | VIPコンシェルジュの専用スレッドと状態 | 引き継がない |
| additional_offering | 追加商品の商品情報・数量上限 | — |
| service_engagement | 追加商品・VIP・ExtraVIP個別サービスの個別契約（追加商品はadditional_offering、個別サービスはconcierge_caseと紐づく） | 引き継がない |
| moderation_report | 通報・調査対象 | — |
| audit_log_entry | 全操作の追記専用の監査ログ | — |

## 実装用スキーマ

以下は実装に必要なDDLである。人が業務ルールを確認するときは、上の「人が確認するモデル」と
[コントロール仕様](./controls.md)を先に確認する。追記専用の履歴テーブルは更新・削除しない。

```sql
-- 法的氏名・住所・生年月日・電話番号・カード情報・銀行口座情報は、いかなるテーブルにも保存しない。

CREATE TABLE account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_rank TEXT NOT NULL DEFAULT 'general' CHECK (user_rank IN ('general','vip','extravip')),
  ops_role TEXT, -- NULL=一般利用者。運営担当者は 'admin' を設定する。将来分割する場合も列挙を固定しないTEXTのまま値を増やす
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','investigation_hold','suspended','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE account_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account(id),
  contact_type TEXT NOT NULL CHECK (contact_type IN ('email')),
  normalized_value TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_type, normalized_value)
);
CREATE UNIQUE INDEX idx_account_contact_single_primary
  ON account_contact (account_id) WHERE is_primary;
-- 連絡先の平文は本人、認証処理、必要な運用処理だけが扱う。クリエイター画面・監査ログには出さない。

CREATE TABLE auth_identity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account(id),
  provider TEXT NOT NULL CHECK (provider IN ('password','x_oauth')),
  provider_subject TEXT NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_subject),
  CHECK ((provider = 'password' AND password_hash IS NOT NULL) OR (provider = 'x_oauth' AND password_hash IS NULL))
);

CREATE TABLE auth_token (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES account(id),
  token_type TEXT NOT NULL CHECK (token_type IN ('email_verification','password_reset','oauth_state')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auth_session (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES account(id),
  session_hash TEXT NOT NULL UNIQUE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ログイン・通知用の連絡先はaccount_contactに分離する。パスワード、短期トークン、セッションはハッシュだけを保存する。
-- アカウント作成・証票の購入・保有に年齢制限はない（全年齢対応。生年月日・年齢は保存しない）。

CREATE TABLE account_profile (
  account_id UUID PRIMARY KEY REFERENCES account(id),
  field_values JSONB NOT NULL DEFAULT '{}'::jsonb, -- 許可済みのプロフィール項目だけを保持する。連絡先・正確な住所・生年月日等は保存しない
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- プロフィールの値は利用者本人だけが更新できる。クリエイターへの表示はattribute_share_consentに有効なfield_keyだけに限定する。

CREATE TABLE creator_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_account_id UUID NOT NULL REFERENCES account(id), -- クリエイターの主担当アカウント。ブランド/店舗名義でaccountとは意図的に別IDにする（accountとidを揃えない）。1つのaccountが複数creator_profileを持つことは許容する
  creator_rank TEXT NOT NULL DEFAULT 'free' CHECK (creator_rank IN ('free','certified','senior_certified','vip')),
  payout_country CHAR(2), -- クリエイターが申告する精算先の国。StripeでConnected Accountを作成する国として利用し、作成後は変更しない
  stripe_connected_account_id TEXT UNIQUE, -- Stripe Connected Account ID。銀行口座情報そのものは保存しない
  stripe_payouts_enabled_at TIMESTAMPTZ, -- Stripeの本人・口座確認および送金可否が有効になった時点。未確認のまま送金しない
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- creator_staff_memberはowner以外に許可した追加スタッフのアクセスを表す。オーナー自身のログイン可否は
-- owner_account_idで判定し、オーナーをcreator_staff_memberへ重複登録しない。

CREATE TABLE stripe_webhook_event (
  stripe_event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  livemode BOOLEAN NOT NULL,
  stripe_account_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('processing','processed','ignored')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
-- StripeのWebhook本文は保存しない。event IDの一意制約で重複配信を拒否し、処理失敗時は
-- トランザクション全体をロールバックしてStripeの再送を受け付ける。

CREATE TABLE creator_staff_member (
  creator_id UUID NOT NULL REFERENCES creator_profile(id),
  account_id UUID NOT NULL REFERENCES account(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  PRIMARY KEY (creator_id, account_id)
);

CREATE TABLE creator_staff_permission (
  creator_id UUID NOT NULL REFERENCES creator_profile(id),
  account_id UUID NOT NULL REFERENCES account(id),
  permission TEXT NOT NULL CHECK (permission IN ('audience_read','offers_manage','revenue_read','messages_manage')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  PRIMARY KEY (creator_id, account_id, permission)
);
-- Studio APIは、有効なcreator_staff_memberとこのテーブルの有効なpermission、またはcreator_profile.owner_account_idだけを認可根拠にする。

CREATE TABLE issuance_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creator_profile(id),
  rank TEXT NOT NULL CHECK (rank IN ('free','standard','advanced','elite','vip','extravip')),
  cap INTEGER, -- VIP・ExtraVIPはクリエイターが上限を設定しない（→ ランク・発行上限）
  price_mode TEXT NOT NULL DEFAULT 'ai_auto' CHECK (price_mode IN ('ai_auto','creator_set')), -- `ai_auto`は既存値。MVPでは外部AIを使わないルールベース自動算出を表す
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','demand_forecast','open','closed','ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (creator_id, rank)
);

CREATE TABLE public_entry_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES issuance_program(id),
  token_hash CHAR(64) NOT NULL UNIQUE, -- 32byte以上のランダムな生トークンをSHA-256でハッシュした16進表現。生トークンは保存・ログ出力しない
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  expires_at TIMESTAMPTZ,
  created_by_account_id UUID NOT NULL REFERENCES account(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  CHECK ((status = 'active' AND revoked_at IS NULL) OR (status = 'revoked' AND revoked_at IS NOT NULL))
);
CREATE UNIQUE INDEX idx_public_entry_link_one_active_per_program
  ON public_entry_link (program_id) WHERE status = 'active';
-- Public read modelは、リンクがactiveかつ期限内、issuance_programがopenかつ有料ランク、creator_profileがactiveの
-- 場合だけ対象限定の事実を返す。それ以外は同じ404とし、状態、対象ID、クリエイターの存在を区別して返さない。

CREATE TABLE issuance_reservation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES issuance_program(id),
  reserved_by_account_id UUID NOT NULL REFERENCES account(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','expired','cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reservation_program_pending ON issuance_reservation (program_id) WHERE status = 'pending';
-- 一次発行の15分仮押さえ（secondary_listingのheld状態と同じ役割）。発行上限チェックは、有効な
-- certificate数（state IN ('active','inactive')）に、有効な予約数（status='pending'かつexpires_at未到達）を
-- 加えた合計をissuance_program.capと比較する。決済成功時だけstatusを'completed'にし、そのタイミングで
-- 初めてcertificate行（serial_no）を発行する。期限切れ・失敗時は'expired'/'cancelled'にするだけで、
-- 番号は消費しない。

CREATE TABLE certificate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES issuance_program(id),
  serial_no INTEGER NOT NULL, -- programごとの連番。回収済み番号は再利用しない
  rank TEXT NOT NULL CHECK (rank IN ('free','standard','advanced','elite','vip','extravip')), -- issuance_program.rankの複製。作成時に一致させ、以後不変とする
  state TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active','inactive','ended','collected','archived')),
  current_holder_account_id UUID REFERENCES account(id),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  holding_started_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- 現保有者の保有開始時刻。譲渡のたびに更新
  support_paid_until TIMESTAMPTZ, -- 有料証票の支払済み期限。無料はNULL
  auto_renew_enabled BOOLEAN NOT NULL DEFAULT false, -- 有料証票だけでtrueにできる。プログラム終了時はfalseへ更新する
  next_renewal_at TIMESTAMPTZ, -- auto_renew_enabled=trueのときだけ次回決済予定日を設定する
  boost_total_amount NUMERIC(14,2) NOT NULL DEFAULT 0, -- 証票支援の匿名化された累計額。この行自体が譲渡されるため買い手へ自動的に引き継がれる（→ 構想の「証票支援」）。無料・ExtraVIPランクでは加算しない
  UNIQUE (program_id, serial_no)
);
-- 有料証票の購入・更新時にsupport_paid_untilとnext_renewal_atを設定する。利用者が自動更新を停止した場合は
-- auto_renew_enabledをfalse、next_renewal_atをNULLにする。プログラム終了時も全対象証票に同じ更新を行い、
-- support_paid_untilの到来時にstateを'ended'へ遷移させる。証票・来歴は削除しない。

CREATE TABLE certificate_event (
  id BIGSERIAL PRIMARY KEY,
  certificate_id UUID NOT NULL REFERENCES certificate(id),
  event_type TEXT NOT NULL, -- issued / transferred / continued / lapsed / collected / ended / archived / reissued_as
  from_holder_account_id UUID REFERENCES account(id),
  to_holder_account_id UUID REFERENCES account(id),
  actor TEXT NOT NULL, -- system / user / admin など
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  detail JSONB
);
-- 証票の来歴（公開可能な部分）はこのテーブルから再構成する。前保有者の支援額・属性は含めない。

CREATE TABLE relationship_acquisition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificate(id),
  acquisition_event_id BIGINT NOT NULL UNIQUE REFERENCES certificate_event(id),
  holder_account_id UUID NOT NULL REFERENCES account(id),
  acquired_at TIMESTAMPTZ NOT NULL,
  x_follower_count BIGINT CHECK (x_follower_count >= 0),
  x_snapshot_observed_at TIMESTAMPTZ,
  x_snapshot_status TEXT NOT NULL CHECK (x_snapshot_status IN ('recorded','unavailable')),
  CHECK (
    (x_snapshot_status = 'recorded' AND x_follower_count IS NOT NULL AND x_snapshot_observed_at IS NOT NULL
      AND x_snapshot_observed_at <= acquired_at AND x_snapshot_observed_at >= acquired_at - INTERVAL '5 minutes') OR
    (x_snapshot_status = 'unavailable' AND x_follower_count IS NULL AND x_snapshot_observed_at IS NULL)
  )
);
-- Xフォロワー数はDBトランザクションを開く前に短いタイムアウトで正規連携元から取得する。発行または譲渡は
-- 連携失敗で止めず、確定と同じDBトランザクションでrelationship_acquisitionをrecordedまたはunavailableとして
-- 一度だけ追記する。推定値・手入力値・5分より古い値を使わない。

CREATE TABLE goods_registration_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES issuance_program(id),
  code_hash TEXT NOT NULL UNIQUE,
  purchase_reference_hash TEXT NOT NULL UNIQUE,
  product_label TEXT NOT NULL,
  purchase_source TEXT NOT NULL,
  purchase_amount NUMERIC(14,2),
  purchase_currency CHAR(3),
  purchase_confirmed_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (purchase_amount IS NULL AND purchase_currency IS NULL) OR
    (purchase_amount IS NOT NULL AND purchase_currency IS NOT NULL
      AND purchase_amount >= 0 AND purchase_currency ~ '^[A-Z]{3}$')
  )
);
-- purchase_amountとpurchase_currencyは正規販売元が購入確定時に提供した場合だけ保存する。
-- 片方だけを保存せず、取得できない場合は両方NULLとして来歴だけへ反映し、支払額グラフには合算しない。

CREATE TABLE goods_purchase_record (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL UNIQUE REFERENCES goods_registration_code(id),
  certificate_id UUID NOT NULL REFERENCES certificate(id),
  holder_account_id UUID NOT NULL REFERENCES account(id),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_goods_purchase_holder ON goods_purchase_record (holder_account_id, registered_at DESC);
-- 正規販売元から購入確定と注文参照を受領し、注文参照のハッシュが未登録の場合だけコードを発行する。
-- 登録時はcertificate.current_holder_account_idとholder_account_id、program_idの一致を同じトランザクションで
-- 確認する。入力された生コードはハッシュ照合後に破棄し、DB・アクセスログ・監査ログへ保存しない。
-- 購入履歴はholder_account_idに属する個人記録であり、XXGGLLの譲渡先へ引き継がない。

CREATE TABLE concierge_case (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id UUID NOT NULL REFERENCES account(id),
  creator_id UUID REFERENCES creator_profile(id), -- 対象クリエイター未定の相談（VIP招待直後の一般的な希望共有等）もありうる
  case_type TEXT NOT NULL CHECK (case_type IN ('attribute_share','service_request')), -- 通常の属性・希望共有か、VIP・ExtraVIP個別サービス相談か
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN (
    'received','reviewing','awaiting_consent','share_reflected',
    'anonymous_outreach','terms_negotiation','final_confirmation',
    'contracted','withdrawn'
  )), -- VIPコンシェルジュ運用の状態表示に対応。'share_reflected'は集計ダッシュボードへ反映済みの状態（プッシュ配信の待機ではない）
  primary_ops_account_id UUID REFERENCES account(id), -- 主担当
  secondary_ops_account_id UUID REFERENCES account(id), -- 副担当
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_concierge_case_user ON concierge_case (user_account_id);

CREATE TABLE concierge_message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES concierge_case(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user','ops','creator')),
  sender_account_id UUID REFERENCES account(id),
  body TEXT NOT NULL,
  contains_identifying_info BOOLEAN NOT NULL DEFAULT false, -- trueの場合、匿名打診段階ではクリエイターへ配信しない
  visible_to_creator BOOLEAN NOT NULL DEFAULT false, -- 運営が内容確認後に開放するまでfalse
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_concierge_message_case ON concierge_message (case_id);
-- status='anonymous_outreach'（匿名打診中）の間は、visible_to_creator=trueであってもcontains_identifying_info=
-- trueのメッセージは配信前に自動チェックで止める（→ セキュリティ「VIPコンシェルジュ・匿名性の保護」）。

CREATE TABLE additional_offering (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creator_profile(id),
  title TEXT NOT NULL,
  terms JSONB NOT NULL, -- 商品内容、価格、数量上限、申込み期限、取消・返金条件等
  quantity_limit INTEGER NOT NULL CHECK (quantity_limit > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','open','sold_out','closed')),
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 成立済み申込み数は、このofferingを参照するservice_engagement（status NOT IN ('cancelled','refunded')）の
-- 件数で数える。quantity_limitに達したら運営がstatus='sold_out'にする。

CREATE TABLE service_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('additional_product','vip_service')),
  user_account_id UUID NOT NULL REFERENCES account(id),
  creator_id UUID NOT NULL REFERENCES creator_profile(id),
  additional_offering_id UUID REFERENCES additional_offering(id), -- kind='additional_product'のときだけ設定する
  concierge_case_id UUID REFERENCES concierge_case(id), -- kind='vip_service'はconcierge_caseでの調整を経て成立する
  terms JSONB NOT NULL, -- 提供内容・対象人数・回数・時間・期限、連絡手段、価格、変更・取消・返金条件、禁止事項、成果物の利用権等
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','terms_proposed','contracted',
    'fulfilled','unfulfilled','cancelled','refunded'
  )),
  price NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'JPY', -- XXGGLLの決済・台帳通貨はJPYに固定する
  contracted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (kind = 'additional_product' AND additional_offering_id IS NOT NULL AND concierge_case_id IS NULL) OR
    (kind = 'vip_service' AND additional_offering_id IS NULL)
  )
);
-- 証票のライフサイクル（certificate.state）とは独立したステートマシン。証票が非継続・終了・回収されても、
-- 成立済みのservice_engagementはtermsの条件に従って履行・代替・返金する。

CREATE TABLE payment_attempt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_account_id UUID NOT NULL REFERENCES account(id),
  purpose TEXT NOT NULL CHECK (purpose IN ('primary_issue','continued_support','certificate_boost','secondary_reissue','additional_purchase','vip_service')),
  certificate_id UUID REFERENCES certificate(id),
  service_engagement_id UUID REFERENCES service_engagement(id),
  idempotency_key UUID NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'JPY' CHECK (currency = 'JPY'),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','payment_pending','succeeded','failed','cancelled','refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
-- 購入画面は要求ごとにidempotency_keyを一度だけ発行する。同じ要求の再送は既存行を返し、新規のStripe決済を作成しない。
-- stripe_payment_intent_idが確認済みの決済試行だけをsucceededにし、台帳行はpayment_attempt.idを参照して記帳する。

CREATE TABLE ledger_entry (
  id BIGSERIAL PRIMARY KEY,
  payment_attempt_id UUID REFERENCES payment_attempt(id),
  transaction_id UUID NOT NULL, -- 同一決済に属する当事者別の行を束ねるID
  kind TEXT NOT NULL CHECK (kind IN ('primary_issue','continued_support','certificate_boost','secondary_reissue','additional_purchase','vip_service','refund')),
  certificate_id UUID REFERENCES certificate(id), -- 追加商品・個別サービスで証票に紐付かない場合はNULL
  service_engagement_id UUID REFERENCES service_engagement(id), -- 追加商品・個別サービスの場合、対象契約への参照
  payer_account_id UUID NOT NULL REFERENCES account(id),
  creator_id UUID REFERENCES creator_profile(id),
  party_role TEXT NOT NULL CHECK (party_role IN ('creator','operator','credit_holder')),
  party_account_id UUID REFERENCES account(id), -- party_role='credit_holder'のときだけ設定する。creator分の受取人はcreator_id、operator分は受取人がないためNULL
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'JPY', -- 取引・分配金の計上通貨。多通貨換算は扱わない
  available_at TIMESTAMPTZ, -- creator分の精算可能日時。creator以外はNULL
  counts_as_support BOOLEAN NOT NULL, -- 個人支援実績・VIP招待実績へ加算するか（→ 取引ルールの配分表）
  counts_as_certificate_cost BOOLEAN NOT NULL, -- 証票の取得原価へ加算するか
  reverses_transaction_id UUID, -- 返金時に元取引のtransaction_idを参照。取り消しは新規行として追加し元行は変更しない
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ledger_transaction ON ledger_entry (transaction_id);
CREATE UNIQUE INDEX idx_ledger_payment_party
  ON ledger_entry (
    payment_attempt_id,
    party_role,
    COALESCE(creator_id, '00000000-0000-0000-0000-000000000000'::UUID),
    COALESCE(party_account_id, '00000000-0000-0000-0000-000000000000'::UUID)
  )
  WHERE payment_attempt_id IS NOT NULL;
-- 1決済 = 同一transaction_idを持つ複数行（creator分・operator分・credit_holder分）。
-- ヘッダー専用テーブルを分けず、決済と当事者別の記帳行だけで台帳を表現する（小規模運用向けの最小構成）。
-- creator分は、購入価格・運営売上との配分率を約定しないクリエイター報酬であり、`available_at`は通常、決済確定日から90日後とする。
-- 運営は決済手数料、返金・異議申立ての見込みおよび運営上のリスク留保を織り込んで報酬額を記帳する。kind='secondary_reissue'のcredit_holder分は、下の
-- reissue_credit_entryで付与する再発行クレジットの根拠であり、現金の支払債務ではない。買い手の支払いは
-- Stripeの運営プラットフォーム残高へ一旦集約され（Separate Charges and Transfers）、creator分だけを
-- payout_requestの出金申請時に送金する（→ セキュリティ「決済・台帳のセキュリティ」）。
-- kind='certificate_boost'（証票支援）は、certificate.boost_total_amountへの加算と同時に発生する
-- 二重記帳。この行（誰が・いつ・いくら払ったか）は支払った本人とadmin以外に公開しない。買い手・将来の
-- 保有者に公開してよいのはcertificate.boost_total_amount（匿名化された合計額）だけである（→ セキュリティ）。

CREATE TABLE payment_review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('payment_provider_notice','card_dispute','fraud_evidence','authority_request')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','refund_confirmed','no_refund','expired')),
  hold_until TIMESTAMPTZ NOT NULL, -- 決済確定日から180日を超えない
  evidence_reference TEXT, -- 決済事業者のイベントID、照会番号又は公的機関の文書番号。原資料はDBに保存しない
  reviewed_by_account_id UUID REFERENCES account(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_payment_review_transaction ON payment_review (transaction_id) WHERE status = 'open';
-- 購入者の申告だけでは本テーブルを作成しない。決済事業者・カード会社からの通知、不正利用を示す合理的な資料又は
-- 公的機関からの要請を確認してから作成する。open行がある取引のcreator分は精算可能額に含めない。返金確定時は
-- 元取引を参照する取消行をledger_entryへ追記する。180日を過ぎた取引は運営負担とし、支払済み報酬を回収しない。

CREATE TABLE reissue_credit_entry (
  id BIGSERIAL PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES account(id),
  transaction_id UUID NOT NULL,
  certificate_id UUID REFERENCES certificate(id),
  kind TEXT NOT NULL CHECK (kind IN ('grant','use','expire','reversal')),
  amount NUMERIC(14,2) NOT NULL CHECK (amount <> 0), -- grantは正、use/expire/reversalは負
  currency TEXT NOT NULL DEFAULT 'JPY',
  source_grant_id BIGINT REFERENCES reissue_credit_entry(id), -- use/expire/reversal時に対象grantを示す
  expires_at TIMESTAMPTZ, -- grantだけに付与日から6か月後を設定する
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (kind = 'grant' AND amount > 0 AND source_grant_id IS NULL AND expires_at IS NOT NULL) OR
    (kind IN ('use','expire','reversal') AND amount < 0 AND source_grant_id IS NOT NULL AND expires_at IS NULL)
  )
);
CREATE INDEX idx_reissue_credit_account_expiry ON reissue_credit_entry (account_id, expires_at) WHERE kind = 'grant';
-- 再発行クレジットは、再発行成立時にgrant行としてだけ発行する。利用時は古いgrantから順にuse行を追加し、
-- 失効日時点の残額にはexpire行を追加する。残額を上書きせず、すべて追記で管理する。
-- クレジットは現金化・払戻し・チャージバック・他者移転を許可しない。利用先は運営が契約相手となる一次発行・
-- 再発行・継続支援だけで、追加商品・VIP・物販その他クリエイター個別のサービスには使えない。
-- `reversal`は、クレジットの返金・チャージバックではない。対応する再発行の購入決済自体が取消・返金・
-- チャージバックにより成立しなくなったときに、付与済みgrantを取り消すためだけに追加する。

CREATE TABLE payout_request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creator_profile(id),
  requested_by_account_id UUID NOT NULL REFERENCES account(id), -- 通常はcreator_profile.owner_account_id
  amount NUMERIC(14,2) NOT NULL, -- 分配金・別契約対価の計上通貨での申請額
  currency TEXT NOT NULL DEFAULT 'JPY',
  settlement_amount NUMERIC(14,2), -- Stripeが実行する実際の送金額。処理開始前はNULL
  settlement_currency TEXT, -- 現行はJPYだけを設定する。多通貨対応まで他の値を使わない
  fx_rate NUMERIC(20,10), -- 現行は常にNULL。多通貨対応時だけ換算レートを記録する
  fx_rate_observed_at TIMESTAMPTZ, -- 現行は常にNULL
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','onboarding_required','processing','paid','failed','cancelled')),
  stripe_transfer_id TEXT UNIQUE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_payout_creator ON payout_request (creator_id);

CREATE TABLE payout_allocation (
  payout_request_id UUID NOT NULL REFERENCES payout_request(id),
  ledger_entry_id BIGINT NOT NULL REFERENCES ledger_entry(id),
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','released','settled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (payout_request_id, ledger_entry_id)
);
CREATE UNIQUE INDEX idx_payout_allocation_single_open
  ON payout_allocation (ledger_entry_id) WHERE status IN ('reserved','settled');
-- 出金申請の作成時に対象ledger_entryをロックし、申請額をpayout_allocationへ記録する。
-- 取消済み出金の予約解除はallocationをreleasedへ更新して表す。送金済みのallocationはsettledとして再利用しない。
-- allocation.amountは対象ledger_entryの未精算全額と一致させる。1つの台帳行を複数の出金申請へ分割しない。
-- 精算可能額 = 該当creator_idに対応する有効なledger_entry（party_role='creator'かつavailable_at <= now()、
-- 対応transaction_idにstatus='open'のpayment_reviewがないもの）の合計 − 返金・取消行 − 申請済み・オンボーディング中・処理中・完了済み（status IN
-- ('requested','onboarding_required','processing','paid')）payout_requestの申請額。これにより同じ残高への
-- 複数の出金申請を防ぐ。
-- 初回申請時、Stripe Connected Accountが未作成なら、申請の流れの中でStripeのホスト型オンボーディング
-- （本人確認・銀行口座確認・Stripeサービス契約への同意）へ進む。作成済みのConnected Account IDは
-- creator_profile.stripe_connected_account_idに保存し、Accounts v2のrecipient transfer capabilityがactiveと確認できた時点で
-- stripe_payouts_enabled_atを設定する。通貨はJPYに固定し、為替・多通貨送金は扱わない。
-- 出金申請前に返金が発生した場合は、送金済み資金がないため取り消しの資金回収が不要である。精算可能額として確定し
-- 出金後に生じた通常の返金・チャージバックは、運営が負担し、クリエイターからの相殺・回収処理は持たない。

CREATE TABLE attribute_share_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_account_id UUID NOT NULL REFERENCES account(id),
  creator_id UUID NOT NULL REFERENCES creator_profile(id),
  field_key TEXT NOT NULL, -- display_name / age_range / region / occupation / interests / support_reason / free_text 等
  consent_version TEXT NOT NULL, -- 同意文面の版
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT CHECK (revoked_at IS NULL OR revocation_reason IN ('user','transfer','expiry','stop','account_stop')),
  UNIQUE (user_account_id, creator_id, field_key, consented_at)
);
CREATE UNIQUE INDEX idx_consent_single_active
  ON attribute_share_consent (user_account_id, creator_id, field_key) WHERE revoked_at IS NULL;
-- 同一項目について、同時に有効な同意行を1件だけに制限する（secondary_listingと同じ部分ユニークインデックスの
-- パターン）。再同意する場合は、先に旧行のrevoked_atを立ててから新しい行を追加する。
-- revoked_atが立った項目は、クリエイター向け集計ダッシュボードの対象から即時除外する。
-- revocation_reason='user'は本人撤回、それ以外は譲渡・失効・停止によるシステム終了を表す。
-- 開示資格は「同じcreator_idの有効な有料証票を1件以上保有すること」とする。特定の証票へ同意を紐づけない。
-- 譲渡・失効・終了により有効な有料証票が0件になった時点で、当該creator_idへの全項目をrevoked_atで一括終了する（アプリケーション層）。
-- profileの値を更新しても、開示先は自動で追加しない。利用者がプロフィール画面で項目・開示先ごとに明示して初めて表示対象になる。
-- 開示先creator_idは、当該利用者が保有中の有料XXGGLLを持つクリエイターだけに限定する。失効・終了時もアプリケーション層でrevoked_atを設定する。

CREATE TABLE support_expression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificate(id),
  user_account_id UUID NOT NULL REFERENCES account(id),
  creator_id UUID NOT NULL REFERENCES creator_profile(id),
  display_name_shared BOOLEAN NOT NULL DEFAULT false,
  support_reason TEXT NOT NULL CHECK (support_reason IN ('creative_work','community','story','other')),
  interest_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 280),
  share_with_creator BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (certificate_id)
);
CREATE INDEX idx_support_expression_creator_visible
  ON support_expression (creator_id, updated_at DESC)
  WHERE status = 'active' AND share_with_creator = true;
-- 応援表現は現保有者の有料証票にだけ紐づき、譲渡時に前保有者の表現・表示名・属性・公開設定を引き継がない。
-- 保存前に、個人連絡先、外部決済、面会要求、性的要求、脅迫・恐喝、差別・ヘイト、詐欺・勧誘を検知して拒否する。
-- creatorが読めるのはshare_with_creator=trueで明示共有された現保有者の表現だけであり、非共有・PII・決済情報は返さない。

CREATE TABLE secondary_listing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificate(id),
  holder_account_id UUID NOT NULL REFERENCES account(id),
  reissue_price NUMERIC(14,2) NOT NULL, -- 運営の価格ルールによる再発行価格。前保有者は設定できない
  credit_amount NUMERIC(14,2) NOT NULL, -- 再発行価格の85%。成立時にreissue_credit_entryのgrant行を作る
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','held','reissued','cancelled','expired')),
  held_by_account_id UUID REFERENCES account(id),
  hold_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_listing_single_active
  ON secondary_listing (certificate_id) WHERE status IN ('active','held');
-- 同一証票に同時に有効な再発行申込みを1件だけに制限する。在庫仮押さえの排他制御はNF-02に従う。

CREATE TABLE waitlist_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES issuance_program(id),
  account_id UUID REFERENCES account(id), -- ログイン済みアカウントでの登録
  contact_channel_hash TEXT, -- 通知先（メール等）のハッシュ。account_idと併用可
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (account_id IS NOT NULL OR contact_channel_hash IS NOT NULL)
);
CREATE INDEX idx_waitlist_program ON waitlist_entry (program_id);
CREATE UNIQUE INDEX idx_waitlist_account_program
  ON waitlist_entry (program_id, account_id) WHERE account_id IS NOT NULL;
CREATE UNIQUE INDEX idx_waitlist_contact_program
  ON waitlist_entry (program_id, contact_channel_hash) WHERE contact_channel_hash IS NOT NULL;
-- 待機順は購入優先権を保証しない（→ 構想の価格・発行数の算出）。

CREATE TABLE fixed_content_asset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES issuance_program(id),
  slot_no INTEGER NOT NULL CHECK (slot_no BETWEEN 1 AND 3),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image','audio','video')),
  asset_ref TEXT NOT NULL, -- オブジェクトストレージ等の参照
  transferable BOOLEAN NOT NULL DEFAULT true, -- 譲渡後も買い手が閲覧できるか。公開前に固定し、以後変更しない
  rights_confirmed_at TIMESTAMPTZ, -- クリエイターが配信・表示・譲渡後閲覧に必要な権利を確認した日時
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected','suspended')),
  suspended_reason TEXT, -- review_status='suspended'のときの理由（権利侵害・誤情報・安全上の理由）
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, slot_no)
);
-- review_status='approved'になるまで配信しない。停止（suspended）時も証票・関係記録は維持する
-- 購入者ごとの差し替え・個別制作は行わない（1つのasset_refを全保有者へ配信）。

CREATE TABLE vip_invite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_account_id UUID NOT NULL REFERENCES account(id),
  creator_id UUID REFERENCES creator_profile(id), -- ExtraVIPは対象クリエイターを伴う。VIPはユーザーランク付与が対象クリエイターに先行することもある
  track TEXT NOT NULL CHECK (track IN ('vip','extravip')),
  referral_source TEXT, -- track='extravip'の起点（vip_track / referral）。紹介者の非公開情報は別途扱う
  criteria_snapshot JSONB NOT NULL, -- 招待時点の評価根拠。内部スコアは非公開項目として分離し、ユーザーには理由区分だけを示す
  status TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN (
    'candidate','under_review','invited','accepted',
    'creator_confirmation_pending','declined','expired','rejected'
  )),
  invited_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- 招待の有効期限（30日）
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vip_invite_candidate ON vip_invite (candidate_account_id);
-- track='extravip'は、status='accepted'（ユーザー承諾）の後、'creator_confirmation_pending'を経て
-- クリエイターの匿名条件確認・双方応諾（concierge_caseで調整）が完了してから証票を発行する。
-- track='vip'はユーザー承諾だけで証票発行に進める（→ 構想のExtraVIPフロー・VIPフロー）。

CREATE TABLE moderation_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_account_id UUID REFERENCES account(id), -- 自動検知の場合はNULL
  target_type TEXT NOT NULL CHECK (target_type IN ('support_expression','fixed_content_asset','concierge_message','account')),
  target_ref UUID NOT NULL,
  category TEXT NOT NULL, -- 差別/脅迫/性的要求/面会要求/個人情報/なりすまし/私的連絡先 等
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved_no_action','resolved_action_taken')),
  handled_by_account_id UUID REFERENCES account(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX idx_moderation_target ON moderation_report (target_type, target_ref);
-- target_refはtarget_typeによって参照先テーブルが変わるポリモーフィックな参照。通報者情報は調査担当以外に開示しない（→ セキュリティ）。

CREATE TABLE audit_log_entry (
  id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user','creator','creator_staff','admin','system')),
  actor_id UUID,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_ref UUID,
  detail JSONB
);
CREATE INDEX idx_audit_target ON audit_log_entry (target_type, target_ref);
-- アプリケーションのDB接続ロールにUPDATE/DELETE権限を与えず、追記専用を権限設定で担保する。
-- ハッシュチェーン等の改ざん検知基盤は作らない。同意・台帳記帳・
-- 証票状態遷移・運営操作を確実に記録することを、マネロン対策を含む安全管理の土台とする。
-- 購入時の利用規約同意、クリエイター利用規約同意、プログラム終了の起票・確定は、規約の文書版、同意または
-- 操作時刻、actor_account_idをdetailに含めて記録する。
```

## 整合性ルール

- 発行上限と実発行数の不変条件（`certificate.state IN ('active','inactive')` の件数に、有効な
  `issuance_reservation`（`status='pending'` かつ `expires_at` 未到達）の件数を加えた合計が、
  `issuance_program` の確定発行数を超えない）は、一意制約だけでは表現できないため、行ロックまたは
  シリアライザブル分離レベルを使ったアプリケーション層のトランザクションで保証する
  。一次発行の15分仮押さえは `issuance_reservation` が担い、
  決済成功時にだけ実際の `certificate` 行（serial_no）を発行する。
- `secondary_listing` の部分ユニークインデックスにより、同一証票の二重再発行・二重成立を防ぐ。
  `attribute_share_consent` も同じパターンの部分ユニークインデックスで、同一項目の同時有効行を1件に制限する。
- `stripe_webhook_event.stripe_event_id` の主キーにより、署名検証済みのStripeイベントを同じイベントIDで
  再処理しない。Accounts v2のrecipient capabilityイベントは、対象の`creator_profile`が存在する場合だけ
  `stripe_payouts_enabled_at`を更新する。Webhook本文・カード情報・口座情報は保存しない。
- 同一 `transaction_id` を持つ `ledger_entry` の `amount` 合計は、決済総額と一致しなければならない。
  DB制約での表現は難しいため、書き込み時にアプリケーション層で検証する。
- `ledger_entry.party_account_id` は `party_role='credit_holder'` のときだけ設定する。creator分の受取人は
  `creator_id` で示し、operator分は受取人を持たない。credit_holder分は同一transaction_idの
  `reissue_credit_entry.kind='grant'` と金額を一致させる。実際の送金は `payout_request` が処理するが、対象は
  creatorだけである。
- `payout_request` の金額は、対応する `ledger_entry` の未精算合計（精算可能日の到来し、確認中の`payment_review`がない有効な報酬・別契約対価 − 返金取消額 −
  申請済み・処理中・完了済みpayout_requestの合計）を超えてはならない。`payout_request.amount`は有効な
  `payout_allocation.amount`の合計と一致させ、各allocationは対象台帳行の未精算全額と一致させる。この超過チェックもアプリケーション層で行う。
- `payout_request` を`processing`へ遷移させる前に、対応するcreator_profileの`stripe_connected_account_id`、
  `stripe_payouts_enabled_at`、`payout_country`およびAccounts v2のrecipient transfer capabilityを確認する。不成立なら
  `onboarding_required`または`failed`として記録し、Stripe以外の送金を実行しない。
- `certificate.boost_total_amount` の加算は、`kind='certificate_boost'` の `ledger_entry` 記帳と同一
  トランザクションで、`UPDATE ... SET boost_total_amount = boost_total_amount + amount` の形で行う
  （読み取り→書き込みの競合を避ける）。`rank` が `free` または `extravip` の証票には加算しない
  （アプリケーション層で拒否する。→ 構想の「証票支援」）。
- `fixed_content_asset` は `review_status='approved'` になるまで配信対象にしない。`suspended` になっても
  証票本体・関係記録は維持し、コンテンツだけを止める（[構想](../concept/benefits/content.md)の「安全・権利」）。
- `additional_offering.quantity_limit` を超える `service_engagement`（`kind='additional_product'`、`status NOT IN ('cancelled','refunded')`）
  を成立させない。発行上限と同様、行ロックまたはシリアライザブル分離レベルのトランザクションで保証する
  。上限到達時は `additional_offering.status` を `sold_out` にする。
- `vip_invite` の `track='extravip'` は、`status='accepted'`（ユーザー承諾）の後に必ず
  `creator_confirmation_pending` を経由し、対応する `concierge_case`（`case_type='service_request'`）で
  クリエイターの匿名条件確認・最終応諾が完了してから証票発行に進める。`track='vip'` はこの経由を必要としない。
- `concierge_message` は、`concierge_case.status='anonymous_outreach'` の間、`contains_identifying_info=true`
  の行を配信対象から除外する。この判定はアプリケーション層の自動チェックが行い、DB制約では表現しない。
- `attribute_share_consent` の `revoked_at` が立った項目は、集計ダッシュボードのクエリで必ず除外する。
- `certificate_event` と `audit_log_entry` は追記専用とし、更新・削除を行わない。証票の現在状態は
  `certificate` テーブルの派生であり、来歴の唯一の正本は `certificate_event` である。

## 保存しないもの

- 法的氏名、住所、生年月日、電話番号、個人メールアドレス、カード情報、銀行口座情報、本人確認書類の原本。
- 人種・民族、宗教、政治的信条、病歴、障害、性的指向など、[属性開示・決済事業者確認](../concept/foundation/identity-disclosure.md)
  の「共有しない情報」に列挙された属性カテゴリ。
- 前保有者の支援額・属性・メッセージ（譲渡時に新保有者へ引き継がない項目）。
