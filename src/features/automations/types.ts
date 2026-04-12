export type Automation = {
  id: string
  userId: string
  type: "rain_alert"
  title: string
  cityLabel: string
  lat: number
  lon: number
  hour: number
  minute: number
  isActive: boolean
  channel: "telegram"
  createdAt?: unknown
  updatedAt?: unknown
}

export type CreateAutomationInput = {
  userId: string
  type: "rain_alert"
  title: string
  cityLabel: string
  lat: number
  lon: number
  hour: number
  minute: number
  isActive: boolean
  channel: "telegram"
}