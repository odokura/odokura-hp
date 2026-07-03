---
title: トップページ仕様
sidebar_label: トップページ仕様
draft: true
sidebar_position: 1
---

# トップページ仕様

この文書はトップページの現状実装を記録する社内向け仕様である。参照元は `src/pages/index.tsx` と `src/pages/index.module.css`。

`draft: true` を付けているため、Docusaurus の開発表示では確認できるが、本番ビルドでは生成対象から外れる。

## 全体構造

トップページは `src/pages/index.tsx` の `Home` コンポーネントで定義されている。`Layout` には `title="ODOKURA"`、`description="ODOKURA LLC / Hatsu-go"`、`noFooter` が指定されている。

主コンテンツのルート section には `styles.page` と `homepage-minimal-root` が付く。`homepage-minimal-root` は、このトップページだけに Docusaurus の通常ナビゲーションとフッター非表示の CSS を当てるための識別クラスである。

非表示指定は `src/pages/index.module.css` の `:global(body:has(.homepage-minimal-root) .navbar)` と `:global(body:has(.homepage-minimal-root) .footer)` で、どちらも `display: none !important` を指定する。サイト設定や他ページのナビゲーション設定は変更しない。

`.frame` は額装フレームの外枠で、`grid-template-rows: auto 1fr auto` により次の 3 行を構成する。

1. `.frameBar`: 上部バー。`ODOKURA` と落款クラスタを表示する。
2. `.stage`: 中央の作品ステージ領域。
3. `.linkRail`: 下部リンクレール。

`.frame` 自体は `min-height: calc(100vh - 2.5rem)`、`display: grid`、`background: #f0ece3`。外側の `.page` は `min-height: 100vh`、`padding: 1.25rem`、`background: #e8e3d8`。

## 配色と額装

トップページは和紙の暖色フラット面を重ねて奥行きを出す。面の配色にはグラデーションを使わない。中央作品の波パターンだけは CSS の `radial-gradient` で描画する。

- `.page`: `#e8e3d8`
- `.frame`: `#f0ece3`
- `.frameBar`: `#e4dfd3`
- `.stageOuter`: `#ece7dd`
- `.stageInner`: `--wave-field: #f4f1ea`
- `.railLink:nth-child(1)`: `#e6e1d6`
- `.railLink:nth-child(2)`: `#e3ddd1`
- `.railLink:nth-child(3)`: `#e0dacd`
- 主要文字色: `#1a1a1a`

額装は太い罫線ではなく、面の色味差で表現する。`.stageOuter` のみ `border: 1px solid #ddd6c8` の極薄い暖色罫を持つ。`.stageInner` は `box-shadow: inset 0 1px 4px rgba(26, 26, 26, 0.06)` により、作品面が少し窪んで見える。

## 上部バー

`.frameBar` は `display: flex`、`justify-content: space-between`、`gap: 1rem`、`padding: 0.9rem 1rem`、`background: #e4dfd3`。

左側の `.meta` は `ODOKURA` を表示する。`.meta` と `.railLink` は共通で `font-family: 'IBM Plex Mono', SFMono-Regular, Consolas, monospace` を使う。`.meta` は `color: #1a1a1a`、`font-size: 0.72rem`、`letter-spacing: 0.18em`、`text-transform: uppercase`。

右側の `.frameMark` は落款クラスタで、`display: inline-flex`、`align-items: center`、`gap: 0.5rem`。中には `.edition` と `.seal` がある。

- `.edition`: `MMXXVI / 01` を表示する。`font-family: 'IBM Plex Mono', SFMono-Regular, Consolas, monospace`、`font-size: 0.68rem`、`letter-spacing: 0.16em`、`color: rgba(26, 26, 26, 0.7)`。
- `.seal`: 藍色の塗り四角。`width: 9px`、`height: 9px`、`background: #1f3a5f`。

## 中央ステージ

