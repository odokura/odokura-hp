---
title: XXGGLL 認証・認可・Ops
sidebar_label: 認証・認可・Ops
sidebar_position: 3
draft: true
---

# XXGGLL 認証・認可・Ops

通常利用者、Creator、Ops、Railway管理者の本人確認、セッション、認可、再認証、登録・復旧境界を定める。

## 1. 通常利用者とCreator

- 利用者（user）はメール等の最小限の情報でアカウントを作成する。パスワードはハッシュ化して保存し、平文・
  復元可能な形では保持しない。決済手段はトークン化して決済代行に委ね、自社では保持しない。
- アカウント作成・証票の購入・保有・譲渡に年齢制限は設けない。全年齢が利用できるサービスとして設計する
  （下記「年齢確認について」）。

### 1.1 共通認可、セッション、設定

- 役割ベースアクセス制御（RBAC）を用い、[要件](../core/requirements.md)の権限マトリクスをサーバー側の認可判定に
  そのまま対応させる。フロントエンドでの表示制御だけに頼らない。
- 運用機能はadminロールに集約する。`ops_role` の追加による役割分割は行わない。
- 管理画面は一般利用者向けAPIとログインセッションを分け、運営アカウントの侵害が利用者アカウントへ直接
  波及しないようにする。専用HTTPS Originは必須とするが、バックエンドを別インフラへ分離することは必須にしない。
- クリエイターの精算先変更など、金銭の受取先に関わる操作には追加の確認ステップを挟む。
- セッションには発行から30日の絶対期限と最終利用から7日のアイドル期限を設ける。ログイン・登録・OAuth完了・
  資格情報変更後は新しいセッションを発行し、旧セッションを使い回さない。
- 通常利用者の高リスク操作は、サーバー側で現在の通常セッションの再認証時刻を確認する。対象はOAuth連携解除と精算申請とし、パスワード再認証から15分を超えている場合は`reauthentication_required`で確定を止める。パスワード値や再認証秘密値は保存・返却しない。adminによる返金・送金などのOps操作は、この通常再認証を使わず、上記の5分以内のパスキー再認証を必須にする。
- パスワード変更自体は現在のパスワード（初回設定を除く）を必須とし、成功後に全セッションを失効して新しい
  現在セッションだけを発行する。OAuth専用アカウントはパスワード設定後に再認証可能とする。
- 通常利用者の設定トップは、現在のaccountに結び付いた最小限のread modelだけを返す。メール、認証方法、セッション、プロフィール共有状態の更新は、現在の通常セッション、CSRF対策、対象所有権、必要な再認証を同一のサーバー側処理で確認し、クライアントのaccount ID、session ID、再認証済みフラグを認可根拠にしない。
- メール変更は新しい連絡先の確認完了まで旧連絡先を有効に保ち、確認成功後に通常セッションを全失効して現在ブラウザだけへ新しいセッションを発行する。X連携解除は直近の再認証と別のログイン方法の残存を確認し、最後の認証方法を消す操作を拒否する。パスワード変更、メール変更、連携解除、全端末ログアウト、アカウント閉鎖の結果を監査するが、パスワード、トークン、Cookie、メールアドレス本文、決済手段を監査ログへ記録しない。
- 通常利用者の設定画面でOpsのパスキー、`admin_session`、Railway資格情報、DB接続資格情報を表示・操作できない。Ops認証は専用Origin・専用セッション・登録済みパスキーの境界を維持し、通常のアカウント設定から到達可能にしない。
- アカウント閉鎖は、保有中XXGGLL、処理中決済、未解決ケースを確認してから、直近の再認証と明示的確認を要求する。台帳・証票来歴・必要な監査記録を削除・改変せず、個人プロフィールの開示と通常・Opsセッションを確定後に失効する。保持・匿名化・再開可否がデータモデルへ定義されるまで、完了したように見える退会操作を提供しない。

## 2. Opsパスキーとchallenge

