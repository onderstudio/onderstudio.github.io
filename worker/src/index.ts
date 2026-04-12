export interface Env {
  TELEGRAM_BOT_TOKEN: string
  OPENWEATHER_API_KEY: string
  GCP_SERVICE_ACCOUNT_EMAIL: string
  GCP_SERVICE_ACCOUNT_PRIVATE_KEY: string
  FIREBASE_WEB_API_KEY: string
  FRONTEND_ORIGIN: string
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }

type FirestoreDoc = {
  name: string
  fields?: Record<string, FirestoreValue>
}

const FIREBASE_PROJECT_ID = "alfredai-assist"
const FIRESTORE_PARENT = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/${FIRESTORE_PARENT}`
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore"

let cachedAccessToken: { token: string; expiresAt: number } | null = null

function corsHeaders(env: Env) {
  return {
    "Access-Control-Allow-Origin": env.FRONTEND_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

function jsonResponse(env: Env, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(env),
    },
  })
}

function textResponse(env: Env, text: string, status = 200) {
  return new Response(text, {
    status,
    headers: {
      ...corsHeaders(env),
    },
  })
}

function getString(
  fields: Record<string, FirestoreValue> | undefined,
  key: string,
  fallback = "",
) {
  const value = fields?.[key]
  if (!value) return fallback
  if ("stringValue" in value) return value.stringValue
  return fallback
}

function getNumber(
  fields: Record<string, FirestoreValue> | undefined,
  key: string,
  fallback = 0,
) {
  const value = fields?.[key]
  if (!value) return fallback
  if ("integerValue" in value) return Number(value.integerValue)
  if ("doubleValue" in value) return Number(value.doubleValue)
  return fallback
}

function getBoolean(
  fields: Record<string, FirestoreValue> | undefined,
  key: string,
  fallback = false,
) {
  const value = fields?.[key]
  if (!value) return fallback
  if ("booleanValue" in value) return value.booleanValue
  return fallback
}

function arrayBufferToBase64Url(buffer: ArrayBuffer | Uint8Array) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

async function importPrivateKey(privateKeyPem: string) {
  const normalizedPem = privateKeyPem
    .trim()
    .replace(/^"(.*)"$/s, "$1")
    .replace(/\\n/g, "\n")

  const pem = normalizedPem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .trim()

  const binaryDer = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0))

  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  )
}

async function getGoogleAccessToken(env: Env) {
  const now = Math.floor(Date.now() / 1000)

  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60) {
    return cachedAccessToken.token
  }

  const header = { alg: "RS256", typ: "JWT" }
  const claimSet = {
    iss: env.GCP_SERVICE_ACCOUNT_EMAIL,
    scope: FIRESTORE_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = arrayBufferToBase64Url(
    new TextEncoder().encode(JSON.stringify(header)),
  )
  const encodedClaimSet = arrayBufferToBase64Url(
    new TextEncoder().encode(JSON.stringify(claimSet)),
  )
  const unsignedJwt = `${encodedHeader}.${encodedClaimSet}`

  const privateKey = await importPrivateKey(env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY)
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(unsignedJwt),
  )

  const signedJwt = `${unsignedJwt}.${arrayBufferToBase64Url(signature)}`

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  })

  if (!tokenRes.ok) {
    const txt = await tokenRes.text()
    throw new Error(`Google token request failed: ${tokenRes.status} ${txt}`)
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string
    expires_in: number
  }

  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: now + tokenData.expires_in,
  }

  return tokenData.access_token
}

async function firestoreFetch(env: Env, url: string, init?: RequestInit) {
  const accessToken = await getGoogleAccessToken(env)

  const headers = new Headers(init?.headers ?? {})
  headers.set("Authorization", `Bearer ${accessToken}`)

  return fetch(url, {
    ...init,
    headers,
  })
}

async function fetchAutomations(env: Env) {
  const res = await firestoreFetch(env, `${FIRESTORE_BASE}/automations`)
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Automations fetch failed: ${res.status} ${txt}`)
  }

  const data = (await res.json()) as { documents?: FirestoreDoc[] }
  return data.documents ?? []
}

async function fetchUser(env: Env, userId: string) {
  const res = await firestoreFetch(env, `${FIRESTORE_BASE}/users/${userId}`)
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`User fetch failed: ${res.status} ${txt}`)
  }

  return (await res.json()) as FirestoreDoc
}

