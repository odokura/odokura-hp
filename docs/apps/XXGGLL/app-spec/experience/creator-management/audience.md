---
title: Creator管理 ファン全体の傾向
sidebar_label: ファン全体の傾向
sidebar_position: 4
draft: true
---

# Creator管理 ファン全体の傾向

## 1. 画面の目的

この画面は、現在の保有者全体の傾向を、個人を探したり順位付けしたりせず活動判断へ使うための集計画面である。汎用BI、個人ファン一覧、メッセージ受信箱、営業リストにはしない。

| 項目 | 仕様 |
| --- | --- |
| 画面ID | `SC-S06` |
| ルート | `/studio/[creatorId]/audience` |
| read model | `RM-CreatorAudienceV1` |
| 利用者 | owner、`audience_read`を持つstaff |
| 操作 | 全体または発行プログラム一件の範囲選択、再読込。データ出力はなし |

製品上は「個人との対応を排した集計表示」と説明する。「匿名加工情報」など特定の法的分類に自動的に該当すると表示しない。

## 2. 集計母集団

### 2.1 一人の定義

`eligibleHolder`は、基準時刻に次を全て満たす重複排除済みaccountである。

- 対象Creatorの有料XXGGLLを一件以上、現在保有している。
- `certificate.current_holder_account_id`が当該accountを指す。
- XXGGLLが回収済み、終了済み、archive済みではない。
- accountが閉鎖済みではない。

プログラムの公開終了や継続停止だけでは、現在の保有関係が残る限り母集団から除外しない。同じaccountが複数のXXGGLLを保有しても、人数の母数は一人と数える。

### 2.2 範囲

| 範囲 | 条件 |
| --- | --- |
| Creator全体 | 対象Creatorの全発行プログラムにまたがる`eligibleHolder` |
| 発行プログラム一件 | 対象Creatorに属する一件だけ。母数が抑制基準以上の場合だけ選択可能 |

期間、属性、ランク、地域を任意に掛け合わせるfilterは設けない。細分化の組合せから個人を推測できるため、V1の範囲選択は全体か一プログラムだけに限定する。

## 3. 画面構造

ページ名は「ファン全体の傾向」、説明は「現在の保有者全体について、個人を特定しない範囲で傾向を確認できます。」とする。「ファンの輪郭」「Audience」「Relationship」などの別名を同じ画面内で併記しない。

重要な結論から詳細へ、次の順序で表示する。

1. 対象バー、基準時刻、選択中の範囲。
2. 母集団: 5単位に丸めた現在の保有者数と現在保有されているXXGGLL件数。
3. 30日変化: 新しく現在保有者になった人数と、前30日との差。データが完全な場合だけ表示。
4. 地域分布。
5. 保有ランク分布。
6. 確認済み支払額帯。
7. 現在の保有期間。
8. 任意プロフィールの傾向。
9. 登録済みグッズ傾向。
10. 集計定義、coverage、基準時刻。

個人の応援文、表示名、プロフィールカード、通報・非表示操作をこの画面へ置かない。個人メッセージ機能は契約・安全・permissionを定義した専用画面が有効になるまで表示しない。

### 3.1 デスクトップワイヤー

```text
Creator名                         owner / staff権限     2026-08-16 10:00時点
────────────────────────────────────────────────────────────────────
ファン全体の傾向                              [範囲: Creator全体 ▾]
現在の保有者全体について、個人を特定しない範囲で傾向を確認できます。

現在の保有者  約125人   現在保有XXGGLL  約150件   直近30日  約+10人
集計条件: 現在保有中 / 重複するaccountは一人 / 5人未満の区分は非表示

地域
日本             ███████████████  60%
東アジア         ██████           25%
その他           ███              15%
[同じ内容の2列表]
回答率 100%

最高保有ランク
[横棒 + 同じ内容の2列表 + coverage]

確認済み支払額帯
[横棒 + 同じ内容の2列表 + coverage + 含む金額の説明]

保有期間
[横棒 + 同じ内容の2列表 + coverage]

任意プロフィール
[fieldごとの区画。回答者数とcoverageを毎回表示]

登録済みグッズ
[横棒 + 同じ内容の2列表 + coverage]

集計定義 creator-audience-v1 / 基準時刻 / 表示できない値の説明
```

