# PoC 要件定義書
## アフリカコールセンター AI 回答支援システム

---

| 項目 | 内容 |
|---|---|
| 文書番号 | 08_poc_requirements |
| 版 | 1.1 |
| 作成日 | 2026-07-09 |
| 最終更新 | 2026-07-09 |
| ステータス | ドラフト（レビュー待ち） |

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [現行モックと本PoC実装の差分](#2-現行モックと本poc実装の差分)
3. [ユーザーと役割](#3-ユーザーと役割)
4. [機能要件](#4-機能要件)
   - 4.1 認証・ユーザー管理
   - 4.2 RAGベース検索システム
   - 4.3 エージェントアシスト画面（`/assist`）
   - 4.4 ログ収集・永続化
   - 4.5 マネージャーダッシュボード（`/dashboard`）
   - 4.6 ナレッジ管理（`/admin/knowledge`）
5. [非機能要件](#5-非機能要件)
6. [システムアーキテクチャ](#6-システムアーキテクチャ)
7. [データモデル（実装版）](#7-データモデル実装版)
8. [外部サービス・API連携](#8-外部サービスapi連携)
9. [セキュリティ要件](#9-セキュリティ要件)
10. [開発フェーズと優先度](#10-開発フェーズと優先度)
11. [制約・前提条件](#11-制約前提条件)
12. [未解決事項（Open Issues）](#12-未解決事項open-issues)

---

## 1. プロジェクト概要

### 1.1 背景と目的

アフリカの自動車販売代理店のコールセンターでは、並行輸入車・多言語顧客・多車種対応という複合的な難しさにより、担当者個人の経験・知識への依存度が高く、対応品質のばらつきが大きい。本システムは以下を目的とした **AI 回答支援PoC** である。

- オーナーズマニュアル・FAQ・ナレッジベースをベクトル検索（RAG）で即時参照し、担当者の対応時間と調べ物の手間を削減する
- 確認質問・次アクション・参考資料の提示によって、経験の浅い担当者でも一定品質の対応ができる仕組みを作る
- 対応ログを自動収集し、「どのカテゴリで回答できていないか」「どのマニュアル・FAQを拡充すべきか」をデータドリブンで可視化する

### 1.2 本PoC（現行モック）との位置づけ

| 現行モック | 本PoC実装 |
|---|---|
| シナリオベースのキーワードマッチング | ベクトル埋め込みによるセマンティック検索（RAG） |
| TypeScript 定数としてハードコードされたログデータ | 実際のDBへの永続化 |
| オペレーター名はハードコード | ログインID＋パスワード認証 |
| ブラウザ内で完結（サーバーサイド不要） | バックエンドAPI＋ベクトルDB＋ストレージ |
| デモ用の固定シナリオのみ対応 | 任意の自然言語クエリに対応 |

### 1.3 PoC の成功基準

| 指標 | 目標値 |
|---|---|
| 回答提示成功率（関連情報が1件以上ヒット） | 検索クエリ全体の 80% 以上 |
| 担当者の主観評価（回答が有用だった） | 5段階中 3.5 以上 |
| 対応完了時の解決記録入力率 | 90% 以上 |
| 平均対応時間（ログから算出） | ベースライン比 20% 削減 |

---

## 2. 現行モックと本PoC実装の差分

### 2.1 検索エンジン

| 項目 | 現行モック | 本PoC実装 |
|---|---|---|
| 検索方式 | キーワードマッチング＋事前定義シナリオ | テキスト埋め込み（Embedding）＋ベクトル類似度検索 |
| 対応クエリ | あらかじめ登録されたキーワードのみ | 自然言語の任意入力（日本語・英語・フランス語） |
| 知識源 | TypeScript定数（`assistScenarios.ts`） | ベクトルDB（オーナーズマニュアルチャンク＋FAQドキュメント） |
| 多言語対応 | 手動で日本語キーワードを追加 | クエリを英語に翻訳してから検索（または多言語埋め込みモデル） |
| 回答生成 | 事前定義テキストを表示 | RAG：検索結果チャンクをコンテキストにLLMが回答文を生成 |

### 2.2 ログ管理

| 項目 | 現行モック | 本PoC実装 |
|---|---|---|
| データ永続化 | なし（TypeScript定数） | RDBまたはドキュメントDB（Supabase / PostgreSQL 等） |
| ログ収集タイミング | なし | 検索実行時・回答採用時・解決記録時にAPIへ自動送信 |
| ハンドリングタイム | ダミー値を生成 | 受付開始〜解決記録の実時間を計測して記録 |

### 2.3 認証

| 項目 | 現行モック | 本PoC実装 |
|---|---|---|
| ログイン | なし | ID＋パスワードによる認証（Supabase Auth 等） |
| セッション管理 | なし | JWTトークン＋リフレッシュトークン |
| ロール | なし（一律同じ画面） | `agent`（担当者）・`manager`（管理者）・`admin`（システム管理者）の3ロール |

---

## 3. ユーザーと役割

| ロール | 主な業務 | 利用画面 |
|---|---|---|
| `agent`（担当者） | 顧客からの問い合わせ受付・AI支援ツール操作・解決記録入力 | `/assist` |
| `manager`（管理者/SV） | KPI確認・ナレッジギャップ把握・担当者パフォーマンスモニタリング | `/dashboard`・`/dashboard/knowledge-gaps` |
| `admin`（システム管理者） | マニュアル・FAQのアップロード・再インデックス・ユーザー管理 | `/admin/knowledge`・`/admin/users` |

---

## 4. 機能要件

### 4.1 認証・ユーザー管理

#### 4.1.1 ログイン

- メールアドレス（または社員ID）＋パスワードによるログイン画面を提供する
- 認証に失敗した場合、エラーメッセージを表示し、5回連続失敗でアカウントをロックする（ロック解除はadminが行う）
- ログイン成功後、ロールに応じたデフォルト画面にリダイレクトする
  - `agent` → `/assist`
  - `manager` → `/dashboard`
  - `admin` → `/admin/knowledge`
- セッションタイムアウトは 8時間（業務シフト単位を想定）

#### 4.1.2 パスワード管理

- 初回ログイン時にパスワード変更を強制する
- パスワードは英数字記号混在 8文字以上を必須とする
- パスワードリセットは管理者からの再発行（自己リセット機能はPoC範囲外）

#### 4.1.3 ユーザー管理（`/admin/users`）

- adminがユーザーの新規作成・ロール変更・無効化を行える
- ユーザー情報：`id`, `name`, `email`, `role`, `distributorId`（所属代理店）, `language`（UIの表示言語デフォルト）, `isActive`

### 4.2 RAGベース検索システム

#### 4.2.1 ナレッジベースの構成

| ソース種別 | 内容 | 更新頻度 |
|---|---|---|
| オーナーズマニュアル（PDF） | 車種別PDFをページ単位でチャンク化 | 車種追加・改訂時（月次以下） |
| 社内FAQ | 担当者が蓄積した質問-回答ペア | 随時（管理者がCRUD） |
| サービス bulletin | メーカー発行の技術情報・リコール通知 | 随時 |

#### 4.2.2 インデックス構築フロー

```
PDFアップロード
  ↓
テキスト抽出（PDF to text。表・図のキャプションも含む）
  ↓
チャンク分割（500〜800トークン、ページ境界を尊重。前後チャンクのオーバーラップ: 100トークン）
  ↓
メタデータ付与（vehicleBrand, vehicleModel, pageNo, sourceType, language）
  ↓
埋め込みモデルによるベクトル化（例: text-embedding-3-small / multilingual-e5-large）
  ↓
ベクトルDB（pgvector / Pinecone 等）に保存
```

#### 4.2.3 検索実行フロー

```
担当者が自然言語で入力（日本語 / 英語 / フランス語）
  ↓
前処理（クエリのノイズ除去・正規化）
  ↓
[オプション] 他言語クエリを英語にトランスレーション（LLM利用）
  ↓
クエリ埋め込みベクトル生成
  ↓
ベクトルDB: コサイン類似度で上位 k=5 チャンク取得
  ↓
リランキング（車種フィルター・カテゴリフィルターを優先）
  ↓
上位チャンク + メタデータをコンテキストとしてLLMに渡す
  ↓
LLMが回答文を生成（引用元ページ番号付き）
  ↓
回答候補（1〜3件）をUIに返す
```

#### 4.2.4 車種・カテゴリによるフィルタリング

- `/assist` 画面の受付フォームで選択した `vehicleBrand` / `vehicleModel` / `inquiryCategory` をベクトル検索のメタデータフィルターとして使用する
- フィルター適用後のヒット件数が 0 の場合は、フィルターなし全文検索にフォールバックし、UIにその旨を表示する

#### 4.2.5 回答生成仕様

- 回答は1〜3候補を提示する（確信度スコアが閾値以上のもの）
- 各回答候補には以下を付与する
  - 出典（ソース種別・ドキュメント名・ページ番号または FAQ ID）
  - 確信度ラベル（`high` / `medium` / `low`）
  - 関連するオーナーズマニュアルのページへのリンク（インラインPDFビューア）
- 閾値を超える候補が存在しない場合は「回答候補なし」を明示し、推奨アクション（エスカレーション先等）を表示する
- 回答はUIの表示言語で生成する（LLMへのプロンプトで言語指定）

#### 4.2.6 確認質問・次アクションの生成

- 各回答候補に対して、LLMが確認質問（1〜3問）と次アクション（1〜3件）を生成する
- または、あらかじめカテゴリ別にテンプレートを登録しておき、LLMによる動的生成と組み合わせる（PoC段階ではテンプレート優先でも可）

#### 4.2.7 問い合わせカテゴリの自動分類

担当者がクエリを送信したタイミングで、入力テキストを解析して問い合わせカテゴリを自動推定する。

**PoCフェーズの実装方式（キーワードスコアリング）**

```
入力テキスト（日本語 / 英語）
  ↓
カテゴリ別キーワード辞書とマッチング（日英両対応）
  ↓
マッチ数 × キーワード長さ × カテゴリ重みでスコア算出
  ↓
最高スコアのカテゴリを推定結果として返す
  ↓
スコア・2位との差分から確信度（high / medium / low）を判定
  ↓
UIに反映（確信度バッジ付き）
```

**本番フェーズの実装方式（LLMによる分類）**

```
入力テキスト + カテゴリ一覧をLLMへ送信
  ↓
LLMがカテゴリキー・確信度・根拠を返す
  ↓
UIに反映
```

**UI仕様**

| 状態 | 表示 |
|---|---|
| 分類処理中 | カテゴリラベル横に「AI分類中」スピナーバッジ |
| 高確度で分類完了 | 緑の「✦ AI分類 (高確度)」バッジ、ドロップダウンが青みがかった強調表示 |
| 中確度 | 青の「✦ AI分類 (中確度)」バッジ |
| 低確度 | 黄の「✦ AI分類 (低確度)」バッジ |
| 担当者が手動変更 | 「手動設定」グレーバッジ（AI分類を上書きしたことを明示） |

- 手動変更後は次の検索クエリを送信しても再分類しない
- ドロップダウン下部に検出されたキーワードを表示する（例：「「エンジン」「始動」を検出」）
- API: `POST /api/classify-category` → `{ result: { categoryKey, confidence, matchedKeywords } }`

### 4.3 エージェントアシスト画面（`/assist`）

#### 4.3.1 受付情報の入力

担当者は対応開始時に以下を選択・入力する（必須項目は★）。

| フィールド | 種別 | 初期フェーズ | 次フェーズ以降 |
|---|---|---|---|
| チャネル ★ | ドロップダウン | ✓ 実装（voice / text） | — |
| 対応言語 ★ | ドロップダウン | ✓ 実装（en / fr / ja） | — |
| 国 | ドロップダウン | **固定値（南アフリカ: ZA）** | 選択式ドロップダウン（ISO国コード一覧） |
| 車両ブランド / モデル | ドロップダウン | **固定値（1車種）** | 車両マスタから選択（ブランド→モデルの連動表示） |
| 販売種別 | ドロップダウン | **非表示（固定値）** | new / certified_used / grey_import の選択式 |
| 問い合わせカテゴリ | ドロップダウン | ✓ **AIが入力内容から自動分類**（4.2.7参照）。担当者による手動変更も可 | — |

> **初期フェーズの意図**: 国・車種・販売形態の選択肢は多様化するほど画面の複雑度と管理コストが増す。PoCでは「回答支援のコア体験」の検証に集中するため、これらは固定値として開発工数を削減する。次フェーズで順次選択式に拡張する。

- 受付情報の入力完了前でも検索は実行できるが、ログ保存時に必須項目が未入力の場合はバリデーションエラーを表示する
- 問い合わせカテゴリは最初の検索クエリ送信時に自動設定される。担当者が変更した場合は以降の再分類を行わない

#### 4.3.2 チャット型クエリ入力

- 担当者が顧客の問い合わせ内容を自然言語で入力し送信する
- 1件の対応中に複数回クエリを入力できる（チャットスレッド形式）
- 各クエリに対して独立した検索・回答提示が行われる
- 過去のクエリと回答はスレッドに残り、後から参照できる

#### 4.3.3 回答提示エリア

| 機能 | 初期フェーズ | 次フェーズ以降 |
|---|---|---|
| 回答候補（最大3件）のカード表示 | ✓ 実装 | — |
| 確信度バッジ・出典バッジ（マニュアル/FAQ） | ✓ 実装 | — |
| 採用チェックボックス（wasAdopted） | ✓ 実装 | — |
| インラインPDFビューア（「ページを見る」） | ✓ 実装 | — |
| 参考資料リスト（URLリンク・PDFリンク） | ✓ 実装 | — |
| **確認質問リスト**（顧客に確認し回答をメモ） | **対象外** | ✓ 次フェーズで実装 |
| **次アクションリスト**（実施済みチェックボックス） | **対象外** | ✓ 次フェーズで実装 |

> **確認質問・次アクションを初期スコープ外とした理由**: 両機能はシナリオ別のテンプレート設計またはLLMによる動的生成が必要であり、品質担保に相応の作り込みを要する。PoCでは「RAG検索による回答候補の提示」の有効性検証を優先し、これらは次フェーズの機能拡張として取り扱う。

#### 4.3.4 対応結果の記録（必須）

担当者は対応終了時に以下を入力する。入力が完了するまで対応を完了できない。

| フィールド | 種別 | 必須 | 表示条件 | 備考 |
|---|---|---|---|---|
| 解決状況 ★ | ラジオ | ✓ | 常時 | resolved / escalated / pending_customer（顧客回答待ち）/ pending_no_answer（その場で回答できなかった） |
| メモ | テキスト | – | 常時 | 自由記述（エスカレ先・保留理由等） |
| **不足していた情報・回答できなかった理由** | テキスト（複数行） | – | **解決状況が resolved 以外のとき自動表示** | ナレッジギャップ分析に活用。`info_gap_note` として保存 |
| 採用した回答候補 | チェックボックス | – | 常時 | wasAdopted フラグに反映 |

- 解決状況選択後に「対応完了」ボタンが活性化する
- 完了押下でログがDBに保存され、新規対応の開始が可能になる
- 「不足していた情報」欄は amber（琥珀色）背景で視覚的に区別し、「ナレッジ改善に活用されます」と補足表示する
- 保存完了後のサマリーカードにも記録した不足情報を表示する
- `info_gap_note` は `/dashboard/knowledge-gaps` のナレッジギャップ詳細ページで参照・分析される

#### 4.3.5 対応時間の自動計測

- 受付フォームの最初の操作時刻を対応開始時刻として記録する
- 「対応完了」ボタン押下時刻を対応終了時刻として記録する
- `handlingTimeMins = (終了時刻 - 開始時刻) / 60`（小数点以下切り捨て）をログに保存する

### 4.4 ログ収集・永続化

#### 4.4.1 収集するイベント

| イベント | タイミング | 保存先テーブル |
|---|---|---|
| イベント | タイミング | 保存先テーブル | フェーズ |
|---|---|---|---|
| 対応セッション開始 | 受付情報を入力し最初のクエリを送信した時点 | `inquiry_logs` | 初期 |
| **カテゴリ自動分類** | **クエリ送信のたびに実行（手動変更済みの場合はスキップ）** | `inquiry_logs`（`inquiry_category` 更新）| 初期 |
| 検索実行 | クエリ送信のたび | `search_logs` | 初期 |
| 回答採用 | 担当者が回答候補にチェックを入れた時点 | `answer_candidates`（wasAdopted更新） | 初期 |
| 解決記録 | 「対応完了」ボタン押下 | `resolutions`（`info_gap_note` を含む） | 初期 |
| ~~確認質問への回答入力~~ | ~~担当者がメモを入力した時点（遅延保存可）~~ | ~~`confirmation_questions`~~ | **次フェーズ** |
| ~~次アクション実施~~ | ~~チェックボックスON~~ | ~~`next_actions`（wasTaken更新）~~ | **次フェーズ** |

#### 4.4.2 ログAPI仕様（概要）

| エンドポイント | メソッド | 概要 |
|---|---|---|
| `/api/inquiry` | POST | 対応セッション開始・更新 |
| `/api/inquiry/:id/search` | POST | 検索ログ追加 |
| `/api/inquiry/:id/resolution` | POST | 解決記録保存（`info_gap_note` を含む） |
| `/api/manual-search` | POST | RAG検索実行（既存） |
| **`/api/classify-category`** | **POST** | **入力テキストから問い合わせカテゴリを自動分類（4.2.7参照）** |

- 全エンドポイントはJWT認証必須
- レスポンスタイム目標：`/api/manual-search` は p95 で 3秒以内
- `/api/classify-category` はレスポンスタイム目標 p95 で 1秒以内（PoCフェーズのキーワード方式は同期処理で十分速い。本番LLM方式移行時は非同期化を検討）

### 4.5 マネージャーダッシュボード（`/dashboard`）

#### 4.5.1 KPI表示

以下のKPIをリアルタイムで表示する（DBから都度集計）。

| KPI | 計算式 |
|---|---|
| 総対応件数 | `COUNT(inquiry_logs)` |
| 解決率 | `COUNT(status='resolved') / COUNT(*)` |
| AI活用率 | `COUNT(DISTINCT inquiry_id WHERE any wasAdopted=true) / COUNT(*)` |
| 平均満足度 | `AVG(satisfaction_score)` |
| 平均対応時間 | `AVG(handling_time_mins)` |
| ナレッジギャップ件数 | `COUNT(status='escalated' OR all_wasAdopted=false)` |

#### 4.5.2 フィルタリング（クロスフィルタリング方式）

カテゴリ棒グラフ・チャネル別内訳・解決状況内訳の3軸でフィルタリングできる。

**クロスフィルタリング**: 各グラフは「他の2軸」のフィルターを受け取って表示を更新する。自分自身の軸フィルターは自グラフには適用しない。

| グラフ | 受け取るフィルター |
|---|---|
| カテゴリ棒グラフ | チャネル × 解決状況 |
| チャネル別内訳 | カテゴリ × 解決状況 |
| 解決状況内訳 | カテゴリ × チャネル |

これにより「エンジンカテゴリのみに絞ったとき、音声 vs テキストの比率はどう変わるか」「escalated 案件に絞ったときカテゴリ分布はどうか」を同一画面で確認できる。

**操作方法**

- カテゴリ棒グラフ: 棒をクリックでそのカテゴリを選択（再クリックで解除）
- チャネル / 解決状況: 色帯セグメントまたは凡例の行をクリック
- 選択中のフィルターはページ上部にチップとして表示。個別に × で解除、または「フィルターをすべて解除」で一括クリア

#### 4.5.3 KPIのフィルター連動

フィルター適用中は、6つの KPI カードがすべて**フィルター後のサブセット**の数値に切り替わる。

- KPI カードは青みがかった背景色（brand カラー）に変化してフィルター状態を視覚的に明示する
- 各カードに「全体: ○○」という比較値を小さく併記し、全体との差異を即座に把握できる

#### 4.5.4 カテゴリ別解決率の表示

カテゴリ棒グラフの各行右端に、そのカテゴリの**解決率（%）**をカラーコードで表示する。

| 解決率 | 表示色 |
|---|---|
| 70% 以上 | 緑（emerald） |
| 40〜69% | 黄（amber） |
| 39% 以下 | 赤（rose） |

フィルター適用中は、適用中のフィルターを除いたサブセットの解決率が反映される（例：「音声チャネルのみ」にフィルターすると、各カテゴリの解決率が音声対応分のみで再計算される）。

#### 4.5.5 期間フィルター（本PoC新規）

- 今日 / 今週 / 今月 / カスタム日付範囲（本番DBへ接続後に実装）

#### 4.5.6 エクスポート

- 表示中のログデータをCSVでエクスポートできる（管理者・マネージャー限定）

### 4.6 ナレッジ管理・ナレッジギャップ詳細（`/admin/knowledge`・`/dashboard/knowledge-gaps`）

#### 4.6.0 ナレッジギャップ詳細ページ（`/dashboard/knowledge-gaps`）

ダッシュボードの「ナレッジギャップ件数」KPI カードからリンクする詳細ページ。

- エスカレーションまたは AI 活用なしで対応終了した案件を一覧表示する
- 各案件について以下の4項目を4カラムグリッドで表示する

| カラム | 内容 | データソース |
|---|---|---|
| 問合せ内容 | 問い合わせテキストの要約 | `raw_inquiry_text` / `info_gap_note` の topic |
| 何の情報が不足していたか | 解決を妨げた知識の欠落 | `info_gap_note`（担当者入力） / KB分析結果 |
| 結果 | 解決状況バッジ＋メモ | `resolution.status` / `resolution.note` |
| 改善提案 | KB改善のための推奨アクション | 管理者が入力またはLLMが生成 |

- 日本語・英語切替対応（ページ内テキストおよびデータ内容）
- 対応案件のメタデータ（日時・車種・国・担当者）をカードヘッダーに表示

#### 4.6.1 ドキュメントアップロード

- PDFをドラッグ＆ドロップでアップロードする
- アップロード時にメタデータ（vehicleBrand / vehicleModel / language / sourceType）を入力する
- アップロード後、バックグラウンドでチャンク分割→埋め込み→ベクトルDB登録が自動実行される
- 処理ステータス（queued / processing / done / failed）を画面に表示する

#### 4.6.2 FAQのCRUD

- FAQエントリの新規作成・編集・削除を管理画面から行える
- FAQ追加後、自動で埋め込みを生成してベクトルDBに反映する

#### 4.6.3 インデックスの再構築

- 「インデックス再構築」ボタンで全ドキュメントの再埋め込みを実行できる（バックグラウンドジョブ）

---

## 5. 非機能要件

### 5.1 パフォーマンス

| 項目 | 目標値 |
|---|---|
| RAG検索レスポンス（p50） | 2秒以内 |
| RAG検索レスポンス（p95） | 5秒以内 |
| ダッシュボードページロード | 3秒以内 |
| 同時接続ユーザー数（PoC規模） | 最大 20名 |

### 5.2 可用性

- 業務時間帯（現地時間 8:00〜20:00）の可用性目標: 99%
- PoCフェーズのため SLA 契約は設けないが、モニタリングを導入する

### 5.3 拡張性

- 車種マスタ・カテゴリマスタは管理画面から追加可能にする（ハードコードにしない）
- 対象国・代理店の追加はDBレコードの追加のみで対応できる設計とする
- 将来の他商材（電機・家電等）への拡張を見据え、`product_category` を汎用フィールドとして保持する

### 5.4 保守性

- フロントエンド: Next.js 14（App Router）+ TypeScript + Tailwind CSS（現行モックと同一スタックを継続）
- バックエンドAPI: Next.js API Routes または Node.js（Hono等）の軽量サーバー
- 環境変数で切り替え可能な設定（LLMモデル名・ベクトルDB接続先・ストレージURL等）

---

## 6. システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│  ブラウザ (Next.js / React)                              │
│  /assist  /dashboard  /admin                             │
└───────────────┬─────────────────────────────────────────┘
                │ HTTPS
┌───────────────▼─────────────────────────────────────────┐
│  Next.js API Routes / バックエンドサーバー               │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 認証 API     │  │ RAG 検索 API │  │ ログ収集 API │  │
│  │ (JWT)        │  │              │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │                 │                  │
  ┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
  │ Auth Provider│  │ LLM API      │  │ PostgreSQL   │
  │ (Supabase    │  │ (OpenAI /    │  │ (Supabase    │
  │  Auth 等)   │  │  Gemini 等)  │  │  DB 等)     │
  └──────────────┘  └──────┬───────┘  └──────────────┘
                           │
                  ┌────────▼────────┐
                  │ ベクトルDB      │
                  │ (pgvector /     │
                  │  Pinecone 等)  │
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │ ドキュメント    │
                  │ ストレージ      │
                  │ (Supabase       │
                  │  Storage 等)   │
                  └─────────────────┘
```

### 6.1 技術スタック候補

| レイヤー | 候補A（シンプル構成） | 候補B（スケール重視） |
|---|---|---|
| フロントエンド | Next.js 14 + Tailwind CSS | 同左 |
| バックエンドAPI | Next.js API Routes | Next.js + Hono（別サーバー） |
| 認証 | Supabase Auth | NextAuth.js |
| RDB | Supabase PostgreSQL | PlanetScale / Neon |
| ベクトルDB | pgvector（PostgreSQL拡張） | Pinecone |
| LLM | OpenAI gpt-4o-mini | Google Gemini 1.5 Flash |
| 埋め込みモデル | text-embedding-3-small | multilingual-e5-large |
| ストレージ（PDF） | Supabase Storage | AWS S3 |
| デプロイ | Vercel | Vercel + Railway |

> **PoC推奨**: 候補Aのシンプル構成。Supabaseで認証・DB・ストレージ・pgvectorを一元管理し、OpenAI APIを利用する。既存モックがVercelにデプロイされているため、フロント側は継続性が高い。

---

## 7. データモデル（実装版）

現行モック（`data/types.ts`）をDBスキーマに移植した設計。

### 7.1 テーブル一覧

```sql
-- ユーザー（Supabase Auth と連携）
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     UUID UNIQUE NOT NULL,   -- Supabase auth.users.id
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('agent','manager','admin')),
  distributor_id TEXT,
  language    TEXT DEFAULT 'en',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 代理店マスタ
CREATE TABLE distributors (
  id      TEXT PRIMARY KEY,   -- 例: "dist_001"
  name    TEXT NOT NULL,
  country TEXT NOT NULL,
  region  TEXT
);

-- 問い合わせログ
CREATE TABLE inquiry_logs (
  id                TEXT PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT now(),
  channel           TEXT CHECK (channel IN ('voice','text')),
  language          TEXT CHECK (language IN ('en','fr','ja')),
  operator_id       UUID REFERENCES users(id),
  distributor_id    TEXT REFERENCES distributors(id),
  country           TEXT,
  product_category  TEXT DEFAULT 'automotive',
  vehicle_brand     TEXT,
  vehicle_model     TEXT,
  sale_type         TEXT CHECK (sale_type IN ('new','certified_used','grey_import')),
  inquiry_category  TEXT,
  raw_inquiry_text  TEXT,
  handling_start_at TIMESTAMPTZ,
  handling_end_at   TIMESTAMPTZ,
  handling_time_mins INTEGER,
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5)
);

-- 検索ログ
CREATE TABLE search_logs (
  id               TEXT PRIMARY KEY,
  inquiry_log_id   TEXT REFERENCES inquiry_logs(id),
  executed_at      TIMESTAMPTZ DEFAULT now(),
  search_keyword   TEXT,
  query_language   TEXT
);

-- 回答候補
CREATE TABLE answer_candidates (
  id               TEXT PRIMARY KEY,
  search_log_id    TEXT REFERENCES search_logs(id),
  answer_text      TEXT,
  confidence_score NUMERIC,            -- ベクトル類似度スコア
  confidence_label TEXT CHECK (confidence_label IN ('high','medium','low')),
  source_type      TEXT CHECK (source_type IN ('manual','faq')),
  source_doc_id    TEXT,               -- ドキュメントID
  source_page_no   INTEGER,
  was_adopted      BOOLEAN DEFAULT false
);

-- 確認質問
CREATE TABLE confirmation_questions (
  id              TEXT PRIMARY KEY,
  search_log_id   TEXT REFERENCES search_logs(id),
  question_text   TEXT,
  operator_answer TEXT
);

-- 次アクション
CREATE TABLE next_actions (
  id            TEXT PRIMARY KEY,
  search_log_id TEXT REFERENCES search_logs(id),
  action_text   TEXT,
  was_taken     BOOLEAN DEFAULT false
);

-- 解決記録
CREATE TABLE resolutions (
  id              TEXT PRIMARY KEY,
  inquiry_log_id  TEXT REFERENCES inquiry_logs(id),
  status          TEXT CHECK (status IN ('resolved','escalated','pending_customer','pending_no_answer')),
  recorded_at     TIMESTAMPTZ DEFAULT now(),
  recorded_by     UUID REFERENCES users(id),
  note            TEXT,
  -- 解決状況が resolved 以外のときに担当者が入力する「不足情報・回答できなかった理由」
  -- ナレッジギャップ分析 (/dashboard/knowledge-gaps) に使用する
  info_gap_note   TEXT
);

-- ナレッジドキュメント（マニュアル・FAQ）
CREATE TABLE knowledge_docs (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  source_type     TEXT CHECK (source_type IN ('manual','faq','bulletin')),
  vehicle_brand   TEXT,
  vehicle_model   TEXT,
  language        TEXT,
  storage_path    TEXT,                -- Supabase Storage のパス
  total_pages     INTEGER,
  indexed_at      TIMESTAMPTZ,
  index_status    TEXT DEFAULT 'pending' CHECK (index_status IN ('pending','processing','done','failed')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ベクトルチャンク（pgvector）
CREATE TABLE knowledge_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id      TEXT REFERENCES knowledge_docs(id),
  chunk_index INTEGER,
  page_no     INTEGER,
  content     TEXT,
  embedding   vector(1536),       -- text-embedding-3-small の次元数
  metadata    JSONB
);

CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## 8. 外部サービス・API連携

| サービス | 用途 | 必要なキー・設定 |
|---|---|---|
| OpenAI API | 埋め込み生成・回答生成・クエリ翻訳 | `OPENAI_API_KEY` |
| Supabase | Auth / PostgreSQL / pgvector / Storage | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Vercel | フロントエンドホスティング・API Routes | Vercel プロジェクト設定 |

### 8.1 将来連携候補（PoC後）

| サービス | 用途 |
|---|---|
| WhatsApp Business API | テキストチャネルからの直接受信 |
| Twilio / AWS Connect | 音声通話との連携（通話メタデータ取得） |
| CRM（HubSpot等） | 顧客情報との紐付け |
| Google Translate API | クエリ多言語翻訳の代替（コスト比較要） |

---

## 9. セキュリティ要件

### 9.1 認証・認可

- 全API エンドポイントはJWT検証を必須とする（Supabase Row Level Security との組み合わせを推奨）
- ロールに応じたアクセス制御：
  - `agent` は自分が担当した `inquiry_logs` のみ参照・編集可能
  - `manager` は所属 `distributor_id` 配下の全ログを参照可能
  - `admin` はシステム全体を操作可能

### 9.2 データ保護

- 個人情報（顧客の発言内容）はログに保存する際に注意が必要。PoC段階では顧客情報の直接入力は求めないが、`raw_inquiry_text` には個人特定情報を含めない運用ルールを設ける
- DBの接続情報・APIキーは環境変数で管理し、コードにハードコードしない
- 本番データへのアクセスはVPNまたはIPホワイトリストで制限する（PoC環境では簡易的な対応でも可）

### 9.3 通信

- HTTPS必須（Vercelデプロイであれば自動対応）
- APIキーはサーバーサイドのみで使用し、クライアントサイドに露出しない

---

## 10. 開発フェーズと優先度

### フェーズ1：基盤構築（推定 3〜4週間）

| # | タスク | 優先度 |
|---|---|---|
| 1 | Supabase プロジェクト作成・DBスキーマ適用 | 最高 |
| 2 | 認証実装（ログイン・セッション管理・ロール制御） | 最高 |
| 3 | ナレッジドキュメントのインデックス構築パイプライン | 最高 |
| 4 | RAG検索APIの実装（埋め込み生成・ベクトル検索・回答生成） | 最高 |
| 5 | `/assist` 画面のログ収集APIとの接続（現行モックUI → 実APIへ差し替え） | 高 |

### フェーズ2：機能完成（推定 2〜3週間）

| # | タスク | 優先度 |
|---|---|---|
| 6 | ダッシュボードのDB集計APIへの切り替え（現行モック定数 → 実DB） | 高 |
| 7 | 期間フィルター・CSVエクスポート | 中 |
| 8 | ナレッジ管理画面（`/admin/knowledge`）のアップロード・CRUD | 中 |
| 9 | ユーザー管理画面（`/admin/users`） | 中 |

### フェーズ3：改善・検証（推定 2週間）

| # | タスク | 優先度 |
|---|---|---|
| 10 | RAG精度チューニング（チャンクサイズ・リランキング調整） | 中 |
| 11 | 多言語クエリ対応の強化（フランス語クエリ検証） | 中 |
| 12 | パフォーマンス計測・最適化 | 低 |
| 13 | PoC成果指標の集計・レポート作成 | 高（評価フェーズ） |

---

## 11. 制約・前提条件

### 11.1 初期フェーズのスコープ制限（次フェーズ以降に拡張）

以下の機能は初期開発スコープから除外し、次フェーズ以降の実装とする。

| 機能 | 初期の扱い | 次フェーズの対応方針 |
|---|---|---|
| **国の選択** | 南アフリカ（ZA）に固定 | ドロップダウンでISO国コードから選択可能にする |
| **車種の選択** | 1車種（固定）に限定 | 車両マスタからブランド→モデルの2段階選択 |
| **販売形態の選択** | 非表示（固定値） | new / certified_used / grey_import の3択を表示 |
| **確認質問リスト** | 非表示（実装しない） | カテゴリ別テンプレートまたはLLM生成による確認質問を提示 |
| **次アクションリスト** | 非表示（実装しない） | 回答候補に紐づく推奨アクションをチェックボックス形式で提示 |

> これらを除外することで、初期フェーズは「RAG検索による回答候補の提示→解決記録→ナレッジギャップ分析」というコアフローの検証に集中できる。

### 11.2 その他の制約・前提条件

| 制約 | 内容 |
|---|---|
| **対象ドキュメント** | PoC期間中にインデックス化するマニュアルはハイラックス（日本語版）を含む数車種に限定する |
| **対応言語** | 英語・日本語を優先対応。フランス語は翻訳精度が検証できたら追加 |
| **音声認識** | 音声通話の文字起こしはPoC範囲外。音声チャネルの担当者は手入力でクエリを入力する |
| **オフライン対応** | PoC範囲外。インターネット接続必須 |
| **本番CRM連携** | PoC範囲外 |
| **顧客向け自己解決ポータル** | PoC範囲外 |
| **LLMコスト上限** | OpenAI APIのコストを月次でモニタリングし、PoC期間中の上限を設定する（目安: $200/月）|

---

## 12. 未解決事項（Open Issues）

| # | 事項 | 決定者 | 期限 |
|---|---|---|---|
| OI-01 | ベクトルDBはpgvector（Supabase内）vs Pinecone（外部）どちらを使うか | アーキテクト | フェーズ1開始前 |
| OI-02 | LLMはOpenAI GPT-4o vs Gemini 1.5 Flash vs その他、コスト・精度のトレードオフ比較 | アーキテクト | フェーズ1開始前 |
| OI-03 | 埋め込みモデルの多言語対応：英語特化モデル+翻訳 vs 多言語モデル（multilingual-e5等）どちらか | アーキテクト | フェーズ1開始前 |
| OI-04 | フランス語クエリの対応優先度・検証タイミング | PMO | フェーズ1終了時 |
| OI-05 | 顧客情報（氏名・電話番号等）の取り扱いと現地データ保護規制（GDPR類似規制）への対応方針 | 法務 | フェーズ1開始前 |
| OI-06 | マネージャーダッシュボードの「期間」デフォルト表示（当月？直近30日？） | UXデザイン | フェーズ2開始前 |
| OI-07 | PoC成功/失敗の判断基準と評価体制（誰が何をもとに判断するか） | PMO / 経営層 | PoC開始前 |

---

*以上*
