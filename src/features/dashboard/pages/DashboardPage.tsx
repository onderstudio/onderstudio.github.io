import AppShell from "../../../components/layout/AppShell"

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <section className="grid">
        <div className="panel">
          <h3>Bugünkü Durum</h3>
          <p>Bugün için hava otomasyonu burada görünecek.</p>
        </div>

        <div className="panel">
          <h3>Aktif Otomasyonlar</h3>
          <p>Sabah 08:00 yağmur kontrolü gibi kurallar burada listelenecek.</p>
        </div>

        <div className="panel">
          <h3>Telegram Bildirimleri</h3>
          <p>Bot bağlantısı ve test mesajı alanı burada olacak.</p>
        </div>
      </section>
    </AppShell>
  )
}