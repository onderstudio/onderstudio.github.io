import type { Automation } from "../types"

type AutomationListProps = {
  items: Automation[]
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export default function AutomationList({ items }: AutomationListProps) {
  if (!items.length) {
    return <p>Henüz otomasyon yok.</p>
  }

  return (
    <div className="automation-list">
      {items.map((item) => (
        <div key={item.id} className="panel">
          <h3>{item.title}</h3>

          <p>
            <strong>Lokasyon:</strong> {item.cityLabel}
          </p>

          <p>
            <strong>Koordinat:</strong> {item.lat}, {item.lon}
          </p>

          <p>
            <strong>Saat:</strong> {pad(item.hour)}:{pad(item.minute)}
          </p>

          <p>
            <strong>Kanal:</strong> {item.channel}
          </p>

          <p>
            <strong>Durum:</strong> {item.isActive ? "Aktif" : "Pasif"}
          </p>
        </div>
      ))}
    </div>
  )
}