数値は説明用の例であり、fixtureやproduction初期値として使わない。区画は一列にし、交互に2列へ並べて開始位置をずらさない。

## 4. 各集計の定義

| 区画 | 集計単位 | 分子・区分 | 分母 |
| --- | --- | --- | --- |
| 地域 | unique holder | 本人が保存した出身国・地域の固定区分 | 出身国・地域を持つ`eligibleHolder` |
| 保有ランク | unique holder | 現在保有する中で最も高いXXGGLLランクへ一人一回だけ割当 | 全`eligibleHolder` |
| 確認済み支払額帯 | unique holder | 現在の保有期間中に本人が対象Creatorへ行った確定済みの取得・継続・証票支援を合算し、返金・取消を差し引いた固定額帯 | 算定可能な`eligibleHolder` |
| 保有期間 | unique holder | 現在保有するXXGGLLのうち、最も早い現在保有開始日から基準時刻までの固定期間帯 | 開始日を持つ`eligibleHolder` |
| 任意プロフィール | fieldごとのunique respondent | `creator_disclosure_fields[field]`が有効で、当該fieldに保存値がある現在保有者を固定カテゴリへ割当 | そのfieldの回答者。全保有者を回答者として扱わない |
| グッズ傾向 | unique holder | 正規発行コードで登録済みの商品の大分類ごとに、現在保有者を一人一回だけ計上 | 全`eligibleHolder` |

### 4.1 確認済み支払額帯

集計の一件は、`payment_attempt.id`または取得eventに対応する一つの支払事実である。当事者別の`ledger_entry`を合算して同じ決済を重複計上してはならない。返金・取消は元の支払事実へ結び付く確定eventを一回だけ減算する。元支払への帰属を確定できない返金が一件でもあるholderは算定対象外とし、coverageへ反映する。

JPYのV1固定帯は`1〜4,999円`、`5,000〜19,999円`、`20,000〜99,999円`、`100,000円以上`の4区分とする。確定支払の純額が0円になったholderは`0円`として別セルを作らず算定対象外とし、coverageへ反映する。JPY以外は通貨別の固定帯を別仕様で定義するまで表示しない。

次を含める。

- 当該accountが現在保有者になった一次取得または二次取得の確定額。
- 現在の保有期間中に当該accountが支払った継続支援と証票支援の確定額。
- 対応する確定済み返金・取消の減額。

次を含めない。

- 前保有者の支払、証票に引き継がれた累計支援額。
- グッズ、別契約、他Creator、他accountの支払。
- 手数料、Creator報酬、未確定・反映待ち・異議申立て確認中の金額。

したがって`certificate.boost_total_amount`だけから現保有者の額を算定してはならない。帯境界は通貨ごとに設定し、異なる通貨を換算推定して合算しない。

### 4.2 保有期間

保有期間のV1固定帯は、現在の連続した保有関係の開始日から`0〜89日`、`90〜364日`、`365〜1,094日`、`1,095日以上`の4区分とする。いったん対象Creatorの現保有が0件になった後の再取得は、新しい連続期間として開始する。

### 4.3 30日変化

「新しく現在保有者になった人数」は、直近30日に現在の保有開始eventを持ち、基準時刻にも`eligibleHolder`であるunique account数とする。前30日は同じ定義で比較する。譲渡で離脱した人、再取得、同一人の複数取得を二重に数えない。event履歴が欠ける場合は区画全体を`not_available`とし、証票発行日で代用しない。

### 4.4 グッズ大分類

正規販売元がコード発行時に、次の一つを`product_category`として確定する。`product_label`の文字列、価格、購入元からカテゴリを推測しない。

| ID | 表示名 |
| --- | --- |
| `music_video` | 音楽・映像 |
| `book_print` | 書籍・印刷物 |
| `apparel` | 衣類 |
| `accessory` | 小物・アクセサリー |
| `art_collectible` | アート・コレクタブル |
| `event_goods` | イベントグッズ |
| `digital_goods` | デジタル商品 |
| `other` | その他 |

同じholderが同じ大分類を複数購入しても一人と数える。現在の連続した保有関係より前の登録、前保有者の登録、カテゴリ未確定の旧データは集計せずcoverageへ反映する。旧行のカテゴリを正規販売元の保存済み商品マスタから決定できない場合は、当該行を`unknown`として除外し、手作業で推測補完しない。

