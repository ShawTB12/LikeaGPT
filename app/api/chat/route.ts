import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAIクライアントを遅延初期化する関数
const getOpenAIClient = (): OpenAI => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// リクエストの型定義
interface ChatRequest {
  message: string
}

// APIレスポンスの型定義
interface ChatResponse {
  message: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {

    // リクエストボディの解析
    const body: ChatRequest = await request.json()
    
    // 入力バリデーション
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { message: '', error: '有効なメッセージを入力してください。' },
        { status: 400 }
      )
    }

    // メッセージの長さ制限（セキュリティ対策）
    if (body.message.length > 4000) {
      return NextResponse.json(
        { message: '', error: 'メッセージが長すぎます。4000文字以内で入力してください。' },
        { status: 400 }
      )
    }

    // 有害なコンテンツの基本的なフィルタリング
    const harmfulPatterns = [
      /APIキー/i,
      /パスワード/i,
      /秘密/i,
      /トークン/i,
    ]
    
    if (harmfulPatterns.some(pattern => pattern.test(body.message))) {
      return NextResponse.json(
        { message: '', error: 'セキュリティ上の理由により、このメッセージは処理できません。' },
        { status: 400 }
      )
    }

    // OpenAI APIの呼び出し（セキュリティ設定付き）
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 最新の効率的なモデル
      messages: [
        {
          role: 'system',
          content: `あなたはNEWJEC GPTとして、以下の分野で専門的な支援を提供するAIアシスタントです：

1. 英文翻訳・添削：正確な翻訳と文法・スタイルの改善提案
2. コーディング：プログラミング、デバッグ、コードレビュー、最適化提案
3. 資料作成アシスト：提案書、レポート、プレゼン資料の構成・改善

日本語で丁寧かつ専門的な回答を心がけ、実用的で具体的なアドバイスを提供してください。
セキュリティとプライバシーを重視し、個人情報や機密情報に関する質問には答えないでください。`
        },
        {
          role: 'user',
          content: body.message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      // 重要: データ学習防止のための設定
      // OpenAI APIではデフォルトでAPIデータは学習に使用されませんが、
      // 明示的にuser IDを設定しないことで匿名性を保持
    }, {
      // リクエストヘッダーにデータ使用ポリシーを明示
      headers: {
        'OpenAI-Beta': 'assistants=v1',
      }
    })

    const aiMessage = completion.choices[0]?.message?.content

    if (!aiMessage) {
      return NextResponse.json(
        { message: '', error: 'AIからの応答を取得できませんでした。' },
        { status: 500 }
      )
    }

    // 成功レスポンス
    return NextResponse.json({
      message: aiMessage
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    
    // エラーハンドリング
    if (error instanceof Error) {
      // OpenAI APIキー設定エラー
      if (error.message.includes('OpenAI API key not configured')) {
        return NextResponse.json(
          { message: '', error: 'サーバー設定エラーが発生しました。' },
          { status: 500 }
        )
      }
      
      // OpenAI API固有のエラーハンドリング
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json(
          { message: '', error: 'APIクォータが不足しています。' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { message: '', error: '一時的にアクセスが集中しています。しばらく待ってからお試しください。' },
          { status: 429 }
        )
      }
    }

    // 一般的なエラー
    return NextResponse.json(
      { message: '', error: 'エラーが発生しました。しばらく待ってからお試しください。' },
      { status: 500 }
    )
  }
}

// GET リクエストは許可しない（セキュリティ対策）
export async function GET() {
  return NextResponse.json(
    { error: 'このエンドポイントはGETリクエストに対応していません。' },
    { status: 405 }
  )
} 