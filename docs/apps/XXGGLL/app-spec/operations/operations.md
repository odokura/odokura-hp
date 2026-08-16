---
title: XXGGLL 運用
sidebar_label: 運用
sidebar_position: 2
draft: true
---

# XXGGLL 運用

本書は、[セキュリティ基本設計](../security/basic-design.md)を継続して満たすための管理運用正本である。担当、頻度、判断、
証跡、停止、復旧を定義し、Railway Dashboardや担当者の記憶だけに手順を置かない。

## 1. 運用原則

1. 本番操作は個人を識別できるアカウントで行い、共有アカウント、共有パスキー、共有回復コードを使わない。
2. project、environment、service、deploymentを確認してから操作し、暗黙のCLI linkやブラウザの前回選択だけを信頼しない。
3. 変更、閲覧、判断、失敗、復旧を記録するが、秘密値、個人情報本文、決済詳細を記録しない。
4. 異常時はデータを修正して見かけ上合わせず、機能gateを閉じ、取消行・状態遷移・監査で復旧する。
5. 外部事業者の機能停止や誤設定もXXGGLLのインシデントとして扱い、責任分界を理由に利用者対応を止めない。
6. 開発・運用・管理は本人一人、一台の専用管理PCで行う。人を増やす前提の帳票や承認は作らず、自動統制と安全側の停止を優先する。

## 2. 管理体制

運用責任者、開発者、Railway Project Owner、アプリケーションの`admin`は、いずれも本人一人とする。職務ごとの架空の担当者、
代替担当、当番表、担当間の引継ぎ、実施者と承認者を分ける手順は設けない。同じ本人が実施・判断しても、個人アカウントと証跡は省略しない。

| 管理機能 | 実施者 | 必須の証跡・安全策 |
| --- | --- | --- |
| リスク受容、公開・停止・復旧、通知判断 | 単独運用者本人 | Issueまたはincidentへ理由、影響、期限を記録し、未充足機能はgateで停止する |
| Railway、個人2FA、secret、backup、monitor | 単独運用者本人 | 個人passkey、固定target、通知、構成差分、restore drill |
| 仕様、実装、CI、migration、rollback | 単独運用者本人 | 正本URL、commit SHA、自動test、release記録 |
| 返金、送金、強制失効、調査hold | 単独運用者本人 | Ops再認証、原子的な状態遷移、監査log |
| 利用者受付、incident、外部連絡 | 単独運用者本人 | incident ID、時系列、通知判断。必要時だけ外部専門家へ相談する |

運用管理票は一つだけとし、本人、連絡経路、Railway role、Ops role、管理PC識別子、最終review日を記録する。回復コード、token、
パスキー公開鍵・秘密鍵、端末PIN、個人情報は記録しない。外部相談先へRailway・GitHub・Opsの恒常的な権限を付与しない。

### 2.1 省略できる手順と省略できない統制

| 判定 | 項目 | 一人運用での扱い |
| --- | --- | --- |
| 可 | 二人承認、職務分離、交代当番、引継ぎ、追加Railway member | 実在しない役割を作らず、本人の一回のGo / No-Go判断へ統合する |
| 可 | 正常時の日次手動巡回 | 常時監視と定期jobに任せ、alertまたは失敗がある時だけ本人が確認する |
| 可 | Issue、release、incidentへの同じ内容の重複転記 | 用途に応じ一つを正本記録とし、他はIDまたはURLで参照する |
| 可 | 手動の週次依存関係・秘密値検査 | GitHub Actionsのpush時・定期実行へ集約し、失敗だけ対応する |
| 不可 | 個人アカウント、2FA、PC外のpasskey・回復手段 | 単独アカウント侵害と単一PC故障に対する基礎統制とする |
| 不可 | 固定targetの`ops:setup`、再認証、原子的失効、監査 | 誤操作、権限濫用、credential喪失時の代替統制とする |
| 不可 | CI gate、機能gate、外部監視、通知 | 人による相互reviewと常時当番を自動統制で補う |
| 不可 | PITR、Railway外backup、off-device回復、四半期restore drill | Railway障害、PC喪失、誤操作からの復旧可能性を確認する |
| 不可 | release・incidentの判断記録と事後review | 同じ本人の思い込みと記憶依存を、後から検証可能にする |

## 3. Issueと仕様照合

