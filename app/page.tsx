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
        const slides = generateSlidesFromAnalysis(analysis)
        
        const slideMessage: Message = {
          text: `${analysis.companyName}の企業分析資料を作成しました。`,
          sender: "ai",
          type: "slides",
          slides: slides
        }
        
        setMessages(prev => [...prev, slideMessage])
        setCurrentSlideIndex(prev => ({ ...prev, [messages.length + 1]: 0 }))
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
        conclusion: "総合的に見て、今後も成長が期待される企業です。"
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

  const exportSlidesToHTML = (slides: SlideData[], filename: string) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename} - 企業分析プレゼンテーション</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            overflow: hidden;
        }
        
        .slide-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .slide {
            width: 90%;
            height: 90%;
            max-width: 1200px;
            max-height: 675px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            display: none;
            flex-direction: column;
            padding: 60px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
        }
        
        .slide.active {
            display: flex;
        }
        
        .slide::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #8B5CF6, #3B82F6);
        }
        
        .slide-header {
            margin-bottom: 40px;
        }
        
        .slide-number {
            color: #8B5CF6;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .slide-title {
            font-size: 48px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1.2;
            margin-bottom: 20px;
        }
        
        .slide-content {
            flex: 1;
            font-size: 24px;
            line-height: 1.6;
            color: #4a4a4a;
            display: flex;
            align-items: center;
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
            background: rgba(139, 92, 246, 0.9);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .nav-btn:hover {
            background: rgba(139, 92, 246, 1);
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
            background: rgba(139, 92, 246, 0.9);
            transform: scale(1.2);
        }
        
        .slide-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 30px;
            height: 100%;
        }
        
        .grid-item {
            background: rgba(139, 92, 246, 0.1);
            border-radius: 15px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border: 2px solid rgba(139, 92, 246, 0.2);
        }
        
        .grid-title {
            font-size: 20px;
            font-weight: 600;
            color: #8B5CF6;
            margin-bottom: 10px;
        }
        
        .grid-content {
            font-size: 16px;
            color: #4a4a4a;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="slide-container">
        ${slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                <div class="slide-header">
                    <div class="slide-number">${index + 1} / ${slides.length}</div>
                    <h1 class="slide-title">${slide.title}</h1>
                </div>
                <div class="slide-content">
                    ${index === 0 ? `
                        <div class="slide-grid">
                            <div class="grid-item">
                                <div class="grid-title">概要</div>
                                <div class="grid-content">${slide.content}</div>
                            </div>
                            <div class="grid-item">
                                <div class="grid-title">市場地位</div>
                                <div class="grid-content">${slides[1]?.content || "業界における重要なポジション"}</div>
                            </div>
                            <div class="grid-item">
                                <div class="grid-title">戦略</div>
                                <div class="grid-content">${slides[5]?.content || "戦略的方向性"}</div>
                            </div>
                            <div class="grid-item">
                                <div class="grid-title">展望</div>
                                <div class="grid-content">${slides[7]?.content || "将来の展望"}</div>
                            </div>
                        </div>
                    ` : `<p>${slide.content}</p>`}
                </div>
            </div>
        `).join('')}
    </div>
    
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

        <main className="flex-1 w-full min-w-0 flex flex-col transition-all duration-300 ease-in-out bg-neutral-900/80 backdrop-blur-lg text-gray-100">
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
                {msg.type === "slides" && msg.slides ? (
                  // スライド表示
                  <div className="max-w-4xl w-full">
                    <div className="bg-card/50 border border-card-foreground/20 rounded-xl p-4 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-card-foreground">{msg.text}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => exportSlidesToHTML(msg.slides!, `分析資料_${new Date().toISOString().split('T')[0]}`)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                          >
                            <Download size={14} />
                            HTML出力
                          </button>
                        </div>
                      </div>
                      
                      {/* スライドプレビュー */}
                      <div className="bg-white rounded-lg aspect-video p-6 relative overflow-hidden mb-4">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                        
                        {msg.slides[currentSlideIndex[index] || 0] && (
                          <div className="h-full flex flex-col">
                            <div className="mb-4">
                              <div className="text-purple-600 text-sm font-semibold mb-2">
                                {(currentSlideIndex[index] || 0) + 1} / {msg.slides.length}
                              </div>
                              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                {msg.slides[currentSlideIndex[index] || 0].title}
                              </h2>
                            </div>
                            
                            {(currentSlideIndex[index] || 0) === 0 ? (
                              // 最初のスライドは2列2行のレイアウト
                              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3">
                                <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-200">
                                  <h4 className="font-semibold text-purple-700 mb-2 text-sm">概要</h4>
                                  <p className="text-gray-600 text-xs leading-relaxed">{msg.slides[0].content}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                                  <h4 className="font-semibold text-blue-700 mb-2 text-sm">市場地位</h4>
                                  <p className="text-gray-600 text-xs leading-relaxed">{msg.slides[1]?.content || "業界における重要なポジション"}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                                  <h4 className="font-semibold text-green-700 mb-2 text-sm">戦略</h4>
                                  <p className="text-gray-600 text-xs leading-relaxed">{msg.slides[5]?.content || "戦略的方向性"}</p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-200">
                                  <h4 className="font-semibold text-orange-700 mb-2 text-sm">展望</h4>
                                  <p className="text-gray-600 text-xs leading-relaxed">{msg.slides[7]?.content || "将来の展望"}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 flex items-center">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {msg.slides[currentSlideIndex[index] || 0].content}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* ナビゲーション */}
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setCurrentSlideIndex(prev => ({ 
                            ...prev, 
                            [index]: Math.max(0, (prev[index] || 0) - 1) 
                          }))}
                          disabled={(currentSlideIndex[index] || 0) === 0}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                        >
                          前へ
                        </button>
                        
                        <div className="flex gap-1">
                          {msg.slides.map((_, slideIndex) => (
                            <button
                              key={slideIndex}
                              onClick={() => setCurrentSlideIndex(prev => ({ ...prev, [index]: slideIndex }))}
                              className={`w-2 h-2 rounded-full transition-all ${
                                slideIndex === (currentSlideIndex[index] || 0) 
                                  ? 'bg-purple-500 scale-125' 
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setCurrentSlideIndex(prev => ({ 
                            ...prev, 
                            [index]: Math.min(msg.slides!.length - 1, (prev[index] || 0) + 1) 
                          }))}
                          disabled={(currentSlideIndex[index] || 0) === msg.slides.length - 1}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                        >
                          次へ
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 通常のテキストメッセージ
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border ${
                      msg.sender === "user"
                        ? "bg-primary/60 border-primary/40 text-primary-foreground"
                        : "bg-card/50 border-card-foreground/20 text-card-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
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
    </div>
    </SidebarProvider>
  )
}
