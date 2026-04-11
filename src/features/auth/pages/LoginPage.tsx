import { FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Şimdilik fake login
    // Firebase Auth'u bir sonraki adımda bağlayacağız
    if (!email || !password) {
      alert("Email ve şifre gerekli.")
      return
    }

    navigate("/dashboard")
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Giriş Yap</h2>
        <p>Yağmur hatırlatma paneline hoş geldin.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Şifre
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit">Devam et</button>
        </form>
      </div>
    </div>
  )
}