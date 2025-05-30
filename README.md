# Central Agent

リアルタイムWeb検索とClaude-3-Sonnet-Latest AIを活用した企業分析チャットアプリケーション

## 機能概要

- 🔍 **リアルタイムWeb検索**: 最新の企業情報を自動収集
- 🤖 **Claude AI分析**: Claude-3-Sonnet-Latestによる高度な企業分析
- 📊 **動的スライド生成**: 分析結果を美しいプレゼンテーション形式で表示
- 💬 **インタラクティブチャット**: 自然言語での企業情報照会
- 📱 **レスポンシブUI**: デスクトップ・モバイル対応の最新UI

## 技術スタック

- **フロントエンド**: Next.js 15.2.4, TypeScript, TailwindCSS
- **AI/ML**: Claude-3-Sonnet-Latest (Anthropic API)
- **Web検索**: Tavily API, Google Custom Search API
- **UI/UX**: Radix UI, Lucide React
- **データ可視化**: Chart.js
- **デプロイ**: Vercel対応

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/ShawTB12/CentralAgent.git
cd CentralAgent
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# 必須: Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 推奨: Web検索API（いずれか一つ）
TAVILY_API_KEY=your_tavily_api_key_here

# または Google Custom Search
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# 開発環境
NODE_ENV=development
```

### 4. API Keyの取得方法

#### Anthropic API (必須)
1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. アカウント作成・ログイン
3. API Keyを生成
4. `ANTHROPIC_API_KEY` に設定

#### Tavily API (推奨)
1. [Tavily](https://tavily.com/) にアクセス
2. APIアクセスを申請
3. API Keyを取得
4. `TAVILY_API_KEY` に設定

#### Google Custom Search API (代替案)
1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. Custom Search API を有効化
3. 認証情報でAPI Keyを作成
4. [Custom Search Engine](https://cse.google.com/) で検索エンジンを作成
5. 環境変数を設定

### 5. 開発サーバーの起動

```bash
pnpm dev
```

## 使用方法

### 基本的な企業分析

1. チャット画面で企業名を入力：
   ```
   トヨタ自動車の分析をお願いします
   ```

2. システムが自動的に：
   - Web検索で最新情報を収集
   - Claude AIで包括的分析を実行
   - プレゼンテーション資料を生成

3. 右側パネルで結果を確認：
   - 8つのスライドで構造化された分析
   - リアルタイムデータビジュアライゼーション
   - HTML形式でのエクスポート機能

### 対応する分析項目

- 企業概要（事業内容、設立背景）
- 市場ポジション（業界地位、競合分析）
- 主要課題（現在の問題点）
- 解決策・戦略（対応策、成長戦略）
- 財務状況（売上、利益、健全性）
- 戦略的方向性（中長期計画）
- リスク分析（事業・市場・規制リスク）
- 結論と展望（総合評価、将来予測）

## アーキテクチャ

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend    │    │   External APIs │
│                 │    │              │    │                 │
│ • Chat UI       │◄──►│ • Next.js    │◄──►│ • Claude API    │
│ • Slide Preview │    │ • API Routes │    │ • Tavily API    │
│ • Chart.js      │    │ • TypeScript │    │ • Google API    │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

## API エンドポイント

### POST /api/analyze-company

企業分析を実行

**リクエスト:**
```json
{
  "companyName": "企業名"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "companyName": "企業名",
    "overview": "企業概要",
    "marketPosition": "市場ポジション",
    "challenges": "主要課題",
    "solutions": "解決策",
    "financialStatus": "財務状況",
    "strategy": "戦略的方向性",
    "risks": "リスク分析",
    "conclusion": "結論と展望",
    "keyMetrics": { /* 主要指標 */ },
    "keyInsights": [ /* 重要な洞察 */ ],
    "chartData": { /* グラフ用データ */ }
  },
  "searchResultsCount": 15
}
```

## カスタマイズ

### スライドテンプレートの変更

`app/page.tsx` の `exportSlidesToHTML` 関数を編集して、スライドデザインをカスタマイズできます。

### 分析項目の追加

`lib/claude-client.ts` の prompt を編集して、分析項目を追加・変更できます。

### 検索エンジンの変更

`lib/web-search.ts` で新しい検索APIを追加できます。

## トラブルシューティング

### よくある問題

1. **API Key エラー**
   - 環境変数が正しく設定されているか確認
   - API Keyの有効性を確認

2. **検索結果が少ない**
   - 複数の検索APIを設定
   - 検索クエリの最適化

3. **分析が遅い**
   - Claude APIのレスポンス時間は約5-10秒
   - 検索API呼び出し回数の調整

### ログの確認

開発サーバーのコンソールで詳細なログを確認できます：

```bash
pnpm dev
# ブラウザでF12 → Consoleタブ
# または Terminal出力を確認
```

## コントリビューション

1. フォークして開発ブランチを作成
2. 機能追加・バグ修正
3. テスト実行
4. プルリクエスト作成

## ライセンス

MIT License

## サポート

- GitHub Issues: [課題報告・機能要望](https://github.com/ShawTB12/CentralAgent/issues)
- 技術的な質問: READMEを参照してください

---

**注意**: このアプリケーションは企業分析の参考情報を提供するものです。投資や経営判断には追加の調査と専門家の助言をお勧めします。 