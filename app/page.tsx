"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Pause,
  Sparkles,
  X,
  Send,
  Paperclip,
  Mic,
  MessageSquare,
  HelpCircle,
  History,
  PanelLeft,
  Presentation,
  Download,
} from "lucide-react"
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarTitle,
  SidebarBody,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// Message型を定義
interface Message {
  text: string;
  sender: string;
  type?: 'text' | 'slides';
  slides?: SlideData[];
  analysisData?: CompanyAnalysis;
}

interface SlideData {
  id: number;
  title: string;
  content: string;
  image?: string;
}

interface CompanyAnalysis {
  companyName: string;
  overview: string;
  challenges: string;
  solutions: string;
  marketPosition: string;
  financialStatus: string;
  strategy: string;
  risks: string;
  conclusion: string;
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

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState<{ [key: number]: number }>({})
  const [showSlidePreview, setShowSlidePreview] = useState(false)
  const [slidePreviewData, setSlidePreviewData] = useState<{
    slides: SlideData[];
    analysisData?: CompanyAnalysis;
    generationProgress: number; // 0-8の生成進行状況
  }>({
    slides: [],
    generationProgress: 0
  })

  const backgroundImageStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  useEffect(() => {
    setIsLoaded(true)

    // Show AI popup after 3 seconds
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)

    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "LLooks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Add actual play/pause logic here
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return
    
    const userMessage: Message = { text: inputValue, sender: "user", type: "text" }
    setMessages(prev => [...prev, userMessage])
    
    const query = inputValue.trim()
    setInputValue("")

    // 企業分析が必要かチェック
    if (isCompanyQuery(query)) {
      setIsAnalyzing(true)
      
      try {
        // 企業分析を実行
        const analysis = await analyzeCompany(query)
        
        // 段階的スライド生成を開始
        generateSlidesProgressively(analysis)
        
        const aiMessage: Message = {
          text: `${analysis.companyName}の企業分析を開始しました。右側でスライドを順次生成しています。`,
          sender: "ai",
          type: "text"
        }
        
        setMessages(prev => [...prev, aiMessage])
      } catch (error) {
        const errorMessage: Message = {
          text: "申し訳ございません。企業分析中にエラーが発生しました。",
          sender: "ai",
          type: "text"
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsAnalyzing(false)
      }
    } else {
      // 通常のチャット応答
      const aiMessage: Message = {
        text: "ご質問ありがとうございます。企業名を入力していただければ、詳細な企業分析資料を作成いたします。",
        sender: "ai",
        type: "text"
      }
      setMessages(prev => [...prev, aiMessage])
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // 企業分析を実行
  const analyzeCompany = async (companyName: string): Promise<CompanyAnalysis> => {
    try {
      const response = await fetch('/api/analyze-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }),
      })
      
      if (!response.ok) {
        throw new Error('企業分析に失敗しました')
      }
      
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('企業分析エラー:', error)
      // フォールバック
      return {
        companyName,
        overview: `${companyName}は業界をリードする企業として、革新的な製品とサービスを提供しています。`,
        challenges: "市場競争の激化、技術革新への対応、規制環境の変化などの課題に直面しています。",
        solutions: "AI技術の活用、デジタル変革の推進、新市場への展開により競争力を強化しています。",
        marketPosition: "業界における重要なポジションを占め、安定した市場シェアを維持しています。",
        financialStatus: "健全な財務基盤を持ち、持続的な成長を実現しています。",
        strategy: "長期的な視点に立った戦略的投資と事業ポートフォリオの最適化を進めています。",
        risks: "市場変動、技術的リスク、競合他社の動向に注意が必要です。",
        conclusion: "総合的に見て、今後も成長が期待される企業です。",
        marketShareData: {
          labels: [],
          datasets: [],
        },
        financialTrendData: {
          labels: [],
          datasets: [],
        },
        competitorComparisonData: {
          labels: [],
          datasets: [],
        },
        keyMetrics: {
          revenue: "",
          growth: "",
          marketShare: "",
          employees: "",
        },
        keyInsights: [],
        dataSource: "",
      }
    }
  }

  // 分析結果からスライドを生成
  const generateSlidesFromAnalysis = (analysis: CompanyAnalysis): SlideData[] => {
    return [
      {
        id: 1,
        title: `${analysis.companyName}の概要`,
        content: analysis.overview
      },
      {
        id: 2,
        title: "市場ポジション",
        content: analysis.marketPosition
      },
      {
        id: 3,
        title: "主要な課題",
        content: analysis.challenges
      },
      {
        id: 4,
        title: "解決策・戦略",
        content: analysis.solutions
      },
      {
        id: 5,
        title: "財務状況",
        content: analysis.financialStatus
      },
      {
        id: 6,
        title: "戦略的方向性",
        content: analysis.strategy
      },
      {
        id: 7,
        title: "リスク分析",
        content: analysis.risks
      },
      {
        id: 8,
        title: "結論と展望",
        content: analysis.conclusion
      }
    ]
  }

  // 企業名かどうかを判定（簡単な検証）
  const isCompanyQuery = (text: string): boolean => {
    const companyKeywords = ['株式会社', '会社', 'Inc', 'Corp', 'Ltd', 'LLC', 'Co.', '分析', '企業', 'について']
    return companyKeywords.some(keyword => text.includes(keyword)) || /^[A-Za-z\s]+$/.test(text.trim())
  }

  const exportSlidesToHTML = (slides: SlideData[], filename: string, analysisData?: CompanyAnalysis) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename} - 企業分析プレゼンテーション</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
        }
        .slide {
            width: 1280px;
            min-height: 720px;
            position: relative;
            background-color: white;
            overflow: hidden;
            box-sizing: border-box;
            padding: 40px 60px;
            display: none;
        }
        .slide.active {
            display: block;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        .slide-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1e40af;
        }
        .slide-number {
            font-size: 1.2rem;
            color: #666;
            font-weight: 500;
        }
        .chart-container {
            height: 320px;
            margin-bottom: 20px;
        }
        .insight-box {
            background-color: #f0f4ff;
            border-left: 5px solid #1e40af;
            padding: 15px 20px;
            margin-top: 20px;
        }
        .insight-title {
            font-weight: 700;
            color: #1e40af;
            font-size: 1.2rem;
            margin-bottom: 5px;
        }
        .highlight {
            color: #1e40af;
            font-weight: 700;
        }
        .footer {
            position: absolute;
            bottom: 20px;
            right: 60px;
            font-size: 0.8rem;
            color: #666;
        }
        .stat-highlight {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1e40af;
            text-align: center;
            line-height: 1;
        }
        .stat-label {
            font-size: 1rem;
            color: #666;
            text-align: center;
            margin-top: 5px;
        }
        .grid-overview {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 30px;
            height: 500px;
        }
        .grid-item {
            background: rgba(30, 64, 175, 0.1);
            border-radius: 15px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border: 2px solid rgba(30, 64, 175, 0.2);
        }
        .grid-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .grid-content {
            font-size: 1rem;
            color: #4a4a4a;
            line-height: 1.5;
        }
        .navigation {
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            gap: 15px;
            z-index: 1000;
        }
        .nav-btn {
            background: rgba(30, 64, 175, 0.9);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .nav-btn:hover {
            background: rgba(30, 64, 175, 1);
            transform: translateY(-2px);
        }
        .nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .slide-indicator {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 1000;
        }
        .indicator-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .indicator-dot.active {
            background: rgba(30, 64, 175, 0.9);
            transform: scale(1.2);
        }
    </style>
</head>
<body>
    ${slides.map((slide, index) => `
        <div class="slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
            <div class="header">
                <h1 class="slide-title">${slide.title}</h1>
                <div class="slide-number">${index + 1} / ${slides.length}</div>
            </div>

            ${index === 0 ? `
                <!-- 概要スライド（2x2グリッド） -->
                <div class="grid-overview">
                    <div class="grid-item">
                        <div class="grid-title">
                            <i class="fas fa-building mr-2"></i>企業概要
                        </div>
                        <div class="grid-content">${slide.content}</div>
                    </div>
                    <div class="grid-item">
                        <div class="grid-title">
                            <i class="fas fa-chart-pie mr-2"></i>主要指標
                        </div>
                        <div class="grid-content">
                            ${analysisData ? `
                                <div class="space-y-2">
                                    <div>売上高: <span class="highlight">${analysisData.keyMetrics.revenue}</span></div>
                                    <div>成長率: <span class="highlight">${analysisData.keyMetrics.growth}</span></div>
                                    <div>市場シェア: <span class="highlight">${analysisData.keyMetrics.marketShare}</span></div>
                                    <div>従業員: <span class="highlight">${analysisData.keyMetrics.employees}</span></div>
                                </div>
                            ` : '主要な業績指標と企業規模'}
                        </div>
                    </div>
                    <div class="grid-item">
                        <div class="grid-title">
                            <i class="fas fa-trophy mr-2"></i>競争優位性
                        </div>
                        <div class="grid-content">${slides[1]?.content || "業界における強固なポジション"}</div>
                    </div>
                    <div class="grid-item">
                        <div class="grid-title">
                            <i class="fas fa-rocket mr-2"></i>将来展望
                        </div>
                        <div class="grid-content">${slides[7]?.content || "持続的成長に向けた戦略"}</div>
                    </div>
                </div>
            ` : index === 1 ? `
                <!-- 市場ポジションスライド -->
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <h2 class="text-xl font-bold mb-4 text-gray-700">市場シェア推移</h2>
                        <div class="chart-container">
                            <canvas id="marketShareChart"></canvas>
                        </div>
                        <div class="stat-highlight">${analysisData?.keyMetrics.marketShare || '21.3%'}</div>
                        <div class="stat-label">現在の市場シェア</div>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold mb-4 text-gray-700">競合比較分析</h2>
                        <div class="chart-container">
                            <canvas id="competitorChart"></canvas>
                        </div>
                        <div class="stat-highlight">業界トップ</div>
                        <div class="stat-label">総合評価ランキング</div>
                    </div>
                </div>
                <div class="insight-box mt-6">
                    <div class="insight-title">市場での競争優位性</div>
                    <div class="grid grid-cols-3 gap-4 mt-2">
                        ${analysisData ? analysisData.keyInsights.map(insight => `
                            <div class="flex items-start">
                                <i class="${insight.icon} text-blue-800 mr-2 mt-1"></i>
                                <span><span class="highlight">${insight.title}</span>：${insight.description}</span>
                            </div>
                        `).join('') : `
                            <div class="flex items-start">
                                <i class="fas fa-chart-line text-blue-800 mr-2 mt-1"></i>
                                <span><span class="highlight">市場拡大</span>：安定した成長基盤</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-cogs text-blue-800 mr-2 mt-1"></i>
                                <span><span class="highlight">技術優位</span>：革新的ソリューション</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-users text-blue-800 mr-2 mt-1"></i>
                                <span><span class="highlight">顧客基盤</span>：長期的パートナーシップ</span>
                            </div>
                        `}
                    </div>
                </div>
            ` : index === 4 ? `
                <!-- 財務状況スライド -->
                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <h2 class="text-xl font-bold mb-4 text-gray-700">財務トレンド分析</h2>
                        <div class="chart-container">
                            <canvas id="financialChart"></canvas>
                        </div>
                        <div class="stat-highlight">${analysisData?.keyMetrics.growth || '+8.3%'}</div>
                        <div class="stat-label">年間成長率</div>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold mb-4 text-gray-700">収益性指標</h2>
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <div class="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div class="text-3xl font-bold text-blue-600">${analysisData?.keyMetrics.revenue || '3.9兆円'}</div>
                                    <div class="text-sm text-gray-600">年間売上高</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold text-green-600">13.4%</div>
                                    <div class="text-sm text-gray-600">営業利益率</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold text-purple-600">18.2%</div>
                                    <div class="text-sm text-gray-600">ROE</div>
                                </div>
                                <div>
                                    <div class="text-3xl font-bold text-orange-600">2.1倍</div>
                                    <div class="text-sm text-gray-600">流動比率</div>
                                </div>
                            </div>
                        </div>
                        <div class="stat-highlight">AAA格付</div>
                        <div class="stat-label">信用格付評価</div>
                    </div>
                </div>
            ` : `
                <!-- 標準的なスライドレイアウト -->
                <div class="text-lg leading-relaxed text-gray-700 mb-8">
                    ${slide.content}
                </div>
                <div class="grid grid-cols-3 gap-6 mt-8">
                    <div class="bg-blue-50 p-4 rounded-lg text-center">
                        <i class="fas fa-lightbulb text-blue-600 text-2xl mb-2"></i>
                        <div class="font-semibold text-blue-800">重要ポイント</div>
                        <div class="text-sm text-gray-600 mt-1">戦略的優先事項</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg text-center">
                        <i class="fas fa-target text-green-600 text-2xl mb-2"></i>
                        <div class="font-semibold text-green-800">目標達成</div>
                        <div class="text-sm text-gray-600 mt-1">具体的成果</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg text-center">
                        <i class="fas fa-chart-bar text-purple-600 text-2xl mb-2"></i>
                        <div class="font-semibold text-purple-800">定量評価</div>
                        <div class="text-sm text-gray-600 mt-1">数値による検証</div>
                    </div>
                </div>
            `}
            
            <div class="footer">
                ${analysisData?.dataSource || `出典: ${filename}企業分析レポート (2024)`}
            </div>
        </div>
    `).join('')}
    
    <div class="navigation">
        <button class="nav-btn" onclick="previousSlide()">前へ</button>
        <button class="nav-btn" onclick="nextSlide()">次へ</button>
    </div>
    
    <div class="slide-indicator">
        ${slides.map((_, index) => `
            <div class="indicator-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
        `).join('')}
    </div>

    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator-dot');
        
        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            slides[n].classList.add('active');
            indicators[n].classList.add('active');
            currentSlide = n;
        }
        
