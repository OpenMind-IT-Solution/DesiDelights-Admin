// Type Imports
import type { ThemeColor } from '@core/types'

export type RestaurantTypes = {
  id: number
  email: string
  status: string
  avatar: string
  name: string
  location: string
  contact: string
  registrationName: string
  adminUsername: string
  currentPlan: string
  avatarColor?: ThemeColor
  billing: string
}
