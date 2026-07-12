---
title: Takaneko アーキテクチャ
sidebar_label: アーキテクチャ
draft: true
sidebar_position: 4
---

# アーキテクチャ

Takaneko は、作者本人が自宅 PC で使う private な TypeScript 製アプリケーションである。日本株の一次情報を
収集・分析し、[コンテンツ仕様](./content/common.md)で定義した企業ファクトをローカル SQLite と localhost の
lab に保存・表示する。外部への投稿・配信・通知は行わない。

## 確定事項

| 項目 | 方針 |
| --- | --- |
| 対象 | 日本の取引所に上場する株式。外国株、為替、暗号資産、投資信託、利用者の口座・取引は扱わない。 |
| 情報 | 上場企業の公式サイトと公的サイトの一次情報を扱う。市場データとリアルタイム株価は扱わない。取込時にライセンス判定はしない。 |
| 実行環境 | 自宅の単一 PC。高可用性や別環境への自動切替は持たない。 |
| 正本 | SQLite の単一 DB ファイル。未加工データ、文書、根拠箇所、ContentSpec、企業ファクト、投稿監査記録を追記保存する（→ [データモデル](./data-model.md)）。 |
| 退避 | bot にバックアップ機能は持たせず、運用者が整合した DB ファイルを定期的に手動でクラウドへ退避する。 |
| 利用範囲 | 作者本人だけが localhost で利用する。X 投稿、第三者再配信、外部通知、公開 Web サイトは持たない。 |
| 表示単位 | 一企業ファクトをローカル表示・CLI 出力の単位とする。種別ごとの抽出項目・テンプレート・抑止条件は[コンテンツ仕様](./content/common.md)に従う。 |
| 分析サイト | 収集結果・分析のサマリー表示とセクター分析は、bot と分離した localhost 限定のローカル分析サイト（lab）が担う（→ [ローカル分析サイト](./local-site.md)）。 |
| 実装言語 | bot は TypeScript。Python の利用は正規化 CLI の差し替えと lab に限定する（→ 言語方針）。 |

## システム分割

収集・分析を行う bot と、作者本人向けのローカル分析サイト（lab）の二つの実行体に分ける。
表示・分析の障害や負荷が、収集・保存の信頼性へ波及しないようにするためである。

~~~text
bot（TypeScript・常駐・private 利用）
  └─ SQLite（bot 正本）への唯一の書き手

ローカル分析サイト lab（Python 第一候補・任意起動・非公開）
  ├─ bot の SQLite を読み取り専用で参照（WAL 前提）
  └─ 官庁・工業会の統計データは独自の stats DB に保存（lab の正本）
~~~

lab は bot の DB に書き込まず、bot は lab に依存しない。分離の契約と lab の機能は
[ローカル分析サイト](./local-site.md)に定める。以降の本ページは bot の構成を定める。

## 構成

~~~text
情報源・実行スケジューラ
          │
          v
  収集・保存 ──> 正規化 ──> ContentSpec による企業ファクト抽出
      │                                             │
      └────────────── SQLite（正本・監査）──────────┤
                                                    v
                                    ローカル表示用の候補・安全制御
                                                    │
                                                    v
                                      localhost の lab / CLI
~~~

定期取得とイベント起点の取得、再取得・訂正は、収集後の正規化・企業ファクト抽出・ローカル表示に同じ経路を使う。
情報源固有の形式は sources のアダプタ内に閉じ込める。

## モジュールの責務

| モジュール | 責務 |
| --- | --- |
| sources | 採用済み情報源からの取得と取得失敗の扱い |
| company-master | 銘柄・企業名・対象銘柄集合の提供 |
| ingestion / normalization | 原本保存、論理文書種別と共通形式への変換、根拠箇所と来歴の付与 |
| content-spec | ContentSpec の版管理、情報源の物理項目との対応、固定テンプレートの提供 |
| storage | SQLite への正本保存、検索、派生データの再生成 |
| analysis | ContentSpec ごとに表・文章を抽出・検証し、企業ファクトと比較可能な財務値を作る |
| local-review | 一企業ファクト一表示候補の生成、重複抑止、作者本人が確認するための状態記録 |
| operations | キルスイッチ、監視、停止・再開の監査 |

モジュール間は型付きの契約だけで接続し、分析やローカル表示が情報源・DB の実装詳細へ直接依存しないようにする。

## 常駐サイクル

単一プロセス・直列実行。各ステップは SQLite トランザクションで区切る。

~~~text
常駐ループ（平日 07:30〜19:00 JST、10 分間隔。時間・間隔は設定 → 運用と設定）
  1. 開示一覧の差分取得 → 対象銘柄の新規開示を source_record へ保存
  2. 未正規化の source_record → disclosure_document + source_excerpt + financial_fact
  3. 未分析の文書 → 有効な ContentSpec で抽出・検証 → company_fact / 抑止記録
  4. company_fact → ローカル表示候補と抑止記録を作成
  5. 作者本人は localhost の lab または CLI で候補と根拠を確認する。外部送信は行わない。
  6. サイクル成功時刻を記録（watchdog 用）。要約ログを出力

