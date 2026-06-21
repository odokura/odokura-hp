---
title: ナビゲーション・メニュー構成
sidebar_label: ナビゲーション
draft: true
---

# ナビゲーション・メニュー構成

この文書は、サイトの docs サイドバーとナビバーの目標構成を定義する社内向け仕様である。参照ファイルは `sidebars.ts` と `docusaurus.config.ts`。

`draft: true` を付けているため、Docusaurus の開発表示では確認できるが、本番ビルドでは生成対象から外れる。

## 方針

アプリは今後増える前提で扱う。docs サイドバーでは「アプリ」を親カテゴリにし、その配下に各アプリをカテゴリとして置く。新しいアプリを追加するときは、「アプリ」配下に Hatsu-go と同列のカテゴリを追加する。

会社情報はアプリとは分け、独立したカテゴリとして扱う。

ナビバーは最小構成にする。docs への入口はトップページのリンクレールに任せ、ナビバーには問い合わせ導線だけを置く。

## Docs サイドバー

目標の階層は次のとおり。

```text
アプリ
└─ Hatsu-go
   ├─ 概要
   ├─ プライバシーポリシー
   └─ 利用規約

会社情報
├─ 会社概要
├─ プライバシーポリシー
└─ サポート

仕様（dev 限定・draft）
├─ トップページ仕様
└─ ナビゲーション
```

対応する doc id は次のとおり。

```text
アプリ > Hatsu-go
- apps/hatsugo-note/overview
- apps/hatsugo-note/legal/privacy-policy
- apps/hatsugo-note/legal/terms-of-service

会社情報
- company/overview
- company/privacy-policy
- company/support

仕様
- spec/hp-spec
- spec/navigation
```

`sidebars.ts` では、`docs` サイドバー配列をこの順序で定義する。

1. アプリ
2. 会社情報
3. 仕様

## サポートページ

会社情報カテゴリには、全アプリ共通のサポート窓口ページを置く。これは Apple App Store の「サポートURL」欄に登録するための公開ページである。

```text
/docs/company/support
```

内容は ODOKURA の全アプリを対象にした汎用的なサポート案内とする。問い合わせ先メールは `info@odokura.jp` とし、問い合わせ時にはアプリ名、端末と OS、発生している事象を添えてもらう。

特定アプリ固有の説明や注意事項は、このサポートページではなく各アプリのページに置く。

## ナビバー

ナビバーは右側の問い合わせ導線のみを表示する。

```text
お問い合わせ -> mailto:info@odokura.jp
```

旧構成の「会社案内」と「Hatsu-go」の docs 直リンクは置かない。`navbar.title` と `navbar.logo` は据え置く。

対象は `docusaurus.config.ts` の `themeConfig.navbar.items` である。`navbar.title`、`navbar.logo`、footer、docs plugin 設定、routeBasePath はこの仕様の対象外とする。

## 将来の整理対象

アプリが増えた場合、サイドバー以外にもアプリ名や導線の整理が必要になる。

- `docusaurus.config.ts` の footer には Hatsu-go の直リンクが残る。
- `src/pages/index.tsx` の `additionalLinks` には `App overview` として Hatsu-go への直リンクが残る。

アプリを追加するときは、これらもアプリ一覧やアプリ別導線として整理する。
