# ODOKURA Docusaurus Site

このディレクトリは、ODOKURA の公開サイトを Docusaurus で管理するためのワークスペースです。

## 前提

- Node.js `20` 以上
- npm

## セットアップ

```bash
npm install
```

## ローカル起動

```bash
npm start
```

## 本番ビルド

```bash
npm run build
```

ビルド成果物は `build/` に出力されます。`static/CNAME` により `www.odokura.com` 向けの設定も同梱されます。

## 現在の構成

- `docs/company/`
  - 会社情報
  - 会社向けプライバシーポリシー
- `docs/apps/hatsugo-note/`
  - 発語ノート概要
  - プライバシーポリシー
  - 利用規約
- `src/pages/index.tsx`
  - トップページ

## 次の候補

- 既存のルート静的HTMLを廃止して、Docusaurus を公開ルートに切り替える
- 運営者名、所在地、連絡先プレースホルダを確定値に置き換える
- ブランドに合わせてロゴ、favicon、OG画像を差し替える