- 運営担当者（`account.ops_role = 'admin'`）がOpsへ入るには、スマートフォンを含む利用者所有のパスキー（WebAuthn/FIDO2）を必須にする。認証器は利用者検証（生体認証または端末PIN）を必須とし、期待するchallenge、RP ID、Origin、credential public key、署名をサーバー側で照合する。メール、パスワード、X OAuth、メール再設定、SMS、通常アカウントのログイン済みCookieをOpsログインの代替・復旧手段にしてはならない。
- パスキーは`admin_passkey_credential`に公開鍵、credential ID、利用状態だけを記録し、秘密鍵、生体情報、端末のロック解除情報を受け取らない。スマートフォン同期型パスキーを許可するが、利用者検証なしの認証器、未登録credential、失効済みcredentialを拒否する。署名カウンタを提供するcredentialでは減少・再利用を異常として記録し、当該セッションを確定しない。カウンタを提供しない同期型credentialは値だけで拒否せず、backup状態を記録して別の認証要件を弱めない。
- Opsの認証開始challengeは推測困難な一回限りの値とし、サーバー側でハッシュだけを保存し、開始したブラウザに結び付けて5分で失効させる。成功・失敗・期限切れを含め、challengeを再利用してOpsセッションを作成してはならない。認証開始と失敗の応答は、adminアカウント・credential・失効理由の存在を示さない。
- Opsの認証開始challengeと登録用の事前認可は、IPを認証要素に使わず、IP単位と全体のレート制限・同時発行上限を設ける。challengeは比較と一回消費を単一の更新で行い、`consumed_at IS NULL`かつ有効期限内の場合だけ消費する。期限切れ・消費済みのchallengeと事前認可は定期削除し、削除処理・拒否件数を監査する。

### 2.1 Origin、セッション、再認証

- Opsは公開利用者向けのログインとは別のHTTPS Originとする。環境ごとに`OPS_ORIGIN`を完全一致のHTTPS URL、`OPS_RP_ID`をそのURLのホスト名として設定する。本番起動時にHTTPS、パス・クエリ・フラグメントを含まないこと、両設定のホスト名一致を検証し、不一致なら起動しない。親ドメイン・ワイルドカードのRP IDを使わず、リバースプロキシはこのHostだけをOpsへルーティングし、他のHost headerをアプリケーション到達前に拒否する。認証前に到達可能なのは`/ops/sign-in`、事前認可済み`/ops/enroll`、監視専用`GET /ops/health`だけとし、Public、Home、Creator管理のナビゲーション・セッション応答・通常の認証画面からOpsの存在、adminロール、credentialの有無を示さない。`/ops/health`はaccount、credential、session、DB、version、deploymentの情報を返さず、DB・外部serviceへ接続しない。その他のOpsページ、旧`/admin`配下、`/api/admin`配下は、有効なOpsセッションがない要求へ理由を区別しない`404`を返す。管理APIは入力解析、DB・外部決済の構成確認、業務処理より先にこの確認を完了する。
- Opsセッションは通常の`auth_session`と別の`admin_session`に保存し、Cookieも`Secure`、`HttpOnly`、`SameSite=Strict`、`__Host-` prefixを満たす専用名にする。通常セッション、Cookie差し替え、利用者・Creatorのセッション発行ではOpsの認可を満たさない。通常セッションの全失効（ログアウト全端末・パスワード変更を含む）は、同じaccountのOps sessionも失効する。全Opsのread/write要求は、共通のOpsセッション検証で現在の`admin_session`、紐づくcredentialの失効状態、`account.ops_role='admin'`、accountがactiveであること、アイドル15分、発行から8時間を同一要求内で再照合する。credential失効・adminロール解除と該当`admin_session`全件の失効は同一DBトランザクションで行い、ロール解除はDBトリガーでも強制する。ロールを再付与しても過去のcredential、Ops session、未完了登録、challengeは再利用できない。更新操作は認可確認から確定まで同じトランザクションで対象セッションとaccountをロックする。
- 返金、送金、強制失効、プログラム終了などの高リスクOps操作は、5分以内に完了したパスキーの再認証をサーバー側で確認する。通常利用者の高リスク操作に必要なパスワード再認証とはセッション、証跡、失敗応答を共有しない。

## 3. Ops登録・復旧・解除

