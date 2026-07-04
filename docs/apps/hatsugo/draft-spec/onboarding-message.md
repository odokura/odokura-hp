---
sidebar_position: 2
title: 初回メッセージ仕様
sidebar_label: 初回メッセージ
draft: true
---

# 初回起動メッセージ仕様

## 対象

Hatsu-go アプリの初回起動時に表示するオンボーディングモーダル。

関連ファイル:

- `components/onboarding-modal.tsx`
- `lib/onboarding-intro.ts`
- `app/(tabs)/index.tsx`
- `storage/keys.ts`
- `i18n/locales/ja.ts` / `en.ts` / `zh-Hant.ts`
- `i18n/types.ts`

## 構成

- 2 ページ構成のモーダル。
  - 1 ページ目: プロフィール設定の価値を伝え、設定へ誘導する（「あとで始める」で 2 ページ目へ進む）。
  - 2 ページ目: 最初の言葉を気軽に記録できることを伝える。
- 本文は各ページ 1 つの `Text` で表示する。文言は `onboardingPage*` の 5 キーで管理する。
  - `onboardingPage1Body` / `onboardingPage1Primary` / `onboardingPage1Secondary` / `onboardingPage2Body` / `onboardingPage2Btn`
- 画面タイトル・画像・追加ページ・本文以外のキーは持たない。

## 文言の方針

機能説明ではなく「最初の一歩」を案内する。

- 1 ページ目: プロフィール設定の価値（記録を成長といっしょに見返せること）を伝える。
- 2 ページ目: 最初の言葉を気軽に記録できることを伝える。
- 専門用語を避け、「発語」「発達」よりも「ことば」「記録」「あとから見返す」を優先する。
- 親向けにやさしくしつつ、幼すぎる語尾は避ける。
- 医療・診断・療育アプリのように重く見せない。

## 文言

### 日本語

```text
onboardingPage1Body: お子さまのプロフィールを設定すると、ことばの記録を成長といっしょに見返せます。
onboardingPage1Primary: プロフィールを設定
onboardingPage1Secondary: あとで始める
onboardingPage2Body: はじめての言葉も、ふとした一言も、右下の＋からすぐ記録できます。
onboardingPage2Btn: 記録を始める
```

### 英語

```text
onboardingPage1Body: Set up your child's profile to look back on their words alongside their growth.
onboardingPage1Primary: Set Up Profile
onboardingPage1Secondary: Start Later
onboardingPage2Body: Capture first words and everyday moments anytime with the + button.
onboardingPage2Btn: Start Recording
```

### 繁体字

```text
onboardingPage1Body: 設定孩子的個人檔案後，就能伴隨成長一起回顧每一次語言記錄。
onboardingPage1Primary: 設定個人檔案
onboardingPage1Secondary: 稍後開始
onboardingPage2Body: 第一句話和日常的小小話語，都可以從右下角＋隨時記錄。
onboardingPage2Btn: 開始記錄
```

## 表示条件

「初回起動メッセージ」は **1 端末につき 1 回だけ** 表示する。判定は AsyncStorage の `onboarding_shown` キー（`storage/keys.ts`）で行い、表示制御ロジックは `lib/onboarding-intro.ts` の `handleOnboardingIntro` に集約する。

### 表示するとき

- ホームタブ（`app/(tabs)/index.tsx`）が初めてマウントされたとき、`handleOnboardingIntro` が `onboarding_shown` を読み取る。
- 値が未設定（`null`）のときだけモーダルを表示する。

### 表示されなくなるとき（核心）

- `onboarding_shown` が `'true'` で保存されている限り、以後は二度と表示しない。
- このフラグは **「表示する直前」に書き込む（mark-before-show）**。読み取りが `null` の場合、先に `onboarding_shown = 'true'` を書き、その後にモーダルを開く。この順序は仕様として固定する。
- 帰結として:
  - モーダルを最後まで読んだか、途中で閉じたかに関わらず、一度トリガーされたら次回以降は表示しない。
  - 表示中にアプリを強制終了・クラッシュしても、フラグは既に書かれているため再表示しない（＝確実に 1 回だけ）。
- モーダルの「閉じる」操作（オーバーレイのタップ／1 ページ目の「プロフィールを設定」／2 ページ目の「記録を始める」）は、その場でモーダルを隠すだけ。非表示の永続化はこのフラグが担う。1 ページ目の「あとで始める」は閉じずに 2 ページ目へ進む遷移であり、表示判定には影響しない。

### 再び表示されるとき（リセット条件）

- `onboarding_shown` が消えたときのみ、次回のホーム表示で再度表示する。具体的には、アプリのアンインストール、アプリデータの削除、開発時の手動キー削除など。
- **アプリのアップデートでは再表示しない**。`onboarding_shown` は AsyncStorage に保存され、ストアからのアップデートではクリアされないため、既読ユーザーには更新後も表示されない。バージョンに紐づくフラグは持たず、`'true'` の有無だけで判定する。
- 例外として、オンボーディング機能を初めて含むバージョンへ更新した既存ユーザーは、フラグ未設定のためその 1 回だけ表示され、以後は表示されない。
- スコープは端末ローカルの AsyncStorage。アカウント同期や複数端末間での共有はしない（別端末では別途 1 回表示される）。バックアップ復元は `onboarding_shown` を変更しない。

### ストレージ障害時（fail-open）

- 表示判定はアプリ起動を妨げない。`onboarding_shown` の読み取りに失敗した場合、そのセッションではモーダルを表示せず、フラグも変更しない（次回起動で再判定する）。
- 読み取りが `null` でも書き込みに失敗した場合は、モーダルを表示せず、フラグも立てない（次回起動で再試行する）。

## 表示上の注意

`OnboardingModal` は本文を 1 つの `Text` で表示する。そのため本文は各言語とも 1 文を基本にし、改行を前提にしない。

想定する最大幅:

- モーダル幅: 最大 360
- 本文フォント: 17
- 行間: 26

本文が 3 行程度に収まれば許容する。狭い画面でも本文とボタンが重ならないこと。

## 守るべき制約

- 文言は `onboardingPage*` の 5 キーの値のみで管理し、3 言語のキー構成を揃える。
- 表示判定（`onboarding_shown` による 1 回限り表示・mark-before-show の順序・fail-open）を維持する。
- モーダルのページ数は 2 のまま。
- 課金・ビルド判定ロジックには触れない。

## 確認手順

Hatsu-go リポジトリで確認する。

```powershell
npm.cmd test -- onboarding-intro
npm.cmd test -- i18n
npm.cmd run typecheck
```

手動確認:

1. `AsyncStorage` の `onboarding_shown` を削除する
2. アプリを起動する
3. 1 ページ目でプロフィール設定誘導が表示される
4. `あとで始める` / `Start Later` / `稍後開始` で 2 ページ目へ進む
5. 2 ページ目で記録開始の案内が表示される
6. 閉じた後、次回起動時に再表示されない
7. 1 ページ目が表示された直後（閉じる前）にアプリを強制終了し、再起動しても再表示されない（mark-before-show の確認）

## 将来の拡張

より丁寧なオンボーディングにする場合は、本文とは別にタイトルキーを追加する。その際は `i18n/types.ts`、各 locale、`components/onboarding-modal.tsx`、既存テストをまとめて更新する。
