# Central Agent セットアップガイド

## 🚀 クイックスタート（無料版）

APIキーなしでもテスト可能な最小構成で始めることができます。

### 1. 基本セットアップ

```bash
# リポジトリクローン
git clone https://github.com/ShawTB12/CentralAgent.git
cd CentralAgent

# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev
```

### 2. 環境変数設定（段階的）

#### Phase 1: 基本動作（APIキーなし）
```env
# .env.local
NODE_ENV=development
```

この状態では模擬データで動作テストが可能です。

#### Phase 2: Claude API追加（推奨）
```env
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-api03-xxxx...
```

#### Phase 3: Web検索追加（完全版）
```env
NODE_ENV=development
ANTHROPIC_API_KEY=sk-ant-api03-xxxx...
TAVILY_API_KEY=tvly-xxxx...
```

## 🔧 API取得詳細手順

### Anthropic Claude API

#### 無料プラン
- 毎月10,000トークンまで無料
- クレジットカード登録不要でテスト可能

#### 取得手順
1. [Anthropic Console](https://console.anthropic.com/) アクセス
2. Googleアカウントでサインアップ
3. 「Create Key」ボタンをクリック
4. キー名を入力（例：central-agent-dev）
5. 生成されたキーをコピー

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Tavily Search API

#### 無料プラン
- 毎月1,000回の検索まで無料
- メール認証のみ

#### 取得手順
1. [Tavily](https://tavily.com/) アクセス
2. 「Get API Key」をクリック
3. メールアドレスで登録
4. 認証メールを確認
5. ダッシュボードでAPI Keyを取得

```env
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Google Custom Search API（代替案）

#### 無料プラン
- 1日100回まで無料
- Google Cloudアカウント必要

#### 取得手順
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. 「APIs & Services」→「Library」→「Custom Search API」を有効化
3. 「Credentials」→「Create Credentials」→「API Key」
4. [Custom Search Engine](https://cse.google.com/cse/) で検索エンジン作成
   - ウェブサイト：`*.com`
   - Search Engine ID をコピー

```env
GOOGLE_SEARCH_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SEARCH_ENGINE_ID=xxxxxxxxx:xxxxxxxx
```

## 🧪 動作テスト

### 1. 基本チャット機能
- ブラウザで http://localhost:3000 を開く
- 「こんにちは」と入力してEnter
- AI応答が表示されれば成功

### 2. 企業分析機能
- 「トヨタ自動車について分析してください」と入力
- 右側にスライドパネルが表示されれば成功

### 3. API連携確認
ブラウザの開発者ツール（F12）→ Consoleタブで以下のログを確認：

```
企業分析開始: トヨタ自動車
Web検索を実行中...
Web検索完了: 10件の結果
Claude AIで企業分析を実行中...
企業分析完了
```

## 🛠️ トラブルシューティング

### よくあるエラーと解決法

#### 1. `ANTHROPIC_API_KEY is not defined`
```bash
# 環境変数を確認
echo $ANTHROPIC_API_KEY

# .env.localファイルの存在確認
ls -la .env.local

# 開発サーバーを再起動
pnpm dev
```

#### 2. `Network Error / API Request Failed`
- API Keyの有効性を確認
- ネットワーク接続を確認
- レート制限の可能性を確認

#### 3. `Search results empty`
- Tavily APIが失敗した場合、DuckDuckGoにフォールバック
- Google Custom Search APIの設定を確認

### ログレベル調整

詳細なデバッグ情報が必要な場合：

```env
# .env.local
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

## 📊 使用例

### 基本的な質問例
```
- ソニーの企業分析をお願いします
- 任天堂について教えてください
- Tesla Inc の分析
- Microsoft Corporation
```

### 詳細分析が可能な企業例
- 上場企業（豊富な公開情報）
- 大手テック企業
- 自動車メーカー
- 金融機関

## 🔄 更新とメンテナンス

### 依存関係の更新
```bash
# パッケージ更新チェック
pnpm outdated

# 更新実行
pnpm update
```

### APIキーのローテーション
セキュリティのため、3ヶ月ごとにAPIキーを更新することを推奨します。

## 🚀 本番環境デプロイ

### Vercel（推奨）
```bash
# Vercel CLIインストール
npm i -g vercel

# デプロイ
vercel --prod

# 環境変数設定
vercel env add ANTHROPIC_API_KEY
vercel env add TAVILY_API_KEY
```

### 環境変数設定
Vercelダッシュボード → Project → Settings → Environment Variables

## 📈 パフォーマンス最適化

### 1. レスポンス時間改善
- Claude APIのmax_tokensを調整
- 検索結果数を制限
- キャッシュ機能の実装

### 2. コスト最適化
- API呼び出し回数の監視
- レート制限の実装
- フォールバック機能の活用

## 🔒 セキュリティ考慮事項

### API Keyの管理
- 環境変数での管理
- .gitignoreへの.env.local追加
- 本番環境での暗号化

### ユーザー入力の検証
- SQLインジェクション対策
- XSS対策
- レート制限の実装

## 💡 カスタマイズのヒント

### UIの変更
- `app/page.tsx`でスライドレイアウトを調整
- `app/globals.css`でカラーテーマを変更

### 分析項目の追加
- `lib/claude-client.ts`のプロンプトを編集
- 新しいスライドテンプレートを追加

### 検索ソースの追加
- `lib/web-search.ts`に新しい検索APIを実装
- フォールバック機能の強化 