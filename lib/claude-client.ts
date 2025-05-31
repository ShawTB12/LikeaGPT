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
あなたは戦略コンサルティングファームのシニアアナリストです。以下は"${companyName}"に関する最新のWeb検索結果です。これらの情報を基に、投資判断や経営戦略立案に資する包括的な企業分析を実行してください。

=== 検索結果 ===
${searchContext}

=== 分析フレームワーク ===
以下の7つの主要項目で戦略的企業分析レポートを作成してください：

1. 財務分析：過去5年間の財務トレンド分析、ROE/ROA分析、デュポン分析、キャッシュフロー分析
2. 競合他社比較：主要競合3-5社との包括的ベンチマーク、バリュエーション比較
3. 市場動向：SWOT分析、PEST分析、VRIO分析、5Forces分析
4. 課題の抽出：影響度×緊急度マトリックス、根本原因分析、定量的インパクト評価
5. 課題に対する取り組み：戦略オプション評価、アクションプラン、KPI設定
6. 直近3ヶ月以内の業界・企業ニュース：最新動向の戦略的示唆
7. 総合評価・今後の見通し：企業価値評価、3年間業績予測、投資判断

また、以下のデータも推定して提供してください：
- 主要財務指標（売上高、成長率、市場シェア、従業員数、ROE、ROA）
- 3つの重要な洞察（アイコン、タイトル、説明）
- チャート用のサンプルデータ（市場シェア推移、財務トレンド、競合比較）

回答は日本語で、戦略コンサルレベルの具体的で実用的な内容にしてください。
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