- XXGGLLのIssueは、作成時、着手時、実装変更時、完了判断時に[アプリ仕様](../overview.md)を入口として影響する正本仕様を確認する。
- Issue本文には、確認した正本仕様のGitHub URL、守る制約、変更する仕様、脅威ID、受け入れ条件、失敗時、rollbackを記録する。
- 実装と正本仕様に差異がある場合は、実装を正とせず、先に正本仕様を更新してIssue本文の確認内容も更新する。
- 完了前に、実装結果を要件の受け入れ条件と[コントロール仕様](../core/controls.md)に照合する。決済、出金、認可、属性開示、
  証票状態、監査に影響するIssueは、該当コントロールの失敗時・証跡・テストも確認する。
- Issue完了時の自動reviewは、仕様確認欄と`docs/apps/XXGGLL/`への参照がないIssueを失敗として記録する。
- 実装リポジトリのREADMEや補助資料は正本ではない。仕様・運用・セキュリティ・保持・公開判定の重複文書を実装リポジトリに置かず、
  必要な手順・検証結果・CI証跡だけを残して本正本へリンクする。

## 4. Railway管理

### 4.1 対象の確認

- dev環境の標準リンク先はWeb service`xxggll`とする。`xxggll-vip-dm-billing`はCron操作時だけ明示する。
- Railway CLIのkeyring認証と、Codex等の連携ツールのOAuth認証は別contextである。一方の再認証で他方の認証状態を前提にしない。
- `railway whoami`と対象project、environment、serviceを指定した`railway status`が取得できれば、CLI認証は有効と判断する。
  `No service linked`や`not found in linked environment`は、認証失敗ではなく対象serviceまたはlinkの誤りとして切り分ける。
- log、domain、variableを扱う操作ではserviceとenvironmentを明示し、変数値やcredential fileを表示・コピー・保存しない。
- 本番の変更前後にproject、environment、service、deployment ID、commit SHAを変更記録へ残す。値そのものは残さない。

### 4.2 アカウント・権限

- 本番Railway workspaceはHobbyを継続する。workspaceの2FA enforcementは前提にせず、本人の個人アカウントで2FAを有効にし、管理PCと分離したスマートフォンまたはhardware authenticatorのpasskeyを少なくとも1つ登録する。TOTPだけの登録は本番公開条件を満たさない。
- 個人2FAはworkspace全体への強制と同等ではないため、本人だけのmembership、off-device回復手段、月次のmember・active session・token reviewを補償統制として必須にする。個人2FA、分離passkeyまたは回復手段を確認できない場合はRailway管理操作と本番公開を停止する。
- 人間用membershipは本人のProject Owner一つを原則とし、追加Owner、Editor、Viewer、緊急代替者を常設しない。
- 月次の統合reviewでproject member、workspace member、Railway account securityのactive session、GitHub連携、token利用目的を照合し、本人以外の不要なmembership・session・tokenがないことを確認する。不要なsessionはrevokeし、秘密値やtoken値は証跡へ残さない。
- 管理PC、個人アカウント、passkeyの紛失・侵害時は、off-device回復手段またはprovider supportからRailway session、GitHub access、
  API・project token、Ops credentialを失効または見直す。
- Railway回復コードは管理PC、source、Issue、chatから分離し、本人だけが利用できる暗号化済みoff-device保管または封緘した紙で保管する。
  利用後に再発行し、四半期に存在と利用可能性だけを確認する。値は転記しない。
- Enterpriseを採用した場合はproductionをrestricted environmentにする。採用しない間は、project memberを最小化し、通常調査を`dev`で行う。

### 4.3 単一管理PC

- 通常の開発・Railway・GitHub・Ops操作は、本人専用の一台の管理PCからだけ行う。共有OSアカウントや共用ブラウザprofileを使わない。
- 管理PCはfull-disk encryption、OS・browserの自動security update、firewall、malware対策、5分以内の自動画面lockを有効にする。
- Railway、GitHub、Opsのpasskey認証器と回復手段を管理PCだけに置かない。スマートフォンまたはhardware authenticatorと、off-device回復情報を使う。
- DB資格情報、sealed variable、回復コードを管理PCへ保存しない。repositoryはremoteから復元できる状態とし、未push変更を唯一の復旧元にしない。
- 管理PCを紛失・侵害した場合は、そのPCから操作を続けず、off-deviceからaccount sessionとtokenを失効する。安全な交換PCを上記基準で構築し、
  repository、固定wrapper、個人passkeyを復旧してから管理操作を再開する。交換PCは二台目の常設機を意味しない。

### 4.4 Environment、network、variable

