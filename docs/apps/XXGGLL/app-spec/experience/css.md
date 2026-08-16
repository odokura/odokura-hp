---
title: XXGGLL CSS実装仕様
sidebar_label: CSS実装仕様
sidebar_position: 31
draft: true
---

# XXGGLL CSS実装仕様

## 1. この仕様の役割

この文書は、デザインを説明する文書ではない。実際にCSSを書くときの責務、ファイル、token、selector、状態、responsive、検証条件を固定する実装仕様である。

対象は `C:\dev\xxrrgg\app` の実装CSSとする。世界観の意味は[世界観コンセプト](../../concept/foundation/worldview.md)、画面の読み順と利用者の判断は[UX仕様](./ux.md)、変更の承認と運用は[デザイン運用](./design-operations.md)を正本とする。

本書で定義していない新しいCSSを、画面ファイルへ自由に足してはならない。まず既存の責務へ置けるか確認し、置けない場合だけこの仕様とファイル構成を更新する。

## 2. CSSが壊れていた原因と再設計

| 原因 | 起きていたこと | 現在の設計 |
| --- | --- | --- |
| tokenの多重所有 | `base.css`、`public/world.css`、`private/tokens.css`、`private/frame.css`が別々の色体系を持ち、同じDOMを上書きした | 初期値は`foundation/tokens.css`の`:root`だけ。旧名は同ファイルのaliasだけ |
| Privateの別テーマ | Home、Creator、Opsが同じ操作面なのに、Homeだけ明色のframeを持っていた | `shell/private.css`が`data-shell="public"`以外を一つの暗色frameで担当 |
| 巨大な共通ファイル | `components.css`に設定、Creator、Ops、Public entry、responsive、primitiveが混在した | `components.css`はimport index。実体を責務別ファイルへ分割 |
| 記録カードの重複 | ArchiveとDetailが`.xxggll-card`をそれぞれ再定義し、radius、shadow、pseudo elementが競合した | `components/record.css`がカードの唯一のowner。画面CSSは配置と画面固有状態だけ |
| legacy aliasの再束縛 | `--home-*`や`--world-*`が画面ごとに再定義されていた | aliasは`:root`から`--xx-*`を参照し、routeで再束縛しない |
| ファイルの境界不在 | 何をどこへ追加すべきか決められず、既存selectorへ継ぎ足していた | foundation / shell / components / public route / private routeの5層に固定 |

## 3. 正本ファイルとimport順

CSSの入口は `C:\dev\xxrrgg\app\globals.css` だけである。import順は依存方向を表す。

```css
@import "./styles/foundation/tokens.css";
@import "./styles/foundation/reset.css";
@import "./styles/shell.css";
@import "./styles/shell/private.css";
@import "./styles/public/landing.css";
@import "./styles/public/homepage.css";
@import "./styles/components.css";
@import "./styles/public/navigation.css";
@import "./styles/public/world.css";
@import "./styles/public/flow.css";
@import "./styles/public/auth.css";
@import "./styles/public/record.css";
@import "./styles/public/guides.css";
@import "./styles/public/pricing.css";
@import "./styles/private/records.css";
@import "./styles/private/home-layout.css";
@import "./styles/private/dashboard.css";
@import "./styles/private/detail.css";
@import "./styles/private/activity.css";
```

### 3.1 責務表

| 層 | ファイル | owner |
| --- | --- | --- |
| foundation | `styles/foundation/tokens.css` | `--xx-*`の初期値、色、font、space、radius、motion、rank、card token。旧`--color-*` / `--world-*` / `--home-*`は移行aliasだけ |
| foundation | `styles/foundation/reset.css` | box sizing、html、body、link、focus、formの基礎 |
| shell | `styles/shell.css` | Public/Private共通のheader、nav、main、footerの構造 |
| shell | `styles/shell/private.css` | Public以外の共通frame。Home、Creator、Opsの別テーマを作らない |
| component index | `styles/components.css` | importだけ。宣言を書かない |
| component | `styles/components/foundation.css` | panel、form、button、notification、table、account primitive |
| component | `styles/components/record.css` | `.xxggll-card`とカード内部部品。Archive/Detail共通 |
| component | `styles/components/settings.css` | 設定一覧、設定行、profile、consent |
| component | `styles/components/creator.css` | audience、expression、offering、revenue、payout |
| component | `styles/components/ops.css` | Ops queue、case、user、creator surface |
| component | `styles/components/public-entry.css` | Public guide、entry card |
| component | `styles/components/responsive.css` | 共通componentの狭幅、reduced motion、forced colors |
| public route | `styles/public/*.css` | Publicページの固有layoutと状態。共通primitiveを再定義しない |
| public route | `styles/public/flow.css` | 七段階のフローと代表UI。料金、ガイド、記録のCSSを持たない |
| private route | `styles/private/records.css` | Archive、issuance、history、transaction、detail data layout |
| private route | `styles/private/detail.css` | Home overview、attention、primary collection、detail heroの画面固有layout |

