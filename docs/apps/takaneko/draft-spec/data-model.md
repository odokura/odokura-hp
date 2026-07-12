---
title: "Takaneko データモデル"
sidebar_label: データモデル
draft: true
sidebar_position: 7
---

# データモデル

## 保存方針

正本は自宅 PC 上の SQLite 単一 DB ファイルとする。未加工の取得内容、正規化文書、文書内の根拠箇所、
ContentSpec、抽出結果、投稿候補、投稿試行、運用操作を同じ DB に保存する。各記録は ID と作成時刻を持ち、
訂正・再取得・再計算は上書きではなく新しい記録を追加する。

時刻は DB では UTC で保存し、投稿文と運用画面では日本時間で表示する。一次情報には公開時刻、取得時刻、
対象会計期間を保存し、訂正前後の文書を混同しない。

書き込みは bot プロセスだけが行う（単一ライター）。ローカル分析サイトは WAL 前提の読み取り専用接続で
参照してよいが、長時間の読み取りトランザクションで WAL チェックポイントを妨げてはならない
（→ [ローカル分析サイト](./local-site.md)）。lab が収集する統計データは別ファイルの stats DB に保存し、
本ページの正本 DB には含めない。

種別ごとの属性、必須項目、根拠、テンプレートは[コンテンツ仕様](./content/common.md)を正本とする。

## 主要エンティティ

| エンティティ | 役割 | 主な項目 |
| --- | --- | --- |
| instrument | 日本株の銘柄マスター | 銘柄 ID、コード、名称、上場市場、有効期間 |
| config_version | 設定全体の版（対象銘柄集合、情報源、正規化マップ、ContentSpec、配信ルール、実行モード） | 設定種別、版、内容、内容ハッシュ、有効開始時刻、作成者 |
| source_record | 取得時点の未加工データ（原本。同一内容は一度だけ保存） | 情報源、外部 ID、取得・公開時刻、内容ハッシュ、ペイロード |
| source_poll | 取得試行と耐久カーソルの記録 | 情報源、実行時刻、結果、カーソル、新規保存件数 |
| disclosure_document | 正規化した一次情報の文書 | 銘柄 ID、論理文書種別、公開時刻、会計期間、訂正元 ID、原本 ID |
| source_excerpt | 文書内で事実を裏付ける構造化された根拠箇所 | 文書 ID、種別（text / table / metadata）、見出し階層、位置（locator）、内容、内容ハッシュ |
| financial_fact | 表から抽出した比較可能な数値 | 文書 ID、指標、実績・予想区分、値、単位、会計期間、連結範囲、根拠箇所 ID |
| analysis_run | ContentSpec を用いた抽出・計算の実行記録 | 文書 ID、ContentSpec 版、実行時刻、品質状態 |
| company_fact | 検証済みの一主題の企業理解用事実 | 銘柄 ID、種別、主題、対象時点・会計期間、属性 JSON、根拠箇所、財務値参照、ContentSpec 版、品質状態、訂正種別 |
| post_candidate | 一企業ファクトから作成した投稿候補 | 本文、テンプレート ID、重複キー、判定結果、抑止理由、対象集合・配信ルール版 |
| post_attempt | X 投稿の試行と結果 | 候補 ID、試行時刻、状態、X 投稿 ID、失敗分類 |
| operation_event | 運用操作と障害 | キルスイッチ、設定変更、停止・再開、エラー、実行者 |

ContentSpec の版（論理モデルの content_spec_version）は、物理的には config_version の
kind = content_spec の行として持つ。対象銘柄集合の所属銘柄は config_version を参照する結合表で持つ。

source_excerpt はいずれも元文書内で再特定できなければならない。company_fact の属性は種別固有の
JSON とし、属性名・型・必須性は ContentSpec の版で検証する。company_fact の本文を正本にせず、
投稿に使う値は主題、属性、根拠箇所、ContentSpec から再生成する。

## 正本・派生データ

source_record、source_poll、disclosure_document、source_excerpt、financial_fact、config_version、
analysis_run、company_fact、post_candidate、post_attempt、operation_event は監査対象の正本として
無期限に保存する。

検索用インデックス、集計ビュー、再作成可能なキャッシュは派生データである。性能改善のために作り直してよいが、
正本から再生成できなければならない。

## 来歴と版管理