| 区分 | Railway environment名 | 用途 | データ・外部mode |
| --- | --- | --- | --- |
| 本番 | `production` | 利用者向け本番 | 本番専用DB、Stripe live、production専用domain・OAuth callback・メール送信先 |
| 常設非本番 | `dev` | staging相当の結合・release前検証 | 非本番DB、Stripe test、dev専用domain・OAuth callback・制限済みメール送信先 |
| 一時preview | PRごとに作成 | UI・限定的な結合確認 | `dev`をbaseとするが、sealed secretとDB内容を複製せず専用の非本番値を使う |

仕様、Issue、Railway操作記録では`staging`を環境名として使わない。一般的なstaging概念を指す場合も、XXGGLLの実体名は`dev`と記載する。

- `production`と`dev`は別environmentとし、`dev`をstaging相当の唯一の常設非本番環境とする。DB、secret、domain、OAuth callback、Stripe mode、メール送信先を共有しない。
- PR environmentは`dev`をbaseとし、productionのデータ・secretを複製しない。sealed variableが複製されないことを前提に、専用の非本番値を設定する。
- PostgreSQLのpublic TCP proxyを無効にし、WebとCronは同じproject・environmentのprivate hostnameを参照する。
- `DATABASE_URL`、Stripe secret、Webhook secret、OAuth client secret、メールcredential、session関連secretはRailwayのsealed variableにする。
- secretを`railway variables`、`railway run`、shell history、CI log、Issue、chat、ローカル`.env`へ取得しない。
- secret更新は、用途、owner、対象environment、更新日、次回review日、失効確認だけを記録する。値は記録しない。
- Railway Dashboardにしかないdeploy設定を作らない。`railway.toml`を正本とし、月次にDashboardとの差分を確認する。

### 4.5 Deploy設定

| Service | Pre-deploy | Start | Health / restart | 失敗時 |
| --- | --- | --- | --- | --- |
| `xxggll` | `npm run preflight:production && npm run migrate` | `npm run start` | `/api/health`、100秒、`ON_FAILURE`最大10回 | deployを進めず、前deploymentを維持する |
| `xxggll-vip-dm-billing` | `npm run migrate` | `npm run stripe:finalize-vip-dm-monthly-billing` | Cron、`NEVER` | 自動再実行せず、台帳・Stripe状態を確認して冪等に再実行する |

- Webはoverlap 30秒、draining 30秒を基準とし、SIGTERMと長時間要求をrelease候補で確認する。
- migrationはexpand → application切替 → contractの順にし、overlap中の旧版と新版から同時に利用できるようにする。
- healthcheckは起動と必須設定の検証だけを行い、秘密値、version詳細、DB内容を返さない。継続監視には使わない。
- preflightまたはmigration失敗時は、値をその場で書き換えてdeployを通さず、失敗原因をIssueとrelease記録へ残す。

## 5. Opsパスキーの運用

### 5.1 共通境界

- 本番OpsはRailway上の専用HTTPS Originで運用し、Public / Fan / Creator管理の通常ログイン、一般navigation、DB公開接続から分離する。
  本番DB資格情報はRailwayのサーバー処理だけへ設定し、ブラウザ、ローカルPC、認証器、Issue、logへコピーしない。
- Railwayのproject管理はOpsより上位の信頼境界である。共有アカウントを禁止し、個人を識別できる最小権限アカウントだけに、
  利用可能な最もphishing耐性の高いMFAを必須にする。member権限、variable、deploy、domain、DB公開設定の変更を監査する。

### 5.2 `dev`のbootstrap・recover・revoke

- `ops_role='admin'`の付与、最初のpasskey登録、全credential喪失後の復旧、role解除は、Railwayの認証済み実行containerだけで実施する。
  利用者はローカルの対話terminalから`npm run ops:setup -- ACTION`を実行する。`ACTION`は`bootstrap`、`recover`、`revoke`のいずれかとする。
  ローカルcommandは`railway whoami`でCLI認証を確認し、Project `f0d6777b-fd62-4561-b504-44e2a3386895`、environment `b98d67a3-d33e-429a-9e0e-820f95591c5f`、Web service `12dfb4a9-961e-4af3-a072-cd4cc15b7cf6`を固定指定した`railway ssh`で稼働中の`dev` serviceへ単一commandを委譲する。
  利用者はaccount UUID、Railway principal、理由を入力しない。ローカルPCはDB接続、Railway variable取得、`railway run`、CI、redirect出力を行わず、DB処理はservice内の`npm run ops:admin`だけが実施する。
