---
title: NeteClay 再生フロー
sidebar_label: 再生フロー
draft: true
sidebar_position: 6
---

# NeteClay 再生フロー

寝かしつけ中の状態遷移、親の操作、音楽側の反応をまとめる。実装時はこのページを正とし、
画面・音楽エンジン・データモデルはここに従う。

## 基本方針

- 既定は自動モード。ホームのワンタップ以外は不要。
- 手動モードは、親が「寝た」を合図したい家庭向けの任意設定。
- 「寝ない」は両モードで必須。子どもが動いた・泣いた・布団移動で起きそうなときの戻し操作にする。
- どの操作も音を急変させない。数十秒の緩やかなランプで移行する。
- 就寝フロー中に全画面ダイアログを出さない。停止は 1 タップで即実行し、確認 UI や長押しは持たない。

## 育児シーンの流れ

| 場面 | 親の状態 | アプリの既定挙動 | 任意操作 |
| --- | --- | --- | --- |
| 1. 抱っこ・トントン開始 | 片手がふさがっている。細かい設定は無理 | ホームの大きな再生ボタンで即開始 | なし |
| 2. あやし中 | 子どもの呼吸・動きに合わせて揺らす | 速めのテンポからゆっくり落ちる | なし |
| 3. うとうと | 寝たかどうかを親が見ている | 自動モードでは時刻で深まりへ進む | 手動モードでは「寝た」 |
| 4. 布団へ移す | 背中スイッチが起きやすい | 低音量で深まりを支える | ぐずったら「寝ない」 |
| 5. 寝入り直後 | 物音・姿勢変化で起きやすい | 深まりフェーズを継続 | 必要なら「寝ない」 |
| 6. 深くなったころ | 親も離れたい | 固定フェードアウトで静かに停止 | 途中停止 |
| 7. 再ぐずり | 子どもが動く・泣く | 自動では音を上げ直さない | 「寝ない」 |

## 再生状態

| 状態 | 意味 | 主な入口 | 主な出口 |
| --- | --- | --- | --- |
| idle | 再生していない | アプリ起動、停止完了 | start |
| intro | 導入。抱っこ・トントンに合う音から徐々に落ち着く | start、soothe_again | auto_onset、fell_asleep、stop |
| intro_hold | 手動モードで「寝た」待ち。導入終端付近の低刺激状態 | manual の onset 到達 | fell_asleep、soothe_again、stop |
| deepening | 深まり。入眠後を低音量で支える | auto_onset、fell_asleep | deepening_elapsed、soothe_again、stop |
| fading | 消灯。固定フェードアウトで停止へ向かう。終了時の stopReason は pendingStopReason で保持する | deepening_elapsed、safety_timeout | fade_complete、soothe_again、stop |
| stopping | 停止処理中。即停止（クリック防止の最短フェードのみ） | stop、error | idle |
| interrupted | OS 中断・アプリ kill などで閉じる途中 | interruption | idle、resume |

## 状態遷移

| 現在状態 | イベント | 自動モード | 手動モード |
| --- | --- | --- | --- |
| idle | start | intro へ。入眠までのタイマーを開始 | intro へ。入眠目安タイマーを開始 |
| intro | onset 到達 | deepening へ | intro_hold へ |
| intro_hold | fell_asleep | 該当なし | deepening へ。深まりタイマーを開始 |
| intro / intro_hold / deepening / fading | soothe_again | intro へ戻し、音は数十秒で導入寄りへ。pendingStopReason は破棄 | intro へ戻し、寝た待ちをやり直す。pendingStopReason は破棄 |
| deepening | deepening_elapsed | fading へ。pendingStopReason は fade_complete | fading へ。pendingStopReason は fade_complete |
| fading | fade_complete | idle へ。stopReason は pendingStopReason | idle へ。stopReason は pendingStopReason |
| 任意の再生中状態 | stop（停止ボタン） | stopping へ。即停止（0.4s の消音のみ）。stopReason は manual | 同左 |
| intro_hold | safety_timeout | 該当なし | fading へ。pendingStopReason は safety_timeout |
| 任意の再生中状態 | interruption | 復帰を試みる。失敗なら interrupted | 復帰を試みる。失敗なら interrupted |
| 任意の再生中状態 | error | stopping へ。stopReason は error | stopping へ。stopReason は error |

