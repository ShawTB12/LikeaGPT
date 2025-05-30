// API設定を管理
export const config = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-sonnet-20240229", // 最新のClaude 3 Sonnet
    maxTokens: 4000,
    temperature: 0.3
  },
  
  search: {
    tavily: {
      apiKey: process.env.TAVILY_API_KEY,
      apiUrl: "https://api.tavily.com/search"
    },
    google: {
      apiKey: process.env.GOOGLE_SEARCH_API_KEY,
      searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID
    }
  },
  
  // ログ設定
  logging: {
    enabled: process.env.NODE_ENV === 'development',
    level: 'info'
  }
}

// 環境変数の存在チェック
export function validateConfig() {
  const required = {
    'ANTHROPIC_API_KEY': config.anthropic.apiKey,
  }
  
  const optional = {
    'TAVILY_API_KEY': config.search.tavily.apiKey,
    'GOOGLE_SEARCH_API_KEY': config.search.google.apiKey,
    'GOOGLE_SEARCH_ENGINE_ID': config.search.google.searchEngineId,
  }
  
  const missing = Object.entries(required)
    .filter(([key, value]) => !value)
    .map(([key]) => key)
    
  if (missing.length > 0) {
    throw new Error(`必須の環境変数が設定されていません: ${missing.join(', ')}`)
  }
  
  const missingOptional = Object.entries(optional)
    .filter(([key, value]) => !value)
    .map(([key]) => key)
    
  if (missingOptional.length > 0) {
    console.warn(`オプション環境変数が未設定（一部機能が制限されます）: ${missingOptional.join(', ')}`)
  }
  
  console.log('設定チェック完了')
} 