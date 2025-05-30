# 🔧 API設定手順ガイド

現在デモデータが表示されている場合、APIキーが設定されていません。
以下の手順でAPIキーを設定してください。

## 📋 設定チェックリスト

- [ ] **Step 1**: `.env.local` ファイル作成
- [ ] **Step 2**: Anthropic Claude APIキー取得・設定
- [ ] **Step 3**: Web検索APIキー取得・設定（オプション）
- [ ] **Step 4**: 開発サーバー再起動
- [ ] **Step 5**: 動作確認

---

## Step 1: 環境変数ファイル作成

プロジェクトルートディレクトリに `.env.local` ファイルを作成してください：

```bash
# ターミナルで実行
touch .env.local
```

または手動でファイルを作成し、以下の内容をコピーしてください：

```env
# Central Agent 環境変数設定

# 開発環境設定
NODE_ENV=development

# 必須: Claude API Key (Anthropic)
ANTHROPIC_API_KEY=

# オプション: Web検索API - Tavily (推奨)
TAVILY_API_KEY=

# オプション: Google Custom Search API (代替案)
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=

# デバッグ設定
DEBUG=false
LOG_LEVEL=info
```

---

## Step 2: Anthropic Claude API設定 (必須)

### 2.1 アカウント作成
1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. 「Sign Up」をクリック
3. Googleアカウントまたはメールアドレスで登録

### 2.2 APIキー取得
1. ダッシュボードで「Create Key」をクリック
2. キー名を入力（例：central-agent-dev）
3. 生成されたキーをコピー

### 2.3 設定
`.env.local` ファイルを編集：
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**💡 無料プラン**: 月10,000トークンまで無料で利用可能

---

## Step 3: Web検索API設定 (推奨)

### Option A: Tavily API (推奨)

#### 特徴
- 月1,000回まで無料
- 高品質な検索結果
- 簡単設定

#### 設定手順
1. [Tavily](https://tavily.com/) にアクセス
2. 「Get API Key」をクリック
3. メールアドレスで登録
4. 認証メールを確認
5. API Keyをコピー

```env
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option B: Google Custom Search API (代替案)

#### 設定手順
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. 「APIs & Services」→「Library」→「Custom Search API」を有効化
3. 「Credentials」→「Create Credentials」→「API Key」
4. [Custom Search Engine](https://cse.google.com/cse/) で検索エンジン作成
5. 検索するサイトに `*.com` を設定
6. Search Engine IDをコピー

```env
GOOGLE_SEARCH_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SEARCH_ENGINE_ID=xxxxxxxxx:xxxxxxxx
```

**注意**: Google APIは1日100回まで無料

---

## Step 4: 開発サーバー再起動

環境変数を設定後、開発サーバーを再起動してください：

```bash
# 現在のサーバーを停止 (Ctrl+C)
# 再起動
pnpm dev
```

---

## Step 5: 動作確認

### 5.1 基本確認
1. ブラウザで http://localhost:3000 を開く
2. 「トヨタ自動車について分析してください」と入力
3. 以下が表示されれば成功：
   - 「企業分析を開始しました」メッセージ
   - 右側にスライドプレビューパネル

### 5.2 ログ確認
ブラウザの開発者ツール（F12）→ Consoleタブで確認：

**✅ 正常な場合:**
```
企業分析開始: トヨタ自動車
Web検索を実行中...
Web検索完了: 10件の結果
Claude AIで企業分析を実行中...
企業分析完了
```

**❌ エラーの場合:**
```
Claude API error: API key not found
Tavily search error: Unauthorized
```

---

## 🚨 トラブルシューティング

### 問題1: "ANTHROPIC_API_KEY is not defined"
**解決策:**
- `.env.local` ファイルが正しい場所にあるか確認
- APIキーが正しく設定されているか確認
- 開発サーバーを再起動

### 問題2: "401 Unauthorized" エラー
**解決策:**
- APIキーが有効か確認
- APIキーに必要な権限があるか確認
- APIの利用制限に達していないか確認

### 問題3: 検索結果が空
**解決策:**
- Tavily APIキーを設定
- または複数の検索APIを設定
- フォールバック機能で最低限の結果は表示される

### 問題4: デモデータのまま
**原因:** 全てのAPIが失敗している
**解決策:**
- 最低限 `ANTHROPIC_API_KEY` を設定
- ネットワーク接続を確認
- APIサービスの障害情報を確認

---

## 📊 設定確認コマンド

以下のコマンドで設定状況を確認できます：

```bash
# 環境変数が読み込まれているか確認
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:0:10}..."
echo "TAVILY_API_KEY: ${TAVILY_API_KEY:0:10}..."

# または Node.js で確認
node -e "console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '設定済み' : '未設定')"
```

---

## 💰 コスト目安

### 開発・テスト段階
- **Anthropic Claude**: 月10,000トークン無料（約50回の企業分析）
- **Tavily**: 月1,000回検索無料
- **Google Custom Search**: 1日100回無料

### 本格運用時
- **Anthropic Claude**: $15/M トークン（約100万トークン）
- **Tavily**: $5/月（25,000回検索）
- **Google Custom Search**: $5/1,000回検索

---

設定完了後、再度企業分析を試してみてください！ 