すべての company_fact は、対象文書、少なくとも一つの source_excerpt、analysis_run、ContentSpec 版を
参照する。数値または比較値を含む company_fact は、該当する financial_fact と比較条件も参照する。
これにより、過去の企業ファクトがどの文書のどの記載、またはどの計算から作られたかを内部で再現できる。

すべての post_candidate は、一つの company_fact、展開したテンプレート ID・表示項目、対象銘柄集合の版、
配信ルール版を参照する。一つの投稿候補に複数の company_fact を混在させない。

設定を変更するときは既存レコードを更新せず、新しい版を追加して有効期間を切り替える。過去の投稿を、
現在の抽出規則、フィルター、投稿条件だけで説明してはならない。

## 整合性ルール

- source_record の内容ハッシュと情報源・外部 ID は、同じ取得物を識別できる。取得試行とカーソルは
  source_poll に記録し、source_record は同一内容の原本を重複保存しない。
- 投稿候補の対象銘柄集合・配信ルール版は、config_version への外部キーで参照する。
- disclosure_document は少なくとも一つの source_record を参照し、訂正時は訂正元を参照する。
- source_excerpt は一つの disclosure_document に属し、構造的位置と内容ハッシュを持つ。
- company_fact は、ContentSpec が要求する主題、対象時点または会計期間、属性、根拠箇所がそろわなければ投稿可能にしない。
- 数値比較を表す company_fact は、比較する financial_fact の指標・会計期間・単位・連結範囲が一致しなければ作成しない。
- post_candidate は一つの company_fact にだけ対応し、投稿済みまたは送信中の重複キーを再利用しない。
- 削除・訂正された事実を上書きしない。元文書と訂正文書、各企業ファクトの関係を残す。

## 物理 DDL（SQLite）

better-sqlite3、WAL、STRICT テーブル。スキーマ変更は番号付き DDL ファイルの追加適用とし、
適用済み番号を DB 内に記録する。途中失敗時は起動しない（→ [検証計画](./verification.md)の運用検証）。

~~~sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE instrument (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  market TEXT,
  valid_from TEXT NOT NULL,
  valid_to TEXT
) STRICT;

CREATE TABLE config_version (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL,      -- universe / sources / normalization_map / content_spec / distribution_rule / app_mode
  version INTEGER NOT NULL,
  body TEXT NOT NULL,      -- 検証済み JSON
  content_hash TEXT NOT NULL,
  valid_from TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (kind, version)
) STRICT;

CREATE TABLE target_universe_member (
  config_version_id INTEGER NOT NULL REFERENCES config_version(id),
  instrument_id INTEGER NOT NULL REFERENCES instrument(id),
  PRIMARY KEY (config_version_id, instrument_id)
) STRICT;

CREATE TABLE source_record (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  published_at TEXT NOT NULL,
  fetched_at TEXT NOT NULL,     -- 初回保存時刻。再取得は source_poll にのみ残る
  content_hash TEXT NOT NULL,
  payload BLOB NOT NULL,
  payload_kind TEXT NOT NULL    -- xbrl_zip / pdf / list_row
) STRICT;
CREATE UNIQUE INDEX idx_source_identity
  ON source_record (source, external_id, content_hash);

CREATE TABLE source_poll (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  polled_at TEXT NOT NULL,
  status TEXT NOT NULL,         -- ok / fetch_error / store_error
  cursor TEXT NOT NULL,         -- JSON: 基準公開時刻・最終外部 ID（行位置に依存しない）
  new_records INTEGER NOT NULL,
  detail TEXT
) STRICT;