## 自動モード

- 初期モード。父親が楽をする既定パス。
- 「入眠までの時間」に達したら、自動で deepening に入る。
- 「寝た」ボタンは常時表示する。押さなくても目安時刻で deepening へ進むが、早く寝たときは押して前倒し＋記録できる（任意）。
- 「寝ない」は常に表示する。押された時点を新しい起点として intro に戻す。
- 「寝ない」後は、同じ入眠までの時間を再度使う。ただし画面には残り時間を強調しない。
- 深まり終了後は固定 5 分のフェードアウトで停止する。

## 手動モード

- 「寝た」を押すまで deepening に入らない。
- 入眠目安時刻を過ぎたら intro_hold に入り、導入終端付近の低刺激状態で待つ。
- 「寝た」を押した時点から、眠りが深くなるまでの時間を数え始める。
- 「寝た」後に取り消した場合は cancel_asleep を記録し、intro_hold に戻す。
- 「寝ない」を押したら intro に戻り、再び「寝た」待ちにする。
- 「寝るまでの時間」として表示する値は、最新の「寝ない」以降に押された「寝た」までの時間とする。
  「寝ない」がない場合だけ、再生開始から「寝た」までの時間とする。
- 親が「寝た」を押さない限り通常の自動フェードアウトには入らない。ただし手動停止はいつでもできる。
- 押し忘れ対策として、手動モードにも安全上限を設ける。再生開始または最後の「寝ない」から 90 分経過したら、
  短いフェードで停止する。これは通常の総再生時間ではなく、安全停止として扱い、stopReason は safety_timeout とする。

## 寝ない

- 子どもが動いた、泣いた、布団に置いて起きそうになったときの操作。
- 自動モード・手動モードの両方で表示する。
- アプリ内操作として必須。再生中画面では常に使えるようにする。
- 1 タップで反応させる。誤操作の害は小さいため、停止ほど重い確認にしない。
- 音は急に戻さない。30〜60 秒かけて導入寄りに戻す。
- fading 中に押された場合も intro へ戻す。消えかけた音を急に戻さず、短いフェードインを挟む。
- fading 中に押された場合は、それまで保持していた pendingStopReason を破棄する。
  あやし直し後の停止理由は、その後に発生したイベントから改めて決める。
- ロック画面・通知からも操作できることを目指す。OS 制約で直接実行できない場合は、通知タップでアプリを開き、
  再生中画面の「寝ない」にすぐ触れる状態にする。

## 停止

- 停止ボタンは 1 タップで即停止する。確認 UI・長押し・全画面モーダルは持たない。
- 急停止のクリックノイズを避けるため、最短のフェード（数百 ms 程度）だけかけて止める。
- 停止（stop）は任意の再生中状態から stopping を経て idle へ向かい、stopReason は manual とする。親の明示操作のため。
- 安全停止は、手動モードで「寝た」が押されないまま再生開始または最後の「寝ない」から 90 分経過したときの停止。
  親の操作ではないため stopReason は safety_timeout とし、音は固定フェードで止める（fading 経由）。
- 停止後はホームへ戻る。

## 復帰時の判定規則

- アプリ復帰時は、保存済みの startedAt、params、events と現在時刻から本来の状態を再計算する。
- 自動モードで、復帰時点が総再生終了時刻を過ぎている場合は、fade_complete としてセッションを閉じる。
- 自動モードで、復帰時点が入眠目安を過ぎているが深まり終了前なら、deepening として再開する。
- 自動モードで、復帰時点が deepening 終了後かつ固定フェード中なら、fading として再開する。
- fading 中に復帰する場合は、復帰前に保持していた pendingStopReason を使う。
  pendingStopReason が復元できない場合、自動モードの予定終了または手動モードの安全上限から明確に導出できるときだけ fade_complete / safety_timeout で閉じる。
  導出できない場合は、音声停止済みの可能性を優先して interrupted で閉じる。