起動時: DB 整合性確認 → 未完了ステップの再開 → 取得位置から一覧の未取得範囲を追補
~~~

訂正や再取得は過去の正本を上書きせず、新しい記録として追加する。PC 停止・回線断の間は新しい取得を行わず、
別環境で自動的に処理を継続しない。

## 技術スタック

| 領域 | 採用 | 理由 |
| --- | --- | --- |
| 実行 | Node.js 22 LTS、TypeScript（strict） | 単一プロセスの常駐で足りる |
| DB | better-sqlite3（WAL、STRICT テーブル） | 同期 API が直列サイクルと相性がよく、トランザクション境界が明確 |
| XBRL・HTML | fast-xml-parser + 自前の薄い読み取り層 | JS に成熟した汎用 XBRL ライブラリがなく、短信サマリーは平坦で自前が最小 |
| 境界検証 | zod | 設定 JSON・ContentSpec の取り込み検証 |
| ログ | pino | JSON 追記ログ |
| テスト | vitest | |

採用しないもの: ORM・マイグレーションフレームワーク（番号付き DDL の自前適用で足りる）、
cron ライブラリ（プロセス内タイマーで足りる）、キュー・ワーカー（直列で足りる）、Web フレームワーク
（bot は UI を持たない。運用操作は CLI スクリプト、表示は lab）。

## 言語方針（TypeScript と Python の境界）

Python には成熟した XBRL ライブラリ（Arelle 等）があるが、bot を部分的・全体的に Python へ
移行しても開発コストは下がらないと判断した（→ [決定ログ](./decisions.md)）。

- MVP が読むのは短信サマリーのインライン XBRL だけで、対象は数十ファクトの平坦な構造である。
  必要なのは ix 要素の属性処理（contextRef・unitRef・decimals・scale・sign）と要素候補の解決であり、
  範囲が狭く自前実装が最小になる。難しさの本体である「指標と要素の対応表」は、ライブラリを使っても
  自前で持つ必要がある。
- フル機能の XBRL 処理系が効くのは、EDINET のフルタクソノミ（有報・半報）を扱う Phase 3 と、
  分析側の探索的な作業である。前者は Phase 3 で再評価し、後者は lab（Python 第一候補）が担う。
- SQLite・型・常駐は TypeScript で設計済みであり、bot を二言語にすると運用（依存更新・
  監視・再現性）のコストが増える。

Python の導入は次の二箇所に限定する。

1. **正規化 CLI の差し替え（保険）**: Normalizer 契約の実装として、ステートレスな Python CLI
   （XBRL zip を受け取り正規化 JSON を返す）へ差し替えてよい。M1 のフィクスチャで TypeScript の
   自前パーサが実データの変動に破綻した場合の切替先とし、同じフィクスチャで検証する。
2. **lab**: 統計処理・分析・表示（→ [ローカル分析サイト](./local-site.md)）。bot の信頼性要件と
   切り離されているため、ライブラリ活用を優先する。

## ディレクトリ構成

~~~text
takaneko/
  src/
    index.ts              # 常駐ループと起動・再開
    sources/tdnet.ts      # 一覧差分取得・原本ダウンロード（SourceConnector 実装）
    company-master.ts     # 手動銘柄マスターの読み込み
    ingestion/            # 文書判定・XBRL 正規化 → document / excerpt / financial_fact
    content-spec/         # ContentSpec の取り込み検証・版管理・テンプレート展開
    analysis/             # structured-parser（財務 3 種の確定ロジック）
    local-review/         # ローカル表示候補・重複抑止・状態記録
    storage/              # DDL 適用・型付きクエリ
    operations/           # キルスイッチ CLI・watchdog・日次要約
  config/                 # 実運用設定（git 管理外）。雛形は config-templates/
  config-templates/
  fixtures/               # 実開示から採取した固定データ（git 管理外）
  scripts/replay.ts       # リプレイ検証 CLI
  lab/                    # ローカル分析サイト（Python。依存・ログは bot と分離）
~~~

## モジュール契約（型の骨子）

~~~ts
interface SourceConnector {
  fetchNewDisclosures(position: FetchPosition, universe: Code[]): Promise<{
    records: RawDisclosure[];   // 原本 + 外部ID + 公開時刻 + 参照先
    nextPosition: FetchPosition;
  }>;
}

interface Normalizer {
  normalize(record: SourceRecord): NormalizedDocument | NormalizationFailure;
}

interface Extractor {
  extract(doc: NormalizedDocument, spec: ContentSpecVersion):
    ExtractedFactDraft[] | Suppression[];
}

interface Renderer {
  render(fact: CompanyFact, spec: ContentSpecVersion):
    { body: string; templateId: string } | Suppression;
}

~~~

## 安全と運用の境界

- ContentSpec の根拠・必須属性・数値検証を満たさない候補はローカル表示にも出さない。
- 全体・情報源・ContentSpec 単位で新規処理を停止できる。
- API 認証情報、SQLite DB、収集データ、フィクスチャ原本は GitHub に保存しない。GitHub にはコードと非機密の設定テンプレートだけを保存する。
- 表示は一次情報の事実、定義済みの計算結果、または会社が明示した説明だけを扱う。個別の売買推奨や利益保証を行わない。
