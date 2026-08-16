---
title: XXGGLL デザイン運用
sidebar_label: デザイン運用
sidebar_position: 32
draft: true
---

# XXGGLL デザイン運用

## 1. 目的と責務

本書は、デザインとCSSを変更するときの変更記録、検証、レビュー、合否、切り戻しを定義する運用仕様である。視覚の正解は[デザイン仕様](./design.md)、CSSの実装契約は[CSS実装仕様](./css.md)、利用者の導線と状態は[UX](./ux.md)および[画面台帳](./screen-catalog.md)が所有する。

本書に、色、装飾、画面モード、コンポーネントの見た目を追加しない。運用上それらが不足している場合は、所有する正本を更新し、その変更を本書の検証対象へ追加する。

## 2. 変更前に作る記録

実装や仕様変更を始める前に、変更記録をIssueまたは作業ブランチへ作成する。空欄のまま実装を開始してはならない。

```text
## Design change record

Owner:
Implementer:
Independent reviewer:
Risk: T0 / T1 / T2 / T3
Date:

Routes:
Components:
Roles / boundary:
data-shell:
data-ui-mode:

Canonical sources:
- Screen catalog:
- UX:
- Design:
- CSS implementation:

Changed selectors / tokens:
States:
Primary action:
Out of scope:
Rollback unit:
```

`Out of scope`には、今回触らないURL、業務状態、認可、データ、旧`/studio`互換ルートなどを明記する。仕様変更と既存実装の移行を同じ完了扱いにしない。

## 3. 変更リスクの分類

| 分類 | 対象 | 必須の証拠 | 完了条件 |
| --- | --- | --- | --- |
| `T0` | Markdown、文言、リンク、CSSコメントだけ | diff、リンク検査、MDX検査 | 文書検証がPASS |
| `T1` | 既存token、primitive、単一画面の静的見た目 | diff、静的CSS検査、1440/390/320の実画面 | 対象状態とfocusがPASS |
| `T2` | shell、共通部品、mode、responsive、複数画面 | T1、typecheck、test、accessibility、全状態、独立レビュー | 全マトリクスとレビューがPASS |
| `T3` | Public、認証、Creator管理、Ops、権限、プロフィール開示、決済、役務境界 | T2、正本照合、失敗・再試行・競合・監査、所有者確認、CI | release gateがPASS |

迷ったら上位に分類する。見た目だけの変更でも、利用者が状態、料金、権限、共有範囲、役務を誤認する可能性があれば`T3`とする。

## 4. 作業手順

### 4.1 正本と現状を確認する

次の順で読む。画面台帳にない状態を、CSSの都合で新設してはならない。

1. [画面・体験仕様の概要](./overview.md)
2. [画面台帳](./screen-catalog.md)
3. [UX](./ux.md)
4. [デザイン仕様](./design.md)
5. [CSS実装仕様](./css.md)
6. 影響する`core`、`security`、個別画面仕様

次の現状差分を記録する。

| 確認 | 記録するもの |
| --- | --- |
| route | URL、互換route、画面rootの`data-shell` |
| DOM | `data-ui-mode`、state attribute、primary action、interactive要素 |
| CSS | import元、token所有者、selector所有者、旧`studio-*`の残存 |
| 状態 | loading、empty、processing、pending、success、attention、error、conflict、expired、unauthorized |
| 境界 | 未認証、Fan、Creator owner/staff、admin、Ops、公開範囲 |

### 4.2 仕様を先に更新する

次の変更は、それぞれの正本を先に更新する。

| 変更 | 更新する正本 |
| --- | --- |
| 利用者の問い、導線、表示順、画面責務 | UX、画面台帳 |
| token、primitive、button/table/statusの状態、効果上限 | デザイン仕様、CSS実装仕様 |
| CSSファイル、DOM、selector、import、breakpoint、検証ケース | CSS実装仕様 |
| 変更の証拠、合否、レビュー、切り戻し | 本書 |
| 認可、read model、個人情報、監査、役務境界 | `core`、`security`、各正本 |

同じ値・状態・手順を複数文書へ複製しない。参照先が変わった場合はリンクを直し、要約側に別の値を残さない。

### 4.3 実装前の機械検査

CSS変更前に、既存のtoken・primitive・effectを検索する。出力に秘密値、Cookie、個人情報を含めない。

```powershell
rg -n -- "--xx-|--color-|--home-|color:|background:|border:|box-shadow|filter|gradient|animation|@media" app/styles app/globals.css
rg -n -- "\.site-header|\.site-nav|\.brand|\.button|\.data-table|studio-|shell-" app/styles app
```

次のいずれかを追加する場合、T1以上として扱う。