`styles/base.css`、`styles/private/tokens.css`、`styles/private/frame.css`は旧import互換の薄いentryであり、`globals.css`から直接importしない。新規宣言をここへ追加してはならない。

## 4. token契約

### 4.1 owner

初期値を宣言できるのは `styles/foundation/tokens.css` の `:root` だけである。route selectorの内部で、色、shadow、font、radiusのtokenを再定義してはならない。

新規CSSは `--xx-*` を使う。旧画面の段階移行中だけ `--color-*`、`--world-*`、`--home-*`を使ってよいが、値はfoundationのaliasから取得し、画面側で上書きしない。

主要tokenは次のとおりである。

```css
:root {
  --xx-canvas: #050806;
  --xx-surface: #0a100c;
  --xx-surface-raised: #111a13;
  --xx-surface-muted: #182019;
  --xx-text: #f3f7ef;
  --xx-muted: #a7b0a6;
  --xx-line: rgba(243, 247, 239, .2);
  --xx-line-strong: rgba(243, 247, 239, .48);
  --xx-signal: #c9ff3d;
  --xx-signal-ink: #071000;
  --xx-cool: #5de0e6;
  --xx-heat: #ff5ca8;
  --xx-success: #7ce6a7;
  --xx-warning: #ffd27a;
  --xx-danger: #ff8f82;
  --xx-rank-free: #d9e1d7;
  --xx-rank-standard: #c9ff3d;
  --xx-rank-advanced: #5de0e6;
  --xx-rank-elite: #c8a7ff;
  --xx-rank-vip: #ffd27a;
  --xx-rank-extravip: #ff8fbd;
  --xx-card-depth: 0 1rem 2.5rem rgba(0, 0, 0, .38);
  --xx-card-radius: 0;
  --xx-radius-0: 0;
  --xx-radius-1: 2px;
  --xx-radius-2: 4px;
  --xx-motion-fast: 120ms;
  --xx-motion-normal: 180ms;
  --xx-motion-signal: 420ms;
}
```

### 4.2 デザインの再検討結果

- 標準面は `--xx-canvas` / `--xx-surface` / `--xx-surface-raised` の暗色面を使う。
- 境界は1pxの `--xx-line` または `--xx-line-strong`。大きな角丸、白いカード、常時強いdrop shadowは使わない。
- radiusは0、2px、4pxだけを基準とする。記録カードは0pxを標準とする。
- 明転は背景色を別テーマへ切り替えず、境界、surface-raised、text、signalの差分で表現する。
- glow、scanline、glitch、強いshadowはfoundationやbodyへ置かず、対象selectorへ明示的に書く。
- 記録カードのランク色は`record.css`で直接hexを書かず、`--xx-rank-*`を参照する。

## 5. selectorとDOM契約

### 5.1 shell

既存AppShellが出力するclassと`data-shell`を使う。新しいshell variantを増やす前に、既存の共通frameで表現できるか確認する。

| selector | 担当 |
| --- | --- |
| `.app-shell` | shell全体の最小構造 |
| `.public-landing-shell` | Publicの表示領域 |
| `.home-world-shell` | Homeの既存互換class。新しいworld token ownerにはしない |
| `.shell-studio` | CreatorのURL/実装互換class。新しい共通概念名として増やさない |
| `.shell-ops` | Opsの既存shell class |
| `.app-shell:not([data-shell="public"])` | Home、Creator、Opsに共通するPrivate frame |

`data-shell="studio"`は既存ルート互換のため残ることがあるが、CSSの新しい大分類としてStudioを増やしてはならない。Creatorの画面差分が必要な場合だけ、Creator routeの固有selectorで表現する。

