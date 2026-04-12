import { useState } from "react"
import { searchLocations } from "../../../lib/workerApi"

type LocationResult = {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

type LocationPickerProps = {
  onSelect: (location: { cityLabel: string; lat: number; lon: number }) => void
}

export default function LocationPicker({ onSelect }: LocationPickerProps) {
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<LocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    setError("")
    setItems([])

    if (query.trim().length < 2) {
      setError("En az 2 karakter gir.")
      return
    }

    try {
      setLoading(true)
      const data = await searchLocations(query)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="location-picker">
      <label>
        Lokasyon Ara
        <div className="button-row">
          <input
            type="text"
            value={query}
            placeholder="İstanbul, Ankara, İzmir..."
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" onClick={handleSearch} disabled={loading}>
            {loading ? "Aranıyor..." : "Ara"}
          </button>
        </div>
      </label>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="location-results">
        {items.map((item, index) => {
          const label = [item.name, item.state, item.country]
            .filter(Boolean)
            .join(", ")

          return (
            <button
              type="button"
              key={`${item.lat}-${item.lon}-${index}`}
              className="location-item"
              onClick={() =>
                onSelect({
                  cityLabel: label,
                  lat: item.lat,
                  lon: item.lon,
                })
              }
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}