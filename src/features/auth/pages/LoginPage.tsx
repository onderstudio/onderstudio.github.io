import { useState } from "react"
import type { FormEvent } from "react"
import { loginWithEmail, registerWithEmail } from "../services/authService"

type AuthMode = "login" | "register"

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isLogin = mode === "login"

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email ve şifre gerekli.")
      return
    }

    if (!isLogin && password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.")
      return
    }

    try {
      setLoading(true)

      if (isLogin) {
        await loginWithEmail(email, password)
      } else {
        await registerWithEmail(email, password)
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bir hata oluştu. Lütfen tekrar dene."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h2>
        <p>Kişisel hava ve otomasyon paneline hoş geldin.</p>

        <div className="auth-switch">
          <button
            type="button"
            className={isLogin ? "tab-button active" : "tab-button"}
            onClick={() => setMode("login")}
          >
            Giriş
          </button>
          <button
            type="button"
            className={!isLogin ? "tab-button active" : "tab-button"}
            onClick={() => setMode("register")}
          >
            Kayıt
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            Şifre
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button type="submit" disabled={loading}>
            {loading
              ? "İşleniyor..."
              : isLogin
                ? "Giriş Yap"
                : "Kayıt Oluştur"}
          </button>
        </form>
      </div>
    </div>
  )
}