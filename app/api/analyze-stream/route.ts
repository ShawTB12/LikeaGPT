import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { searchWithTavily, searchWithDuckDuckGo } from '@/lib/web-search'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
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
            content: `${companyName}の企業分析を開始します...`,
            metadata: { progress: 0, stage: 'start' }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(startMessage)}\n\n`))

          // Web検索実行
          const searchMessage = {
            type: 'analysis_progress', 
            content: '📊 Web検索を実行中...',
            metadata: { progress: 10, stage: 'search' }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(searchMessage)}\n\n`))

          // 検索実行
          const searchQueries = [
            `${companyName} 企業概要 事業内容`,
            `${companyName} 財務 業績 売上`,
            `${companyName} 市場シェア 競合`,
            `${companyName} 戦略 将来計画`
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
            content: '🧠 Claude AIで詳細分析を実行中...',
            metadata: { progress: 30, stage: 'claude_analysis' }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(analysisStartMessage)}\n\n`))

          // 検索結果をコンテキストに変換
          const searchContext = searchResults.results
            .map(result => `【${result.title}】\n${result.content}\n出典: ${result.url}`)
            .join('\n\n')

          const prompt = `
以下は"${companyName}"に関する最新のWeb検索結果です。これらの情報を基に、包括的な企業分析を実行してください。

=== 検索結果 ===
${searchContext}

=== 分析要求 ===
以下の8つのセクションで構造化された企業分析レポートを作成してください。
各セクションは見出しと内容を明確に分けて記載してください：

## 📈 企業概要
会社の基本情報、事業内容、設立背景について詳しく説明してください。

## 💼 市場ポジション  
業界での立ち位置、競合状況、市場シェアについて分析してください。

## ⚠️ 主要な課題
現在直面している課題や問題点を具体的に挙げてください。

## 🎯 解決策・戦略
課題に対する対応策や成長戦略について説明してください。

## 💰 財務状況
売上、利益、財務健全性について詳細に分析してください。

## 🚀 戦略的方向性
中長期的な方針や投資計画について説明してください。

## ⚡ リスク分析
事業リスク、市場リスク、規制リスク等について詳しく分析してください。

## 🎊 結論と展望
総合評価と将来予測をまとめてください。

回答は日本語で、具体的で実用的な内容にしてください。各セクションは独立して読めるように詳細に記述してください。
`

          // Claude APIストリーミング開始
          const claudeStream = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 4000,
            temperature: 0.3,
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
            if (chunk.type === 'content_block_delta' && chunk.delta.text) {
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
            content: '🎉 企業分析が完了しました！',
            metadata: { 
              progress: 100, 
              stage: 'complete',
              analysisData: {
                companyName,
                fullContent: accumulatedContent,
                searchResultsCount: searchResults.results.length,
                dataSource: `Web検索結果（${searchResults.results.length}件の情報源）`
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