CREATE TABLE disclosure_document (
  id INTEGER PRIMARY KEY,
  instrument_id INTEGER NOT NULL REFERENCES instrument(id),
  doc_kind TEXT NOT NULL,       -- earnings_report / forecast_revision / dividend_resolution / other
  title TEXT NOT NULL,
  published_at TEXT NOT NULL,
  fiscal_year_end TEXT,
  period_type TEXT,             -- FY / Q1 / Q2 / Q3
  accounting_standard TEXT,     -- jgaap / ifrs / usgaap
  is_correction INTEGER NOT NULL DEFAULT 0,
  corrects_document_id INTEGER REFERENCES disclosure_document(id),
  source_record_id INTEGER NOT NULL REFERENCES source_record(id),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE source_excerpt (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES disclosure_document(id),
  kind TEXT NOT NULL CHECK (kind IN ('text','table','metadata')),
  heading_path TEXT,
  locator TEXT NOT NULL,        -- JSON: XBRL要素名/コンテキストID/unitRef/decimals、または段落・文字範囲
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE financial_fact (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES disclosure_document(id),
  excerpt_id INTEGER NOT NULL REFERENCES source_excerpt(id),
  metric TEXT NOT NULL,
  role TEXT NOT NULL,           -- actual / prior_actual / forecast / previous_forecast / revised_forecast / dividend
  value_raw INTEGER,            -- 円（配当は 1/100 円）
  value_text TEXT,              -- 原文表記（円銭など）
  decimals INTEGER,
  unit TEXT NOT NULL,
  fiscal_year_end TEXT NOT NULL,
  period_type TEXT NOT NULL,
  consolidation TEXT NOT NULL,  -- consolidated / non_consolidated
  accounting_standard TEXT,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE analysis_run (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES disclosure_document(id),
  content_spec_version_id INTEGER NOT NULL REFERENCES config_version(id),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL          -- ok / suppressed / error
) STRICT;

CREATE TABLE company_fact (
  id INTEGER PRIMARY KEY,
  instrument_id INTEGER NOT NULL REFERENCES instrument(id),
  kind TEXT NOT NULL,
  subject TEXT NOT NULL,
  fiscal_year_end TEXT,
  occurred_at TEXT,
  attributes TEXT NOT NULL,     -- 種別固有 JSON
  quality TEXT NOT NULL,        -- postable / stored_only
  correction_kind TEXT,         -- NULL / source / system
  corrects_x_post_id TEXT,      -- system 訂正が対象にした X 投稿 ID
  document_id INTEGER NOT NULL REFERENCES disclosure_document(id),
  analysis_run_id INTEGER NOT NULL REFERENCES analysis_run(id),
  content_spec_version_id INTEGER NOT NULL REFERENCES config_version(id),
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE company_fact_evidence (
  company_fact_id INTEGER NOT NULL REFERENCES company_fact(id),
  excerpt_id INTEGER NOT NULL REFERENCES source_excerpt(id),
  PRIMARY KEY (company_fact_id, excerpt_id)
) STRICT;

CREATE TABLE company_fact_financial (
  company_fact_id INTEGER NOT NULL REFERENCES company_fact(id),
  financial_fact_id INTEGER NOT NULL REFERENCES financial_fact(id),
  role TEXT NOT NULL,           -- actual / baseline / previous / revised
  PRIMARY KEY (company_fact_id, financial_fact_id)
) STRICT;

CREATE TABLE post_candidate (
  id INTEGER PRIMARY KEY,
  company_fact_id INTEGER NOT NULL REFERENCES company_fact(id),
  body TEXT NOT NULL,
  template_id TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  status TEXT NOT NULL,         -- approved / suppressed
  suppress_stage TEXT,
  suppress_reason TEXT,
  universe_config_version_id INTEGER NOT NULL REFERENCES config_version(id),
  distribution_rule_version_id INTEGER NOT NULL REFERENCES config_version(id),
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX idx_candidate_dedupe ON post_candidate (dedupe_key, status);

CREATE TABLE post_attempt (
  id INTEGER PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES post_candidate(id),
  attempted_at TEXT NOT NULL,
  status TEXT NOT NULL,         -- sending / published / failed / unknown / unknown_final / dry_run
  x_post_id TEXT,
  failure_class TEXT
) STRICT;

CREATE TABLE operation_event (
  id INTEGER PRIMARY KEY,
  at TEXT NOT NULL,
  actor TEXT NOT NULL,          -- operator / bot
  kind TEXT NOT NULL,           -- kill_switch / config_change / stop / resume / error / watchdog
  target TEXT,
  reason TEXT,
  detail TEXT
) STRICT;
~~~

重複キーの一意性は、単一プロセス直列実行の前提で「投稿済み・送信中の同一 dedupe_key が存在しないこと」を
同一トランザクション内のクエリで判定する（suppressed 行が同じキーを繰り返し持つため UNIQUE 制約にしない）。

## 無期限保存と容量

原本、根拠箇所、ContentSpec、企業ファクト、投稿監査記録は削除しない。DB 容量を運用指標として記録し、
容量不足、書込み失敗、整合性エラーが起きた場合は、新しい企業ファクトの分析と投稿を停止する。
保存できない状態で投稿だけを継続してはならない。