## 5. プライバシー保護

### 5.1 抑制

- 母集団または各表示セルが5人未満の場合、値と割合を表示しない。
- 1〜4人のどれか、0人か、未回答かを外部表示から区別させず、「表示に必要な人数に達していません」とする。
- 一つの小セルを隠しても合計と他セルから逆算できる場合、次に小さいセルも隠す。安全に補完抑制できない場合は区画全体を非表示にする。
- 「その他」へまとめても一人の属性が推測できる場合はまとめず、区画全体を非表示にする。
- program範囲へ切り替えた結果も同じ抑制を再計算する。全体応答をクライアントでfilterしない。

### 5.2 表示精度

分布とcoverageは5ポイント単位、母集団・XXGGLL件数・30日変化は5件単位に丸め、「約」を付けて表示する。端数0〜2は下、3〜4は上の5倍数へ丸め、負の変化は絶対値を同じ規則で丸めて符号を戻す。accessibleなデータ表にも同じ丸め済み値を載せ、生件数や抑制前の値をDOM、JSON、tooltip、analyticsへ入れない。補完抑制後のセルから個人を逆算できないことをserverで確認する。

### 5.3 時系列差分の抑制

- 同じCreator・scopeの公開snapshotはUTC月曜日00:00を境界とする週一回までとし、画面再読込のたびに再計算した値を返さない。
- 新snapshotと直前の公開snapshotのセル差が1〜4人で、その差から小集団を推測できる区画は、新snapshotの区画全体を`temporal_suppression`にする。古い値を現在値として黙って残さない。
- 30日変化、program scope、任意プロフィールfieldも同じ比較を行う。scopeやfieldを新設した最初の週も通常の5人未満・補完抑制を適用する。
- 認可と現在の保有資格は要求ごとに再確認する。snapshot固定は失効permissionや削除済み対象を表示し続ける理由にしない。

### 5.4 任意プロフィール

- 任意プロフィールは、各fieldの共有が有効な現在保有者について、そのfieldの入力済み値だけを集計する。別のfieldが共有されていても、対象fieldの共有が無効なら分子へ入れない。
- 集計は利用者の共有設定をCreator別に変更する仕組みを持たず、対象fieldの設定と現在保有関係だけで母集団を決める。
- fieldごとに全`eligibleHolder`に対する丸め済みcoverageを表示する。正確な回答者数は返さない。
- 未回答者を特定のカテゴリに入れない。自由記述をそのまま集計・表示しない。
- センシティブ情報、連絡先、正確な住所、決済情報、法的氏名は入力・集計対象にしない。

## 6. 可視化契約

| 項目 | 仕様 |
| --- | --- |
| グラフ | 原則は横棒。円・ドーナツ・3D・面積比較・アニメーションを使わない |
| カテゴリ | 一画面の一グラフで4区分を目安にし、多い場合は意味を保った固定区分または表へ切り替える |
| 軸 | 0から開始し、割合は0〜100%。目盛、単位、丸めを明記する |
| ラベル | 棒へカテゴリ名と丸め済み割合を直接表示し、凡例や色だけに依存しない |
| 代替 | 各グラフに短い要約と同内容の単純な2列表を付ける |
| 色 | 一色の濃淡を基本とし、状態色をカテゴリ色へ流用しない |
| insight | 最大1文。首位が次位を10ポイント以上上回りcoverageが基準以上の場合だけ事実を述べ、それ以外は「明確な偏りは確認できません」 |

各区画の見出し、短い要約、グラフ、データ表、coverage、注記は同じ左端に揃える。グラフだけを全幅、表だけを狭幅にせず、区画間は40px、区画内は16pxの間隔を使う。

AIによる人物像、購買力、嗜好、将来行動、推薦、スコアリングを生成しない。集計から個人への施策を提案しない。

## 7. API契約

`GET /api/creator/audience?creatorId=[id]&programId=[id]`は、認証・membership・`audience_read`を確認してから集計する。認可なしと不存在は同じ`404`、全応答は`Cache-Control: private, no-store`とする。

`RM-CreatorAudienceV1`は次の構造を持つ。

