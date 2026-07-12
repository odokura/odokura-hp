---
title: "コンテンツ仕様: 共通契約"
sidebar_label: 共通契約
draft: true
sidebar_position: 1
---

# コンテンツ仕様: 共通契約

このフォルダは、フォロワーに届ける具体的な価値と、それを一次情報から抽出し X へ出力する方法の正本である。
本ページが全種別の共通契約を定め、種別ページ（[決算実績](./financial-result.md)、
[業績予想の修正](./forecast-revision.md)、[配当](./dividend.md)、[将来種別（凍結）](./future.md)）が
種別固有の価値・入力・抽出・テンプレート・キー・フィクスチャを定める。

種別ページは共通して次の並びで書く: 提供する価値 → 受け入れる文書 → 抽出 → 確定する企業ファクト →
投稿テンプレート → 優先度と重複キー → 投稿しない条件 → フィクスチャ。

## 文書から投稿までの単位

~~~text
一次情報文書
  -> 正規化済みの段落・表・明示メタデータ
  -> 根拠箇所
  -> ExtractedFactDraft
  -> 検証済み company_fact
  -> 一投稿一企業ファクトの post_candidate
~~~

根拠箇所（source_excerpt）は、文章では見出し階層、段落番号、文字範囲、内容ハッシュを、
表では表名または要素の位置、見出し行、行・列、内容ハッシュを持つ。いずれも元文書内で再特定できなければ
ならない。投稿本文は company_fact の確定済み項目だけから生成する。

文章の span は、正規化済み source_excerpt の UTF-16 コード単位による半開区間 [start, end) とし、
保存時の内部表現とする。span の計算は検証器だけが行い、LLM に span を生成させない（→ 抽出方式）。

## ContentSpec

コンテンツ種別ごとに、次の設定を持つ。情報源固有の CSS セレクタ、XBRL 要素名、API フィールド名は、
この論理仕様へ対応付ける情報源アダプタ側の設定とする。

~~~ts
type ContentKind =
  | "financial_result"
  | "financial_forecast_revision"
  | "shareholder_return"
  | "capital_transaction"
  | "business_structure"
  | "strategy_target"
  | "business_execution"
  | "risk_constraint"
  | "governance_change";

type ContentSpec = {
  kind: ContentKind;
  valueQuestion: string;
  acceptedDocumentKinds: string[];
  extractionMode: "table" | "text" | "metadata";
  requiredFields: string[];
  optionalFields: string[];
  evidenceRule: string;
  validationRule: string;
  renderTemplate: string;
  priority: number;
  dedupeFields: string[];
};

type ExtractedFactDraft = {
  kind: ContentKind;
  documentId: string;
  evidenceIds: string[];
  subject: string;
  occurredAt?: string;
  fiscalPeriod?: string;
  attributes: Record<string, string | number | boolean>;
  extractionMethod: "structured-parser" | "text-rule" | "llm-candidate";
};
~~~

ContentSpec の変更は設定版として保存し、過去の company_fact や投稿を再解釈しない
（版管理の手続きは[運用と設定](../operations.md)）。

## 抽出方式

### structured-parser（表・構造化データ）

決算、業績予想・配当の修正など、列見出しと数値の意味が確定できる文書で使う。MVP の 3 種別はすべてこの方式。

1. アダプタは表名（XBRL では要素・コンテキスト）、見出し行、行名、列名、セル値を正規化して保存する。
2. ContentSpec は、必要な行名・列名（XBRL では要素候補）と同義語を定義する。
3. 抽出器は、組合せが一意に決まるセルだけを取得する。複数候補に一致したら候補を作らない。
4. 数値は、値、単位、会計期間、実績・予想区分、連結範囲、比較元を別々の項目で保存する。
5. 計算は ContentSpec で定めた算術だけに限定し、数値から評価や因果を作らない。
6. 必須セルが欠ける、単位や会計期間が不明な場合は company_fact を作らない。

PDF を画像として読ませた OCR の数値で自動投稿してはならない。文字・表構造を安定して取得できない
情報源は、原本を保存してもそのコンテンツ種別の自動投稿には採用しない。

### text-rule（文章・公式発表）

将来種別（Phase 2 以降）で使う。見出し条件と文中の直接表現から、主題・対象・時点を抽出する。

1. アダプタは見出し階層を保って本文を段落・文へ分割する。
2. ContentSpec は、対象見出し、許可する行為、必須の対象表現、必要な日付・期間を定義する。
3. 抽出器は対象見出し配下の一文または連続した段落から、主語、行為、対象、時点を抽出する。
4. 主語・行為・対象の全てが根拠箇所内にあり、ContentSpec の許可語に一致する場合だけ候補にする。
5. 発表日と実行日、予定と完了、方針と決定を別の値として扱う。元文にない因果、目的、将来効果を補わない。

