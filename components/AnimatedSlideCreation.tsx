import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, CheckCircle, BarChart3, TrendingUp, AlertTriangle, Newspaper, Target, Download, FileText } from 'lucide-react'

interface SlideData {
  id: number
  title: string
  icon: React.ReactNode
  status: 'empty' | 'loading' | 'complete'
  progress: number
  content: {
    sections: {
      title: string
      content: string
      keyPoints?: string[]
      metrics?: { label: string; value: string; trend?: string; color?: string }[]
      visualType: 'text' | 'metrics' | 'grid' | 'timeline'
    }[]
  }
}

interface AnimatedSlideCreationProps {
  analysisData: any
  isVisible: boolean
  onComplete?: (slides: SlideData[]) => void
}

export const AnimatedSlideCreation: React.FC<AnimatedSlideCreationProps> = ({
  analysisData,
  isVisible,
  onComplete
}) => {
  const slidesRef = useRef<HTMLDivElement>(null)
  const [slides, setSlides] = useState<SlideData[]>([
    {
      id: 1,
      title: 'エグゼクティブサマリー',
      icon: <BarChart3 size={24} />,
      status: 'empty',
      progress: 0,
      content: { sections: [] }
    },
    {
      id: 2,
      title: '収益構造と財務の深層分析',
      icon: <TrendingUp size={24} />,
      status: 'empty',
      progress: 0,
      content: { sections: [] }
    },
    {
      id: 3,
      title: 'SWOT分析（戦略環境の深層解析）',
      icon: <Target size={24} />,
      status: 'empty',
      progress: 0,
      content: { sections: [] }
    },
    {
      id: 4,
      title: '最新動向とその戦略的示唆',
      icon: <Newspaper size={24} />,
      status: 'empty',
      progress: 0,
      content: { sections: [] }
    },
    {
      id: 5,
      title: '総合戦略評価と提案ロードマップ',
      icon: <Sparkles size={24} />,
      status: 'empty',
      progress: 0,
      content: { sections: [] }
    }
  ])

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)

  // 分析データをパースして5枚のスライドデータを生成
  const parseAnalysisData = (fullContent: string) => {
    const companyName = analysisData?.companyName || '企業'
    
    // スライド1: エグゼクティブサマリー
    const slide1Match = fullContent.match(/📋 Slide 1: エグゼクティブサマリー([\s\S]*?)💰 Slide 2/)
    const slide1Content = slide1Match ? slide1Match[1] : ''
    
    // スライド2: 収益構造と財務分析
    const slide2Match = fullContent.match(/💰 Slide 2: 収益構造と財務の深層分析([\s\S]*?)🎯 Slide 3/)
    const slide2Content = slide2Match ? slide2Match[1] : ''
    
    // スライド3: SWOT分析
    const slide3Match = fullContent.match(/🎯 Slide 3: SWOT分析（戦略環境の深層解析）([\s\S]*?)📰 Slide 4/)
    const slide3Content = slide3Match ? slide3Match[1] : ''
    
    // スライド4: 最新動向
    const slide4Match = fullContent.match(/📰 Slide 4: 最新動向とその戦略的示唆([\s\S]*?)🎊 Slide 5/)
    const slide4Content = slide4Match ? slide4Match[1] : ''
    
    // スライド5: 総合評価
    const slide5Match = fullContent.match(/🎊 Slide 5: 総合戦略評価と提案ロードマップ([\s\S]*)$/)
    const slide5Content = slide5Match ? slide5Match[1] : ''

    return [
      {
        id: 1,
        title: 'エグゼクティブサマリー',
        icon: <BarChart3 size={24} />,
        status: 'empty' as const,
        progress: 0,
        content: {
          sections: [
            {
              title: '企業概要',
              content: extractSection(slide1Content, '企業概要', '財務パフォーマンス'),
              visualType: 'text' as const
            },
            {
              title: '財務パフォーマンス',
              content: extractSection(slide1Content, '財務パフォーマンス', '競争優位性'),
              metrics: extractMetrics(slide1Content),
              visualType: 'metrics' as const
            },
            {
              title: '競争優位性',
              content: extractSection(slide1Content, '競争優位性', '重要課題'),
              keyPoints: ['業界トップ利益率', '5セグメント成長', '多様化成功', 'AI投資継続'],
              visualType: 'grid' as const
            }
          ]
        }
      },
      {
        id: 2,
        title: '収益構造と財務の深層分析',
        icon: <TrendingUp size={24} />,
        status: 'empty' as const,
        progress: 0,
        content: {
          sections: [
            {
              title: 'セグメント別業績',
              content: extractSection(slide2Content, '売上構造', '収益性指標'),
              keyPoints: ['コンシューマ: 2.8兆円', 'エンタープライズ: 0.8兆円', 'その他: 3.2兆円'],
              visualType: 'grid' as const
            },
            {
              title: '収益性指標',
              content: extractSection(slide2Content, '収益性指標', '財務トレンド'),
              metrics: extractFinancialMetrics(slide2Content),
              visualType: 'metrics' as const
            },
            {
              title: '成長トレンド分析',
              content: extractSection(slide2Content, '財務トレンド', '効率化ポテンシャル'),
              visualType: 'text' as const
            }
          ]
        }
      },
      {
        id: 3,
        title: 'SWOT分析（戦略環境の深層解析）',
        icon: <Target size={24} />,
        status: 'empty' as const,
        progress: 0,
        content: {
          sections: [
            {
              title: 'SWOT分析マトリックス',
              content: 'ソフトバンクの内部要因（強み・弱み）と外部環境（機会・脅威）を2×2マトリックスで分析',
              keyPoints: [
                '💪 強み: 過去最高業績、営業利益率15.1%、事業多様化成功、技術投資積極性',
                '⚠️ 弱み: 国内市場成熟、成長率鈍化傾向、親会社依存、料金下落圧力',
                '🌟 機会: AI市場拡大、DX需要増加、新規事業機会、規制緩和期待',
                '🚨 脅威: 競争激化、技術革新遅れ、規制強化、新規参入者増加'
              ],
              visualType: 'grid' as const
            }
          ]
        }
      },
      {
        id: 4,
        title: '最新動向とその戦略的示唆',
        icon: <Newspaper size={24} />,
        status: 'empty' as const,
        progress: 0,
        content: {
          sections: [
            {
              title: '重要ニュース timeline',
              content: extractSection(slide4Content, 'ニュース1', ''),
              keyPoints: [
                '2025.5 📊 過去最高業績達成 - 全セグメント増収増益',
                '2025 🎯 中期計画最終年 - 次世代インフラ企業へ転換',
                '2026 🚀 新成長戦略 - AI投資継続、DX市場拡大期待'
              ],
              visualType: 'timeline' as const
            },
            {
              title: '戦略的示唆',
              content: extractSection(slide4Content, '推測】戦略的示唆', ''),
              visualType: 'text' as const
            }
          ]
        }
      },
      {
        id: 5,
        title: '総合戦略評価と提案ロードマップ',
        icon: <Sparkles size={24} />,
        status: 'empty' as const,
        progress: 0,
        content: {
          sections: [
            {
              title: '現状評価',
              content: extractSection(slide5Content, '現状評価', '戦略的将来シナリオ'),
              visualType: 'text' as const
            },
            {
              title: '将来シナリオ分析',
              content: '3つのシナリオに基づく将来予測と対応策',
              metrics: [
                { label: '楽観シナリオ', value: '売上成長+5-8%', trend: '↗', color: 'green' },
                { label: '基準シナリオ', value: '売上成長+2-4%', trend: '→', color: 'blue' },
                { label: '悲観シナリオ', value: '売上成長+0-2%', trend: '↘', color: 'orange' }
              ],
              visualType: 'metrics' as const
            },
            {
              title: 'DX機会とアクションプラン',
              content: extractSection(slide5Content, 'DX機会とビジネス', '分析総括'),
              keyPoints: ['AI基盤構築支援', 'クラウド移行促進', 'セキュリティ強化', 'データ活用高度化'],
              visualType: 'grid' as const
            }
          ]
        }
      }
    ]
  }

  // テキストから特定セクションを抽出
  const extractSection = (content: string, startKeyword: string, endKeyword: string): string => {
    const startIndex = content.indexOf(startKeyword)
    if (startIndex === -1) return 'データを解析中...'
    
    const startContent = content.substring(startIndex)
    if (!endKeyword) return startContent.substring(0, 300) + '...'
    
    const endIndex = startContent.indexOf(endKeyword)
    if (endIndex === -1) return startContent.substring(0, 300) + '...'
    
    return startContent.substring(0, endIndex).trim()
  }

  // 財務指標を抽出
  const extractMetrics = (content: string) => {
    const metrics = []
    
    // 売上高を抽出
    const revenueMatch = content.match(/売上高[：:]([^（\n]+)/)
    if (revenueMatch) {
      metrics.push({ label: '売上高', value: revenueMatch[1].trim(), trend: '↗', color: 'blue' })
    }
    
    // 営業利益を抽出
    const profitMatch = content.match(/営業利益[：:]([^（\n]+)/)
    if (profitMatch) {
      metrics.push({ label: '営業利益', value: profitMatch[1].trim(), trend: '↗', color: 'green' })
    }
    
    // 従業員数を抽出
    const employeeMatch = content.match(/従業員数([0-9,，]+人)/)
    if (employeeMatch) {
      metrics.push({ label: '従業員数', value: employeeMatch[1].trim(), trend: '→', color: 'purple' })
    }
    
    return metrics
  }

  // 財務メトリクスを抽出
  const extractFinancialMetrics = (content: string) => {
    const metrics = []
    
    // 営業利益率を抽出
    const marginMatch = content.match(/営業利益率[：:]([^（\n]+)/)
    if (marginMatch) {
      metrics.push({ label: '営業利益率', value: marginMatch[1].trim(), trend: '↗', color: 'green' })
    }
    
    // 成長率を抽出
    const growthMatch = content.match(/成長率[：:]([^（\n]+)/)
    if (growthMatch) {
      metrics.push({ label: '成長率', value: growthMatch[1].trim(), trend: '↗', color: 'blue' })
    }
    
    // ROEを抽出
    const roeMatch = content.match(/ROE[：:]([^（\n]+)/)
    if (roeMatch) {
      metrics.push({ label: 'ROE', value: roeMatch[1].trim(), trend: '↗', color: 'purple' })
    }
    
    return metrics
  }

  // PDF出力機能
  const exportToPDF = async () => {
    if (!slidesRef.current) {
      alert('スライドデータが見つかりません。')
      return
    }

    // 完了したスライドがあるかチェック
    const completedSlides = slides.filter(slide => slide.status === 'complete')
    if (completedSlides.length === 0) {
      alert('まだスライドが生成されていません。スライド生成完了後にお試しください。')
      return
    }

    try {
      // 印刷用のスタイルを動的に追加
      const printStyle = document.createElement('style')
      printStyle.id = 'pdf-print-style'
      printStyle.textContent = `
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          
          body * {
            visibility: hidden;
          }
          
          .pdf-print-container,
          .pdf-print-container * {
            visibility: visible;
          }
          
          .pdf-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          
          .pdf-slide {
            page-break-after: always;
            page-break-inside: avoid;
            background: white !important;
            color: black !important;
            padding: 20px;
            margin-bottom: 40px;
            min-height: 18cm;
            border: 1px solid #ddd;
          }
          
          .pdf-slide:last-child {
            page-break-after: auto;
          }
          
          .pdf-slide * {
            color: black !important;
            background: white !important;
            border-color: #ccc !important;
          }
          
          .pdf-slide h1, .pdf-slide h2, .pdf-slide h3 {
            color: #333 !important;
            font-weight: bold;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `
      document.head.appendChild(printStyle)

      // 印刷用のコンテナを作成
      const printContainer = document.createElement('div')
      printContainer.className = 'pdf-print-container'
      printContainer.style.display = 'none'
      
      // 完了したスライドを印刷用フォーマットでコピー
      completedSlides.forEach((slide, index) => {
        const slideElement = document.querySelector(`[data-slide-id="${slide.id}"]`)
        if (slideElement) {
          const clonedSlide = slideElement.cloneNode(true) as HTMLElement
          clonedSlide.className = 'pdf-slide'
          
          // 印刷に不要な要素を削除
          const progressElements = clonedSlide.querySelectorAll('.no-print, [class*="progress"], [class*="loading"]')
          progressElements.forEach(el => el.remove())
          
          printContainer.appendChild(clonedSlide)
        }
      })
      
      document.body.appendChild(printContainer)
      
      // 印刷用表示に切り替え
      printContainer.style.display = 'block'
      
      // ユーザーに指示を表示
      const instructions = `
PDF保存の手順：
1. 印刷ダイアログが開きます
2. 「送信先」で「PDFに保存」を選択
3. ファイル名を「${analysisData?.companyName || '企業'}_戦略分析_${new Date().toISOString().split('T')[0]}」に変更
4. 「保存」をクリック

OKをクリックすると印刷ダイアログが開きます。
      `
      
      if (confirm(instructions)) {
        // 印刷ダイアログを開く
        window.print()
        
        // 印刷後のクリーンアップ
        setTimeout(() => {
          document.body.removeChild(printContainer)
          document.head.removeChild(printStyle)
        }, 1000)
      } else {
        // キャンセル時のクリーンアップ
        document.body.removeChild(printContainer)
        document.head.removeChild(printStyle)
      }

    } catch (error) {
      console.error('PDF出力エラー:', error)
      alert('PDF出力中にエラーが発生しました。ブラウザの印刷機能をお試しください。')
    }
  }

  // スライドコンテンツを順次流し込み
  const fillSlideContent = async (slideIndex: number, parsedSlides: SlideData[]) => {
    setSlides(prev => prev.map((slide, index) => 
      index === slideIndex 
        ? { ...slide, status: 'loading' as const }
        : slide
    ))

    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise(resolve => setTimeout(resolve, 30))
      setSlides(prev => prev.map((slide, index) => 
        index === slideIndex 
          ? { ...slide, progress }
          : slide
      ))
    }

    await new Promise(resolve => setTimeout(resolve, 200))
    setSlides(prev => prev.map((slide, index) => 
      index === slideIndex 
        ? { 
            ...slide, 
            status: 'complete' as const, 
            content: parsedSlides[slideIndex].content 
          }
        : slide
    ))

    setOverallProgress(((slideIndex + 1) / 5) * 100)
  }

  // コンテンツ生成を開始
  useEffect(() => {
    if (isVisible && analysisData?.fullContent) {
      const startGeneration = async () => {
        const parsedSlides = parseAnalysisData(analysisData.fullContent)
        
        for (let i = 0; i < 5; i++) {
          setCurrentSlideIndex(i)
          await fillSlideContent(i, parsedSlides)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        if (onComplete) {
          onComplete(parsedSlides)
        }
      }
      
      startGeneration()
    }
  }, [isVisible, analysisData])

  // セクションの視覚化コンポーネント
  const renderSection = (section: any, sectionIndex: number) => {
    switch (section.visualType) {
      case 'text':
        return (
          <div className="bg-neutral-700/50 rounded-lg p-6">
            <h4 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              {section.title}
            </h4>
            <p className="text-gray-300 leading-relaxed text-base">
              {section.content.length > 200 ? section.content.substring(0, 200) + '...' : section.content}
            </p>
          </div>
        )

      case 'metrics':
        return (
          <div className="bg-neutral-700/50 rounded-lg p-6">
            <h4 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              {section.title}
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {section.metrics?.map((metric: any, metricIndex: number) => (
                <div key={metricIndex} className={`
                  rounded-lg p-4 text-center border-2
                  ${metric.color === 'green' ? 'bg-green-600/20 border-green-500/30' :
                    metric.color === 'blue' ? 'bg-blue-600/20 border-blue-500/30' :
                    metric.color === 'purple' ? 'bg-purple-600/20 border-purple-500/30' :
                    'bg-orange-600/20 border-orange-500/30'}
                `}>
                  <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
                  <div className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    {metric.value}
                    <span className={`text-lg ${
                      metric.trend === '↗' ? 'text-green-400' :
                      metric.trend === '→' ? 'text-blue-400' : 'text-orange-400'
                    }`}>
                      {metric.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'grid':
        if (section.title === 'SWOT分析マトリックス') {
          return (
            <div className="bg-neutral-700/50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                {section.title}
              </h4>
              <div className="grid grid-cols-2 gap-4 h-64">
                <div className="bg-green-600/20 border-2 border-green-500/30 rounded-lg p-4">
                  <h5 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                    💪 Strengths
                  </h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 過去最高業績達成</li>
                    <li>• 営業利益率15.1%</li>
                    <li>• 事業多様化成功</li>
                    <li>• 技術投資積極性</li>
                  </ul>
                </div>
                <div className="bg-blue-600/20 border-2 border-blue-500/30 rounded-lg p-4">
                  <h5 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                    🌟 Opportunities
                  </h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• AI市場拡大</li>
                    <li>• DX需要増加</li>
                    <li>• 新規事業機会</li>
                    <li>• 規制緩和期待</li>
                  </ul>
                </div>
                <div className="bg-orange-600/20 border-2 border-orange-500/30 rounded-lg p-4">
                  <h5 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                    ⚠️ Weaknesses
                  </h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 国内市場成熟</li>
                    <li>• 成長率鈍化傾向</li>
                    <li>• 親会社依存</li>
                    <li>• 料金下落圧力</li>
                  </ul>
                </div>
                <div className="bg-red-600/20 border-2 border-red-500/30 rounded-lg p-4">
                  <h5 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                    🚨 Threats
                  </h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 競争激化</li>
                    <li>• 技術革新遅れ</li>
                    <li>• 規制強化</li>
                    <li>• 新規参入者増加</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        } else {
          return (
            <div className="bg-neutral-700/50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                {section.title}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {section.keyPoints?.map((point: string, pointIndex: number) => (
                  <div key={pointIndex} className="bg-neutral-600/50 rounded-lg px-4 py-3 text-sm text-gray-300 border border-neutral-500/30">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )
        }

      case 'timeline':
        return (
          <div className="bg-neutral-700/50 rounded-lg p-6">
            <h4 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              {section.title}
            </h4>
            <div className="space-y-4">
              {section.keyPoints?.map((point: string, pointIndex: number) => (
                <div key={pointIndex} className="flex items-center gap-4 p-3 bg-neutral-600/30 rounded-lg border-l-4 border-purple-500">
                  <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-300">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-neutral-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-3">{section.title}</h4>
            <p className="text-gray-300">{section.content}</p>
          </div>
        )
    }
  }

  if (!isVisible) return null

  return (
    <div className="h-full w-full bg-neutral-900 text-white overflow-y-auto">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-neutral-800/95 backdrop-blur-lg p-4 border-b border-neutral-700 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-purple-400" size={24} />
            <h2 className="text-xl font-semibold">
              {analysisData?.companyName || '企業'} スライド生成
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {overallProgress === 100 && (
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
              >
                <FileText size={20} />
                PDF保存
              </button>
            )}
            <div className="text-right">
              <div className="text-sm text-gray-400">全体進捗</div>
              <div className="text-lg font-bold text-purple-400">{Math.round(overallProgress)}%</div>
            </div>
          </div>
        </div>
        
        {/* 全体プログレスバー */}
        <div className="mt-3">
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* スライド一覧 */}
      <div ref={slidesRef} className="p-6 space-y-8">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            data-slide-id={slide.id}
            className={`
              bg-neutral-800 rounded-xl border transition-all duration-500 min-h-[600px]
              ${slide.status === 'complete' ? 'border-green-500/50 bg-neutral-800/80' : 
                slide.status === 'loading' ? 'border-blue-500/50 bg-blue-950/20' : 
                'border-neutral-700'}
              ${currentSlideIndex === index ? 'ring-2 ring-purple-500/50' : ''}
            `}
          >
            {/* スライドヘッダー */}
            <div className="p-6 border-b border-neutral-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    p-3 rounded-lg 
                    ${slide.status === 'complete' ? 'bg-green-600' :
                      slide.status === 'loading' ? 'bg-blue-600' : 'bg-neutral-700'}
                  `}>
                    {slide.status === 'complete' ? <CheckCircle size={24} /> : slide.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-white">[{slide.id}/5] {slide.title}</h3>
                    <div className="text-sm text-gray-400 mt-1">
                      {slide.status === 'complete' ? '✅ 完了' :
                       slide.status === 'loading' ? '🔄 生成中...' : '⏳ 待機中'}
                    </div>
                  </div>
                </div>
                
                {slide.status === 'loading' && (
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-400">{slide.progress}%</div>
                    <div className="w-32 bg-neutral-700 rounded-full h-3 mt-2">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${slide.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* スライドコンテンツ */}
            <div className="p-8">
              {slide.status === 'empty' ? (
                <div className="h-96 bg-neutral-700/30 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-xl font-medium">コンテンツ待機中</div>
                    <div className="text-sm mt-2">分析データからスライドを生成します</div>
                  </div>
                </div>
              ) : slide.status === 'loading' ? (
                <div className="h-96 bg-blue-950/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-blue-400 font-medium text-lg">コンテンツを生成中...</div>
                    <div className="text-sm text-gray-400 mt-2">分析データを処理しています</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {slide.content.sections.map((section, sectionIndex) => 
                    renderSection(section, sectionIndex)
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* 完了メッセージ */}
        {overallProgress === 100 && (
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-8 border border-green-500/30">
            <div className="text-center">
              <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-green-400 mb-4">スライド生成完了！</h3>
              <p className="text-gray-300 text-lg mb-6">
                {analysisData?.companyName || '企業'}の戦略分析プレゼンテーション（5枚）が完成しました
              </p>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors mx-auto"
              >
                <FileText size={24} />
                PDF保存
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 