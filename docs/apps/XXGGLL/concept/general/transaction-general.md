---
title: 取引ルール
sidebar_label: 取引ルール
sidebar_position: 6
draft: true
---

# 取引ルール

- 通貨はJPYだけを使う。
- 決済はStripeで処理し、カード情報はXXGGLLに保存しない。
- 支払い成功のWebhookで、証票、台帳、同意を確定する。
- 同じWebhookは一度だけ処理する。
- 返金は管理者が確定し、未送金のクリエイター報酬だけを台帳で相殺する。
- クリエイター報酬は決済確定後90日を過ぎると精算可能になる。
- 送金は日本のStripe Connected AccountとJPYだけで行う。
- 利用者の支払い、再発行クレジット、クリエイター報酬は別の台帳記録として管理する。
