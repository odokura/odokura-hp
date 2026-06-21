# odokura-hp

ODOKURA の公開サイトを管理するリポジトリです。

サイト本体は `website/` 配下の Docusaurus プロジェクトで管理しています。ビルドすると静的ファイルが `website/build/` に出力されます。

## 前提

- Node.js `20` 以上
- npm

Node.js のバージョン確認:

```powershell
node --version
npm --version
```

## セットアップ

リポジトリのルートから `website/` に移動し、依存パッケージをインストールします。

```powershell
cd website
npm install
```

CI やクリーンな環境で lockfile どおりにインストールしたい場合は、代わりに次を使います。

```powershell
npm ci
```

## ローカル開発

開発サーバーを起動します。

```powershell
npm start
```

標準では `http://localhost:3000/` で確認できます。

## ビルド

本番用の静的ファイルを生成します。

```powershell
npm run build
```

ビルド成果物は `website/build/` に出力されます。`website/static/CNAME` もビルド時に含まれるため、公開先ドメイン `www.odokura.com` の設定ファイルも `build/CNAME` として生成されます。

## ビルド結果の確認

生成した静的サイトをローカルで確認します。

```powershell
npm run serve
```

表示された URL をブラウザで開いて確認してください。

## 主な構成

- `website/docusaurus.config.ts`: Docusaurus のサイト設定
- `website/src/pages/index.tsx`: トップページ
- `website/docs/company/`: 会社情報、会社向けプライバシーポリシー
- `website/docs/apps/hatsugo-note/`: 発語ノート関連ページ
- `website/static/`: favicon、ロゴ、CNAME などの静的ファイル
- `website/build/`: ビルド成果物

