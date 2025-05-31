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
あなたはソフトバンク株式会社の法人営業部門のシニアアナリストです。顧客企業"${companyName}"の深層的な企業分析を実行し、戦略的インサイトを抽出してください。

=== 検索結果 ===
${searchContext}

=== 重要な制約事項 ===
🚨 **ハルシネーション防止ルール**
• 検索結果に記載されていない情報は絶対に創作しない
• 数値データは出典付きで記載されたもののみ使用
• 推測や想定は【推測】として明確にラベル付け
• 情報が不足している項目は「情報不足により分析不可」と明記
• 架空の数値、社名、データは一切出力禁止

🎯 **完全分析必須ルール**
• 全5枚のスライド分析を必ず完全に出力する
• 字数制限や省略は一切行わない
• 各セクションで詳細な分析を必ず実行する
• 「割愛」「省略」「以下同様」等の表現は禁止
• 情報不足の場合もその旨を詳細に記述する

=== 深層分析フレームワーク（全5枚完全分析必須） ===

## 📋 Slide 1: エグゼクティブサマリー
### 検索結果に基づく包括的戦略サマリー（完全版）
- **企業概要**: 検索結果から確認できる事業規模・主力事業・市場地位の詳細分析
- **財務パフォーマンス**: 検索結果に記載された売上・利益・成長率の多角的評価（出典明記）
- **競争優位性**: 検索結果で確認できる業界ランキング・シェア情報の戦略的解釈
- **重要課題の深層分析**: 検索結果で言及されている経営課題の根本原因と相互関係
- **【推測】DX機会の戦略的評価**: 検索結果から推察されるソフトバンクソリューション機会の詳細分析
- **情報品質評価**: 検索結果の情報源数、信頼性、時系列分析

## 💰 Slide 2: 収益構造と財務の深層分析
### 検索結果から読み解く財務戦略とボトルネック（完全版）
- **売上構造の解剖**: 検索結果に記載されたセグメント別情報の詳細分析（出典付き）
  - 各事業セグメントの成長性・収益性・市場環境の詳細評価
  - セグメント間のシナジー効果と相互依存関係の分析
  - 主力事業の競争優位性と持続可能性の評価
- **収益性指標の多角的評価**: 検索結果で確認できたROE・ROA・利益率の業界比較（出典付き）
  - 収益性トレンドの背景要因分析
  - 業界ベンチマークとの比較による競争力評価
  - 資本効率性と投資戦略の整合性分析
- **財務トレンドの戦略的示唆**: 検索結果に記載された前年比数値の深層解析（出典付き）
  - 成長ドライバーとボトルネックの特定
  - 財務指標変化の経営戦略への影響分析
  - キャッシュフロー構造と投資余力の評価
- **情報不足項目と分析限界**: 検索で確認できなかった重要財務データの戦略的影響
- **【推測】効率化ポテンシャルの定量評価**: 一般的な業界ベンチマークとの比較による改善可能性

## 🎯 Slide 3: SWOT分析（戦略環境の深層解析）
### 検索結果から抽出された戦略的洞察（完全版）
- **Strengths（内部強み）の戦略的価値**: 
  検索結果で言及された技術力・ブランド・財務状況等の競争優位性分析（出典明記・詳細記述）
  - コア・コンピタンスの識別と持続可能性の詳細評価
  - 他社との差別化要因の深層分析
  - 強みを活かした事業拡大可能性の具体的検討
  
- **Weaknesses（内部弱み）の戦略的リスク**: 
  検索結果で指摘されたシステム課題・業務非効率等の根本原因分析（出典明記・詳細記述）
  - 弱みが事業成長に与える定量的インパクトの評価
  - 競合他社との比較による相対的評価
  - 改善に向けた戦略的優先順位の設定
  
- **Opportunities（外部機会）の事業インパクト**: 
  検索結果で言及された市場機会・技術トレンド等の戦略的評価（出典明記・詳細記述）
  - 市場機会の規模と成長性の詳細分析
  - 同社の参入可能性と競争優位性の評価
  - 機会実現に必要な投資とリソースの検討
  
- **Threats（外部脅威）のリスク評価**: 
  検索結果で指摘された競合脅威・市場リスク等の影響度分析（出典明記・詳細記述）
  - 脅威の発現可能性と事業への影響度の評価
  - 競合他社の動向と市場シェア争いの分析
  - リスク軽減策と対応戦略の検討

