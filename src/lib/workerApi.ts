import { auth } from "./firebase"
import { env } from "./env"

type WorkerLocationResult = {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

async function getAuthHeader() {
  const user = auth.currentUser

  if (!user) {
    throw new Error("Önce giriş yapmalısın.")
  }

  const token = await user.getIdToken()
  return `Bearer ${token}`
}

export async function sendImmediateTelegramTestMessage() {
  const authHeader = await getAuthHeader()

  const res = await fetch(`${env.workerBaseUrl}/api/send-test-message`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: authHeader,
    },
  })

  const text = await res.text()

  if (!res.ok) {
    throw new Error(text || "Test mesajı gönderilemedi.")
  }

  return text
}

export async function searchLocations(query: string): Promise<WorkerLocationResult[]> {
  const res = await fetch(
    `${env.workerBaseUrl}/geo/search?q=${encodeURIComponent(query.trim())}`,
    {
      method: "GET",
    },
  )

  const text = await res.text()

  if (!res.ok) {
    throw new Error(text || "Lokasyon aranamadı.")
  }

  return JSON.parse(text) as WorkerLocationResult[]
}