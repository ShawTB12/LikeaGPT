# NEWJEC GPT

🚀 **NEWJEC GPT** - セキュリティとプライバシーを重視したNext.js製のAIチャットアプリケーション

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-API-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-blue)

## ✨ 特徴

### 🛡️ セキュリティ重視
- **データ学習防止**: OpenAIの学習に使用されない設定
- **サーバーサイド処理**: APIキーをクライアントに露出させない安全な設計
- **入力バリデーション**: セキュリティ関連コンテンツの自動フィルタリング
- **プライバシー保護**: 匿名性を保持した通信

### 🎯 専門機能
- **英文翻訳・添削**: 正確な翻訳と文法・スタイル改善提案
- **コーディング支援**: プログラミング、デバッグ、コードレビュー
- **資料作成アシスト**: 提案書、レポート、プレゼン資料の構成支援

### 💬 チャット管理
- **履歴管理**: サイドバーでのチャット履歴表示・切り替え
- **自動タイトル生成**: 最初のメッセージからタイトルを自動生成
- **ローカル永続化**: ブラウザ再読み込み後も履歴が保持
- **リアルタイム通信**: 高速でスムーズなチャット体験

### 🎨 モダンUI/UX
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **ダークテーマ**: 目に優しいモダンなインターフェース
- **ローディング状態**: 適切なフィードバック表示
- **エラーハンドリング**: ユーザーフレンドリーなエラー表示

## 🚀 クイックスタート

### 前提条件
- Node.js 18.0 以上
- OpenAI APIキー

### インストール

1. **リポジトリのクローン**
```bash
git clone https://github.com/ShawTB12/LikeaGPT.git
cd LikeaGPT
```

2. **依存関係のインストール**
```bash
npm install --legacy-peer-deps
```

3. **環境変数の設定**
```bash
# .env.local ファイルを作成
OPENAI_API_KEY=sk-your-openai-api-key-here
NEXT_PUBLIC_APP_ENV=production
```

4. **開発サーバーの起動**
```bash
npm run dev
```

5. **ブラウザでアクセス**
```
http://localhost:3000
```

## 📖 使用方法

### 基本的なチャット
1. メッセージを入力してEnterキーまたは送信ボタンをクリック
2. AIからの応答を待機
3. 継続的な会話が可能

### クイックアクション
- **🌍 英文翻訳・添削**: 英文の翻訳や文法チェック
- **💻 コーディング**: プログラミング支援
- **📄 資料作成アシスト**: 文書作成支援

### チャット管理
- **New Chat**: 新しいチャットセッションを開始
- **履歴切り替え**: サイドバーから過去のチャットに切り替え
- **自動保存**: ローカルストレージに自動保存

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15.2.4**: React フレームワーク
- **TypeScript**: 型安全な開発
- **TailwindCSS**: ユーティリティファーストCSS
- **Radix UI**: アクセシブルなコンポーネント

### バックエンド
- **Next.js API Routes**: サーバーレス API
- **OpenAI SDK**: 公式SDKを使用
- **セキュリティ重視**: APIキー保護・入力検証

### 状態管理
- **React Hooks**: useState, useEffect
- **Local Storage**: クライアントサイド永続化

## 📁 プロジェクト構造

```
├── app/
│   ├── api/chat/           # OpenAI API ルート
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # アプリケーションレイアウト
│   └── page.tsx            # メインページ
├── components/
│   └── ui/                 # UI コンポーネント
├── lib/
│   └── utils.ts            # ユーティリティ関数
├── public/                 # 静的ファイル
└── styles/                 # スタイルファイル
```

## 🔧 設定

### OpenAI設定
- **モデル**: gpt-4o-mini（効率的で高品質）
- **最大トークン**: 1000
- **Temperature**: 0.7
- **データ学習**: 無効化

### セキュリティ設定
- APIキーのサーバーサイド処理
- 入力バリデーション
- レート制限対応
- エラーハンドリング

## 📚 詳細ドキュメント

セットアップとセキュリティの詳細については、[OPENAI_SETUP.md](./OPENAI_SETUP.md) をご参照ください。

## 🤝 コントリビュート

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 ライセンス

このプロジェクトは MIT License の下で配布されています。詳細は [LICENSE](LICENSE) ファイルをご参照ください。

## 🔗 関連リンク

- [OpenAI Platform](https://platform.openai.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 📞 サポート

問題や質問がある場合は、[GitHub Issues](https://github.com/ShawTB12/LikeaGPT/issues) を作成してください。

---

Built with ❤️ by NEWJEC Team 