async function verifyFirebaseIdToken(env: Env, idToken: string) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_WEB_API_KEY}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    },
  )

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`ID token verify failed: ${res.status} ${txt}`)
  }

  const data = (await res.json()) as {
    users?: Array<{ localId?: string; email?: string }>
  }

  const user = data.users?.[0]
  if (!user?.localId) {
    throw new Error("Geçersiz kullanıcı tokenı.")
  }

  return {
    uid: user.localId,
    email: user.email ?? "",
  }
}

async function willRainToday(lat: number, lon: number, apiKey: string) {
  const url =
    `https://api.openweathermap.org/data/3.0/onecall` +
    `?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Weather fetch failed: ${res.status} ${txt}`)
  }

  const data = (await res.json()) as {
    daily?: Array<{
      weather?: Array<{ main?: string }>
      pop?: number
    }>
  }

  const today = data.daily?.[0]
  const rainyMain = today?.weather?.some((w) =>
    ["Rain", "Drizzle", "Thunderstorm"].includes(w.main ?? ""),
  )
  const rainyPop = (today?.pop ?? 0) >= 0.35

  return Boolean(rainyMain || rainyPop)
}

async function sendTelegramMessage(token: string, chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  })

  const body = await res.text()

  if (!res.ok) {
    throw new Error(`Telegram send failed: ${res.status} - ${body}`)
  }

  return JSON.parse(body)
}

async function runRainChecks(env: Env) {
  const docs = await fetchAutomations(env)

  for (const doc of docs) {
    const fields = doc.fields
    const isActive = getBoolean(fields, "isActive", false)
    const type = getString(fields, "type")
    const channel = getString(fields, "channel")
    const userId = getString(fields, "userId")
    const cityLabel = getString(fields, "cityLabel")
    const hour = getNumber(fields, "hour", 8)
    const minute = getNumber(fields, "minute", 0)
    const lat = getNumber(fields, "lat", 0)
    const lon = getNumber(fields, "lon", 0)

    if (!isActive || type !== "rain_alert" || channel !== "telegram") continue
    if (hour !== 8 || minute !== 0) continue

    const userDoc = await fetchUser(env, userId)
    const chatId = getString(userDoc.fields, "telegramChatId")

    if (!chatId) continue

    const rain = await willRainToday(lat, lon, env.OPENWEATHER_API_KEY)
    if (!rain) continue

    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      chatId,
      `Bugün ${cityLabel} için yağmur ihtimali var. Şemsiyeni almayı unutma ☔`,
    )
  }
}

async function searchLocations(query: string, apiKey: string) {
  const url =
    `https://api.openweathermap.org/geo/1.0/direct` +
    `?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Geo search failed: ${res.status} ${txt}`)
  }

  return res.json()
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env),
      })
    }

    if (url.pathname === "/geo/search") {
      const q = url.searchParams.get("q")?.trim() ?? ""

      if (q.length < 2) {
        return jsonResponse(env, [])
      }

      try {
        const results = await searchLocations(q, env.OPENWEATHER_API_KEY)
        return jsonResponse(env, results)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Bilinmeyen hata"
        return textResponse(env, message, 500)
      }
    }

    if (url.pathname === "/api/send-test-message" && request.method === "POST") {
      try {
        const authHeader = request.headers.get("authorization") ?? ""
        const idToken = authHeader.startsWith("Bearer ")
          ? authHeader.slice("Bearer ".length)
          : ""

        if (!idToken) {
          return textResponse(env, "Unauthorized", 401)
        }

        const authUser = await verifyFirebaseIdToken(env, idToken)
        const userDoc = await fetchUser(env, authUser.uid)
        const chatId = getString(userDoc.fields, "telegramChatId")

        if (!chatId) {
          return textResponse(env, "Telegram chat id kayıtlı değil.", 400)
        }

        await sendTelegramMessage(
          env.TELEGRAM_BOT_TOKEN,
          chatId,
          "Test başarılı. Butondan gönderilen mesaj çalışıyor. ☔",
        )

        return textResponse(env, "Test mesajı gönderildi.", 200)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Bilinmeyen hata"
        return textResponse(env, message, 500)
      }
    }

    return textResponse(env, "Rain alert worker is running.")
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    await runRainChecks(env)
  },
}