import React, { useEffect, useRef } from 'react'
import { StreamingMessage } from '@/hooks/useStreamingAnalysis'
import { Loader2, StopCircle, AlertCircle, CheckCircle } from 'lucide-react'

interface StreamingAnalysisProps {
  messages: StreamingMessage[]
  isStreaming: boolean
  progress: number
  currentStage: string
  error: string | null
  fullContent: string
  onStop?: () => void
}

export const StreamingAnalysis: React.FC<StreamingAnalysisProps> = ({
  messages,
  isStreaming,
  progress,
  currentStage,
  error,
  fullContent,
  onStop
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const analysisContentRef = useRef<HTMLDivElement>(null)

  // 自動スクロール
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [messages, fullContent])

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
              <span className="text-gray-400 text-sm">{progress}%</span>
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
              style={{ width: `${progress}%` }}
            />
          </div>
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
                {message.metadata.stage === 'search_complete' ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <Loader2 className="animate-spin" size={16} />
                )}
                <span>{message.content}</span>
              </div>
            )}

            {message.type === 'analysis_complete' && (
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <CheckCircle size={16} />
                <span>{message.content}</span>
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