- `bootstrap`は`dev`のactive accountが1件だけで、既存の有効Ops credentialがない場合にだけadmin roleを付与して一回限りの登録記録を発行する。
  active accountが複数、対象が不在、または既に有効credentialがある場合は停止し、対象を推測しない。credentialがないadmin roleだけが残っている場合は、`bootstrap`を初回登録の再発行として扱う。
- `recover`はactiveなadminが1件だけの場合に旧credential、全Ops session、未完了登録、未消費challengeを同じDB transactionで全て失効してから新しい登録記録を発行する。
  `revoke`はactiveなadminが1件だけの場合にadmin roleを解除し、DB triggerが同じtransactionで同じ失効を強制する。
  各操作で対象account、`railway whoami`から取得した本人principal、固定理由、実行時刻、結果を監査する。実行者情報は本人が入力せず、
  ローカルCLIのRailway認証結果をSSH実行へ渡す。principal文字列だけを認証根拠にはせず、固定targetへ接続できたRailway sessionと組み合わせる。
- 標準出力の一回限りURLは対話terminal以外へ出力しない。永続log、Issue、chat、shell historyへ保存せず、確認済み本人の専用ブラウザへ一度だけ安全に引き渡す。
- 登録linkの秘密値はURL fragmentで渡し、専用画面が一度だけ送信する。サーバーは原子的に消費して開始ブラウザに束縛した短期Cookieを発行し、
  そのブラウザでだけWebAuthn登録を許可する。
- メール、パスワード、X OAuth、通常のアプリ画面からadmin credentialを登録・復旧してはならない。既存adminのcredential追加・削除も、
  5分以内の新しいpasskey再認証を必須にする。自動メール復旧、共有credential、秘密鍵のexportを行わない。
- credentialの登録、失効、認証成功・失敗、challenge再利用・期限切れ、admin role変更、返金・送金等の再認証は監査対象とする。
  credential ID、公開鍵、challenge、session値、端末の生体情報を監査logへ出さない。

### 5.3 Productionの公開境界

- 現行の`ops:setup`と固定targetは`dev`専用であり、productionのbootstrap・recover・revoke手順ではない。
- production Opsを公開する前に、`dev`と同じ`npm run ops:setup -- ACTION`の操作境界を維持したproduction専用wrapperを用意する。
  productionのproject、environment、serviceをcodeへ固定し、本人によるtarget・account UUID・理由の入力を許可せず、active admin一件だけを対象とする。
  action別の固定理由、旧credential・session・challengeの一括失効、監査、緊急停止、off-device回復、復旧訓練をrunbookと自動testへ定義する。
- 上記が未完成の間は、productionのOps登録・復旧、高リスクOps操作を機能gateで閉じる。`dev`のaccount、credential、登録linkをproductionへ移さない。

### 5.4 Release前確認

- release前に、PostgreSQL公開接続が無効であること、Ops OriginがHTTPSだけで`OPS_ORIGIN`と`OPS_RP_ID`が完全一致すること、
  許可外Hostがproxyで拒否されること、通常sessionではOps APIが`404`になることを確認する。
- 未登録・失効済み・利用者検証なし・Origin / RP ID / challenge不一致のpasskey拒否、初回登録・復旧・追加・削除、
  登録link・Cookie・challenge再利用、role解除・credential失効と並行するOps操作、rate limit・期限切れ削除も確認する。

## 6. Releaseとrollback

### 6.1 Release前

- [要件](../core/requirements.md)の該当機能gateを満たし、検証記録を残す。
- `npm run typecheck`と`npm test`をpush前に実行する。失敗している変更をpushしない。
- GitHub Actionsの直近runが実行中の場合は完了を待つ。失敗runがある場合は原因を修正してからpushする。
- CIでintegration test、production build、migration check、accessibility、依存関係・秘密値検査を実行する。
- 正常、失敗、Webhook、権限なし、入力変更、重複、並行、再試行、再起動を変更対象に応じて確認する。
- 実行環境、commit SHA、結果、残る制約、rollback、Go / 条件付きGo / No-Goをrelease記録へ残す。
- 実施者と承認者を分ける帳票は作らず、本人がCI結果とchecklistを確認して一回のGo / No-Goを記録する。

### 6.2 `dev`切替検証（Issue #189、SIGTERM実測はIssue #195）