- 手動モードで「寝た」イベントがない場合は、intro_hold として再開する。ただし安全上限を過ぎていれば safety_timeout として閉じる。
- 手動モードで「寝た」イベントがあり、cancel_asleep がそれより後にない場合は、その時刻を deepening 開始として再計算する。
- 中断中に「寝ない」は発生しないため、最後の soothe_again より後の時刻を基準にする。
- OS kill などで音声が停止していた可能性が高い場合、ユーザーに自動再開を強制しない。
  最後に保存された lastActiveAt を endedAt として、interrupted でセッションを閉じる。

## 音声割り込み時の動作

寝かしつけ中は、着信・通知・他アプリ音声で子どもが起きるリスクを下げたい。ただし、一般アプリが
OS 全体の通知を強制的に遮断することはできない。MVP では、初回再生時または設定内で OS の
おやすみモード/集中モード利用を短く案内し、アプリ自身は割り込みから安全に復帰する。

| 割り込み | 期待動作 | 復帰できない場合 | セッション処理 |
| --- | --- | --- | --- |
| 通常通知 | アプリ音声は継続。通知音は OS 設定に従う | 該当なし | SessionEvent は追加しない |
| 着信 | OS に従って一時停止または音量低下。通話終了後に復帰を試みる | interrupted で閉じる | stopReason を interrupted にする |
| アラーム/タイマー | OS を優先。終了後に復帰を試みる | interrupted で閉じる | stopReason を interrupted にする |
| 他アプリ音声再生 | 他アプリが音声フォーカスを奪ったら一時停止または duck。フォーカス回復後に復帰 | interrupted で閉じる | stopReason を interrupted にする |
| Siri/音声アシスタント | OS を優先。終了後に復帰を試みる | interrupted で閉じる | stopReason を interrupted にする |
| Bluetooth/イヤホン切断 | 端末スピーカーへ急に大音量で戻さない。安全側で一時停止または低音量復帰 | interrupted で閉じる | stopReason を interrupted にする |
| OS kill | 自動再開しない | interrupted で閉じる | 次回起動時に未完了セッションを補正する |

- おやすみモード/集中モードの設定変更はユーザー操作に委ねる。アプリが勝手に有効化しない。
- 他アプリ通知を完全に排除できない端末では、その制約を設定画面の短いヘルプに記載する。
- 復帰時に予定終了時刻を過ぎていた場合は、再生を再開せずセッションを閉じる。

## 記録

- 手動モードの「寝た」は fell_asleep として保存する。
- 「寝た」の取り消しは cancel_asleep として保存する。
- 「寝ない」は soothe_again として保存する。
- 割り込みは SessionEvent として保存しない。復帰できない場合だけセッション終了理由で表す。
- 自動モードの入眠時刻は推定値であり、fell_asleep イベントとしては保存しない。
- 寝るまでの時間（sleepLatencyMs）はタイムライン調整画面の一覧でのみ参照する。ホームに寝つき目安は表示しない。
- sleepLatencyMs は、最新の fell_asleep から、その直前の soothe_again 時刻またはセッション開始時刻を引いた値とする。
  fell_asleep より後に cancel_asleep または soothe_again がある場合は null とする。

## 実装メモ

- 状態遷移は UI コンポーネント内に散らさず、純粋関数または小さな状態管理モジュールに寄せる。
- タイマーはアプリ前面・バックグラウンド・復帰後で同じ結果になるよう、開始時刻と現在時刻の差分から導出する。
- バックグラウンド中も音は続けるが、画面表示は復帰時に状態から再計算する。
- 再生中は、操作イベント、フェーズ遷移、アプリのバックグラウンド遷移、または最大 60 秒に 1 回の軽い heartbeat で lastActiveAt を更新する。
- OS kill で途中終了した場合は、次回起動時に lastActiveAt を endedAt として interrupted で閉じる。