### 5.2 共通部品

2画面以上で使うselectorは `styles/components/` に置く。画面固有のレイアウトは `styles/public/` または `styles/private/` に置く。

```html
<section class="workspace-panel">
  <header class="workspace-section-head">
    <h2>区画タイトル</h2>
    <p>補助説明</p>
  </header>
</section>

<a class="xxggll-card" data-rank="elite" href="/fan/supports/example">
  <div class="xxggll-card-topline">...</div>
  <div class="xxggll-card-core">...</div>
  <div class="xxggll-card-ledger">...</div>
  <div class="xxggll-card-open">...</div>
</a>
```

`.xxggll-card`の背景、border、rank color、hover、pseudo elementは `components/record.css`だけが所有する。`private/detail.css`や`private/records.css`で同じselectorの見た目を上書きしない。

状態は新しいclassを増やすのではなく、既存の`data-status`、`data-rank`、ARIA状態を使う。操作対象であることを表すhoverは `:hover` と `:focus-visible` の双方を確認し、装飾だけの要素を操作対象に見せない。

## 6. responsiveと状態

### 6.1 breakpoint

既存CSSのbreakpointを維持する。

| breakpoint | 契約 |
| --- | --- |
| 1000px | Home command、library header、detail heroの列を再構成 |
| 900px | shellとdetail/attentionの列を縮退 |
| 720px | component grid、form、table周辺を1列化。操作targetは44px以上 |
| 560px | Public heroと長い説明面を1列化 |
| 390px | record ledger、facts、summaryを分割 |
| 360px | 最小幅の文字サイズと余白を調整 |

新しいbreakpointを追加する場合は、既存breakpointで表現できない理由をCSS仕様書へ追記する。画面ごとに任意の幅を増やしてはならない。

### 6.2 reduced motion / forced colors

`prefers-reduced-motion: reduce`では、transform、カードhoverの浮上、loading animation、装飾アニメーションを止める。内容、境界、操作可能性は残す。

`forced-colors: active`では、背景画像、gradient、装飾pseudo element、shadowを無効化し、`Canvas`、`CanvasText`、`Highlight`などのシステム色と境界で情報構造を残す。

## 7. CSS追加手順

1. 追加するselectorが2画面以上で使われるか確認する。
2. tokenだけで表現できるか確認し、hex、rgba、shadow、radiusの直書きを増やさない。
3. componentなら `styles/components/`、Public固有なら `styles/public/`、Private固有なら `styles/private/`へ置く。
4. 同じselectorが別ファイルに既にないか検索する。
5. 既存のresponsive、reduced motion、forced colorsを更新する。
6. `npm run typecheck`と`npm test`を実行する。
7. `git diff --check`とCSSファイルの行数を確認し、500 physical linesを超えるファイルは責務を分割する。

## 8. 受け入れ条件

### 静的条件

- `app/globals.css`はimportだけで、画面宣言を持たない。
- tokenの初期値は`foundation/tokens.css`だけにある。
- `components.css`はimport indexであり、巨大な共通宣言を持たない。
- `.xxggll-card`のownerは`components/record.css`だけである。
- `styles/base.css`、`private/tokens.css`、`private/frame.css`へ新規宣言がない。
- Public以外のshellに明色paletteや別の`--color-*`再束縛がない。
- CSSファイルは一つの責務を持ち、500 physical lines未満である。

### 動作条件

- Home、Creator、Opsの標準面が同じ暗色surface、境界、form、button規則で表示される。
- 記録カードはArchiveとDetailで同じborder、radius、rank色、hover規則を使う。
- 720px以下で主要gridとformが破綻せず、操作targetが44px以上である。
- keyboard focus、reduced motion、forced colorsで内容と操作を維持する。
- `npm test`が全件成功し、CSS契約テストが古い明色Private frameを要求していない。

## 9. 変更時の判断

新しい視覚表現を追加する前に、次の順で判断する。

1. 既存tokenと既存componentで表現できるか。
2. 既存componentのmodifierで表現できるか。
3. 画面固有のlayoutとしてroute CSSへ限定できるか。
4. それでも不足する場合だけ新しいtokenまたはcomponentを追加し、この仕様書の責務表と受け入れ条件を同時に更新する。

見た目を良くするために、別palette、別radius体系、別shell、別巨大ファイルを追加してはならない。