- token以外の直接色値、shadow、gradient、filter、animation
- 新しいshell、mode、status、button variant
- `.xx-*`以外の共通selector
- hoverだけで意味を変える規則
- 320px、focus-visible、reduced motion、forced colorsに関する規則

### 4.4 実装と局所検証

CSS実装は[CSS実装仕様](./css.md)の移行順に従い、token、shell、primitive、effect、routeの順に進める。一つの変更で複数の移行段階を跨がない。

最低限のローカル検証は次のとおりとする。リポジトリで利用可能なコマンドだけを実行し、未実行は合格扱いにしない。

```powershell
git diff --check
npm run typecheck
npm test
```

CSS、focus、form、状態表示に影響する場合は次も実行する。

```powershell
npm run accessibility:check
```

`npm run test:integration`と`npm run build`はCIで実行する。ローカル未実行を理由に無条件でFAILとはしないが、CI結果がない間は`NOT VERIFIED`とする。

### 4.5 実画面の確認

次の組み合わせを、変更した画面と共通部品の全てで確認する。

| 軸 | 必須値 |
| --- | --- |
| viewport | 1440px、1024px、768px、390px、320px |
| mode | `standard`、影響する特殊mode、`operation` |
| state | 初期、loading、empty、正常、processing、pending、success、attention、error、再試行、conflict、expired |
| identity | 未認証、Fan、Creator owner、Creator staff、admin、Ops |
| input | mouse hover、keyboard focus-visible、touch、reduced motion、forced colors |

各ケースに期待結果と観測結果を残す。

```text
Route:
Viewport:
Role / session:
Mode:
State:
Input / preference:
Expected:
Observed:
Primary action:
Boundary or disclosure checked:
Screenshot / browser evidence:
Result: PASS / FAIL / NOT VERIFIED / BLOCKED / WAIVED
```

スクリーンショットは実装リポジトリの`docs/design-evidence/<issue-or-pr-id>/`へ保存する。秘密値、Cookie、実利用者の個人情報、決済秘密情報を保存しない。証拠が不要なT0を除き、実画面を見ていない状態で`PASS`を付けない。

## 5. CSS合否基準

### 5.1 機械検査

| 検査 | PASS条件 |
| --- | --- |
| import | `app/globals.css`がCSS実装仕様の順序と一致 |
| token | `--xx-*`の定義はtokenファイルだけ。route再定義なし |
| selector | 共通primitiveの所有ファイルが一つ。旧selectorの残存理由が記録済み |
| effect | `standard`と`operation`にscanline、glitch、glowがない |
| legacy | 新規`studio-*`、旧shell名、直接色値、`!important`が例外台帳なしにない |
| diff | `git diff --check`が成功 |

### 5.2 実画面

| 対象 | PASS条件 |
| --- | --- |
| 情報順 | 対象、状態、条件、主操作が装飾なしでも同じ順序で読める |
| state | 状態名と形状があり、色・発光・animationを無効にしても意味が残る |
| action | primaryは画面1つ、44px以上、disabled/processingで二重送信できない |
| focus | keyboardで現在位置が見え、focus輪郭が遮蔽されない |
| responsive | 320pxで横スクロール、重なり、主要操作の画面外化がない |
| motion | reduced motionでglitch、scanline、順次明転が止まり、情報が残る |
| forced colors | 境界、status、focus、disabledの意味が残る |
| boundary | 未認証、権限外、共有範囲、Opsに誤認させる演出がない |

### 5.3 判定値

| 判定 | 意味 | 完了可否 |
| --- | --- | --- |
| `PASS` | 必須検証が実施され、期待結果と観測結果が一致 | 完了可 |
| `FAIL` | 期待結果と不一致。修正して再検証する | 不可 |
| `NOT VERIFIED` | 必要な画面、状態、CI、レビューの証拠が不足 | 不可 |
| `BLOCKED` | 認証、環境、外部サービス、テストデータなどが不足 | 不可。再開条件が必要 |
| `WAIVED` | 責任者、理由、期限、代替防御が記録された例外 | 所有者確認が必要 |

「見た目は問題なさそう」「既存と同じ」「CIをまだ見ていない」は判定理由にならない。

## 6. 独立レビュー

実装者と別の観点で、差分を次の順に読む。一人運用の場合も、実装を止めて別のレビュー工程として時間を分け、レビュー記録を残す。

1. 正本の責務境界：UX、デザイン、CSS、運用が混ざっていないか
2. 実装契約：DOM、selector、token、import、breakpointがCSS実装仕様と一致するか
3. 状態：正常、空、処理中、失敗、再試行、競合、期限切れ、権限なしがあるか
4. 入力：hoverだけでなくfocus-visible、keyboard、touchで成立するか
5. 環境：320px、reduced motion、forced colors、dark/light設定差があるか
6. 境界：公開、認証、Creator管理、Ops、プロフィール開示、決済、役務を誤認させないか
7. 証拠：コマンド出力、実画面、CI、未検証、切り戻し条件が記録されているか

