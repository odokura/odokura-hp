---
title: NeteClay データモデル
sidebar_label: データモデル
draft: true
sidebar_position: 9
---

# NeteClay データモデル

## 方針

- 保存先は AsyncStorage（JSON）。storage 層を通してアクセスする。
- すべてのルートオブジェクトに `version` を持たせ、後方互換 deep merge で移行する。
- 端末内にのみ保存する。音声・センシング系のデータは扱わない。

## 型定義

```ts
// 再生パラメータ（既定値を初期値とし、タイムライン調整で上書きされうる）
type PlaybackMode = 'auto' | 'manual';

interface PlaybackParams {
  mode: PlaybackMode;         // 自動 / 手動
  onsetMinutes: number;       // 入眠までの時間
  deepeningMinutes: number;   // 眠りが深くなるまでの時間
}

type PresetKind = 'melody' | 'ambient';

interface PresetAsset {
  phase: 'intro' | 'deepening';
  uri: string;
  loopDurationMs: number;
  bpm: number | null;         // 環境音系は null 可
  loudnessLufs: number;
}

interface SoundPreset {
  id: string;
  packId: string | null;      // 無料同梱は null
  kind: PresetKind;
  label: string;
  description: string;    // プリセット選択画面に表示する短い説明文
  assets: PresetAsset[];
  artworkUri: string | null;
  isDefault: boolean;
}

interface SoundPack {
  id: string;                 // packId
  productId: string;          // ストア商品 ID
  label: string;
  presetIds: string[];
}

// 再生中だけ使う状態。永続化せず、復帰時は時刻差分から再計算する
type PlaybackPhase = 'intro' | 'intro_hold' | 'deepening' | 'fading' | 'stopping';
type StopReason = 'fade_complete' | 'manual' | 'safety_timeout' | 'interrupted' | 'error';
type PendingStopReason = 'fade_complete' | 'safety_timeout'; // 停止(manual)は即停止で fading を通らないため含めない

interface RuntimePlaybackState {
  phase: PlaybackPhase;
  phaseStartedAtMs: number;   // セッション開始からの経過ミリ秒
  lastSootheAgainAtMs: number | null;
  pendingStopReason: PendingStopReason | null; // fading 完了時に使う終了理由。Session 側にも保存する
  shouldClose: boolean;   // このフレームでセッションを閉じるべき状態か（finalizeIfDue が true にする）
  stopReason: StopReason | null; // shouldClose が true のときに確定した終了理由
}

// アプリ設定
interface AppSettings {
  version: number;
  params: PlaybackParams;      // 内蔵の既定値を初期値とし、手動で上書きされた値
  paramsCustomized: boolean;   // 将来の既定値更新で、手動設定を上書きしないための印
  presetId: string;            // 音色プリセット
  onboardingDone: boolean;
  focusModeHintShown: boolean; // おやすみモード/集中モード案内の表示と通知権限要求を行ったか。初回再生開始時に true にし、以降は再度案内・権限要求を行わない
}

// 再生中の親のリアルタイム操作イベント
type SessionEventKind = 'fell_asleep' | 'cancel_asleep' | 'soothe_again';

interface SessionEvent {
  kind: SessionEventKind;
  atMs: number;               // セッション開始からの経過ミリ秒
}

// 1 回の寝かしつけセッション
interface Session {
  id: string;
  startedAt: string;          // ISO 8601
  endedAt: string | null;
  stopReason: StopReason | null;
  pendingStopReason: PendingStopReason | null; // fading 中だけ保持。soothe_again で null に戻す
  lastActiveAt: string;       // OS kill 補正用の最終保存時刻
  presetId: string;
  params: PlaybackParams;     // その回に使ったモードと時間のスナップショット
  events: SessionEvent[];     // リアルタイム操作の記録
  onsetMs: number | null;     // events から導出。最新の fell_asleep より後に cancel_asleep または soothe_again があれば null
  sleepLatencyMs: number | null; // 手動モード表示用。直前の soothe_again または開始から fell_asleep まで
  estimatedOnsetMs: number | null; // 自動モードの入眠目安。fell_asleep とは別扱い
}

// 購入状態（音源パックの買い切り）
interface PurchaseState {
  version: number;
  ownedPackIds: string[];         // 購入済み音源パック
  lastRestoredAt: string | null;
}
```

