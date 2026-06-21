# ライセンス確認メモ

最終確認日: 2026-04-14

## 結論

- トップレベル依存に GPL 専用ライブラリは見当たらない
- 主要ライブラリはほぼ MIT
- 注意点は次の 2 つ
  - `@expo-google-fonts/inter`: `MIT AND OFL-1.1`
  - transitive dependency の `node-forge`: `(BSD-3-Clause OR GPL-2.0)`

## 注意点

### `@expo-google-fonts/inter`

- ライセンス: `MIT AND OFL-1.1`
- フォントはソフトウェア本体と別扱いになりやすいため、MIT と同じ感覚では見ない
- 商用利用自体はしやすいが、フォント配布や改変時は OFL の扱いを確認する

### `node-forge`

- ライセンス: `(BSD-3-Clause OR GPL-2.0)`
- GPL 専用ではなく dual-license
- `expo -> @expo/cli -> @expo/code-signing-certificates` 経由で入っている
- 現状は開発・ビルド系の依存として見える
- 実務上は BSD 側で扱える前提が強いが、法務確認を厳密に行う場合は個別確認候補

## トップレベル dependencies

- `@expo-google-fonts/inter`: `MIT AND OFL-1.1`
- `@expo/vector-icons`: `MIT`
- `@noble/ciphers`: `MIT`
- `@noble/hashes`: `MIT`
- `@react-native-async-storage/async-storage`: `MIT`
- `@react-native-community/datetimepicker`: `MIT`
- `@react-navigation/bottom-tabs`: `MIT`
- `@react-navigation/elements`: `MIT`
- `@react-navigation/native`: `MIT`
- `expo`: `MIT`
- `expo-constants`: `MIT`
- `expo-document-picker`: `MIT`
- `expo-file-system`: `MIT`
- `expo-font`: `MIT`
- `expo-haptics`: `MIT`
- `expo-image`: `MIT`
- `expo-image-picker`: `MIT`
- `expo-linking`: `MIT`
- `expo-router`: `MIT`
- `expo-sharing`: `MIT`
- `expo-splash-screen`: `MIT`
- `expo-status-bar`: `MIT`
- `expo-symbols`: `MIT`
- `expo-system-ui`: `MIT`
- `expo-video`: `MIT`
- `expo-video-thumbnails`: `MIT`
- `expo-web-browser`: `MIT`
- `react`: `MIT`
- `react-dom`: `MIT`
- `react-native`: `MIT`
- `react-native-gesture-handler`: `MIT`
- `react-native-get-random-values`: `MIT`
- `react-native-iap`: `MIT`
- `react-native-reanimated`: `MIT`
- `react-native-safe-area-context`: `MIT`
- `react-native-screens`: `MIT`
- `react-native-svg`: `MIT`
- `react-native-view-shot`: `MIT`
- `react-native-web`: `MIT`
- `react-native-worklets`: `MIT`
- `react-native-zip-archive`: `MIT`

## devDependencies

- `@types/jest`: `MIT`
- `@types/react`: `MIT`
- `eslint`: `MIT`
- `eslint-config-expo`: `MIT`
- `jest`: `MIT`
- `jest-expo`: `MIT`
- `typescript`: `Apache-2.0`

## 今後の運用

- 新しいライブラリを追加したら、追加時点で license を確認する
- GPL / AGPL / SSPL 系は導入前に要確認とする
- フォント、画像、動画素材はコードライセンスと別で確認する
- 商用リリース前に、依存関係全体の再確認を行う