### llm-candidate（LLM による候補生成）

text-rule で安定して候補化できない文章に限り使う（Phase 3）。LLM は事実の根拠でも投稿文の自由生成器でもない。
入力は一つの根拠箇所と許可された ContentSpec に限定し、次の JSON 以外を受け取らない。
LLM には文字位置ではなく原文の完全一致引用を返させる。LLM はオフセット計算を安定して行えないためである。

~~~json
{
  "kind": "business_execution",
  "subject_quote": "当社",
  "action": "開始",
  "object_quote": "法人向けクラウドサービスの提供",
  "occurred_at_quote": "2026年7月1日"
}
~~~

検証器は、全ての引用文字列が入力した根拠箇所内に完全一致でちょうど一回出現することを確認し、
一致位置から span を計算して保存する。出現しない、または複数回出現する引用は候補ごと不採用にする。
行為が ContentSpec の許可語であること、必須項目・型がそろうことも確認する。検証後の投稿は
固定テンプレートから生成し、LLM が返した自由文・分類根拠・因果推測は使わない。
検証に失敗した候補は保存しても投稿しない。

## 分析の実行順

1. 正規化済み文書を、銘柄、公開時刻、論理文書種別、会計期間、訂正関係で確認する。
2. 論理文書種別に一致する有効な ContentSpec を選ぶ。
3. extractionMode に従い ExtractedFactDraft を作り、必須項目・根拠規則・数値比較条件・重複条件を検証する。
4. 合格した候補だけを company_fact として保存し、配信へ渡す。抑止した候補は理由コードを保存する。

同じ文書が複数の ContentSpec に一致する場合は、根拠箇所と主題が異なる候補だけを別々に扱う。
一つの候補から複数の無関係な company_fact を作らない。訂正文書は元文書と別に分析し、
新しい根拠箇所と company_fact を追加する（過去の記録を上書き・削除しない）。

## 共通の確定条件と抑止条件

company_fact を確定するには、次を全て満たす。

1. 採用済み情報源の一次情報文書であり、文書種別が ContentSpec の対象に一致する。
2. 企業、コンテンツ種別、主題、対象時点または会計期間、根拠箇所を特定できる。
3. 根拠箇所は元文書内で再特定でき、抽出された全ての表示項目を裏付ける。
4. 数値を使う場合、値・単位・定義・会計期間・連結範囲・比較元を検証できる。
5. 一つの company_fact が扱う主題は一つだけである。

次の候補は company_fact にせず、抑止理由を保存する。

- 文書タイトルだけで、本文・表・明示メタデータの根拠がない。
- 主語、対象、時点、数値の意味のいずれかが欠ける。
- 他社との比較、株価・将来業績への影響、良し悪しの評価を補っている。
- 同じ文書、根拠箇所、主題、ContentSpec 版から有効な company_fact が既にある（分析段階の再抽出抑止）。
- 訂正関係、文書鮮度、対象銘柄、投稿頻度の条件を満たさない。

## 投稿生成の共通規則

- 投稿は company_fact の種別ごとの固定テンプレートだけで生成する。LLM・任意の文章生成器による
  再要約・短縮・補足を行わない。
- 企業名、証券コード、分類、主題、対象時点または会計期間を必須とする。根拠 URL は投稿に表示しない。
- 本文の上限は、X の公式カウント仕様による重み付き長 280（全角・CJK は 2、半角英数記号は 1、
  URL は固定値）とする。テンプレート展開後に超える場合は、ContentSpec に明示した定型置換だけを適用し、
  なお超える場合は抑止する。意味を保った自動要約は行わない。
- 一文書から投稿できる company_fact は最大 3 件とする。priority、元文書内の出現順、根拠箇所 ID の順に
  選び、漏れた候補は投稿しない。priority は文書内の選抜だけに使い、企業価値や株価への影響を評価する
  値ではない。

## 重複キーの原則

投稿の重複キーは、company_id、ContentKind、種別ページが定める dedupeFields の意味属性だけから作る。
文書の ID・内容ハッシュ、根拠箇所の内容ハッシュ、ContentSpec 版、配信ルール版は含めない。
設定の版上げ、再正規化、同一事実を載せた別文書から、同じ内容をフォロワーへ再投稿しないためである。

訂正を表す company_fact（correction_kind = source または system）に限り、訂正元と同じ重複キーでも
投稿でき、本文に訂正表示を含める（種類の定義と執行は[配信](../distribution.md)）。dedupeFields の
属性が欠けるときは、ContentSpec が明示的に代替属性を定めない限り投稿しない。

## 種別の有効化

新しい種別・情報源・表現の有効化には、[設計指針](../design-principles.md)の 6 項目の定義と、
[検証計画](../verification.md)の固定データ検証、[スコープと段階計画](../scope.md)のゲート通過を要求する。