| フィールド | 内容 |
| --- | --- |
| `definitionVersion` | 集計定義の版。V1では`creator-audience-v1` |
| `asOf` | 公開snapshotのserver基準時刻 |
| `publicationWindow` | UTC週境界と、通常公開または差分抑制の状態 |
| `scope` | Creator全体または一プログラム。認可済み表示名を含む |
| `population` | 抑制・5件丸め後の保有者数、XXGGLL件数、source状態 |
| `sections` | 区画ID、状態、coverage、丸め済みカテゴリ、短い説明 |
| `suppression` | `shown`、`insufficient_population`、`complementary_suppression`、`temporal_suppression`、`source_unavailable`の外部安全な状態 |

応答にaccount ID、certificate ID、プロフィール原値、メッセージ、個人額、個人eventのexact timestamp、生件数、抑制前セルを含めない。集計queryと抑制を同じserver境界で完了し、クライアントへ渡してから隠さない。

## 8. 状態と障害

| 状態 | 表示・動作 |
| --- | --- |
| 母集団0または5人未満 | 安全な同一文言。空グラフや0%を表示しない |
| 一区画だけ不足 | 他区画を残し、不足区画だけ安全文言にする |
| 一source失敗 | 該当区画だけ取得失敗。0、未回答、偏りなしへ変換しない |
| 全体失敗 | 前回値を現在値として残さず、再読込を一つだけ示す |
| 時系列差分抑制 | 「変化から少人数を推測できないよう、今週は表示していません」。過去値を現在値として表示しない |
| 範囲変更中 | 旧範囲の値を消し、対象と読込中を表示する |
| permission失効 | 応答と画面を`404`にし、直前の集計を残さない |

観測ログは要求ID、Creator内部ID、definition version、区画状態、処理時間だけを記録する。プロフィール値、セル値、メッセージを記録しない。同一区画の5xxまたはsource failureが連続した場合だけ運用アラートにし、日次の手動確認を必須にしない。

週次snapshot生成は既存のRailway Cronから自動実行し、同じscope・version・週に対して冪等にする。Cronだけに`internal_cell_counts`を扱えるDB roleを設定し、Web serviceとOps serviceのDB roleは抑制済みviewだけをSELECTできるようにする。資格情報はRailway service変数で分離し、ブラウザやlogへ出さない。失敗時は公開APIへ新しい値を出さず`source_unavailable`を返し、単独運用者にはjob失敗の一件だけを通知する。手作業の集計、セル編集、抑制判断を通常運用にしない。

## 9. 受け入れ条件

- 同一人の複数保有、複数ランク、譲渡、再取得、終了プログラムの現保有をfixture化し、各区画の一人一計上を確認する。
- 前保有者の証票支援累計が現在保有者の支払額帯へ入らない。
- 0人、1人、4人、5人、6人、補完抑制が必要な分布、全セル表示可能な分布を確認する。
- 週境界の前後でセル差0人、1人、4人、5人となるsnapshotを確認し、1〜4人の差分が応答・cacheから推測できない。
- fieldごとの共有無効、未回答、fieldごとに回答数が異なる場合にcoverageと分母が一致する。あるfieldを無効にしても、他のfieldの集計値を変更しない。
- owner、`audience_read` staff、permissionなしstaff、他Creator、失効membershipで応答とナビを確認する。
- HTML、RSC payload、API、tooltip、analytics、logに生件数、個人ID、原プロフィール、支援表現がない。
- 1440pxと390pxで、各グラフとデータ表の読み順、focus、200% zoom、forced colorsを確認する。

## 10. 設計根拠

- [Government Analysis Function: Building and managing dashboards](https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-building-and-managing-dashboards/)
- [Government Analysis Function: Testing dashboards for design and accessibility](https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-testing-dashboards-for-design-and-accessibility/)
- [Government Analysis Function: Accessible charts checklist](https://analysisfunction.civilservice.gov.uk/policy-store/charts-a-checklist/)
- [デジタル庁デザインシステム: テーブルのアクセシビリティ](https://design.digital.go.jp/dads/components/table/accessibility/)
- [W3C: Complex images](https://www.w3.org/WAI/tutorials/images/complex/)
- [個人情報保護委員会: 仮名加工情報・匿名加工情報編](https://www.ppc.go.jp/personalinfo/legal/guidelines_anonymous/)
