"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
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

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return
    setMessages([...messages, { text: inputValue, sender: "user" }])
    // TODO: AIからの返信を処理するロジックを追加
    setInputValue("")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
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
