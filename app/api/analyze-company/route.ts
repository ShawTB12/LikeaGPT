import { NextRequest, NextResponse } from 'next/server'
import { searchWithTavily, searchWithDuckDuckGo } from '@/lib/web-search'
import { analyzeCompanyWithClaude } from '@/lib/claude-client'
import type { CompanyAnalysis } from '@/lib/types'

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface AnalysisData {
  companyName: string;
  overview: string;
  marketPosition: string;
  challenges: string;
  solutions: string;
  financialStatus: string;
  strategy: string;
  risks: string;
  conclusion: string;
  // 新しいデータ可視化フィールド
  marketShareData: ChartData;
  financialTrendData: ChartData;
  competitorComparisonData: ChartData;
  keyMetrics: {
    revenue: string;
    growth: string;
    marketShare: string;
    employees: string;
  };
  keyInsights: {
    icon: string;
    title: string;
    description: string;
  }[];
  dataSource: string;
}

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json()

    if (!companyName) {
      return NextResponse.json(
        { error: '企業名が必要です' },
        { status: 400 }
      )
    }

    console.log(`企業分析開始: ${companyName}`)

    // 1. Web検索を実行
    console.log('Web検索を実行中...')
    const searchQueries = [
      `${companyName} 企業概要 事業内容`,
      `${companyName} 財務 業績 売上`,
      `${companyName} 市場シェア 競合`,
      `${companyName} 戦略 将来計画`
    ]

    let searchResults
    try {
      // Tavily APIを優先使用
      const searchPromises = searchQueries.map(query => searchWithTavily(query))
      const allResults = await Promise.all(searchPromises)
      
      // 検索結果を統合
      searchResults = {
        query: companyName,
        results: allResults.flatMap(result => result.results).slice(0, 15),
        answer: allResults.find(result => result.answer)?.answer
      }
    } catch (error) {
      console.log('Tavily API失敗、DuckDuckGoにフォールバック...')
      searchResults = await searchWithDuckDuckGo(companyName)
    }

    console.log(`Web検索完了: ${searchResults.results.length}件の結果`)

    // 2. Claude AIで企業分析を実行
    console.log('Claude AIで企業分析を実行中...')
    const analysis = await analyzeCompanyWithClaude({
      companyName,
      searchResults
    })

    console.log('企業分析完了')

    return NextResponse.json({
      success: true,
      data: analysis,
      searchResultsCount: searchResults.results.length
    })

  } catch (error) {
    console.error('企業分析エラー:', error)
    
    return NextResponse.json(
      { 
        error: '企業分析中にエラーが発生しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}

// GET メソッドでのテスト用エンドポイント
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const companyName = url.searchParams.get('company')

  if (!companyName) {
    return NextResponse.json({
      message: 'POST /api/analyze-company にcompanyNameを送信してください',
      example: {
        method: 'POST',
        body: { companyName: 'トヨタ自動車' }
      }
    })
  }

  // GETでもテストできるようにリダイレクト
  try {
    const fakeRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName })
    })
    return POST(fakeRequest as NextRequest)
  } catch (error) {
    return NextResponse.json({ error: 'テスト実行中にエラーが発生しました' }, { status: 500 })
  }
} 