本番で同じ切替を試験する前に、`dev`のWeb serviceだけでoverlap・draining・終了境界を確認する。対象はIssueで指定した`dev`環境とし、Cloudflare、DNS、本番Railway、Cron serviceは変更しない。検証には専用test accountと読み取りまたは冪等なテスト要求だけを使い、commit SHA、旧・新deployment ID、開始・終了時刻、request ID、ログをrelease記録へ残す。Next.js / Node.jsへ独自のsignal handlerは追加せず、実行時の観測結果だけを記録する。

1. **長時間要求中の再deploy**
   - `dev`で30秒を超えて継続する読み取りまたは冪等な要求を開始し、要求中にWeb deploymentを切り替える。
   - 要求が旧deploymentのdraining中にどう完了または中断したか、応答、request ID、データの重複・欠落がないことを確認する。再現できない場合も、要求時間と切替時刻を記録する。

2. **SIGTERM受信と終了**
   - 旧deploymentのログでSIGTERM受信時刻を確認し、受信後に新規要求の受付が止まり、draining時間内に正常終了したことを確認する。
   - 30秒経過後も終了しない場合はRailwayの強制終了を含む実際の挙動を記録する。SIGKILL、終了遅延、未完了のcleanup、接続・台帳の不整合があればNo-Goとする。

3. **overlap中の新旧deploymentへの要求確認**
   - 新deploymentのhealthcheck成功後に新規要求が新deploymentへ到達し、切替前から継続中の要求が旧deploymentのdraining対象として扱われることを、deployment ID、ログ、メトリクスまたはtraceで確認する。
   - 旧・新のどちらか一方だけに偏る場合を直ちに異常とはせず、Railwayが記録した切替時刻と要求の状態が整合することを確認する。5xx、認証状態の破損、DB接続エラー、同一更新の二重実行があれば停止する。

4. **draining時間超過時の挙動**
   - 30秒を超えて継続する要求を意図的に作り、draining時間超過後に要求が終了または接続切断される境界を確認する。応答が返らないまま無期限に残らないこと、強制終了後に更新が二重実行されないことを確認する。
   - 期待する境界を定義できない、プロセスが残り続ける、またはデータ整合性を確認できない場合は、結果を確定せずNo-Goとする。

5. **異常時のrollback判断**
   - healthcheck失敗、5xx増加、認証・DB接続エラー、SIGTERM後の終了失敗、要求の二重実行・欠落、旧・新deployment間の互換性不一致のいずれかがあれば、`dev`検証を中止して前回正常deploymentへrollbackする。
   - rollback前に対象deployment、影響要求、migration状態、台帳・監査logの整合性を保存し、rollback後に同じ確認を再実施する。migrationが旧版と互換しない場合はdown migrationを行わず、互換修正版を用意する。

6. **本番試験前の中止条件**
   - 上記のいずれかが未実施、再現不能、または証跡不足である。
   - `dev`でSIGTERM、draining、healthcheck、migration、要求の整合性のいずれかに未解決の異常がある。
   - CIのtypecheck、unit test、integration test、production build、migration checkが成功していない、または直近の失敗原因が未解消である。
   - rollback対象の正常deployment、監視、request IDを追跡できるログ、専用test accountのいずれかを準備できない。
   - Cloudflare、DNS、本番RailwayまたはCronを変更しないと試験できない。

上記の中止条件に該当しないことを本人がrelease記録で確認して初めて、本番の通常deploy判断へ進む。Issue #189の実装完了だけでは本番試験完了を意味しない。Dev切替のうちSIGTERM受信時刻と終了までの実測は、Issue #195が完了するまで未完了とする。

### 6.3 Deploy後

- deployが成功したことだけで完了にしない。commit SHA、migration status、health、Public / Ops外形監視、主要read model、
  Stripe webhook受信、audit書込みを確認する。
- deploy直後15分は5xx、認証拒否、DB接続、Webhook失敗、CPU・RAMを重点監視する。
- 個人情報や金銭に関わる手動smoke testは、専用test accountとStripe test modeを使う。本番利用者データを試験入力に使わない。

### 6.4 Rollback

- application不具合は前回正常deploymentへ戻す。migration後の旧版が動かない場合は、DBを安易にdown migrationせず、互換修正版をdeployする。
- 異常機能をサーバー側機能gateから外して再deployし、画面とAPIを同時に利用不可へ戻す。
- 既存の決済、台帳、証票来歴、監査logを削除・上書きしない。誤記帳は対応する取消行で戻す。
- rollback後に原因、影響期間、対象transaction、整合性確認、再公開条件をincidentまたはrelease記録へ残す。

