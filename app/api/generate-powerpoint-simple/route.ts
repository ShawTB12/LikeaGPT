import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 簡易PowerPoint生成開始')

    const body = await request.json()
    const { company_name, analysis_data } = body

    if (!company_name || !analysis_data) {
      return NextResponse.json(
        { error: '企業名と分析データが必要です' },
        { status: 400 }
      )
    }

    // 現時点では、分析データをテキスト形式で提供
    const textReport = generateTextReport(company_name, analysis_data)
    
    // テキストファイルとしてダウンロード
    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' })
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Disposition': `attachment; filename="${company_name}_analysis_report.txt"`
      }
    })

  } catch (error) {
    console.error('❌ 簡易レポート生成エラー:', error)
    
    return NextResponse.json(
      { 
        error: 'レポート生成に失敗しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

function generateTextReport(companyName: string, analysisData: any): string {
  const timestamp = new Date().toLocaleString('ja-JP')
  
  return `
# ${companyName} 企業分析レポート
生成日時: ${timestamp}

## 企業概要
${analysisData.slide3?.企業概要 || 'データなし'}

## 競合比較  
${analysisData.slide3?.競合比較 || 'データなし'}

## 重要課題
${analysisData.slide3?.重要課題 || 'データなし'}

## 財務分析
### 売上構造
${analysisData.slide4?.売上構造 || 'データなし'}

### 財務サマリ
${analysisData.slide4?.財務分析サマリ || 'データなし'}

## SWOT分析
### 強み
${analysisData.slide5?.強み || 'データなし'}

### 弱み  
${analysisData.slide5?.弱み || 'データなし'}

### 機会
${analysisData.slide5?.機会 || 'データなし'}

### 技術革新
${analysisData.slide5?.技術革新 || 'データなし'}

## 最新動向
### ニュース①
${analysisData.slide6?.最新ニュース① || 'データなし'}

### ニュース②
${analysisData.slide6?.最新ニュース② || 'データなし'}

### ニュース③ 
${analysisData.slide6?.最新ニュース③ || 'データなし'}

## 顧客課題分析
### 財務課題
${analysisData.slide7?.財務課題 || 'データなし'}

### 業界課題
${analysisData.slide7?.業界課題 || 'データなし'}

### 顧客ビジョン
${analysisData.slide7?.顧客ビジョン || 'データなし'}

### 顧客課題
${analysisData.slide7?.顧客課題 || 'データなし'}

---
本レポートは AI による企業分析結果です。
詳細な検証を行った上でご活用ください。
`
} 