        function nextSlide() {
            if (currentSlide < slides.length - 1) {
                showSlide(currentSlide + 1);
            }
        }
        
        function previousSlide() {
            if (currentSlide > 0) {
                showSlide(currentSlide - 1);
            }
        }
        
        function goToSlide(n) {
            showSlide(n);
        }

        // チャートの初期化
        window.addEventListener('DOMContentLoaded', function() {
            // 市場シェアチャート
            const marketShareCanvas = document.getElementById('marketShareChart');
            if (marketShareCanvas) {
                const ctx = marketShareCanvas.getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: ${analysisData ? JSON.stringify(analysisData.marketShareData) : '{"labels":[],"datasets":[]}'},
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: '市場シェア (%)' }
                            }
                        }
                    }
                });
            }

            // 競合比較チャート
            const competitorCanvas = document.getElementById('competitorChart');
            if (competitorCanvas) {
                const ctx = competitorCanvas.getContext('2d');
                new Chart(ctx, {
                    type: 'radar',
                    data: ${analysisData ? JSON.stringify(analysisData.competitorComparisonData) : '{"labels":[],"datasets":[]}'},
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        },
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                });
            }

            // 財務トレンドチャート
            const financialCanvas = document.getElementById('financialChart');
            if (financialCanvas) {
                const ctx = financialCanvas.getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: ${analysisData ? JSON.stringify(analysisData.financialTrendData) : '{"labels":[],"datasets":[]}'},
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: '金額（兆円）' }
                            }
                        }
                    }
                });
            }
        });
        
        // キーボードナビゲーション
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') previousSlide();
        });
    </script>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 段階的スライド生成機能
  const generateSlidesProgressively = async (analysis: CompanyAnalysis) => {
    const slideTemplates = [
      { id: 1, title: `${analysis.companyName}の概要`, content: analysis.overview },
      { id: 2, title: "市場ポジション", content: analysis.marketPosition },
      { id: 3, title: "主要な課題", content: analysis.challenges },
      { id: 4, title: "解決策・戦略", content: analysis.solutions },
      { id: 5, title: "財務状況", content: analysis.financialStatus },
      { id: 6, title: "戦略的方向性", content: analysis.strategy },
      { id: 7, title: "リスク分析", content: analysis.risks },
      { id: 8, title: "結論と展望", content: analysis.conclusion }
    ]

    // 初期化：枠を表示
    setSlidePreviewData({
      slides: [],
      analysisData: analysis,
      generationProgress: 0
    })
    setShowSlidePreview(true)

    // 1枚ずつ生成
    for (let i = 0; i < slideTemplates.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1秒間隔で生成
      
      setSlidePreviewData(prev => ({
        ...prev,
        slides: [...prev.slides, slideTemplates[i]],
        generationProgress: i + 1
      }))
    }
  }

  return (
    <SidebarProvider defaultOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div 
        className="flex h-screen w-full font-sans relative overflow-hidden"
        style={backgroundImageStyle}
      >
        <Sidebar
          side="left"
          variant="sidebar"
          collapsible={isSidebarOpen ? "icon" : "offcanvas"}
          className="bg-neutral-900/80 backdrop-blur-lg text-gray-100 border-r border-neutral-700/50 fixed md:sticky top-0 left-0 h-full z-20"
        >
          <SidebarHeader className="border-b border-neutral-700/50">
            <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-purple-400"/>
              {isSidebarOpen && <SidebarTitle className="text-gray-50">Central Agent</SidebarTitle>}
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
              <PanelLeft />
            </Button>
          </SidebarHeader>
          <SidebarBody className="space-y-4 mt-4">
            {isSidebarOpen && (
              <Button variant="outline" className="w-full justify-start gap-2 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white">
                <Plus size={18} /> New Chat
              </Button>
            )}
            {!isSidebarOpen && (
                 <Button variant="ghost" size="icon" className="w-full justify-center gap-2 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white mb-4">
                    <Plus size={18} />
                 </Button>
            )}
            <div className={`flex-grow overflow-y-auto ${isSidebarOpen ? "px-2" : ""}`}>
              {isSidebarOpen && <p className="px-1 py-2 text-xs font-medium text-gray-400">Recent</p>}
              <SidebarNav>
                <SidebarNavItem href="#" isActive={isSidebarOpen} title="Current Chat Topic Example">
                  <MessageSquare size={16} /> {isSidebarOpen && "Current Chat"}
                </SidebarNavItem>
                <SidebarNavItem href="#" title="Previous discussion about UI">
                  <MessageSquare size={16} /> {isSidebarOpen && "UI Discussion"}
                </SidebarNavItem>
                <SidebarNavItem href="#" title="Exploring new ideas">
                  <MessageSquare size={16} /> {isSidebarOpen && "New Ideas"}
                </SidebarNavItem>
              </SidebarNav>
            </div>
          </SidebarBody>
          <SidebarFooter>
            <SidebarNav>
              <SidebarNavItem href="#" title="Help">
                <HelpCircle size={16} /> {isSidebarOpen && "Help"}
              </SidebarNavItem>
              <SidebarNavItem href="#" title="Activity">
                <History size={16} /> {isSidebarOpen && "Activity"}
              </SidebarNavItem>
              <SidebarNavItem href="#" title="Settings">
                <Settings size={16} /> {isSidebarOpen && "Settings"}
              </SidebarNavItem>
            </SidebarNav>
            {isSidebarOpen && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-700 mt-3">
                    <Image src="/placeholder.svg" alt="User Avatar" width={32} height={32} className="rounded-full"/>
                    <span className="text-sm font-medium text-gray-300">User Name</span>
          </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className={`flex-1 w-full min-w-0 flex flex-col transition-all duration-300 ease-in-out bg-neutral-900/80 backdrop-blur-lg text-gray-100 ${showSlidePreview ? 'mr-[65%]' : ''}`}>
          <header className="bg-neutral-900/60 backdrop-blur-lg p-4 flex items-center justify-between sticky top-0 z-10 border-b border-neutral-700/50 text-gray-100">
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-md hover:bg-neutral-700/60" onClick={toggleSidebar}>
                <Menu size={22} />
          </button>
              <h1 className="text-xl font-semibold">Chat Title</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full hover:bg-neutral-700/60 transition-colors">
                <Search size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-neutral-700/60 transition-colors">
                <Settings size={20} />
              </button>
              <Image
                src="/placeholder.svg"
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
          </header>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border ${
                    msg.sender === "user"
                      ? "bg-primary/60 border-primary/40 text-primary-foreground"
                      : "bg-card/50 border-card-foreground/20 text-card-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* 分析中インジケーター */}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="bg-card/50 border border-card-foreground/20 text-card-foreground px-4 py-3 rounded-xl backdrop-blur-md flex items-center gap-2">
                  <div className="animate-spin">
                    <Search size={16} />
                  </div>
                  企業分析中...資料を作成しています
                </div>
              </div>
            )}
          </div>

          <div className="bg-neutral-900/60 backdrop-blur-lg p-4 sticky bottom-0 z-10 border-t border-neutral-700/50">
            <div className="flex items-center space-x-3 max-w-5xl mx-auto px-4">
              <button className="p-2.5 rounded-full hover:bg-neutral-700/60 transition-colors text-gray-100 flex-shrink-0">
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 p-4 rounded-xl bg-neutral-800 border border-neutral-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none placeholder-gray-400 text-gray-100 text-base"
              />
              <button
                onClick={handleSendMessage}
                className="p-4 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors text-white flex items-center justify-center flex-shrink-0"
              >
                <Send size={20} />
              </button>
              <button className="p-2.5 rounded-full hover:bg-neutral-700/60 transition-colors text-gray-100 flex-shrink-0">
                <Mic size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Central Agent may display inaccurate info, including about people, so double-check its responses. Your privacy & Central Agent Apps
            </p>
          </div>
        </main>

        {showAIPopup && (
          <div className="absolute bottom-24 right-6 bg-popover/70 backdrop-blur-xl p-6 rounded-xl shadow-2xl max-w-md z-20 border border-border/40 text-foreground">
              <button
                onClick={() => setShowAIPopup(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
              <X size={18} />
              </button>
            <div className="flex items-start space-x-3">
              <Sparkles size={24} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm mb-4 leading-relaxed">
                  {typedText}
                </p>
                <div className="flex items-center justify-end space-x-2.5">
                <button
                  onClick={togglePlay}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium transition-colors text-primary-foreground"
                >
                    {isPlaying ? <Pause size={16} /> : <Sparkles size={16} />}
                    <span>{isPlaying ? "Pause" : "Play Music"}</span>
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                    className="px-4 py-2 bg-secondary/70 hover:bg-secondary rounded-lg text-sm font-medium transition-colors text-secondary-foreground"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 右側スライドプレビューエリア */}
        {showSlidePreview && (
          <div className="fixed top-0 right-0 w-[65%] h-full bg-neutral-900/95 backdrop-blur-lg border-l border-neutral-700/50 z-30">
            {/* ヘッダー */}
            <div className="bg-neutral-800/80 backdrop-blur-lg p-4 border-b border-neutral-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-purple-400" size={24} />
                  <h2 className="text-lg font-semibold text-white">
                    {slidePreviewData.analysisData?.companyName || '企業分析'} プレゼンテーション
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    {slidePreviewData.generationProgress} / 8
                  </span>
                  <button
                    onClick={() => setShowSlidePreview(false)}
                    className="p-2 hover:bg-neutral-700 rounded-lg transition-colors text-gray-400"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* タブ */}
              <div className="flex gap-4 mt-4">
                <button className="px-4 py-2 bg-neutral-700 text-white rounded-lg text-sm">
                  プレビュー
                </button>
                <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">
                  コード
                </button>
                <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">
                  考え中
                </button>
              </div>
            </div>

            {/* メインコンテンツエリア */}
            <div className="flex-1 h-full overflow-hidden">
              {slidePreviewData.generationProgress === 0 ? (
                // 初期枠表示
                <div className="p-8 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin mb-4">
                      <Search size={48} className="text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">スライドを準備中...</h3>
                    <p className="text-gray-400">企業分析データからプレゼンテーション資料を生成しています</p>
                  </div>
                </div>
              ) : (
                // 縦列スライド表示
                <div className="p-4 h-full overflow-y-auto">
                  <div className="space-y-6">
                    {slidePreviewData.slides.map((slide, index) => (
                      <div key={slide.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* スライドヘッダー */}
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2"></div>
                        <div className="p-4 border-b">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-purple-600 text-sm font-semibold">
                                {index + 1} / 8
                              </span>
                              <h3 className="text-lg font-bold text-gray-800 mt-1">
                                {slide.title}
                              </h3>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-500">
                                {new Date().toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* スライドコンテンツ */}
                        <div className="p-6 aspect-video">
                          {index === 0 ? (
                            // 最初のスライドは2×2グリッド
                            <div className="h-full grid grid-cols-2 grid-rows-2 gap-4">
                              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                                <h4 className="font-semibold text-purple-700 mb-2">
                                  <i className="fas fa-building mr-2"></i>企業概要
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">{slide.content}</p>
                              </div>
                              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                <h4 className="font-semibold text-blue-700 mb-2">
                                  <i className="fas fa-chart-pie mr-2"></i>主要指標
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {slidePreviewData.analysisData ? `
                                    売上高: ${slidePreviewData.analysisData.keyMetrics.revenue}
                                    成長率: ${slidePreviewData.analysisData.keyMetrics.growth}
                                    市場シェア: ${slidePreviewData.analysisData.keyMetrics.marketShare}
                                  ` : '主要な業績指標と企業規模'}
                                </p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                <h4 className="font-semibold text-green-700 mb-2">
                                  <i className="fas fa-trophy mr-2"></i>競争優位性
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {slidePreviewData.slides[1]?.content || "業界における強固なポジション"}
                                </p>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                                <h4 className="font-semibold text-orange-700 mb-2">
                                  <i className="fas fa-rocket mr-2"></i>将来展望
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {slidePreviewData.slides[7]?.content || "持続的成長に向けた戦略"}
                                </p>
                              </div>
                            </div>
                          ) : index === 1 ? (
                            // 市場ポジションスライド（チャート付き）
                            <div className="h-full">
                              <div className="grid grid-cols-2 gap-6 h-full">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">市場シェア推移</h4>
                                  <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-blue-600 mb-1">
                                        {slidePreviewData.analysisData?.keyMetrics.marketShare || '21.3%'}
                                      </div>
                                      <div className="text-xs text-gray-500">現在の市場シェア</div>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <p className="text-gray-600 text-sm">{slide.content}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">競合比較</h4>
                                  <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-green-600 mb-1">業界トップ</div>
                                      <div className="text-xs text-gray-500">総合評価ランキング</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : index === 4 ? (
                            // 財務状況スライド
                            <div className="h-full">
                              <div className="grid grid-cols-2 gap-6 h-full">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">財務トレンド</h4>
                                  <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-blue-600 mb-1">
                                        {slidePreviewData.analysisData?.keyMetrics.growth || '+8.3%'}
                                      </div>
                                      <div className="text-xs text-gray-500">年間成長率</div>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <p className="text-gray-600 text-sm">{slide.content}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">収益性指標</h4>
                                  <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="bg-blue-50 p-2 rounded">
                                      <div className="text-lg font-bold text-blue-600">
                                        {slidePreviewData.analysisData?.keyMetrics.revenue || '3.9兆円'}
                                      </div>
                                      <div className="text-xs text-gray-600">売上高</div>
                                    </div>
                                    <div className="bg-green-50 p-2 rounded">
                                      <div className="text-lg font-bold text-green-600">13.4%</div>
                                      <div className="text-xs text-gray-600">営業利益率</div>
                                    </div>
                                    <div className="bg-purple-50 p-2 rounded">
                                      <div className="text-lg font-bold text-purple-600">18.2%</div>
                                      <div className="text-xs text-gray-600">ROE</div>
                                    </div>
                                    <div className="bg-orange-50 p-2 rounded">
                                      <div className="text-lg font-bold text-orange-600">AAA</div>
                                      <div className="text-xs text-gray-600">格付</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // 標準スライドレイアウト
                            <div className="h-full flex flex-col">
                              <div className="flex-1 mb-4">
                                <p className="text-gray-700 leading-relaxed">{slide.content}</p>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mt-auto">
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                  <i className="fas fa-lightbulb text-blue-600 text-xl mb-2"></i>
                                  <div className="text-sm font-semibold text-blue-800">重要ポイント</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg text-center">
                                  <i className="fas fa-target text-green-600 text-xl mb-2"></i>
                                  <div className="text-sm font-semibold text-green-800">目標達成</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg text-center">
                                  <i className="fas fa-chart-bar text-purple-600 text-xl mb-2"></i>
                                  <div className="text-sm font-semibold text-purple-800">定量評価</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* スライドフッター */}
                        <div className="px-6 py-3 bg-gray-50 border-t">
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>
                              出典: {slidePreviewData.analysisData?.dataSource || '企業分析レポート (2024)'}
                            </span>
                            <span>Powered by Central Agent</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* 生成中のプレースホルダー */}
                    {slidePreviewData.generationProgress < 8 && (
                      <div className="bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-600 p-8 text-center">
                        <div className="animate-pulse">
                          <div className="w-16 h-16 bg-neutral-700 rounded-full mx-auto mb-4"></div>
                          <div className="h-4 bg-neutral-700 rounded w-32 mx-auto mb-2"></div>
                          <div className="h-3 bg-neutral-700 rounded w-24 mx-auto"></div>
                        </div>
                        <p className="text-gray-400 text-sm mt-4">
                          次のスライドを生成中... ({slidePreviewData.generationProgress + 1}/8)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* エクスポートボタン */}
                  {slidePreviewData.generationProgress === 8 && (
                    <div className="mt-6 p-4 bg-neutral-800 rounded-lg">
                      <button
                        onClick={() => exportSlidesToHTML(
                          slidePreviewData.slides, 
                          `分析資料_${slidePreviewData.analysisData?.companyName}_${new Date().toISOString().split('T')[0]}`, 
                          slidePreviewData.analysisData
                        )}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        HTMLプレゼンテーションをエクスポート
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
    </SidebarProvider>
  )
}
