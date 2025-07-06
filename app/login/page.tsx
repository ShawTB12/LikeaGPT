"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // デモ用のログイン処理（実際のプロジェクトでは認証APIを呼び出す）
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // ログイン成功時はメインページへリダイレクト
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex items-center justify-center">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 z-0">
        {/* パターン1: ノイズシルエット */}
        <div className="absolute inset-0 opacity-5">
          <div className="brain-silhouette-grid"></div>
        </div>
        
        {/* パターン2: データフローライン */}
        <div className="absolute inset-0 opacity-10">
          <div className="data-flow-lines"></div>
        </div>
        
        {/* パターン3: 点滅サーキット */}
        <div className="absolute inset-0 opacity-8">
          <div className="circuit-pattern"></div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* ロゴ（鼓動エフェクト付き） */}
        <div className={`text-center mb-12 transition-all duration-2000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative inline-block">
            <div className="logo-pulse">
              <Image
                src="/BizBrain_logo.png"
                alt="BizBrain"
                width={120}
                height={120}
                className="mx-auto mb-6 logo-glow"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              BizBrain
            </h1>
            <p className="text-gray-400 text-sm font-light">
              起動と共に、記憶が目覚める。
            </p>
          </div>
        </div>

        {/* ログインフォーム */}
        <div className={`bg-black/40 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-8 shadow-2xl transition-all duration-2000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">ログイン</h2>
            <p className="text-gray-400 text-sm">アカウントにアクセスしてください</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* メールアドレス */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            {/* パスワード */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* ログインボタン */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed circuit-button"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  接続中...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  ログイン
                </div>
              )}
            </Button>
          </form>

          {/* その他のリンク */}
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200">
              パスワードをお忘れですか？
            </a>
          </div>
        </div>
      </div>


    </div>
  )
} 