import React, { useEffect, useRef, useState } from 'react'
import { StreamingMessage } from '@/hooks/useStreamingAnalysis'
import { Loader2, StopCircle, AlertCircle, CheckCircle, Sparkles, Clock, Bug } from 'lucide-react'

interface StreamingAnalysisProps {
  messages: StreamingMessage[]
  isStreaming: boolean
  progress: number
  currentStage: string
  error: string | null
  fullContent: string
  onStop?: () => void
  onAnalysisComplete?: (analysisData: any) => void
}

export const StreamingAnalysis: React.FC<StreamingAnalysisProps> = ({
  messages,
  isStreaming,
  progress,
  currentStage,
  error,
  fullContent,
  onStop,
  onAnalysisComplete
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const analysisContentRef = useRef<HTMLDivElement>(null)
  const [autoTransitionTimer, setAutoTransitionTimer] = useState<number | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [showDebug, setShowDebug] = useState(false)
  const [manualTriggerAvailable, setManualTriggerAvailable] = useState(false)

  // 自動スクロール
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [messages, fullContent])

  // デバッグ情報の更新
  useEffect(() => {
    const newDebugInfo = {
      timestamp: new Date().toISOString(),
      currentStage,
      isStreaming,
      messagesCount: messages.length,
      fullContentLength: fullContent?.length || 0,
      hasCompleteMessage: messages.some(msg => msg.type === 'analysis_complete'),
      hasOnAnalysisComplete: !!onAnalysisComplete,
      autoTransitionTimer: autoTransitionTimer !== null,
      lastMessage: messages[messages.length - 1]?.type || 'none'
    }
    setDebugInfo(newDebugInfo)
    console.log('🔍 StreamingAnalysis Debug:', newDebugInfo)
  }, [currentStage, isStreaming, messages, fullContent, onAnalysisComplete, autoTransitionTimer])

  // より確実な分析完了検知
  useEffect(() => {
    console.log('🎯 分析完了検知チェック開始')
    
    // 複数の条件で完了を判定
    const hasCompleteMessage = messages.some(msg => msg.type === 'analysis_complete')
    const hasSignificantContent = fullContent && fullContent.length > 500
    const isAnalysisComplete = !isStreaming && hasSignificantContent
    const stageIndicatesComplete = currentStage === 'complete'
    
    // 手動トリガーの有効化条件（より緩い条件）
    if (hasSignificantContent && !isStreaming) {
      setManualTriggerAvailable(true)
    }
    
    console.log('🎯 完了検知状態:', {
      hasCompleteMessage,
      hasSignificantContent,
      isAnalysisComplete,
      stageIndicatesComplete,
      isStreaming,
      onAnalysisComplete: !!onAnalysisComplete
    })
    
    // 自動遷移の条件
    if ((isAnalysisComplete || stageIndicatesComplete || hasCompleteMessage) && onAnalysisComplete && !autoTransitionTimer) {
      console.log('🚀 自動遷移タイマー開始（3秒）')
      
      const timer = setTimeout(() => {
        console.log('🚀 自動遷移実行')
        executeTransition()
      }, 3000)

      setAutoTransitionTimer(timer as any)

      return () => {
        if (timer) clearTimeout(timer)
      }
    }
  }, [currentStage, fullContent, onAnalysisComplete, messages, isStreaming, autoTransitionTimer])

  // タイムアウト機能（30秒後に強制的に手動オプションを有効化）
  useEffect(() => {
    if (isStreaming) {
      const timeoutTimer = setTimeout(() => {
        console.log('⏰ タイムアウト: 手動遷移を有効化')
        setManualTriggerAvailable(true)
      }, 30000) // 30秒

      return () => clearTimeout(timeoutTimer)
    }
  }, [isStreaming])

  const executeTransition = () => {
    console.log('🎊 遷移を実行します')
    
    // 分析結果からメタデータを抽出
    const completeMessage = messages.find(msg => msg.type === 'analysis_complete')
    const analysisData = completeMessage?.metadata?.analysisData || {
      companyName: extractCompanyNameFromContent(fullContent) || '企業名',
      fullContent: fullContent,
      searchResultsCount: messages.filter(msg => msg.type === 'analysis_progress').length,
      dataSource: 'ストリーミング分析結果'
    }
    
    console.log('🎊 分析データ:', analysisData)
    
    if (onAnalysisComplete) {
      onAnalysisComplete(analysisData)
      // タイマーをクリア
      if (autoTransitionTimer) {
        clearTimeout(autoTransitionTimer)
        setAutoTransitionTimer(null)
      }
    }
  }

  // コンテンツから企業名を抽出する関数
  const extractCompanyNameFromContent = (content: string): string | null => {
    if (!content) return null
    
    // 「〜の企業分析」「〜について」などのパターンを探す
    const patterns = [
      /## 📈 (.+?)の/, 
      /企業名[:\s]*(.+?)[\n\r]/,
      /会社名[:\s]*(.+?)[\n\r]/,
      /(.+?)の企業分析/,
      /(.+?)について/
    ]
    
    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    return null
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'start':
      case 'starting':
        return '🚀'
      case 'search':
        return '🔍'
      case 'search_complete':
        return '✅'
      case 'claude_analysis':
      case 'streaming_analysis':
        return '🧠'
      case 'complete':
        return '🎉'
      case 'error':
        return '❌'
      case 'aborted':
      case 'stopped':
        return '⏹️'
      default:
        return '⚡'
    }
  }

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'start':
      case 'starting':
        return '分析開始'
      case 'search':
        return 'Web検索実行中'
      case 'search_complete':
        return 'Web検索完了'
      case 'claude_analysis':
        return 'AI分析開始'
      case 'streaming_analysis':
        return 'AI分析実行中'
      case 'complete':
        return '分析完了'
      case 'error':
        return 'エラー発生'
      case 'aborted':
      case 'stopped':
        return '分析停止'
      default:
        return '処理中'
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* プログレスバー */}
      {isStreaming && (
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getStageIcon(currentStage)}</span>
              <span className="text-white font-medium">{getStageText(currentStage)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{Math.min(progress, 100)}%</span>
              {onStop && (
                <button
                  onClick={onStop}
                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                  title="分析を停止"
                >
                  <StopCircle size={20} />
                </button>
              )}
            </div>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 自動遷移タイマー表示 */}
      {autoTransitionTimer && (
        <div className="bg-blue-800/30 border border-blue-600 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-300">
            <Clock size={16} className="animate-pulse" />
            <span className="text-sm">3秒後に自動でスライド作成を開始します...</span>
          </div>
        </div>
      )}

      {/* 手動遷移オプション */}
      {manualTriggerAvailable && onAnalysisComplete && (
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Sparkles size={16} />
            分析完了！次のステップを選択:
          </h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={executeTransition}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
            >
              <Sparkles size={16} />
              AIスライド作成を開始
            </button>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
            >
              <Bug size={16} />
              {showDebug ? 'デバッグ非表示' : 'デバッグ表示'}
            </button>
          </div>
        </div>
      )}

      {/* デバッグ情報パネル */}
      {showDebug && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <h4 className="text-gray-300 font-medium mb-2 flex items-center gap-2">
            <Bug size={16} />
            デバッグ情報
          </h4>
          <pre className="text-xs text-gray-400 overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle size={20} />
            <span className="font-medium">エラーが発生しました</span>
          </div>
          <p className="text-red-300 text-sm mt-2">{error}</p>
        </div>
      )}

      {/* メッセージ表示 */}
      <div 
        ref={contentRef}
        className="bg-neutral-800/50 backdrop-blur-lg rounded-lg border border-neutral-700/50 p-4 max-h-96 overflow-y-auto space-y-3"
      >
        {messages.map((message) => (
          <div key={message.id} className="text-gray-100">
            {message.type === 'analysis_start' && (
              <div className="flex items-center gap-2 text-blue-400">
                <Loader2 className="animate-spin" size={16} />
                <span>{message.content}</span>
              </div>
            )}
            
            {message.type === 'analysis_progress' && (
              <div className="flex items-center gap-2 text-gray-300">
                {message.metadata?.stage === 'search_complete' ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <Loader2 className="animate-spin" size={16} />
                )}
                <span>{message.content}</span>
              </div>
            )}

            {message.type === 'analysis_complete' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 font-medium">
                  <CheckCircle size={16} />
                  <span>{message.content}</span>
                </div>
              </div>
            )}

            {message.type === 'analysis_error' && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={16} />
                <span>{message.content}</span>
              </div>
            )}
          </div>
        ))}

        {/* ストリーミング分析内容 */}
        {fullContent && (
          <div className="mt-4 pt-4 border-t border-neutral-700">
            <div className="prose prose-invert prose-sm max-w-none">
              <div 
                ref={analysisContentRef}
                className="whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatAnalysisContent(fullContent)
                }}
              />
              {isStreaming && (
                <span className="inline-block w-2 h-5 bg-white animate-pulse ml-1 align-text-bottom" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 分析内容のフォーマット関数
function formatAnalysisContent(content: string): string {
  return content
    // マークダウンの見出しをHTMLに変換
    .replace(/^## (.*$)/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-3 flex items-center gap-2">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-4">$1</h2>')
    
    // 箇条書きの変換
    .replace(/^- (.*$)/gm, '<li class="text-gray-300 ml-4">$1</li>')
    .replace(/^\* (.*$)/gm, '<li class="text-gray-300 ml-4">$1</li>')
    
    // 強調テキスト
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-gray-200 italic">$1</em>')
    
    // 改行の処理
    .replace(/\n\n/g, '</p><p class="text-gray-300 leading-relaxed mb-3">')
    .replace(/\n/g, '<br/>')
    
    // 段落の開始
    .replace(/^/, '<p class="text-gray-300 leading-relaxed mb-3">')
    .replace(/$/, '</p>')
} 