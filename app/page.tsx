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
  Sparkles,
  X,
  Send,
  Paperclip,
  Mic,
  MessageSquare,
  HelpCircle,
  History,
  PanelLeft,
  LogIn,
  Loader2,
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
  type?: 'text';
  timestamp?: Date;
}

// Chat型を定義
interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// API応答の型定義
interface ChatResponse {
  message: string;
  error?: string;
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // 現在のチャットを取得
  const currentChat = chats.find(chat => chat.id === currentChatId)
  const messages = currentChat?.messages || []

  // チャットタイトルを生成する関数
  const generateChatTitle = (firstMessage: string): string => {
    const truncated = firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage
    return truncated.replace(/\n/g, " ").trim()
  }

  // 新しいチャットを作成する関数
  const createNewChat = (): string => {
    const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newChat: Chat = {
      id: newChatId,
      title: "新しいチャット",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(newChatId)
    return newChatId
  }

  // チャットメッセージを追加する関数
  const addMessageToChat = (chatId: string, message: Message) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, message]
        // 最初のメッセージの場合、タイトルを更新
        const title = chat.messages.length === 0 && message.sender === "user" 
          ? generateChatTitle(message.text)
          : chat.title
        
        return {
          ...chat,
          messages: updatedMessages,
          title,
          updatedAt: new Date()
        }
      }
      return chat
    }))
  }

  // チャットを切り替える関数
  const switchToChat = (chatId: string) => {
    setCurrentChatId(chatId)
    setError(null)
  }

  const backgroundImageStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  // ローカルストレージからチャット履歴を読み込み
  useEffect(() => {
    const savedChats = localStorage.getItem('newjec-gpt-chats')
    const savedCurrentChatId = localStorage.getItem('newjec-gpt-current-chat-id')
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
          }))
        }))
        setChats(parsedChats)
        
        if (savedCurrentChatId && parsedChats.some((chat: Chat) => chat.id === savedCurrentChatId)) {
          setCurrentChatId(savedCurrentChatId)
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
    
    setIsLoaded(true)
  }, [])

  // チャット履歴をローカルストレージに保存
  useEffect(() => {
    if (isLoaded && chats.length > 0) {
      localStorage.setItem('newjec-gpt-chats', JSON.stringify(chats))
    }
  }, [chats, isLoaded])

  // 現在のチャットIDをローカルストレージに保存
  useEffect(() => {
    if (isLoaded && currentChatId) {
      localStorage.setItem('newjec-gpt-current-chat-id', currentChatId)
    }
  }, [currentChatId, isLoaded])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return
    
    // エラーをクリア
    setError(null)
    
    // 現在のチャットがない場合は新しいチャットを作成
    let activeChat = currentChatId
    if (!activeChat) {
      activeChat = createNewChat()
    }
    
    const userMessage: Message = { 
      text: inputValue, 
      sender: "user", 
      type: "text",
      timestamp: new Date()
    }
    addMessageToChat(activeChat, userMessage)
    
    const query = inputValue.trim()
    setInputValue("")
    setIsLoading(true)

    try {
      // OpenAI APIに送信
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      })

      const data: ChatResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'APIエラーが発生しました')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      // AI応答を追加
      const aiMessage: Message = {
        text: data.message,
        sender: "ai",
        type: "text",
        timestamp: new Date()
      }
      
      addMessageToChat(activeChat, aiMessage)
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(errorMessage)
      
      // エラーメッセージを表示
      const errorMsg: Message = {
        text: `エラー: ${errorMessage}`,
        sender: "system",
        type: "text",
        timestamp: new Date()
      }
      addMessageToChat(activeChat, errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen w-full font-sans relative overflow-hidden" style={backgroundImageStyle}>
      {/* Sidebar */}
      <div className={`group peer ${isSidebarOpen ? 'block' : 'hidden'} md:block text-sidebar-foreground`} data-state="expanded" data-collapsible="" data-variant="sidebar" data-side="left">
        <div 
          className="duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180 group-data-[collapsible=icon]:w-[--sidebar-width-icon]" 
          style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}
        ></div>
        <div 
          className="duration-200 inset-y-0 hidden w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l bg-neutral-900/95 backdrop-blur-lg text-gray-100 border-r border-neutral-700/50 fixed md:sticky top-0 left-0 h-full z-20" 
          style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}
        >
          <div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow">
            <div className="flex h-14 items-center justify-center p-4 border-b border-neutral-700/50 relative">
              <Image src="/NEWJECロゴ.png" alt="NEWJEC Logo" width={120} height={32} className="object-contain" />
              <Button variant="ghost" size="icon" className="md:hidden absolute right-4">
                <PanelLeft size={20} />
              </Button>
            </div>
            <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4 mt-4">
              <Button 
                onClick={createNewChat}
                className="w-full justify-start gap-2 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                <Plus size={18} />
                New Chat
              </Button>
              <div className="flex-grow overflow-y-auto px-2">
                <p className="px-1 py-2 text-xs font-medium text-gray-400">Recent</p>
                <nav className="flex flex-col gap-1">
                  {chats.length === 0 ? (
                    <p className="px-3 py-4 text-xs text-gray-500 text-center">
                      まだチャット履歴がありません
                    </p>
                  ) : (
                    chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => switchToChat(chat.id)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-700 hover:text-white w-full text-left ${
                          currentChatId === chat.id ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                        title={chat.title}
                      >
                        <MessageSquare size={16} />
                        <span className="truncate">{chat.title}</span>
                      </button>
                    ))
                  )}
                </nav>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-neutral-700/50 p-4">
              <nav className="flex flex-col gap-1">
                <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white" title="Help">
                  <HelpCircle size={16} />
                  Help
                </Link>
                <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white" title="Activity">
                  <History size={16} />
                  Activity
                </Link>
                <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white" title="Settings">
                  <Settings size={16} />
                  Settings
                </Link>
              </nav>
              <div className="flex items-center gap-3 pt-3 border-t border-neutral-700/50 mt-3">
                <Image src="/placeholder.svg" alt="User Avatar" width={32} height={32} className="rounded-full" />
                <span className="text-sm font-medium text-gray-300">User Name</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 flex flex-col transition-all duration-300 ease-in-out bg-glass backdrop-blur-lg text-foreground">
        {/* Header */}
        <header className="bg-glass-strong backdrop-blur-lg p-4 flex items-center justify-between sticky top-0 z-10 border-b border-border text-foreground">
          <div className="flex items-center space-x-3">
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-secondary transition-colors">
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-semibold">
              {currentChat ? currentChat.title : "NEWJEC GPT"}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Settings size={20} />
            </button>
            <Link href="/login">
              <Button variant="ghost" size="icon" className="p-2 rounded-full hover:bg-secondary transition-colors">
                <LogIn size={20} />
              </Button>
            </Link>
            <Image src="/placeholder.svg" alt="User Avatar" width={32} height={32} className="rounded-full" />
          </div>
        </header>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 m-4 rounded-lg">
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-xs underline mt-1 hover:no-underline"
            >
              閉じる
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent" ref={chatContainerRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Sparkles size={48} className="mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">NEWJEC GPTへようこそ</h2>
              <p className="text-lg">何でもお聞きください。お手伝いします。</p>
              <p className="text-sm mt-2 mb-8 opacity-75">セキュリティとプライバシーを重視した設計です。</p>
              
              {/* クイックアクションボタン */}
              <div className="flex justify-center gap-3 w-full px-4">
                <button
                  onClick={() => setInputValue("以下の英文を日本語に翻訳し、文法やスタイルの改善提案も含めてください：\n\n")}
                  className="p-3 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-lg transition-colors text-center"
                >
                  <h3 className="font-medium text-xs">英文翻訳・添削</h3>
                </button>
                
                <button
                  onClick={() => setInputValue("プログラミングに関して質問があります。以下のコードについて説明や改善提案をお願いします：\n\n")}
                  className="p-3 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-lg transition-colors text-center"
                >
                  <h3 className="font-medium text-xs">コーディング</h3>
                </button>
                
                <button
                  onClick={() => setInputValue("以下の内容で資料を作成する際のアドバイスやアウトライン、改善点を教えてください：\n\n")}
                  className="p-3 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-lg transition-colors text-center"
                >
                  <h3 className="font-medium text-xs">資料作成アシスト</h3>
                </button>
              </div>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : msg.sender === "system"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-secondary text-secondary-foreground"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.timestamp && (
                  <p className="text-xs opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {/* ローディング表示 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                <div className="flex items-center space-x-2">
                  <Loader2 size={16} className="animate-spin" />
                  <p className="text-sm">考え中...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="bg-glass-strong backdrop-blur-lg p-4 sticky bottom-0 z-10 border-t border-border">
          <div className="flex items-center space-x-3 max-w-5xl mx-auto px-4">
            <button 
              className="p-2.5 rounded-full hover:bg-secondary transition-colors text-foreground flex-shrink-0 disabled:opacity-50" 
              disabled={isLoading}
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              placeholder={isLoading ? "送信中..." : "メッセージを入力してください..."}
              className="flex-1 p-4 rounded-xl bg-background border border-input focus:ring-2 focus:ring-ring focus:border-transparent outline-none placeholder-muted-foreground text-foreground text-base disabled:opacity-50"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              disabled={isLoading}
              maxLength={4000}
            />
            <button 
              className="p-4 rounded-xl bg-primary hover:bg-primary/90 transition-colors text-primary-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-50"
              onClick={handleSendMessage}
              disabled={isLoading || inputValue.trim() === ""}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
            <button 
              className="p-2.5 rounded-full hover:bg-secondary transition-colors text-foreground flex-shrink-0 disabled:opacity-50" 
              disabled={isLoading}
            >
              <Mic size={20} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            NEWJEC GPT may display inaccurate info, including about people, so double-check its responses. Your privacy & NEWJEC Apps
          </p>
        </div>
      </main>
    </div>
  )
}
