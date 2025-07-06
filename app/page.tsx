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
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const backgroundImageStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return
    
    const userMessage: Message = { text: inputValue, sender: "user", type: "text" }
    setMessages(prev => [...prev, userMessage])
    
    const query = inputValue.trim()
    setInputValue("")

    // シンプルなチャット応答
    const aiMessage: Message = {
      text: "こんにちは！こちらはUIデモです。現在、分析機能は無効化されています。",
      sender: "ai",
      type: "text"
    }
    
    setMessages(prev => [...prev, aiMessage])
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen w-full font-sans relative overflow-hidden" style={backgroundImageStyle}>
      {/* Sidebar */}
      <div className={`group peer ${isSidebarOpen ? 'block' : 'hidden'} md:block text-sidebar-foreground`} data-state="expanded" data-collapsible="" data-variant="sidebar" data-side="left">
        <div className="duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180 group-data-[collapsible=icon]:w-[--sidebar-width-icon]" style={{"--sidebar-width": "16rem", "--sidebar-width-icon": "3rem"}}></div>
        <div className="duration-200 inset-y-0 hidden w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l bg-neutral-900/80 backdrop-blur-lg text-gray-100 border-r border-neutral-700/50 fixed md:sticky top-0 left-0 h-full z-20" style={{"--sidebar-width": "16rem", "--sidebar-width-icon": "3rem"}}>
          <div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow">
            <div className="flex h-14 items-center justify-between gap-2 p-4 border-b border-neutral-700/50">
              <div className="flex items-center gap-3">
                <Sparkles className="text-purple-400" size={24} />
                <p className="whitespace-nowrap text-lg font-semibold tracking-tight text-gray-50">
                  Central Agent
                </p>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden">
                <PanelLeft size={20} />
              </Button>
            </div>
            <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4 mt-4">
              <Button className="w-full justify-start gap-2 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white">
                <Plus size={18} />
                New Chat
              </Button>
              <div className="flex-grow overflow-y-auto px-2">
                <p className="px-1 py-2 text-xs font-medium text-gray-400">Recent</p>
                <nav className="flex flex-col gap-1">
                  <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-700 hover:text-white bg-gray-700 text-white" title="Current Chat Topic Example">
                    <MessageSquare size={16} />
                    Current Chat
                  </Link>
                  <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white" title="Previous discussion about UI">
                    <MessageSquare size={16} />
                    UI Discussion
                  </Link>
                  <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white" title="Exploring new ideas">
                    <MessageSquare size={16} />
                    New Ideas
                  </Link>
                </nav>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-border p-4">
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
              <div className="flex items-center gap-3 pt-3 border-t border-gray-700 mt-3">
                <Image src="/placeholder.svg" alt="User Avatar" width={32} height={32} className="rounded-full" />
                <span className="text-sm font-medium text-gray-300">User Name</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 flex flex-col transition-all duration-300 ease-in-out bg-neutral-900/80 backdrop-blur-lg text-gray-100 ">
        {/* Header */}
        <header className="bg-neutral-900/60 backdrop-blur-lg p-4 flex items-center justify-between sticky top-0 z-10 border-b border-neutral-700/50 text-gray-100">
          <div className="flex items-center space-x-3">
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-neutral-700/60">
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
            <Image src="/placeholder.svg" alt="User Avatar" width={32} height={32} className="rounded-full" />
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === "user" ? "bg-purple-600 text-white" : "bg-neutral-800 text-white"}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-neutral-900/60 backdrop-blur-lg p-4 sticky bottom-0 z-10 border-t border-neutral-700/50">
          <div className="flex items-center space-x-3 max-w-5xl mx-auto px-4">
            <button className="p-2.5 rounded-full hover:bg-neutral-700/60 transition-colors text-gray-100 flex-shrink-0">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 p-4 rounded-xl bg-neutral-800 border border-neutral-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none placeholder-gray-400 text-gray-100 text-base"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button 
              className="p-4 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors text-white flex items-center justify-center flex-shrink-0"
              onClick={handleSendMessage}
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
    </div>
  )
}
