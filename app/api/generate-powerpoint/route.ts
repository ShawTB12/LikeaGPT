import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Python backend のURL（環境変数または固定値）
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:5001'

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 PowerPoint生成リクエスト受信')

    // リクエストからJSONデータを取得
    const body = await request.json()
    console.log('📊 企業名:', body.company_name)
    console.log('📋 分析データ:', Object.keys(body.analysis_data || {}))

    // 必須フィールドの検証
    if (!body.company_name) {
      return NextResponse.json(
        { error: 'company_name が必要です' },
        { status: 400 }
      )
    }

    if (!body.analysis_data) {
      return NextResponse.json(
        { error: 'analysis_data が必要です' },
        { status: 400 }
      )
    }

    // Python backend にリクエストを転送
    console.log('🔄 Python backendにリクエスト転送中...')
    
    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/generate-powerpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json().catch(() => ({}))
      console.error('❌ Python backend エラー:', errorData)
      
      return NextResponse.json(
        { 
          error: `PowerPoint生成エラー: ${errorData.error || 'Unknown error'}`,
          details: errorData
        },
        { status: pythonResponse.status }
      )
    }

    const result = await pythonResponse.json()
    console.log('✅ PowerPoint生成成功:', result.file_id)

    // Next.js 側のダウンロードURLを作成
    const downloadUrl = `/api/download-powerpoint/${result.file_id}`

    return NextResponse.json({
      success: true,
      message: 'PowerPointファイルが正常に生成されました',
      file_id: result.file_id,
      company_name: result.company_name,
      download_url: downloadUrl,
      python_backend_url: `${PYTHON_BACKEND_URL}/download/${result.file_id}` // 直接アクセス用
    })

  } catch (error) {
    console.error('❌ PowerPoint生成エラー:', error)
    
    return NextResponse.json(
      { 
        error: 'PowerPoint生成に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Python backend のヘルスチェック
    const healthResponse = await fetch(`${PYTHON_BACKEND_URL}/health`, {
      method: 'GET',
    })

    if (!healthResponse.ok) {
      return NextResponse.json(
        { 
          error: 'Python backend に接続できません',
          backend_url: PYTHON_BACKEND_URL,
          status: healthResponse.status
        },
        { status: 503 }
      )
    }

    const healthData = await healthResponse.json()

    return NextResponse.json({
      status: 'healthy',
      message: 'PowerPoint生成APIが利用可能です',
      backend_status: healthData,
      backend_url: PYTHON_BACKEND_URL
    })

  } catch (error) {
    console.error('❌ ヘルスチェックエラー:', error)
    
    return NextResponse.json(
      { 
        error: 'Python backend へのアクセスに失敗しました',
        backend_url: PYTHON_BACKEND_URL,
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 503 }
    )
  }
} 