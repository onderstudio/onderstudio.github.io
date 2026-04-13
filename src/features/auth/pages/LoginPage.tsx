import { useState } from "react"
import { loginWithEmail } from "../services/authService"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email ve şifre gerekli.")
      return
    }

    try {
      setLoading(true)
      await loginWithEmail(email, password)
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
        <h2>Giriş Yap</h2>
        <p>Kişisel hava ve otomasyon paneline hoş geldin.</p>

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
              autoComplete="current-password"
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}

          <button type="submit" disabled={loading}>
            {loading ? "İşleniyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  )
}