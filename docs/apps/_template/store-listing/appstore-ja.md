---
title: "{{アプリ名}} ストア入力情報：App Store（日本語）"
sidebar_label: App Store（日本語）
draft: true
sidebar_position: 2
---

# {{アプリ名}} ストア入力情報：App Store（日本語）

各項目は[概要・安全ライン](./index.md)の表現ルールに従う。文字数上限は末尾の Notes を参照。

## App Name

上限 30 文字。ブランド名＋短い説明の形が使いやすい（例: 「アプリ名：短い説明」）。

```
{{App Name（30文字以内）}}
```

## Subtitle

上限 30 文字。App Name を補う一言。

```
{{Subtitle（30文字以内）}}
```

## Promotional Text

上限 170 文字。審査なしで差し替え可能。キャンペーンや旬の訴求に使う。

```
{{Promotional Text（170文字以内）}}
```

## Description

上限 4000 文字。【見出し】＋本文のブロックで構成する。おすすめの並び:

- 導入（何をするアプリか）
- 開発の背景・コンセプト
- 主な特長（箇条書き）
- 安心・プライバシー（収集しないデータ、端末内完結など）
- 料金（無料範囲と有料範囲）
- 免責・重要事項（医療・診断を目的としない等、必要なら）

```
{{Description（4000文字以内）}}
```

## Keywords

上限 100 文字。カンマ区切り。App Name / Subtitle に含めた語は繰り返さない。

```
{{keyword1,keyword2,keyword3（合計100文字以内）}}
```

## In-App Purchase Localization: {{IAP表示名}}

課金がある場合のみ。packId / productId はマネタイズ仕様を正とする。

### Display Name

```
{{IAP Display Name}}
```

### Description

```
{{IAP Description}}
```

## Notes

App Store の各文字数上限の目安は、App Name 30 / Subtitle 30 / Promotional Text 170 / Keywords 100 / Description 4000。

- 実際の文字数は App Store Connect で要確認。
- カテゴリ候補: {{メイン / サブ カテゴリ}}。
- {{その他の申請メモ}}