## 7. 監視と通知

### 7.1 監視元

| 監視元 | 見るもの | 通知先 |
| --- | --- | --- |
| Railway resource monitor | CPU、RAM、disk、network egress | 単独運用者 |
| Railway deploy / webhook | deploy失敗、crash、volume警告 | 単独運用者 |
| 外形監視 | Public Originの`GET /api/health`、Ops Originの`GET /ops/health`、応答時間、TLS | 単独運用者 |
| アプリevent | 5xx、認証拒否、rate limit、audit書込み失敗 | 単独運用者 |
| 決済監視 | Webhook署名失敗、重複、未処理、台帳差異、精算失敗 | 単独運用者 |
| backup監視 | PITR archive、schedule成功、容量、restore drill | 単独運用者 |

Ops外形監視は、完全一致するOps Hostへqueryなしの`GET /ops/health`を送り、`200`とJSONの`status`フィールド`ok`だけを正常とする。`503`、timeout、TLS不一致、redirect、本文schema不一致は失敗とする。認証Cookie、通常session、Ops session、登録linkをmonitorへ保存しない。Ops Originの`/api/health`が`404`であることは正常なHost境界としてrelease時に確認する。

### 7.2 初期閾値

| 条件 | 重大度 | 対応 |
| --- | --- | --- |
| PublicまたはOps外形監視が1分間隔で2回連続失敗 | SEV-2 | deploy、domain、TLS、service、DBを確認する |
| 5分間の5xx率が5%超、または同一endpointで10回連続 | SEV-2 | 対象機能gate、直近deploy、外部依存を確認する |
| audit書込み失敗、台帳制約違反、DB公開検知 | SEV-1 | 金銭・Ops操作を停止し、証拠保全と整合性確認を開始する |
| Ops認証の再利用、Origin / RP ID不一致、role失効との競合 | SEV-1 | Ops session・credentialを失効し、Railway accessをreviewする |
| Webhook署名失敗が5分で3件以上、未処理eventが15分超 | SEV-2 | endpoint、secret更新、Stripe deliveryを確認する |
| CPU 90%超またはRAM 85%超が15分継続、disk 80%超 | SEV-2 | traffic、process、容量、log量を確認する |
| PITR archive停止、日次backup未作成、restore drill失敗 | SEV-1 | 有料機能を停止し、復旧点を再確立する |

閾値は初期値であり、月次reviewで誤検知、見逃し、通常負荷を確認して変更する。閾値を緩める変更にも理由、期限、ownerを記録する。

## 8. インシデント対応

### 8.1 受付

- 監視通知、利用者申告、provider通知、脆弱性報告、担当者の発見を同じincident受付へ集約する。
- 監視と通知は常時動作させるが、本人による24時間の有人応答は約束しない。初動時間は本人が通知を認知した時点から計測する。
- 個人情報漏えい、脅迫、つきまとい等に24時間即応する必要があるVIP・個別メッセージ機能は、外部の24時間受付と、申告時に安全側へ
  自動停止できる仕組みが完成するまで公開しない。外部受付者へRailwayまたはOpsの恒常的な資格情報を渡さない。
- incident ID、発見時刻、発見元、重大度、影響候補、担当、次回更新時刻を記録する。本文・秘密値は転記しない。

### 8.2 初動

1. 進行中の影響を止める。対象機能gate、account、Ops session、credential、token、deploy、domainを必要最小範囲で停止する。
2. log、audit、deployment ID、commit SHA、provider event ID、DBの該当状態を保全する。生の秘密値やメッセージ本文をincident記録へ複製しない。
3. 正常系を含む影響範囲、開始時刻、対象account・transaction件数、外部事業者を特定する。
4. 本人が利用者影響、金銭影響、通知要否、復旧条件を記録する。判断に法務・会計の知見が必要な場合は外部専門家へ相談する。
5. 修正、秘密値失効、復元、取消記帳を行い、受け入れ条件と整合性を確認して段階的に再開する。

### 8.3 種別別の封じ込め

