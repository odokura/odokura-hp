---
title: XXGGLL デザイン仕様
sidebar_label: デザイン仕様
sidebar_position: 30
draft: true
---

# XXGGLL デザイン仕様

## 1. 目的と適用範囲

本書は、XXGGLLの画面を同じ視覚結果へ実装するためのデザイン契約である。対象は、色、文字、余白、面、罫線、番号、状態、ボタン、リンク、表、フォーム、特殊効果、レスポンシブの表示結果である。

画面の目的・導線は[UX](./ux.md)、ルート・read model・認可・業務状態は[画面台帳](./screen-catalog.md)、CSSファイル・DOM・selector・移行順は[CSS実装仕様](./css.md)、変更手順は[デザイン運用](./design-operations.md)を正本とする。

本書はコンセプトを説明しない。[世界観コンセプト](../../concept/foundation/worldview.md)は、ゲーム・サイバー・セックスというモチーフの意味だけを定義し、本書はそれを「どの画面のどの部品へ、どの効果として適用するか」へ変換する。

## 2. 視覚結果の不変条件

| ID | 実装結果 |
| --- | --- |
| D-01 | 対象、現在状態、条件、主操作、境界は、装飾を無効にしても同じ順序で読める。 |
| D-02 | Public、Home、Creator管理、Opsは同じトークンと部品を使う。シェルごとの別テーマを作らない。 |
| D-03 | 標準画面は暗い面、1px境界、番号、罫線、透過面で構成し、大きな角丸・強いshadow・浮遊カードを使わない。 |
| D-04 | 状態は、状態名と形状を必ず表示し、色・発光・アニメーションだけで伝えない。 |
| D-05 | 番号、発行No、時刻、基準時刻はデータまたは読み順を示す場合だけ表示する。装飾用の数字を追加しない。 |
| D-06 | グリッチ、走査線、発光は、画面が宣言した特殊モードの範囲内だけに置く。Opsには置かない。 |
| D-07 | hover/focusは操作対象の反応であり、静止画面の常時装飾ではない。 |
| D-08 | 性的な連想は、熱色・距離・透過・共有境界で表現し、性的サービス、出会い、返信、面会を想起させるUI文言や演出に変換しない。 |

## 3. 画面モード

画面のルート要素は`data-ui-mode`を一つだけ持つ。未指定は`standard`とする。モード名の追加は本書と[CSS実装仕様](./css.md)を同時に変更する。

| `data-ui-mode` | 適用画面 | 許可する効果 | 効果の上限 |
| --- | --- | --- | --- |
| `standard` | Home、Creator管理、通常のFan画面、Public説明・認証 | 罫線、透過面、状態ランプ、操作時の明転 | 常時animation 0。発光0。 |
| `signal-stage` | Publicトップの代表領域 | 背景走査線、1箇所の微光、短いglitch | scanline opacity 0.04以下、glow 1箇所、glitch 1層 |
| `artifact-focus` | 一件のXXGGLL詳細、取得確認 | 主対象枠の内側の微光、番号の明転 | 背景全体へblur/glowを漏らさない |
| `intimate-boundary` | プロフィール共有、VIP・別契約の境界 | 熱色、透過境界面、静かな明転 | 熱色を主面の10%を超えて使用しない |
| `operation` | Opsの全画面 | 罫線、状態ランプ、focus輪郭 | scanline、glitch、glow、常時animationは0 |

モードは画面全体の演出を許可するが、各効果は要素単位で明示的に付与する。`signal-stage`だからといって、すべての子要素へglowを継承させない。

## 4. トークン契約

token名の意味は本書、値は[CSS実装仕様](./css.md)の`foundation/tokens.css`だけが所有する。シェルごとに同名tokenを再定義してはならない。

| token群 | 用途 | 使用範囲 |
| --- | --- | --- |
| `--xx-canvas`、`--xx-surface*` | canvas、panel、raised panel、muted面 | 面とlayout |
| `--xx-text`、`--xx-muted` | 本文、補助文、disabled | 文字 |
| `--xx-line`、`--xx-line-strong` | 罫線、境界、input | 境界 |
| `--xx-signal`、`--xx-cool`、`--xx-heat` | 主操作、ID、性的連想を含む境界 | semanticな部品だけ |
| `--xx-success`、`--xx-warning`、`--xx-danger` | status、validation、失敗 | 状態表示 |
| `--xx-focus` | keyboard focus | focus-visibleだけ |
| `--xx-space-*`、`--xx-radius-*` | 余白と角丸 | layoutと部品 |
| `--xx-motion-*` | hover、focus、特殊効果の時間 | animationとtransition |

