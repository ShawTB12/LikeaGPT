// 共通型定義
export interface SearchResult {
  title: string
  url: string
  content: string
  published_date?: string
}

export interface WebSearchResponse {
  query: string
  results: SearchResult[]
  answer?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
  }[]
}

export interface CompanyAnalysis {
  companyName: string
  overview: string
  challenges: string
  solutions: string
  marketPosition: string
  financialStatus: string
  strategy: string
  risks: string
  conclusion: string
  marketShareData: ChartData
  financialTrendData: ChartData
  competitorComparisonData: ChartData
  keyMetrics: {
    revenue: string
    growth: string
    marketShare: string
    employees: string
  }
  keyInsights: {
    icon: string
    title: string
    description: string
  }[]
  dataSource: string
}

export interface AnalysisRequest {
  companyName: string
  searchResults: WebSearchResponse
}

export interface SlideData {
  id: number
  title: string
  content: string
  image?: string
}

export interface Message {
  text: string
  sender: string
  type?: 'text' | 'slides'
  slides?: SlideData[]
  analysisData?: CompanyAnalysis
}

// API Response型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string
}

// エラー型
export interface ApiError {
  message: string
  code?: string
  status?: number
}

// ストリーミング分析の型定義
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

export interface StreamingAnalysisHook extends StreamingState {
  startStreaming: (companyName: string) => Promise<void>
  stopStreaming: () => void
  clearMessages: () => void
} 