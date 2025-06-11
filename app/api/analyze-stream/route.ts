import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { searchWithTavily, searchWithDuckDuckGo } from '@/lib/web-search'

// Anthropic クライアントは関数内で初期化（サーバーレス環境対応）
let anthropic: Anthropic

export async function POST(request: NextRequest) {
  try {
    // デバッグ: 環境変数の確認
    console.log('🔍 ANTHROPIC_API_KEY status:', process.env.ANTHROPIC_API_KEY ? 'Set' : 'NOT SET')
    console.log('🔍 API Key prefix:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 15) + '...' : 'MISSING')
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY 環境変数が設定されていません' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Anthropic クライアントを初期化
    try {
      anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      })
      console.log('✅ Anthropic クライアント初期化成功')
    } catch (initError) {
      console.error('❌ Anthropic クライアント初期化失敗:', initError)
      return new Response(
        JSON.stringify({ error: `Anthropic クライアント初期化失敗: ${initError instanceof Error ? initError.message : String(initError)}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const { companyName } = await request.json()

    if (!companyName) {
      return new Response(
        JSON.stringify({ error: '企業名が必要です' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 分析開始通知
          const startMessage = {
            type: 'analysis_start',
            content: `${companyName}の深層企業分析を開始します（戦略的インサイト抽出モード）...`,
            metadata: { progress: 0, stage: 'start' }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(startMessage)}\n\n`))

          // Web検索実行
          const searchMessage = {
            type: 'analysis_progress', 
            content: '📊 戦略的インサイト抽出のため包括的情報収集を実行中...',
            metadata: { progress: 10, stage: 'search' }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(searchMessage)}\n\n`))

          // 検索実行
          const searchQueries = [
            `${companyName} 企業概要 会社概要 事業内容 売上高`,
            `${companyName} 財務諸表 決算 業績 営業利益 純利益`,
            `${companyName} 競合 業界 市場シェア ランキング`,
            `${companyName} 強み 弱み 課題 問題点`,
            `${companyName} 戦略 計画 投資 設備投資`,
            `${companyName} ニュース 発表 決算説明会 IR`,
            `${companyName} リスク 課題 将来性 見通し`
          ]

          let searchResults
          try {
            const searchPromises = searchQueries.map(query => searchWithTavily(query))
            const allResults = await Promise.all(searchPromises)
            
            searchResults = {
              query: companyName,
              results: allResults.flatMap(result => result.results).slice(0, 15),
              answer: allResults.find(result => result.answer)?.answer
            }
          } catch (error) {
            console.log('Tavily API失敗、DuckDuckGoにフォールバック...')
            searchResults = await searchWithDuckDuckGo(companyName)
          }

          // 検索完了通知
          const searchCompleteMessage = {
            type: 'analysis_progress',
            content: `✅ Web検索完了 (${searchResults.results.length}件の情報源を取得)`,
            metadata: { progress: 25, stage: 'search_complete', sources: searchResults.results.length }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(searchCompleteMessage)}\n\n`))

          // Claude分析開始通知  
          const analysisStartMessage = {
            type: 'analysis_progress',
            content: '🧠 深層分析による戦略的インサイト抽出を実行中（事実と推測を明確分離）...',
            metadata: { progress: 30, stage: 'claude_analysis' }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(analysisStartMessage)}\n\n`))

          // 検索結果をコンテキストに変換
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
- {企業名}: 正式企業名 （日本語表記のみ）

**スライド3: 企業概要**
- {企業概要}(300文字以上): 設立背景、事業内容、規模、特徴を簡潔に
- {競合比較}(300文字以上): 主要競合3社との比較、市場ポジション、差別化要因
- {重要課題}(300文字以上): 現在直面している経営課題、業界課題、戦略的課題

**スライド4: 収益構造・財務分析**
- {売上構造}(300文字以上): 主要セグメント別売上、収益源、ビジネスモデル
- {財務分析サマリ}(220文字以上): ROE、ROA、負債比率等の財務健全性評価
- {売上高}: 最新年度の連結売上高（単位：億円/兆円）
- {営業利益}: 最新年度の営業利益（単位：億円/兆円）
- {自己資本比率}: 最新の自己資本比率（%表記）

**スライド5: SWOT分析**
- {強み}(250文字以上): 技術力、ブランド力、市場地位等の競争優位性
- {弱み}(250文字以上): 改善すべき課題、リスク要因、制約事項
- {機会}(250文字以上): 市場拡大、新規事業、規制緩和等の成長機会
- {技術革新}(250文字以上): DX推進、AI活用、イノベーション戦略

**スライド6: 最新動向**
- {最新ニュース①}(250文字以上): 直近3ヶ月の最重要ニュース・発表
- {最新ニュース②}(250文字以上): 新製品・新サービス・事業展開
- {最新ニュース③}(250文字以上): M&A・提携・投資等の戦略的動向

**スライド7: 財務課題／顧客課題**
- {財務課題}(200文字以上): 資金調達、投資効率、コスト構造の課題
- {業界課題}(200文字以上): 業界全体が直面する課題、規制変更の影響
- {顧客ビジョン}(200文字以上): 顧客価値創造、CX向上の取り組み
- {顧客課題}(200文字以上): 顧客が抱える課題、市場ニーズへの対応

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

          // Claude APIストリーミング開始
          const claudeStream = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 12000,
            temperature: 0.1,
            stream: true,
            messages: [
              {
                role: "user", 
                content: prompt
              }
            ]
          })

          let accumulatedContent = ''
          let currentSection = ''
          let sectionCount = 0
          
          for await (const chunk of claudeStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text
              accumulatedContent += text
              
              // セクション区切りを検出
              if (text.includes('##')) {
                sectionCount++
                const progress = 30 + (sectionCount * 8) // 30%から開始して8%ずつ増加
                
                const sectionMessage = {
                  type: 'analysis_section',
                  content: text,
                  metadata: { 
                    progress: Math.min(progress, 95), 
                    stage: 'streaming_analysis',
                    section: sectionCount 
                  }
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(sectionMessage)}\n\n`))
              } else {
                // 通常のテキストストリーミング
                const streamMessage = {
                  type: 'analysis_stream',
                  content: text,
                  metadata: { 
                    progress: 30 + (sectionCount * 8),
                    stage: 'streaming_analysis' 
                  }
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(streamMessage)}\n\n`))
              }
            }
          }

          // 分析完了通知
          const completeMessage = {
            type: 'analysis_complete',
            content: '🎉 深層企業分析が完了しました（戦略的インサイト抽出済み・推測項目明確化済み）！',
            metadata: { 
              progress: 100, 
              stage: 'complete',
              analysisData: {
                companyName,
                fullContent: accumulatedContent,
                searchResultsCount: searchResults.results.length,
                dataSource: `戦略的インサイト抽出済みWeb検索結果（${searchResults.results.length}件の情報源）`
              }
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeMessage)}\n\n`))

        } catch (error) {
          console.error('ストリーミング分析エラー:', error)
          const errorMessage = {
            type: 'analysis_error',
            content: '❌ 分析中にエラーが発生しました。',
            metadata: { 
              error: error instanceof Error ? error.message : '不明なエラー' 
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('ストリーミングAPI エラー:', error)
    return new Response(
      JSON.stringify({ error: '内部サーバーエラー' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 