中央ステージは `.stage`、`.stageOuter`、`.stageInner` の 3 層で構成される。

`.stage` は `display: flex`、`padding: 1rem`。`.stageOuter` は `min-height: 52vh`、`display: flex`、`flex: 1`、`padding: 0.85rem`、`border: 1px solid #ddd6c8`、`background: #ece7dd`。

`.stageInner` は空の div で、作品を飾るキャンバスとして使われる。`flex: 1`、`display: flex`、`align-items: flex-end`、`justify-content: flex-start`、`padding: 1rem`、`position: relative`、`overflow: hidden` を持つ。

背景アートは青海波風の CSS パターンである。`.page` で `--wave-size: 76px`、`--wave-line: rgba(18, 18, 18, 0.11)`、`--wave-field: #f4f1ea` を定義する。

`.stageInner` は `background-color: var(--wave-field)` を下地に、`radial-gradient(circle at 50% 100%, ...)` を 2 層重ねる。どちらも `transparent 0 26%`、`var(--wave-line) 26% 29%`、`transparent 29% 43%`、`var(--wave-line) 43% 46%`、`transparent 46% 60%`、`var(--wave-line) 60% 63%`、`transparent 63%` の円弧パターンで作られる。

パターンのサイズは `background-size: var(--wave-size) calc(var(--wave-size) / 2)`。配置は 1 層目が `0 0`、2 層目が `calc(var(--wave-size) / 2) calc(var(--wave-size) / 2)` で、半タイルずらして波の反復を作る。

`.stageInner::after` には左下寄りから広がる波紋がある。`radial-gradient(circle at 22% 82%, ...)` で、`--ripple-r` を中心半径として `transparent calc(var(--ripple-r) - 6%)`、`rgba(31, 58, 95, 0.18) var(--ripple-r)`、`transparent calc(var(--ripple-r) + 6%)` を描く。`animation: ripple 9s ease-out infinite` により、`--ripple-r` は `0%` から `120%` へ広がり、`opacity` は `12%` 時点で `0.85`、`70%` 以降は `0` になる。

`@media (prefers-reduced-motion: reduce)` では `.stageInner::after` の `animation` を止め、`opacity: 0` にする。

## リンクレール

下部リンクは `index.tsx` の `additionalLinks` から生成される。`.linkRail` は `display: grid`、`grid-template-columns: repeat(3, minmax(0, 1fr))`。

現在のリンクは次の 3 件。

- `App overview`: Docusaurus `Link` で `/docs/apps/hatsugo/overview` へ遷移する。
- `Company`: Docusaurus `Link` で `/docs/company/overview` へ遷移する。
- `Contact`: 通常の `<a>` で `mailto:info@odokura.jp` へ遷移する。

`.railLink` は `display: flex`、`align-items: center`、`justify-content: space-between`、`gap: 0.75rem`、`padding: 1rem`、`color: #1a1a1a !important`、`font-size: 0.8rem`、`letter-spacing: 0.12em`、`text-transform: uppercase`、`transition: background 0.2s ease`。`.railLink::after` で `+` を表示する。

リンク面は 3 段のフラット色で、hover 時はそれぞれ一段深くなる。

- 1 件目: 通常 `#e6e1d6`、hover `#ddd7c9`
- 2 件目: 通常 `#e3ddd1`、hover `#dad3c4`
- 3 件目: 通常 `#e0dacd`、hover `#d7d0c0`

## レスポンシブ

`@media (max-width: 640px)` では、トップページの構成を縦方向に詰める。

- `.page` と `.stage` の `padding` は `0.75rem`。
- `.frame` の `min-height` は `calc(100vh - 1.5rem)`。
- `.frameBar` は `flex-direction: column`、`align-items: flex-start`。
- `.stageOuter` は `min-height: 42vh`、`padding: 0.65rem`。
- `.linkRail` は `grid-template-columns: 1fr`。
