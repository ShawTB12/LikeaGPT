import Anthropic from '@anthropic-ai/sdk'
import type { WebSearchResponse, CompanyAnalysis, ChartData, AnalysisRequest } from './types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeCompanyWithClaude(request: AnalysisRequest): Promise<CompanyAnalysis> {
  const { companyName, searchResults } = request

  // 検索結果をテキストに変換
  const searchContext = searchResults.results
    .map(result => `【${result.title}】\n${result.content}\n出典: ${result.url}`)
    .join('\n\n')

  const prompt = `
あなたは戦略コンサルティングファームのシニアパートナーです。"${companyName}"に関するPowerPoint企業分析資料のプレースホルダーに挿入するデータを生成してください。

=== 検索結果 ===
${searchContext}

=== PowerPoint構成とプレースホルダー ===
各セクションの文字数制限を厳守して、簡潔で価値のある内容を日本語で作成してください：

**スライド1: リサーチ資料**
- {企業名}: 正式企業名（英語併記推奨）

**スライド3: 企業概要**
- {企業概要}(300文字): 設立背景、事業内容、規模、特徴を簡潔に
- {競合比較}(300文字): 主要競合3社との比較、市場ポジション、差別化要因
- {重要課題}(300文字): 現在直面している経営課題、業界課題、戦略的課題

**スライド4: 収益構造・財務分析**
- {売上構造}(200文字): 主要セグメント別売上、収益源、ビジネスモデル
- {財務分析サマリ}(200文字): ROE、ROA、負債比率等の財務健全性評価
- {売上高}: 最新年度の連結売上高（単位：億円/兆円）
- {営業利益}: 最新年度の営業利益（単位：億円/兆円）
- {自己資本比率}: 最新の自己資本比率（%表記）

**スライド5: SWOT分析**
- {強み}(250文字): 技術力、ブランド力、市場地位等の競争優位性
- {弱み}(250文字): 改善すべき課題、リスク要因、制約事項
- {機会}(250文字): 市場拡大、新規事業、規制緩和等の成長機会
- {技術革新}(250文字): DX推進、AI活用、イノベーション戦略

**スライド6: 最新動向**
- {最新ニュース①}(250文字): 直近3ヶ月の最重要ニュース・発表
- {最新ニュース②}(250文字): 新製品・新サービス・事業展開
- {最新ニュース③}(250文字): M&A・提携・投資等の戦略的動向

**スライド7: 財務課題／顧客課題**
- {財務課題}(250文字): 資金調達、投資効率、コスト構造の課題
- {業界課題}(250文字): 業界全体が直面する課題、規制変更の影響
- {顧客ビジョン}(250文字): 顧客価値創造、CX向上の取り組み
- {顧客課題}(250文字): 顧客が抱える課題、市場ニーズへの対応

=== 出力フォーマット ===
以下のJSONフォーマットで日本語にて回答してください：

{
  "slide1": {
    "企業名": "株式会社○○（○○ Corp.）"
  },
  "slide3": {
    "企業概要": "300文字以内の企業概要...",
    "競合比較": "300文字以内の競合比較...",
    "重要課題": "300文字以内の重要課題..."
  },
  "slide4": {
    "売上構造": "200文字以内の売上構造...",
    "財務分析サマリ": "200文字以内の財務分析...",
    "売上高": "X.X兆円",
    "営業利益": "X,XXX億円",
    "自己資本比率": "XX.X%"
  },
  "slide5": {
    "強み": "250文字以内の強み...",
    "弱み": "250文字以内の弱み...",
    "機会": "250文字以内の機会...",
    "技術革新": "250文字以内の技術革新..."
  },
  "slide6": {
    "最新ニュース①": "250文字以内の最新ニュース...",
    "最新ニュース②": "250文字以内の最新ニュース...",
    "最新ニュース③": "250文字以内の最新ニュース..."
  },
  "slide7": {
    "財務課題": "250文字以内の財務課題...",
    "業界課題": "250文字以内の業界課題...",
    "顧客ビジョン": "250文字以内の顧客ビジョン...",
    "顧客課題": "250文字以内の顧客課題..."
  }
}

**注意事項:**
- 文字数制限を厳守してください
- 具体的な数値やデータを優先してください
- 曖昧な表現は避け、事実ベースで記載してください
- 最新の情報を優先してください（検索結果の日付を確認）
- プレゼンテーション資料として適切な簡潔で分かりやすい表現を使用してください
- すべての内容を日本語で出力してください
`

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229", // claude-3-7-sonnet-latestはまだ正式リリース前のため、sonnetを使用
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Claude の応答を構造化データに変換
    return parseClaudeAnalysis(companyName, analysisText, searchResults)
    
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('企業分析の生成に失敗しました')
  }
}