- `ops_role='admin'`の付与、最初のパスキー登録、全credential喪失後の復旧、ロール解除は、通常の公開Web APIでは扱わない。ローカルの`npm run ops:setup -- ACTION`は、`ACTION`を`bootstrap`、`recover`、`revoke`のいずれかとして実行する。`railway whoami`で確認したRailway認証を使い、Project `f0d6777b-fd62-4561-b504-44e2a3386895`、environment `b98d67a3-d33e-429a-9e0e-820f95591c5f`、Web service `12dfb4a9-961e-4af3-a072-cd4cc15b7cf6`へ`railway ssh`で単一commandを委譲するだけである。稼働中の`dev`実行containerだけが、対象account、照合済みのRailway個人アカウント、固定理由、有効期限を記録した一回限りの`admin_passkey_enrollment`を作成できる。初回bootstrapはactive accountが一件だけで有効credentialがない場合に限定し、複数対象や既存credentialを推測・上書きしない。ローカルPCはDB接続、Railway variable、`railway run`、CIへ登録処理を委譲しない。登録前に実行containerがProject/Environment/Service IDと`dev`の`APP_BASE_URL`/`OPS_ORIGIN`を完全一致で検証する。登録リンクの秘密値は対話端末だけに表示し、URLフラグメントで受け渡す。`Referrer-Policy: no-referrer`の専用画面がTLSで一度だけ送信し、サーバーは有効な登録記録を原子的に消費して、開始ブラウザに結び付く5分以内の`__Host-`事前認可Cookieを発行する。そのCookieを持つ`/ops/enroll`だけでWebAuthn登録challengeを発行する。リンク、Cookie、challengeのいずれかがない要求と失敗理由は同じ`404`とする。
- 上記のproject、environment、service、Originは`dev`専用であり、productionへ流用しない。productionの初回登録・復旧・解除は、`dev`と同じ
  `npm run ops:setup -- ACTION`の操作境界を維持しながら、production専用固定target、active admin一件の対象条件、action別の固定理由、
  旧credential・session・challengeの一括失効、監査、PC外の回復手段を定義したrunbookとtestが完成するまで有効化しない。
- 既存adminのcredential追加・削除は、有効なOpsセッションだけでは行えない。対象accountの現在有効なcredentialによる5分以内の新しいパスキー再認証を完了し、再認証、adminロール、credentialとセッションの失効状態を同じDBトランザクションで再確認した場合だけ確定する。追加・削除の成功は監査する。紛失・侵害または全credential喪失後の復旧では、旧credential、全Opsセッション、未完了登録、未消費challengeを先に同一トランザクションで失効し、新しい一回限りの登録だけを発行する。メール等による自動復旧を行わない。

## 4. 管理用read model

- 運営担当者がユーザー画面を確認する場合は、admin専用の読み取り専用ビューで一人の対象を明示して開く。ユーザー本人のセッション発行、Cookie差し替え、なりすまし、ユーザー向け更新APIの管理者バイパスを実装しない。詳細閲覧は`audit_log_entry`へ記録し、認証秘密、OAuthトークン、セッション秘密、パスワードハッシュ、決済手段を返さない。
- 運営担当者がCreator画面を確認する場合は、admin専用の読み取り専用ビューで一人の対象を明示して開く。Creator本人のセッション発行、管理権限の差し替え、Creator向け更新APIの管理者バイパスを実装しない。詳細閲覧は`audit_log_entry`へ記録し、個人ファン一覧、未同意属性、Stripe Connected Account ID、銀行口座、本人確認書類、秘密値を返さない。

## 5. Railway管理境界

- OpsはRailway上のアプリケーションがサーバー側でDBへ接続して処理する。ブラウザ、ローカルPC、パスキー認証器へ`DATABASE_URL`と
  DB接続資格情報を配布せず、PostgreSQLの公開接続を有効にしない。Railwayへの本人login sessionは管理PCのOS保護済みkeyringまたは
  browser profileだけで扱い、生のtokenを表示、export、source・Issue・logへ保存しない。ローカルの`ops:setup`はSSHの単一commandを
  起動するだけで、DB接続は`dev`実行container内の`DATABASE_URL`だけが行う。Ops APIはブラウザからのDB直接接続を受け付けず、
  Opsセッションを検証したサーバー処理だけがprivate network経由でDBを利用する。
- Railwayのプロジェクト管理権限はOpsより上位の信頼境界として扱う。共有アカウントを使わず、人間用membershipは本人の個人アカウント一つを
  原則とし、利用可能な最もフィッシング耐性の高い多要素認証を必須にする。passkey認証器と回復コードは管理PCだけに置かない。環境変数、
  デプロイ、ドメイン、メンバー権限、DB公開設定の変更は監査・通知し、PC・account・passkeyの紛失または侵害時はoff-device回復手段から
  session、token、credentialを失効する。ソースコードまたは管理PCだけの漏えいではパスキー秘密鍵、Railwayの管理資格情報、DB接続資格情報、
  登録用の一回限りの秘密値を同時に得られない設計にする。
- 端末名、IPアドレス、Host header、User-Agent、ブラウザ指紋をadmin本人の認証要素として扱わない。端末の利用制限を導入する場合は、別途、コピー不能な端末鍵とその失効・復旧手順を正本へ追加するまで有効化しない。
