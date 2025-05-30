import { useState, useCallback, useRef } from 'react'

export interface StreamingMessage {
  id: string
  type: 'analysis_start' | 'analysis_progress' | 'analysis_section' | 'analysis_stream' | 'analysis_complete' | 'analysis_error'
  content: string
  metadata: {
    progress: number
    stage: string
    section?: number
    sources?: number
    error?: string
    analysisData?: any
  }
  timestamp: Date
}

export interface StreamingState {
  messages: StreamingMessage[]
  isStreaming: boolean
  progress: number
  currentStage: string
  error: string | null
  fullContent: string
}

export const useStreamingAnalysis = () => {
  const [state, setState] = useState<StreamingState>({
    messages: [],
    isStreaming: false,
    progress: 0,
    currentStage: '',
    error: null,
    fullContent: ''
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const messageIdRef = useRef(0)

  const startStreaming = useCallback(async (companyName: string) => {
    // 前回のストリーミングを中止
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // 新しいAbortControllerを作成
    abortControllerRef.current = new AbortController()

    // 状態をリセット
    setState({
      messages: [],
      isStreaming: true,
      progress: 0,
      currentStage: 'starting',
      error: null,
      fullContent: ''
    })

    try {
      const response = await fetch('/api/analyze-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is null')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        
        // Server-Sent Events形式の解析
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 最後の不完全な行を保持

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              const message: StreamingMessage = {
                id: `msg-${++messageIdRef.current}`,
                type: data.type,
                content: data.content,
                metadata: data.metadata,
                timestamp: new Date()
              }

              setState(prevState => {
                const newMessages = [...prevState.messages, message]
                let newFullContent = prevState.fullContent

                // ストリーミングテキストを蓄積
                if (data.type === 'analysis_stream' || data.type === 'analysis_section') {
                  newFullContent += data.content
                }

                return {
                  ...prevState,
                  messages: newMessages,
                  progress: data.metadata.progress || prevState.progress,
                  currentStage: data.metadata.stage || prevState.currentStage,
                  fullContent: newFullContent,
                  isStreaming: data.type !== 'analysis_complete' && data.type !== 'analysis_error'
                }
              })

              // 完了またはエラーの場合
              if (data.type === 'analysis_complete') {
                setState(prevState => ({
                  ...prevState,
                  isStreaming: false,
                  progress: 100,
                  currentStage: 'complete'
                }))
              } else if (data.type === 'analysis_error') {
                setState(prevState => ({
                  ...prevState,
                  isStreaming: false,
                  error: data.metadata.error || 'Unknown error',
                  currentStage: 'error'
                }))
              }

            } catch (parseError) {
              console.error('JSON解析エラー:', parseError)
            }
          }
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // ユーザーによる中止
        setState(prevState => ({
          ...prevState,
          isStreaming: false,
          currentStage: 'aborted'
        }))
      } else {
        // その他のエラー
        console.error('ストリーミングエラー:', error)
        setState(prevState => ({
          ...prevState,
          isStreaming: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          currentStage: 'error'
        }))
      }
    }
  }, [])

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState(prevState => ({
      ...prevState,
      isStreaming: false,
      currentStage: 'stopped'
    }))
  }, [])

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isStreaming: false,
      progress: 0,
      currentStage: '',
      error: null,
      fullContent: ''
    })
  }, [])

  return {
    ...state,
    startStreaming,
    stopStreaming,
    clearMessages
  }
} 