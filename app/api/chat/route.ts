import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAIクライアントを遅延初期化する関数
const getOpenAIClient = (): OpenAI => {
  // デバッグ用ログ（実際のキーは表示しない）
  console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY)
  console.log('OpenAI API Key length:', process.env.OPENAI_API_KEY?.length || 0)
  
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

export async function POST(request: NextRequest) {
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

    // OpenAI APIの呼び出し（ストリーミング対応）
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
      stream: true // ストリーミングを有効化
    })

    // ストリーミングレスポンスを作成
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              // タイプライター効果のために各文字をJSONで送信
              const data = JSON.stringify({ content, done: false })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          // ストリーム終了の合図
          const endData = JSON.stringify({ content: '', done: true })
          controller.enqueue(encoder.encode(`data: ${endData}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          const errorData = JSON.stringify({ 
            error: 'ストリーミング中にエラーが発生しました。',
            done: true 
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
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