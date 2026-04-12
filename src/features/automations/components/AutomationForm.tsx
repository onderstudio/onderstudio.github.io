import { useState } from "react"
import { createRainAutomation } from "../services/automationService"
import LocationPicker from "./LocationPicker"

type AutomationFormProps = {
  userId: string
  onCreated: () => Promise<void> | void
}

export default function AutomationForm({
  userId,
  onCreated,
}: AutomationFormProps) {
  const [title, setTitle] = useState("Sabah yağmur kontrolü")
  const [cityLabel, setCityLabel] = useState("")
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)
  const [hour, setHour] = useState(8)
  const [minute, setMinute] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("Başlık gerekli.")
      return
    }

    if (!cityLabel.trim() || lat === null || lon === null) {
      setError("Önce lokasyon seç.")
      return
    }

    try {
      setLoading(true)

      await createRainAutomation({
        userId,
        title: title.trim(),
        cityLabel,
        lat,
        lon,
        hour,
        minute,
      })

      setSuccess("Yağmur alarmı oluşturuldu.")
      setTitle("Sabah yağmur kontrolü")
      setCityLabel("")
      setLat(null)
      setLon(null)
      setHour(8)
      setMinute(0)

      await onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <form className="automation-form" onSubmit={handleSubmit}>
        <h3>Yağmur alarmı oluştur</h3>

        <label>
          Başlık
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sabah yağmur kontrolü"
          />
        </label>

        <LocationPicker
          onSelect={({ cityLabel, lat, lon }) => {
            setCityLabel(cityLabel)
            setLat(lat)
            setLon(lon)
          }}
        />

        <label>
          Seçilen lokasyon
          <input
            type="text"
            value={cityLabel}
            readOnly
            placeholder="Henüz lokasyon seçilmedi"
          />
        </label>

        <div className="time-grid">
          <label>
            Saat
            <input
              type="number"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
            />
          </label>

          <label>
            Dakika
            <input
              type="number"
              min={0}
              max={59}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
            />
          </label>
        </div>

        {error ? <div className="error-box">{error}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}

        <button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Alarmı Kaydet"}
        </button>
      </form>
    </div>
  )
}