※各項目で情報不足の場合は「検索結果に十分な情報なし - 追加調査要」と詳細に明記

## 📰 Slide 4: 最新動向とその戦略的示唆
### 検索結果から読み解く経営環境変化（完全版）
検索結果から抽出された具体的ニュースの深層分析（全件詳細分析）：

**【ニュース1】**: [検索結果の見出し・日付・出典URL]
- **事実関係**: 検索結果に記載された具体的内容の詳細整理
- **業界への波及効果**: 当該ニュースが業界全体に与える中長期的影響の詳細分析
- **【推測】戦略的示唆**: 一般的な業界知識に基づく企業戦略への影響分析
- **【推測】競合への影響**: 主要競合他社の対応策と市場動向予測
- **【推測】SB機会の詳細評価**: ソフトバンクソリューションとの関連性と提案タイミング

**【ニュース2】**: [検索結果の見出し・日付・出典URL]
- **事実関係**: 検索結果の具体的記述と背景情報の詳細分析
- **市場インパクト**: 株価・業界評価・顧客行動への影響の詳細評価
- **【推測】戦略的示唆**: 推測による中長期的な事業戦略への影響
- **【推測】技術トレンド**: デジタル変革との関連性と技術導入可能性
- **【推測】SB機会**: 具体的な提案アプローチと想定ソリューション

**【ニュース3】**: [検索結果の見出し・日付・出典URL]
- **事実関係**: 検索結果の具体的内容と関連データの詳細分析
- **経営戦略への影響**: 事業ポートフォリオ・投資戦略への示唆の詳細評価
- **【推測】戦略的示唆**: 推測による競争環境変化と対応策
- **【推測】イノベーション機会**: 新技術・新サービス導入可能性
- **【推測】SB機会**: タイミング・アプローチ方法・期待効果の詳細分析

※検索結果にニュースが含まれていない場合は「最新ニュース情報不足 - リアルタイム調査推奨」と詳細に明記

## 🎊 Slide 5: 総合戦略評価と提案ロードマップ
### 検索結果ベースの戦略的結論と行動計画（完全版）
- **事実に基づく現状評価の深層分析**: 
  - 検索結果で確認された財務状況・市場地位の多面的評価（出典付き・詳細分析）
  - 検索結果で言及された競争力・成長性の戦略的解釈（出典付き・詳細分析）
  - 業界内ポジショニングと相対的優位性の定量評価
  - 事業ポートフォリオの最適性と成長ドライバーの詳細分析

- **【推測】戦略的将来シナリオの詳細分析**:
  - **楽観シナリオ**: 一般的な業界トレンドに基づく最適成長予測
    - 成長ドライバー、市場拡大要因、競争優位性強化の詳細分析
    - 必要投資額、期待リターン、実現可能性の詳細評価
  - **基準シナリオ**: 現状維持ベースの堅実成長予測
    - 既存事業の安定成長、段階的改善、リスク管理の詳細分析
  - **悲観シナリオ**: 市場環境悪化時のリスク評価
    - 主要リスク要因、影響度、対応策の実効性の詳細分析

- **【推測】DX機会とビジネスポテンシャル**:
  - 検索結果から推察される効率化ニーズの詳細分析
  - 業界動向から想定されるシステム更新・DX投資の可能性
  - 競争力強化に向けた技術活用の戦略的方向性

- **分析総括と重要ポイント**: 
  - 検索結果から得られた最も重要な戦略的示唆の整理
  - 情報不足により追加調査が必要な重要項目の明記
  - 継続的にモニタリングすべき指標と変化要因の特定

=== 出力品質基準 ===
• **完全性**: 全5枚のスライドを必ず完全に分析・出力する
• **詳細性**: 各項目で詳細な分析を必ず実行する
• **事実**: 検索結果に記載された情報のみ（出典明記必須）
• **推測**: 【推測】ラベル付きで論理的根拠を明示
• **数値**: 検索結果に出典があるもののみ使用
• **企業名**: 検索結果に登場する実在企業のみ言及
• **不明事項**: 「情報不足」として正直に明記し、影響度を評価
• **架空データ**: 一切出力禁止
• **深層分析**: 表面的でない戦略的洞察の抽出
• **実用性**: ソフトバンク営業提案に直結する具体的示唆
• **省略禁止**: 「割愛」「省略」「以下同様」等の表現は絶対に使用しない
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