---
title: XXGGLL アプリ仕様
sidebar_label: 概要
sidebar_position: 1
draft: true
---

# XXGGLL アプリ仕様

このページを仕様確認の入口とする。全ファイルを上から読むのではなく、変更目的に対応するカテゴリの概要から必要な正本へ進む。

## メニュー

| カテゴリ | 最初に読むページ | ここで決めること |
| --- | --- | --- |
| 基本仕様 | [基本仕様の概要](./core/overview.md) | 機能要件、構成、データ、業務操作を確定できる条件 |
| 画面仕様 | [画面仕様の概要](./experience/overview.md) | 画面責務、導線、個別画面、視覚結果、CSS実装契約、デザイン変更の検証 |
| セキュリティ | [セキュリティ概要](./security/overview.md) | 脅威、認証、データ保護、取引安全、監査、基盤、公開gate |
| 運用・法務 | [運用・法務の概要](./operations/overview.md) | Railway運用、release、監視、復旧、定期点検、精算条件 |

## 変更目的から読む

| 変更目的 | 必ず確認する順序 |
| --- | --- |
| 新機能・API | [要件](./core/requirements.md) → [コントロール](./core/controls.md) → [データモデル](./core/data-model.md) → 関連するセキュリティ詳細 |
| 画面・導線 | [画面台帳](./experience/screen-catalog.md) → [UX](./experience/ux.md) → 対象画面仕様 → [デザイン仕様](./experience/design.md) |
| Creator管理・集計 | [Creator管理](./experience/creator-management/overview.md) → 対象画面仕様 → [画面台帳](./experience/screen-catalog.md) → [要件](./core/requirements.md) |
| CSS・共通部品 | [デザイン仕様](./experience/design.md) → [CSS実装仕様](./experience/css.md) → [デザイン運用](./experience/design-operations.md) |
| 認証・Ops・個人情報・決済 | [セキュリティ基本設計](./security/basic-design.md) → [セキュリティ概要](./security/overview.md)から対象詳細 → [コントロール](./core/controls.md) |
| Railway・release・障害対応 | [セキュリティ基本設計](./security/basic-design.md) → [運用](./operations/operations.md) |
| クリエイター報酬・出金 | [クリエイター精算](./operations/creator-settlement.md) → [取引・不正・利用者安全](./security/transactions-and-safety.md) → [コントロール](./core/controls.md) |

## 正本の扱い

- 同じ要件を複数文書へ複製しない。要約側から詳細の正本へリンクする。
- 仕様が競合した場合は実装者が一方を選ばず、変更Issueで正本同士を整合させる。
- Issueには変更対象の正本、制約、受け入れ条件、未実施の検証を記録する。
- セキュリティ未決定事項は、安全側停止または機能gateを維持したまま判断する。

## Review response

| 項目 | 結果 |
| --- | --- |
| 対象 | app-spec直下の旧正本互換ページ15件、正本への移動リンク、自動生成sidebar、互換ページ専用CSS |
| 判定 | No material findings |
| 確認 | 互換ページは`draft: true`を維持し、`sidebar_class_name: xxggll-compat-doc`だけを指定する。Docusaurus 3.9.2のdevelopment server起動、client compile、生成sidebarへのclass付与を確認した |
| 応答 | 同時指定できない`unlisted`を削除し、専用classを持つ互換項目だけをCSSで非表示にした。正本、公開ページ、他カテゴリのsidebar表示は変更しない |
