import { NextRequest, NextResponse } from 'next/server'

// Python backend のURL
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:5001'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file_id: string }> }
) {
  try {
    const { file_id } = await params
    console.log('📥 PowerPointダウンロード開始:', file_id)

    // Python backend のダウンロードエンドポイントにリクエスト
    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/download/${file_id}`, {
      method: 'GET',
    })

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json().catch(() => ({}))
      console.error('❌ ダウンロードエラー:', errorData)
      
      return NextResponse.json(
        { 
          error: `ファイルダウンロードエラー: ${errorData.error || 'File not found'}`,
          file_id: file_id,
          details: errorData
        },
        { status: pythonResponse.status }
      )
    }

    // ファイルデータをストリームとして取得
    const fileBuffer = await pythonResponse.arrayBuffer()
    
    // Content-Disposition ヘッダーから元のファイル名を取得
    const contentDisposition = pythonResponse.headers.get('content-disposition')
    let filename = `企業分析_${file_id}.pptx`
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }

    console.log('✅ ダウンロード完了:', filename)

    // ファイルを返す
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('❌ ダウンロードエラー:', error)
    
          return NextResponse.json(
        { 
          error: 'ファイルダウンロードに失敗しました',
          file_id: (await params).file_id,
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ file_id: string }> }
) {
  try {
    const { file_id } = await params
    console.log('🧹 ファイルクリーンアップ:', file_id)

    // Python backend のクリーンアップエンドポイントにリクエスト
    const pythonResponse = await fetch(`${PYTHON_BACKEND_URL}/cleanup/${file_id}`, {
      method: 'DELETE',
    })

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json().catch(() => ({}))
      console.error('❌ クリーンアップエラー:', errorData)
      
      return NextResponse.json(
        { 
          error: `ファイルクリーンアップエラー: ${errorData.error || 'Unknown error'}`,
          file_id: file_id,
          details: errorData
        },
        { status: pythonResponse.status }
      )
    }

    const result = await pythonResponse.json()
    console.log('✅ クリーンアップ完了:', file_id)

    return NextResponse.json({
      success: true,
      message: 'ファイルが正常にクリーンアップされました',
      file_id: file_id
    })

  } catch (error) {
    console.error('❌ クリーンアップエラー:', error)
    
          return NextResponse.json(
        { 
          error: 'ファイルクリーンアップに失敗しました',
          file_id: (await params).file_id,
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      )
  }
} 