CSS実装仕様にないtokenを追加しない。正確なhex、alpha、spacing、radius、durationを変更する場合は、デザイン仕様とCSS実装仕様を同じ変更で更新する。

本文・通常文字は4.5:1以上、UI部品と状態を識別する非テキスト境界は3:1以上を確認する。[WCAG 2.2 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum)と[1.4.11](https://www.w3.org/TR/WCAG22/#non-text-contrast)を基準にし、装飾のために透明度を下げてはならない。

## 5. 部品の表示契約

### 5.1 面と境界

| 部品 | 通常 | hover/focus | disabled / processing |
| --- | --- | --- | --- |
| `.xx-panel` | `background: var(--xx-surface)`、1px `--xx-line` | 非操作面は反応しない。操作面だけinteractive modifierを付ける | 面・文字の意味を変えず、操作不能を`opacity`だけで表さない |
| `.xx-panel--raised` | `--xx-surface-raised`、1px `--xx-line` | 非操作面は反応しない。操作面だけモザイク明転を許可 | animation停止、現在値を維持 |
| `.xx-boundary` | 左境界または上下罫線で範囲を示す | 反応なし | 説明文を消さない |
| `.xx-divider` | 1pxの罫線 | 反応なし | 反応なし |

角丸は`0〜4px`のみ。`border-radius: 6px`以上、全面blur、全面gradientを共通部品へ追加しない。

### 5.2 文字と番号

| 用途 | font | size / line-height | color |
| --- | --- | --- | --- |
| 本文 | `Noto Sans JP`, `Yu Gothic UI`, `Meiryo`, system sans | 16px / 1.75 | `--xx-text` |
| 補助文 | 本文と同じ | 13px / 1.6 | `--xx-muted` |
| 認証後画面の`h1` | `Noto Sans JP`, `Yu Gothic UI`, system sans | 32px / 1.25、800。767px以下は28px | `--xx-text` |
| Public下層の`h1` | 認証後画面と同じ | 40px / 1.2、800。767px以下は32px | `--xx-text` |
| Publicトップのhero | 認証後画面と同じ | `clamp(40px, 5vw, 64px)` / 1.05、800 | `--xx-text` |
| 区画`h2` | 認証後画面と同じ | 22px / 1.4、700 | `--xx-text` |
| 区画内`h3` | 認証後画面と同じ | 17px / 1.5、700 | `--xx-text` |
| 主要指標 | 本文または数値用system sans | 28px / 1.2、700を上限 | `--xx-text` |
| 番号・ID・時刻 | `ui-monospace`, `Consolas`, monospace | 12px / 1.4 | `--xx-cool`または`--xx-muted` |
| 状態名 | 本文またはmono | 12px以上 / 1.4 | 状態色 + 文字 |

見出しを英大文字だけにして意味を隠さない。番号・IDのfontを本文全体へ適用しない。認証後の業務画面へPublic heroの文字サイズを適用せず、ページ固有のfont-family、font-size、line-heightを追加しない。

### 5.3 状態ランプ

DOMは次の順序を持つ。

```html
<span class="xx-status" data-status="open">
  <span class="xx-status__lamp" aria-hidden="true"></span>
  <span class="xx-status__label">公開中</span>
</span>
```

`data-status`は`open`、`active`、`pending`、`attention`、`error`、`closed`、`draft`のいずれかとする。状態の意味は画面台帳に従い、色は次の補助に使う。

| 状態 | 形 | 色 |
| --- | --- | --- |
| `open` / `active` | 常時表示の丸ランプ | `--xx-success` |
| `pending` / `draft` | 中空の角ランプ | `--xx-warning` |
| `attention` | 短い横バー | `--xx-warning` |
| `error` | 四角ランプ | `--xx-danger` |
| `closed` | 消灯した輪郭 | `--xx-muted` |

### 5.4 操作部品

| selector | 通常 | hover | focus-visible | disabled |
| --- | --- | --- | --- | --- |
| `.xx-button`, `.xx-button-primary` | min-height 44px、padding 12px 16px、1px境界、`--xx-signal`面 | モザイク明転、文字位置不変 | 3px `--xx-focus` outline、2px offset | `cursor: not-allowed`、処理中表示、モザイクなし |
| `.xx-button-secondary` | 透明面、`--xx-line-strong`境界 | モザイク明転、境界を明るくする | 同上 | 同上 |
| `.xx-button-danger` | `--xx-danger`境界、透明面 | 危険色の面を一度だけ明転 | 同上 | 同上 |
| `.xx-link` | 下線または番号で移動対象を示す | モザイクまたは`--xx-signal`文字 | outlineを表示 | disabledリンクを作らず、状態をテキストで示す |

確定操作のPrimaryは1画面1つ。危険操作は通常操作と隣接させず、確認区画へ置く。

### 5.5 表と一覧

```html
<div class="xx-table-wrap">
  <table class="xx-table">
    <thead>...</thead>
    <tbody>
      <tr class="xx-table__row" data-interactive="true">...</tr>
    </tbody>
  </table>
</div>
```

`data-interactive="true"`の行だけhover/focusのモザイク明転を使う。情報表示だけの行へ一律に付与しない。デスクトップでは列を維持し、767px以下では対象・状態・主操作を先頭に残した行形式へ変換する。

## 6. 特殊効果

| 効果 | selector | 実装値 | 禁止 |
| --- | --- | --- | --- |
| 走査線 | `.xx-effect-scanline` | `repeating-linear-gradient`、1px線、opacity 0.04以下、pointer-events none | 本文、フォーム、表全体への適用 |
| 微光 | `.xx-effect-glow` | `box-shadow: 0 0 24px var(--xx-signal)`を1要素1つまで | `body`、ナビ全体、複数の面の連鎖 |
| glitch | `.xx-effect-glitch` | pseudo-element 1層、420ms以下、初回表示で自動再生しない | Ops、価格・確定金額、エラー本文、常時loop |
| heat | `.xx-effect-heat` | `--xx-heat`のborderまたは短いlabelだけ | 背景全面、Primaryボタン、状態ランプ |

特殊効果は視覚的に無効化してもレイアウトが変わらない。`prefers-reduced-motion: reduce`ではglitch・scanline・順次明転を無効化し、色・境界の即時変化にする。

## 7. レスポンシブ契約

| viewport | shell | 本文 | 操作 |
| --- | --- | --- | --- |
| `>= 1024px` | 認証後は左サイドバー240px。Publicは上部ナビ | 共通上限1180px。Creator管理は[Creator管理](./creator-management/overview.md)の960px・左端固定variant | inline配置可。主操作は右上または主対象の直後 |
| `768px–1023px` | 上部ヘッダー、必要なら横スクロールナビ | 1列、補助区画は主対象の下 | ボタンは折返し、表は対象列を優先 |
| `<= 767px` | 上部ヘッダー + 画面固有の下部ナビ | 1列、左右16px | 操作幅44px以上、主操作は横幅100%可 |
| `320px` | 同じ順序 | 文字切れ、重なり、横スクロールなし | エラーとPrimaryを画面内で完了 |

ブレークポイントごとに新しいレイアウト型を作らず、同じDOMのgrid/flex方向・gap・幅だけを変更する。

## 8. CSS実装の完了条件

- [CSS実装仕様](./css.md)のファイル責務、import順、selector命名、DOM契約に一致している。
- `data-ui-mode`がない画面へ特殊効果を追加していない。
- `button`、`.xx-link`、`data-interactive="true"`の表行で、hover/focus-visibleの状態が一致している。
- `data-status`の状態名・形・色が表と一致している。
- 320px、390px、1440pxで、対象 → 状態 → 主操作の順序が変わらない。
- reduced motion、forced colors、キーボードで、状態・操作・focusが失われない。
- 新しい直接色値、shadow、gradient、radius、`!important`がCSS実装仕様の例外台帳にない。
- 既存の`studio-*`は画面の表示ラベル・新規selectorへ使用していない。URL互換は画面台帳の移行契約だけに残す。

## 9. 参照

- [世界観コンセプト](../../concept/foundation/worldview.md)
- [UX](./ux.md)
- [画面台帳](./screen-catalog.md)
- [CSS実装仕様](./css.md)
- [デザイン運用](./design-operations.md)