## プリセットメタデータ

- プリセットの実体はアプリ同梱の静的アセットを基本とする。
- SoundPreset はコードまたは同梱 JSON として持つ。ユーザー編集データとして保存しない。
- SoundPack はストア商品とプリセットの対応を表す。ユーザー編集データとして保存しない。
- 無料同梱プリセットは packId を null とする。
- 有料プリセットは packId を持ち、ownedPackIds に含まれる場合だけ選択可能にする。
- SoundPack.productId は App Store / Google Play の商品 ID と一致させる。
- assets には intro と deepening を必ず 1 つずつ含める。
- 環境音系は bpm を null にできる。その場合、タイムラインの変化は音量・帯域変化として扱う。
- isDefault が true のプリセットを初回起動時の presetId にする。

### MVP 初期プリセット

| presetId | 表示名 | 種別 | packId | isDefault | 用途 |
| --- | --- | --- | --- | --- | --- |
| default_melody | やわらかメロディ | melody | null | true | 初回再生の既定。抱っこ・トントンに合わせる |
| default_ambient | しずかなノイズ | ambient | null | false | 低月齢向けの環境音 |

- MVP の無料同梱は上記 2 プリセットとする。
- 有料パック calm_pack_1 の追加プリセット ID は[マネタイズ](./monetization.md)の音源パック仕様を正とする。
- 初回再生で選択中プリセットのロードに失敗した場合、settings.presetId は書き換えず、そのセッションだけ default_melody で再試行する。
  default_melody も失敗した場合はセッションを error で閉じる。

### MVP 音源マニフェスト

| presetId | phase | uri | loopDurationMs | bpm | loudnessLufs |
| --- | --- | --- | --- | --- | --- |
| default_melody | intro | assets/audio/presets/default_melody/intro.wav | 180000 | 75 | -20 |
| default_melody | deepening | assets/audio/presets/default_melody/deepening.wav | 180000 | 50 | -20 |
| default_ambient | intro | assets/audio/presets/default_ambient/intro.wav | 180000 | null | -20 |
| default_ambient | deepening | assets/audio/presets/default_ambient/deepening.wav | 180000 | null | -20 |

- 実音源の長さが変わる場合も、各プリセットは intro と deepening を 1 つずつ持つ。
- MVP 実装時点で本番音源が未完成なら、同じマニフェスト構造で短い検証用ループを同梱してよい。
  その場合も store 提出前に本番音源へ差し替える。

## セッション終了と復帰

- 開始テンポ（75 BPM）とフェードアウト時間（5 分）はアプリ固定値として扱い、設定には保存しない。
- 再生開始時に、endedAt=null、stopReason=null、pendingStopReason=null の Session を即時作成する。
  OS kill やクラッシュでも開始済みセッションを検出できるようにするため。
- 「寝た」「寝たを取り消す」「寝ない」は、操作直後に events へ追記して保存する。
- 安全停止・自動停止は、フェード開始時に Session.pendingStopReason を保存し、フェード完了時に endedAt と stopReason を確定して pendingStopReason を null に戻す。
- fading 中に「寝ない」が押された場合は、Session.pendingStopReason を null に戻してから intro に戻す。
- 停止（停止ボタン・manual）・error・interrupted は、停止確定時に endedAt と stopReason を即時保存する。
- 自動モードで総再生時間に達した場合は stopReason を fade_complete とする。
- 親が停止ボタンを押した場合は manual とする。停止は即停止で、fading を通さず、クリック防止の最短フェード（0.4 秒程度）のみで閉じる。
- 手動モードで「寝た」が押されないまま安全上限に達した場合は safety_timeout とする。
- 着信・他アプリ再生などの中断は自動復帰を試みる。復帰できなければ interrupted でセッションを閉じる。
- 音声エンジンの異常で継続できない場合は error とする。
- アプリが OS に kill され endedAt を書けなかったセッションは、次回起動時に未完了として検出する。
  その場合は stopReason を interrupted、endedAt を lastActiveAt としてクローズする。
