'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface PowerPointGeneratorProps {
  analysisData: any
  companyName: string
  isVisible: boolean
}

interface GeneratedFile {
  fileId: string
  companyName: string
  downloadUrl: string
  isDownloading: boolean
  isCleaningUp: boolean
}

export default function PowerPointGenerator({ 
  analysisData, 
  companyName, 
  isVisible 
}: PowerPointGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const generatePowerPoint = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      
      console.log('🎯 PowerPoint生成開始:', companyName)
      toast.info('PowerPoint生成を開始しています...')

      const response = await fetch('/api/generate-powerpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: companyName,
          analysis_data: analysisData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'PowerPoint生成に失敗しました')
      }

      const result = await response.json()
      console.log('✅ PowerPoint生成成功:', result)

      // 生成されたファイルをリストに追加
      const newFile: GeneratedFile = {
        fileId: result.file_id,
        companyName: result.company_name,
        downloadUrl: result.download_url,
        isDownloading: false,
        isCleaningUp: false,
      }

      setGeneratedFiles(prev => [newFile, ...prev])
      toast.success('PowerPointファイルが正常に生成されました！')

    } catch (error) {
      console.error('❌ PowerPoint生成エラー:', error)
      const errorMessage = error instanceof Error ? error.message : 'PowerPoint生成に失敗しました'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadFile = async (file: GeneratedFile) => {
    try {
      // ダウンロード状態を更新
      setGeneratedFiles(prev => 
        prev.map(f => 
          f.fileId === file.fileId 
            ? { ...f, isDownloading: true }
            : f
        )
      )

      console.log('📥 ダウンロード開始:', file.fileId)
      
      const response = await fetch(file.downloadUrl)
      if (!response.ok) {
        throw new Error('ダウンロードに失敗しました')
      }

      // ファイルをダウンロード
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `企業分析_${file.companyName}_${new Date().toISOString().slice(0, 10)}.pptx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log('✅ ダウンロード完了')
      toast.success('ファイルをダウンロードしました')

    } catch (error) {
      console.error('❌ ダウンロードエラー:', error)
      const errorMessage = error instanceof Error ? error.message : 'ダウンロードに失敗しました'
      toast.error(errorMessage)
    } finally {
      // ダウンロード状態をリセット
      setGeneratedFiles(prev => 
        prev.map(f => 
          f.fileId === file.fileId 
            ? { ...f, isDownloading: false }
            : f
        )
      )
    }
  }

  const cleanupFile = async (file: GeneratedFile) => {
    try {
      // クリーンアップ状態を更新
      setGeneratedFiles(prev => 
        prev.map(f => 
          f.fileId === file.fileId 
            ? { ...f, isCleaningUp: true }
            : f
        )
      )

      console.log('🧹 ファイルクリーンアップ:', file.fileId)

      const response = await fetch(`/api/download-powerpoint/${file.fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'クリーンアップに失敗しました')
      }

      // ファイルをリストから削除
      setGeneratedFiles(prev => prev.filter(f => f.fileId !== file.fileId))
      
      console.log('✅ クリーンアップ完了')
      toast.success('ファイルを削除しました')

    } catch (error) {
      console.error('❌ クリーンアップエラー:', error)
      const errorMessage = error instanceof Error ? error.message : 'ファイル削除に失敗しました'
      toast.error(errorMessage)
    } finally {
      // クリーンアップ状態をリセット
      setGeneratedFiles(prev => 
        prev.map(f => 
          f.fileId === file.fileId 
            ? { ...f, isCleaningUp: false }
            : f
        )
      )
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          PowerPoint生成
        </CardTitle>
        <CardDescription>
          分析結果をPowerPointプレゼンテーションとして出力します
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 生成ボタン */}
        <div className="flex flex-col space-y-3">
          <Button
            onClick={generatePowerPoint}
            disabled={isGenerating || !analysisData}
            className="w-full h-12"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                PowerPoint生成中...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                PowerPointプレゼンテーションを生成
              </>
            )}
          </Button>
          
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* 生成されたファイル一覧 */}
        {generatedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">生成されたファイル</h3>
            <div className="space-y-2">
              {generatedFiles.map((file) => (
                <div
                  key={file.fileId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">{file.companyName} - 企業分析</p>
                      <p className="text-sm text-gray-500">
                        ファイルID: {file.fileId.slice(0, 8)}...
                      </p>
                    </div>
                    <Badge variant="secondary">PowerPoint</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => downloadFile(file)}
                      disabled={file.isDownloading || file.isCleaningUp}
                      variant="outline"
                      size="sm"
                    >
                      {file.isDownloading ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ダウンロード中...
                        </>
                      ) : (
                        <>
                          <Download className="mr-1 h-3 w-3" />
                          ダウンロード
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => cleanupFile(file)}
                      disabled={file.isDownloading || file.isCleaningUp}
                      variant="outline"
                      size="sm"
                    >
                      {file.isCleaningUp ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          削除中...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-1 h-3 w-3" />
                          削除
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用方法 */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">使用方法</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 企業分析が完了すると、PowerPoint生成ボタンが有効になります</li>
            <li>• 生成されたファイルはPowerPoint形式（.pptx）でダウンロードできます</li>
            <li>• 不要になったファイルは削除ボタンでクリーンアップできます</li>
            <li>• 各スライドには分析結果が自動的に挿入されます</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 