findingは次の形式で記録する。

```text
Severity: S0 / S1 / S2 / S3
Location: file, selector, route, or state
Failure condition:
Impact:
Minimal correction:
Required re-check:
```

「好みではない」「もっと派手に」はfindingにしない。仕様のID、失敗条件、利用者影響へ変換できる場合だけ記録する。

## 7. release gate

次の一つでも該当する場合、変更を完了・リリース可と報告してはならない。

- 正本同士が矛盾し、どの文書を直すか決まっていない。
- DOMまたはselectorがCSS実装仕様と異なる。
- T2/T3でtypecheck、test、accessibility、実画面、独立レビューのいずれかが未実施・失敗。
- CIのintegration/buildが未確認なのに`PASS`としている。
- 320pxで主要操作、状態、エラーが確認できない。
- focus、reduced motion、forced colorsで情報または操作が失われる。
- standardまたはOpsへ特殊効果が漏れている。
- 旧Creator管理表示、旧shell名、旧selectorが移行課題として記録されていない。
- 変更理由、影響範囲、切り戻し単位が残っていない。

## 8. 切り戻し

### 8.1 CSSだけの変更

1. 失敗したviewport、route、state、roleを変更記録へ追記する。
2. 新しいeffect、route import、primitive変更のうち、失敗した単位だけを無効化する。
3. 旧CSSへ戻す場合は、旧importと新importを同時に有効にしない。
4. `git diff --check`、typecheck、test、影響画面の実画面確認を再実行する。
5. 切り戻し後の状態を`PASS`ではなく、原因修正前は`NOT VERIFIED`として残す。

### 8.2 DOMまたは状態契約を含む変更

DOM、認可、業務状態をCSSだけで隠してはならない。CSS変更を切り戻した後も、利用者データ、URL、監査記録を破壊しない。状態契約が壊れている場合は、実装の切り戻しと正本の修正を別の変更として扱う。

### 8.3 特殊効果の緊急停止

特殊効果が可読性、操作、Ops、エラー表示を損なった場合、効果のimportまたはmode付与だけを停止できる構造にする。効果停止後も、境界、status、focus、主要操作、エラー文言が残ることを確認する。

## 9. 定期監査

次のいずれかの時点で、CSS実装仕様との乖離を監査する。

- T2/T3の変更を完了するとき
- CSS変更が5件累積したとき
- `studio-*`または重複shell selectorが見つかったとき
- 同じレビューfindingが2回発生したとき

監査では次を確認する。

```powershell
rg -n -- "--xx-|--color-|--home-" app/styles app/globals.css
rg -n -- "studio-|\.site-header|\.site-nav|\.brand|!important" app/styles app
rg -n -- "data-shell=|data-ui-mode=|data-status=|data-interactive=" app
```

同じfindingが2回発生した場合、運用で注意喚起するだけで終わらせず、CSS実装仕様、受け入れ条件、またはDOM契約を更新する。

## 10. 変更記録の完了テンプレート

```text
## Verification result

Risk: T0 / T1 / T2 / T3
Changed files:
Changed routes / components:
Canonical references:

### Static
- git diff --check:
- npm run typecheck:
- npm test:
- npm run accessibility:check:
- CI integration/build:

### Runtime matrix
- 1440px:
- 1024px:
- 768px:
- 390px:
- 320px:
- keyboard / focus-visible:
- prefers-reduced-motion:
- forced-colors:

### Review
- Independent reviewer:
- Findings:
- Responses:
- Unresolved NOT VERIFIED / BLOCKED / WAIVED:

### Rollback
- Rollback unit:
- Trigger:
- Recovery check:

Verdict: PASS / FAIL / NOT VERIFIED / BLOCKED / WAIVED
```

## 11. レビュー応答

| 指摘 | 対応 |
| --- | --- |
| 運用がデザインの説明と混在していた | 本書から視覚ルールを外し、変更記録、リスク分類、検証、レビュー、release gate、切り戻しだけを残した |
| CSSを元にした合否判断ができなかった | import、token、selector、DOM、状態、viewport、preferenceごとのPASS条件を追加した |
| 「確認する」だけで、誰が何を残すか不明だった | Owner、Implementer、Independent reviewer、証拠保存先、判定値、完了テンプレートを固定した |
| 失敗時の対応がなかった | CSSのみ、DOM/状態契約、特殊効果緊急停止に分け、切り戻し単位と再検証を定義した |