- lastActiveAt は、再生開始、操作イベント、フェーズ遷移、アプリのバックグラウンド遷移、または最大 60 秒に 1 回の heartbeat で更新する。
- onsetMs は最新の fell_asleep イベントの時刻から導出する。ただし、それより後に cancel_asleep または soothe_again があれば null とする。
- sleepLatencyMs は最新の fell_asleep イベントから導出する。ただし、それより後に cancel_asleep または soothe_again があれば null とする。
  fell_asleep の直前に soothe_again があれば、その soothe_again から fell_asleep までの時間にする。
  直前の soothe_again がなければ、セッション開始から fell_asleep までの時間にする。
- estimatedOnsetMs は自動モードで使った入眠目安時刻を保存する。親が押した記録ではないため、fell_asleep イベントにはしない。
- ホームに寝つき目安は表示しない。sleepLatencyMs はタイムライン調整画面の一覧表示にだけ使う。estimatedOnsetMs は記録として保存するが表示しない。
- RuntimePlaybackState は保存しない。アプリ復帰時は startedAt、params、events、現在時刻から[再生フロー](./playback-flow.md)に従って再計算する。
- paramsCustomized が false の場合だけ、将来のアプリ更新で既定値を移行してよい。true の場合はユーザーの時間設定を保持する。
- 再生開始時に params と presetId を Session へスナップショットする。再生中に設定画面で params や presetId を変更しても、進行中のセッションには反映せず次回再生から使う。

## バージョンと移行

- MVP 初期の settings.version と purchase.version は 1 とする。
- 保存済みデータに新しいフィールドがない場合は、初期値で補完する。
- 将来の未知の高い version を見つけた場合は、既知フィールドだけを読み、破壊的な上書きはしない。
- sessions は個別セッションの shape を緩やかに読む。pendingStopReason、lastActiveAt、sleepLatencyMs が欠ける旧データは、events と startedAt から再導出できる範囲で補完する。

## 初期値

| 項目 | 初期値 |
| --- | --- |
| params.mode | auto |
| params.onsetMinutes | 15 |
| params.deepeningMinutes | 20 |
| paramsCustomized | false |
| presetId | default_melody |
| onboardingDone | false |
| focusModeHintShown | false |
| ownedPackIds | 空配列 |

## 保存キーと容量

| キー | 内容 | 想定サイズ |
| --- | --- | --- |
| `settings` | AppSettings | 1 KB 未満 |
| `sessions` | Session の配列（操作イベント含む） | 1 回 300 B 程度。365 件でも年間 100 KB 級 |
| `purchase` | PurchaseState | 1 KB 未満 |

- セッションは MVP では直近 365 件を保存する。タイムライン調整画面の一覧は各セッションの sleepLatencyMs を新しい順に表示する。
- estimatedOnsetMs は記録として保存するが、ホームにもタイムライン一覧にも表示しない。
- セッション履歴は MVP では直近 365 件を保持する。上限を超えた古いセッションは削除してよい。
- タイムライン調整画面では、手動モードかつ sleepLatencyMs があるセッションだけを新しい順に最大 100 件表示する。
  表示対象は startedAt、presetId、sleepLatencyMs、soothe_again の回数程度に絞り、詳細な履歴分析画面にはしない。
- 履歴上限の削除はセッション終了時またはアプリ起動時に行う。削除順は startedAt が古い完了済みセッションを優先する。
  endedAt=null の未完了セッションは起動時に補正してから削除判定する。購入状態・設定は削除対象にしない。
- 音源パックの実体（音声ファイル）はアプリ同梱を基本とする。パック数増加でアプリサイズが問題に
  なった段階で App Bundle / On-Demand Resources を検討する。自前 CDN 配信はしない。
- ownedPackIds は端末内の購入済みキャッシュとして扱う。復元失敗・ストア未到達時に既存値を消さない。

## バックアップ

- 持たない。設定・セッションは軽量で、失われても致命傷にならない。
- 購入復元はバックアップではない。復元対象はストア購入権利と ownedPackIds の再構築のみ。
- 再インストール後、設定・セッション履歴は戻らない。購入済み音源パックはストア復元で戻す。