| 種別 | 最初の封じ込め |
| --- | --- |
| secret漏えい | 対象credentialを失効・再発行し、利用log、scope、二次secretを確認する。Git履歴編集は失効後に判断する |
| Railway侵害 | 本人以外のmembership、不審なsession・tokenを停止し、2FA、domain、variable、deploy、DB公開設定、audit logを確認する |
| Ops侵害 | admin roleまたはcredentialを失効し、全Ops session、未完了登録、challengeを同一transactionで失効する |
| 利用者account侵害 | 通常sessionと同accountのOps sessionを失効し、認証方法・連絡先・直近操作を確認する |
| 個人情報漏えい | 該当read model・export・cacheを止め、閲覧auditから対象と受領者を特定する |
| 決済・台帳差異 | 該当決済・返金・送金gateを閉じ、Stripe状態と追記台帳を照合し、直接UPDATEせず取消行で戻す |
| コンテンツ安全 | `investigation_hold`、非表示、連絡停止を行い、必要な証拠だけをアクセス制限して保全する |

### 8.4 復旧と事後review

- 復旧は、原因修正、secret失効、整合性確認、monitor回復、再発試験、rollback方法をchecklistで確認し、本人が再開判断を記録してから行う。
- SEV-1は72時間以内、SEV-2は5営業日以内を目標に事後reviewを開始する。
- 原因、検知できた理由・できなかった理由、影響、時系列、対応、残存risk、owner、期限を記録する。
- 正本、test、monitor、runbook、権限、provider設定のいずれかを更新し、口頭注意だけで完了にしない。

## 9. Backupと復旧

### 9.1 構成

- PostgreSQLでPITRを有効にし、日次、週次、月次backup scheduleを併用する。
- 月次の暗号化済み論理backupをRailway workspaceおよび管理PCと別のアクセス境界へ保存する。保存先、本人だけが利用できるoff-device鍵回復手段、
  保持期間が決まるまでは有料決済を公開しない。
- backupには本番secretを同梱しない。restoreに必要な構成は変数名、version、手順だけを記録し、値はsealed variableから再設定する。
- backup jobが容量、作成時刻、対象service、復旧可能期間を自動確認し、失敗を通知する。本人は失敗時と月次統合reviewで結果を確認する。

### 9.2 Restore drill

四半期ごと、または重大なPostgreSQL・migration・backup構成変更後に次を行う。

1. productionと同等のアクセス制御を持つ一時recovery serviceへ、指定時点のPITRまたは外部論理backupを復元する。通常の`dev`へ本番データを置かない。
2. public domain、通常アプリからのreference、Stripe・メール・OAuth secretを付けず、検証専用のDB接続だけを設定する。
3. migration status、主要table件数、外部キー、追記専用権限、台帳残高、証票状態、Webhook event一意性を確認する。
4. 検証serviceはread-onlyで実行し、外部API、Webhook、Cron、メールへの送信経路を持たせない。
5. 所要時間、到達RPO、到達RTO、失敗、追加手順を記録し、必要な最小証跡を残して一時serviceを運用手順に従って廃止する。

本番復旧時も元serviceへ直接上書きしない。別serviceへ復元し、上記の整合性確認後に接続先を切り替え、旧serviceを証拠保全期間中は保持する。

Railwayのnative volume backupは、復元時に元serviceのmountを新しいvolumeへ差し替え、旧volumeをunmount状態で保持する。
この操作を本番serviceでの定期drillには使わない。PITRが利用できない実incidentで使う場合は、復元前に利用可能な復旧点を記録し、
staged change、旧volume保持、新volumeの整合性、application再開条件を本人がchecklistで確認する。

### 9.3 目標

| 対象 | RPO | RTO |
| --- | --- | --- |
| PostgreSQL | 通常5分以内を目標。PITR不能時は24時間以内 | 4時間以内 |
| Web / Cron | 永続データなし。review済みcommitとconfig as codeを正本とする | Web 1時間以内、Cronは次回実行前 |
| Railway設定 | 最終承認済み`railway.toml`と変更記録 | 2時間以内 |

RTOは本人が通知を認知し、復旧操作を開始してからの技術作業時間とする。障害発生からの経過時間には通知認知までの時間が加わる。
発生時点からのRTOは契約または表示で保証しない。保証が必要になった場合は、単独運用という前提と自動復旧範囲を再設計する。

目標未達または最新restore drill失敗中は、有料決済、送金、証票状態更新を機能gateで停止する。

## 10. 継続的セキュリティ運用

- dev / mainへのpushと週次の定期実行で依存関係監査を行う。追跡済みtextの秘密値検査は、値そのものをlogへ出さない。
- GitHub Actionsの既定権限は`contents: read`に限定する。高・重大の依存関係例外は、対象package、影響範囲、理由、期限、担当者、
  更新確認日を記録し、期限切れ時は更新、代替または機能停止を判断する。
