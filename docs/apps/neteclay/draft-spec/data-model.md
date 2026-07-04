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

interface RuntimePlaybackState {
  phase: PlaybackPhase;
  phaseStartedAtMs: number;   // セッション開始からの経過ミリ秒
  lastSootheAgainAtMs: number | null;
}

// アプリ設定
interface AppSettings {
  version: number;
  params: PlaybackParams;      // 内蔵の既定値を初期値とし、手動で上書きされた値
  paramsCustomized: boolean;   // 将来の既定値更新で、手動設定を上書きしないための印
  presetId: string;            // 音色プリセット
  onboardingDone: boolean;
  hideSleepEstimate: boolean;  // ホームの「だいたい○分」表示を隠す
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
  stopReason: 'fade_complete' | 'manual' | 'safety_timeout' | 'interrupted' | 'error';
  presetId: string;
  params: PlaybackParams;     // その回に使ったモードと時間のスナップショット
  events: SessionEvent[];     // リアルタイム操作の記録
  onsetMs: number | null;     // events から導出。最新の fell_asleep より後に cancel_asleep があれば null
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

## セッション終了と復帰

- 開始テンポ（75 BPM）とフェードアウト時間（5 分）はアプリ固定値として扱い、設定には保存しない。
- 自動モードで総再生時間に達した場合は stopReason を fade_complete とする。
- 親が停止した場合は manual とする。通常停止は短いフェードで消音してから閉じる。
- 手動モードで「寝た」が押されないまま安全上限に達した場合は safety_timeout とする。
- 着信・他アプリ再生などの中断は自動復帰を試みる。復帰できなければ interrupted でセッションを閉じる。
- 音声エンジンの異常で継続できない場合は error とする。
- アプリが OS に kill され endedAt を書けなかったセッションは、次回起動時に未完了として検出する。
  その場合は stopReason を interrupted、endedAt を最終既知時刻としてクローズする。
- onsetMs は最新の fell_asleep イベントの時刻から導出する。ただし、それより後に cancel_asleep があれば null とする。
- estimatedOnsetMs は自動モードで使った入眠目安時刻を保存する。親が押した記録ではないため、fell_asleep イベントにはしない。
- 「だいたい○分で寝つく」は onsetMs を優先し、手動記録が少ない場合だけ estimatedOnsetMs を補助的に使う。
- RuntimePlaybackState は保存しない。アプリ復帰時は startedAt、params、events、現在時刻から[再生フロー](./playback-flow.md)に従って再計算する。
- paramsCustomized が false の場合だけ、将来のアプリ更新で既定値を移行してよい。true の場合はユーザーの時間設定を保持する。

## 保存キーと容量

| キー | 内容 | 想定サイズ |
| --- | --- | --- |
| `settings` | AppSettings | 1 KB 未満 |
| `sessions` | Session の配列（操作イベント含む） | 1 回 300 B 程度。全件保存でも年間 100 KB 級 |
| `purchase` | PurchaseState | 1 KB 未満 |

- セッションは全件保存する。「だいたい○分で寝つく」表示は各セッションの onsetMs を主に集計する。
  手動記録が少ない初期状態では estimatedOnsetMs を補助的に使える。
- 手動の onsetMs が 3 件以上ある場合は、estimatedOnsetMs を集計から外す。自動モードの推定値で実績を上書きしない。
- 手動記録が少ない場合の表示は「設定では約○分で見守りに入ります」のように、実績ではなく目安であることが分かる文言にする。
- セッション履歴は MVP では直近 365 件を保持する。上限を超えた古いセッションは削除してよい。
- 履歴上限の削除はセッション終了時またはアプリ起動時に行う。購入状態・設定は削除対象にしない。
- 音源パックの実体（音声ファイル）はアプリ同梱を基本とする。パック数増加でアプリサイズが問題に
  なった段階で App Bundle / On-Demand Resources を検討する。自前 CDN 配信はしない。
- ownedPackIds は端末内の購入済みキャッシュとして扱う。復元失敗・ストア未到達時に既存値を消さない。

## バックアップ

- 持たない。設定・セッションは軽量で、失われても致命傷にならない。
- 購入復元はバックアップではない。復元対象はストア購入権利と ownedPackIds の再構築のみ。
- 再インストール後、設定・セッション履歴は戻らない。購入済み音源パックはストア復元で戻す。
