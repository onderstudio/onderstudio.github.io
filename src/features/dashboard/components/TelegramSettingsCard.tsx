import { useEffect, useState } from "react"
import { updateTelegramChatId } from "../../../lib/firestore"
import { sendImmediateTelegramTestMessage } from "../../../lib/workerApi"

type TelegramSettingsCardProps = {
  userId: string
  initialChatId: string
  onUpdated: () => Promise<void> | void
}

export default function TelegramSettingsCard({
  userId,
  initialChatId,
  onUpdated,
}: TelegramSettingsCardProps) {
  const [chatId, setChatId] = useState(initialChatId)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setChatId(initialChatId)
  }, [initialChatId])

  const handleSave = async () => {
    setError("")
    setMessage("")

    if (!chatId.trim()) {
      setError("Telegram chat id gerekli.")
      return
    }

    try {
      setSaving(true)
      await updateTelegramChatId(userId, chatId.trim())
      setMessage("Telegram chat id kaydedildi.")
      await onUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydetme başarısız.")
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setError("")
    setMessage("")

    if (!chatId.trim()) {
      setError("Önce Telegram chat id kaydet.")
      return
    }

    try {
      setTesting(true)

      await updateTelegramChatId(userId, chatId.trim())
      await onUpdated()

      await sendImmediateTelegramTestMessage()

      setMessage("Test mesajı gönderildi.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test mesajı gönderilemedi.")
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="panel">
      <h3>Telegram Ayarları</h3>

      <label>
        Telegram Chat ID
        <input
          type="text"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="123456789"
        />
      </label>

      <div className="button-row">
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Chat ID Kaydet"}
        </button>

        <button type="button" onClick={handleTest} disabled={testing}>
          {testing ? "Gönderiliyor..." : "Test Mesajı Gönder"}
        </button>
      </div>

      {message ? <div className="success-box">{message}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}
    </div>
  )
}