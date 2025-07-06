# BizBrain UI

シンプルで美しいチャットUIアプリケーション

## 機能概要

- 💬 **インタラクティブチャット**: 直感的なチャットインターフェース
- 📱 **レスポンシブUI**: デスクトップ・モバイル対応の最新UI
- 🎨 **モダンデザイン**: Radix UI とTailwind CSSによる美しいデザイン

## 技術スタック

- **フロントエンド**: Next.js 15.2.4, TypeScript, TailwindCSS
- **UI/UX**: Radix UI, Lucide React
- **スタイリング**: Tailwind CSS

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/ShawTB12/BizBrain.git
cd BizBrain
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## アーキテクチャ

```
┌─────────────────┐    ┌──────────────┐
│   Frontend      │    │   Backend    │
│                 │    │              │
│ • Chat UI       │◄──►│ • Next.js    │
│ • Sidebar       │    │ • TypeScript │
│ • Responsive    │    │ • React      │
└─────────────────┘    └──────────────┘
```

## UI コンポーネント

### 主要コンポーネント

- **サイドバー**: ナビゲーション用のサイドバー
- **チャット画面**: メッセージ送受信インターフェース
- **レスポンシブレイアウト**: デバイスに応じた最適化

### カスタマイズ

`app/page.tsx` を編集してUIをカスタマイズできます。

## コントリビューション

プルリクエストやイシューの報告をお待ちしています。

## ライセンス

MIT License 