- 秘密値の混入を検知した場合は、値を失効・再発行してから履歴の扱いを判断する。実際の形式に一致する秘密値をtestや例示に使わない。
- Stripe Webhookは署名検証、メール確認・パスワード再設定は一回限りの短期ハッシュ済みtokenを用いるため、CSRFの例外にできる。
  それ以外のブラウザ起点の更新APIはOrigin / Referer検証を必須とする。

## 11. 定期点検

| 頻度 | 点検内容 | 証跡 |
| --- | --- | --- |
| 常時・自動 | 外形、resource、deploy、5xx、認証、audit、決済、backup、依存関係・秘密値検査 | alert、CI run、incident ID |
| event時 | alert、失敗deploy、設定・credential変更、PC紛失・交換、重大な仕様変更 | incident、release、access change record |
| 月次・一回 | 未処理alert、Railway / GitHub member、token目的、config差分、監視閾値、backup report、admin・Ops credential、期限付き例外 | 月次統合review |
| 四半期 | restore drill、off-device回復確認、管理PC再構築手順、脅威model、外部事業者・保持方針 | drill report、risk review |
| 第4四半期に統合 | 仕様全体、provider契約・plan、データ一覧、保持・削除、incident傾向、事業継続 | 第4四半期risk review |

## 12. 証跡と保持

| 証跡 | 必須項目 | 保持 |
| --- | --- | --- |
| Release記録 | commit、environment、service、検証、migration、rollback、判断者 | 監査に必要な期間 |
| 月次統合review | member、role、token目的、config差分、alert、backup、例外、review日 | 変更履歴を保持 |
| Secret台帳 | 用途、owner、environment、更新・review日、失効結果 | 値を含めず、利用終了後も変更履歴を保持 |
| Incident記録 | 時系列、影響、封じ込め、通知判断、復旧、再発防止 | 法務・保持方針に従う |
| Backup / drill | 復旧点、所要時間、整合性、RPO / RTO、失敗・改善 | 最新4回以上と第4四半期reviewに必要な期間 |
| 脆弱性例外 | package、影響、理由、owner、期限、次回確認、代替統制 | 解消後も変更reviewに必要な期間 |

具体的な年数が法務・会計と合意されるまでは、証跡の自動削除を実装しない。ただし、秘密値や不要な個人情報を長期保持する理由にはしない。

## 13. 公開判定

- [セキュリティ基本設計](../security/basic-design.md)のrelease gateと、[要件](../core/requirements.md)の該当機能gateを両方満たす。
- 本番Hobby plan、個人2FA、管理PCと分離したpasskey、本人一人のmembership、active session・token review、off-device回復、private DB、sealed secret、外形監視、通知、PITR、backupを確認する。workspaceの2FA enforcementは確認対象にせず、個人2FAによる補償統制の証跡を残す。
- 未決定の外部backup保存先・保持期間・24時間外部受付と自動停止に依存する機能は、正本で指定した機能gateを閉じたままにする。
- Go判断は、release記録、最新の月次統合review、最新restore drill、未解決SEV-1 / SEV-2、期限切れ脆弱性例外を確認して本人が行う。
- 異常時は該当機能をサーバー側の機能gateから外し、画面とAPIを利用不可へ戻す。既存の決済・台帳・監査logを削除・上書きしない。

## 14. 運用仕様の受け入れ条件

- 平常時、release時、incident時、復旧時、管理PC・credential変更時の単独運用者と証跡が特定できる。
- Railwayのproject、environment、serviceを取り違えない確認方法が定義されている。
- secretを表示・複製せずに設定、更新、失効、reviewできる。
- Web、Cron、Ops、PostgreSQLのdeploy・monitor・rollback・restore手順が定義されている。
- Public Originの`GET /api/health`とOps Originの`GET /ops/health`を別々に監視し、Ops Originの`/api/health`は`404`、Ops healthは機密情報・認証Cookie・DB依存なしで判定できる。
- alertの重大度、初動目標、封じ込め、証拠保全、復旧条件、事後reviewが定義されている。
- RPO、RTO、backup schedule、外部backup、四半期restore drillを証跡で確認できる。
- 常時自動監視、event時確認、月次統合review、四半期drillが期限・owner付きで運用できる。
- 未決定事項に依存する機能を、サーバー側機能gateで公開不可にできる。
