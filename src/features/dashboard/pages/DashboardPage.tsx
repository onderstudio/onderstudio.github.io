import { useEffect, useState } from "react"
import AppShell from "../../../components/layout/AppShell"
import { useAuth } from "../../auth/context/AuthContext"
import { logout } from "../../auth/services/authService"
import { getUserProfile } from "../../../lib/firestore"
import type { AppUser } from "../../auth/types"
import type { Automation } from "../../automations/types"
import { fetchUserAutomations } from "../../automations/services/automationService"
import AutomationForm from "../../automations/components/AutomationForm"
import AutomationList from "../../automations/components/AutomationList"
import TelegramSettingsCard from "../components/TelegramSettingsCard"

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)

  const handleLogout = async () => {
    await logout()
  }

  const loadDashboardData = async () => {
    if (!user) return

    setLoading(true)

    try {
      const [userProfile, userAutomations] = await Promise.all([
        getUserProfile(user.uid),
        fetchUserAutomations(user.uid),
      ])

      setProfile(userProfile)
      setAutomations(userAutomations)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboardData()
  }, [user])

  if (!user) {
    return null
  }

  return (
    <AppShell title="Dashboard">
      <section className="dashboard-topbar">
        <div className="user-badge">
          <strong>Kullanıcı:</strong> {user.email ?? "Bilinmiyor"}
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </section>

      <section className="grid dashboard-grid">
        <div className="panel">
          <h3>Profil</h3>
          <p>
            <strong>Email:</strong> {profile?.email ?? user.email ?? "-"}
          </p>
          <p>
            <strong>UID:</strong> {profile?.uid ?? user.uid}
          </p>
          <p>
            <strong>Telegram Chat ID:</strong>{" "}
            {profile?.telegramChatId || "Henüz eklenmedi"}
          </p>
        </div>

        <TelegramSettingsCard
          userId={user.uid}
          initialChatId={profile?.telegramChatId ?? ""}
          onUpdated={loadDashboardData}
        />
      </section>

      <section style={{ marginTop: 20 }}>
        <AutomationForm userId={user.uid} onCreated={loadDashboardData} />
      </section>

      <section style={{ marginTop: 20 }}>
        <div className="panel">
          <h3>Aktif Otomasyonlar</h3>
          {loading ? <p>Yükleniyor...</p> : <AutomationList items={automations} />}
        </div>
      </section>
    </AppShell>
  )
}