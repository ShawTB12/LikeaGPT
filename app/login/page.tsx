"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* メインコンテンツ */}
      <div className={`w-full max-w-md transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* ロゴとタイトル */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="/BizBrain_logo.png"
              alt="BizBrain"
              width={64}
              height={64}
              className="mx-auto opacity-90"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            BizBrain
          </h1>
          <p className="text-gray-400 text-sm">
            アカウントにログインしてください
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* メールアドレス */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
                required
              />
            </div>

            {/* パスワード */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                パスワード
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* ログインボタン */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </div>
              ) : (
                "ログイン"
              )}
            </Button>
          </form>

          {/* その他のリンク */}
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
              パスワードをお忘れですか？
            </a>
          </div>
        </div>
      </div>

    </div>
  )
} 