function parseClaudeAnalysis(companyName: string, analysisText: string, searchResults: WebSearchResponse): CompanyAnalysis {
  // テキストを解析して構造化データに変換
  const sections = analysisText.split(/\d+\.\s+/)
  
  return {
    companyName,
    overview: extractSection(sections, '企業概要') || `${companyName}は業界をリードする企業として、革新的な製品とサービスを提供しています。`,
    marketPosition: extractSection(sections, '市場ポジション') || '業界における重要なポジションを占め、安定した市場シェアを維持しています。',
    challenges: extractSection(sections, '主要な課題') || '市場競争の激化、技術革新への対応、規制環境の変化などの課題に直面しています。',
    solutions: extractSection(sections, '解決策') || 'AI技術の活用、デジタル変革の推進、新市場への展開により競争力を強化しています。',
    financialStatus: extractSection(sections, '財務状況') || '健全な財務基盤を持ち、持続的な成長を実現しています。',
    strategy: extractSection(sections, '戦略的方向性') || '長期的な視点に立った戦略的投資と事業ポートフォリオの最適化を進めています。',
    risks: extractSection(sections, 'リスク分析') || '市場変動、技術的リスク、競合他社の動向に注意が必要です。',
    conclusion: extractSection(sections, '結論') || '総合的に見て、今後も成長が期待される企業です。',
    
    // サンプルデータを生成
    marketShareData: generateMarketShareData(companyName),
    financialTrendData: generateFinancialTrendData(companyName),
    competitorComparisonData: generateCompetitorComparisonData(companyName),
    
    keyMetrics: {
      revenue: "2.8兆円",
      growth: "+7.2%",
      marketShare: "18.5%",
      employees: "45,000人"
    },
    
    keyInsights: [
      {
        icon: "fas fa-chart-line",
        title: "安定成長",
        description: "継続的な売上成長を実現"
      },
      {
        icon: "fas fa-cogs",
        title: "技術革新",
        description: "最新技術への積極投資"
      },
      {
        icon: "fas fa-users",
        title: "人材強化",
        description: "優秀な人材の確保・育成"
      }
    ],
    
    dataSource: `Web検索結果（${searchResults.results.length}件の情報源）`
  }
}

function extractSection(sections: string[], keyword: string): string | null {
  const section = sections.find(s => s.includes(keyword))
  return section ? section.replace(keyword, '').trim() : null
}

function generateMarketShareData(companyName: string): ChartData {
  return {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: companyName,
        data: [15.2, 16.8, 17.5, 18.1, 18.5],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3
      },
      {
        label: '競合A',
        data: [20.1, 19.8, 19.2, 18.8, 18.3],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2
      }
    ]
  }
}

function generateFinancialTrendData(companyName: string): ChartData {
  return {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: '売上高（兆円）',
        data: [2.1, 2.3, 2.5, 2.6, 2.8],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3
      },
      {
        label: '営業利益（兆円）',
        data: [0.28, 0.31, 0.34, 0.35, 0.38],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3
      }
    ]
  }
}

function generateCompetitorComparisonData(companyName: string): ChartData {
  return {
    labels: ['技術力', '市場シェア', '財務健全性', 'ブランド力', '成長性', '収益性'],
    datasets: [
      {
        label: companyName,
        data: [85, 78, 82, 88, 75, 80],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        borderWidth: 2
      },
      {
        label: '業界平均',
        data: [70, 60, 65, 68, 62, 58],
        backgroundColor: 'rgba(156, 163, 175, 0.2)',
        borderColor: '#9CA3AF',
        borderWidth: 2
      }
    ]
  }
} 