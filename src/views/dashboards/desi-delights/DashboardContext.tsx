'use client'

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react'

export type DateRangePreset = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom'

interface DateRange {
  startDate: string
  endDate: string
}

interface DashboardContextValue {
  dateRangePreset: DateRangePreset
  setDateRangePreset: (preset: DateRangePreset) => void
  customStartDate: string
  customEndDate: string
  setCustomStartDate: (date: string) => void
  setCustomEndDate: (date: string) => void
  dateRange: DateRange
  previousDateRange: DateRange
  refreshKey: number
  refresh: () => void
  selectedRestaurantId: number | null
  setSelectedRestaurantId: (id: number | null) => void
  restaurants: Array<{ id: number; name: string }>
  setRestaurants: (restaurants: Array<{ id: number; name: string }>) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

const belgiumFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Brussels' })

function getBelgiumDateRange(preset: DateRangePreset, customStart: string, customEnd: string): DateRange {
  const now = new Date()
  const todayStr = belgiumFormatter.format(now)

  const startOfDay = (dateStr: string) => `${dateStr}T00:00:00`
  const endOfDay = (dateStr: string) => `${dateStr}T23:59:59`

  switch (preset) {
    case 'today':
      return { startDate: startOfDay(todayStr), endDate: endOfDay(todayStr) }

    case 'yesterday': {
      const d = new Date(now)

      d.setDate(d.getDate() - 1)

      const yesterdayStr = belgiumFormatter.format(d)

      return { startDate: startOfDay(yesterdayStr), endDate: endOfDay(yesterdayStr) }
    }

    case 'last7': {
      const d = new Date(now)

      d.setDate(d.getDate() - 6)

      const startStr = belgiumFormatter.format(d)

      return { startDate: startOfDay(startStr), endDate: endOfDay(todayStr) }
    }

    case 'last30': {
      const d = new Date(now)

      d.setDate(d.getDate() - 29)

      const startStr = belgiumFormatter.format(d)

      return { startDate: startOfDay(startStr), endDate: endOfDay(todayStr) }
    }

    case 'thisMonth': {
      const year = now.toLocaleString('en-US', { timeZone: 'Europe/Brussels', year: 'numeric' })
      const month = now.toLocaleString('en-US', { timeZone: 'Europe/Brussels', month: '2-digit' })

      return { startDate: `${year}-${month}-01T00:00:00`, endDate: endOfDay(todayStr) }
    }

    case 'lastMonth': {
      const d = new Date(now)

      d.setDate(0)

      const lastMonthStr = belgiumFormatter.format(d)
      const year = lastMonthStr.substring(0, 4)
      const month = lastMonthStr.substring(5, 7)

      return { startDate: `${year}-${month}-01T00:00:00`, endDate: endOfDay(lastMonthStr) }
    }

    case 'custom': {
      if (!customStart || !customEnd) return { startDate: startOfDay(todayStr), endDate: endOfDay(todayStr) }

      return { startDate: startOfDay(customStart), endDate: endOfDay(customEnd) }
    }

    default:
      return { startDate: startOfDay(todayStr), endDate: endOfDay(todayStr) }
  }
}

function getPreviousDateRange(current: DateRange): DateRange {
  const start = new Date(current.startDate)
  const end = new Date(current.endDate)
  const diff = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - diff)

  return {
    startDate: `${belgiumFormatter.format(prevStart)}T00:00:00`,
    endDate: `${belgiumFormatter.format(prevEnd)}T23:59:59`
  }
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('last30')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null)
  const [restaurants, setRestaurants] = useState<Array<{ id: number; name: string }>>([])

  const dateRange = useMemo(
    () => getBelgiumDateRange(dateRangePreset, customStartDate, customEndDate),
    [dateRangePreset, customStartDate, customEndDate]
  )

  const previousDateRange = useMemo(() => getPreviousDateRange(dateRange), [dateRange])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const value = useMemo(
    () => ({
      dateRangePreset,
      setDateRangePreset,
      customStartDate,
      customEndDate,
      setCustomStartDate,
      setCustomEndDate,
      dateRange,
      previousDateRange,
      refreshKey,
      refresh,
      selectedRestaurantId,
      setSelectedRestaurantId,
      restaurants,
      setRestaurants
    }),
    [
      dateRangePreset,
      customStartDate,
      customEndDate,
      dateRange,
      previousDateRange,
      refreshKey,
      refresh,
      selectedRestaurantId,
      restaurants
    ]
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext)

  if (!ctx) throw new Error('useDashboardContext must be used within DashboardProvider')

  return ctx
}
