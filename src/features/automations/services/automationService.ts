import { createAutomation, getUserAutomations } from "../../../lib/firestore"
import type { CreateAutomationInput } from "../types"

export async function createRainAutomation(input: {
  userId: string
  title: string
  cityLabel: string
  lat: number
  lon: number
  hour: number
  minute: number
}) {
  const payload: CreateAutomationInput = {
    userId: input.userId,
    type: "rain_alert",
    title: input.title,
    cityLabel: input.cityLabel,
    lat: input.lat,
    lon: input.lon,
    hour: input.hour,
    minute: input.minute,
    isActive: true,
    channel: "telegram",
  }

  return createAutomation(payload)
}

export async function fetchUserAutomations(userId: string) {
  return getUserAutomations(userId)
}