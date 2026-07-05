# ストア入力情報テンプレート

新規アプリのストア掲載文言を作るときの雛形。`docs/apps/` 配下の各アプリで同じ構成をそろえ、
申請作業とレビューを効率化するためのもの。

## このディレクトリの扱い

- `_template` はアンダースコア始まりのため Docusaurus のルーティングから除外される（サイトには出ない）。
  純粋なコピー元の雛形として置く。
- 実際のアプリでは、このディレクトリ配下のファイルを
  `docs/apps/<app>/draft-spec/store-copy/` にコピーして使う。

## 使い方

1. `docs/apps/<app>/draft-spec/store-copy/` を作る。
2. 本ディレクトリの `index.md` / `appstore-ja.md` / `googleplay-ja.md` / `review-notes.md` をコピーする。
3. `{{ }}` のプレースホルダーを各アプリの内容で置き換える。
4. `_category_.json` を作る（例: `{"label": "外向け文言（ストア）", "position": <番号>}`）。
5. アプリの `overview.md` などのページ一覧に `./store-copy/` へのリンクを足す。

## 言語展開

- 初版が日本語のみなら `*-ja.md` だけでよい（`draft: true` は日本語のみ更新）。
- 英語・繁体字を出す段になったら `appstore-en.md` / `appstore-tw.md` などを同構成で追加し、
  3 言語をそろえる（docusaurus スキルの i18n ルールに従う）。

## 各ストアの主な文字数上限（目安）

| ストア | 項目 | 上限 |
| --- | --- | --- |
| App Store | App Name | 30 |
| App Store | Subtitle | 30 |
| App Store | Promotional Text | 170 |
| App Store | Keywords | 100 |
| App Store | Description | 4000 |
| Google Play | タイトル | 30 |
| Google Play | 短い説明 | 80 |
| Google Play | 詳細説明 | 4000 |

実際の文字数は App Store Connect / Google Play Console で要確認。

## MDX 上の注意

- 申請文言は必ずコードフェンス（3 連バッククォート）の中に入れる。
  `{ }` やバッククォートを含む値をインラインに書くとビルドが落ちる。
- Google Play の詳細説明で使う `<b>` などの書式タグも、コードフェンス内にそのまま入れる。
