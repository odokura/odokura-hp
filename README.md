# odokura-hp

ODOKURA の公開サイトを管理する Docusaurus プロジェクトです。

## 前提

- Node.js `20` 以上
- npm

## セットアップ

```powershell
npm install
```

## ローカル開発

```powershell
npm start
```

標準では `http://localhost:3000/` で確認できます。

## ビルド

```powershell
npm run build
```

ビルド成果物は `build/` に出力されます。`static/CNAME` もビルド時に含まれるため、公開先ドメイン `www.odokura.com` の設定ファイルも `build/CNAME` として生成されます。

## ビルド結果の確認

```powershell
npm run serve
```

## 主な構成

- `docusaurus.config.ts`: Docusaurus のサイト設定
- `sidebars.ts`: ドキュメントのサイドバー設定
- `src/pages/index.tsx`: トップページ
- `docs/company/`: 会社情報、会社向けプライバシーポリシー
- `docs/apps/hatsugo-note/`: 発語ノート関連ページ
- `static/`: favicon、ロゴ、CNAME などの静的ファイル
- `build/`: ビルド成果物