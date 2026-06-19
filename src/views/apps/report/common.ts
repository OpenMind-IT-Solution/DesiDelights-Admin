'use client'

import { useCallback, useState } from 'react'

import { useSession } from 'next-auth/react'

import { post } from '@/services/apiService'
import type { DateRange, ApiResponse } from '@/types/apps/reportTypes'

type UseReportOptions = {
  endpoint: string
  defaultRange?: DateRange
}

export function useReport<T>({ endpoint, defaultRange }: UseReportOptions) {
  const { data: session } = useSession()
  const today = new Date()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [range, setRange] = useState<DateRange>(
    defaultRange ?? { startDate: thirtyDaysAgo.toISOString(), endDate: today.toISOString() }
  )

  const fetch = useCallback(
    async (overrides?: Partial<DateRange> & Record<string, unknown>) => {
      if (!session) return
      setLoading(true)
      setError(null)

      try {
        const payload = {
          startDate: range.startDate,
          endDate: range.endDate,
          ...overrides
        }

        const res: ApiResponse<T> = await post(endpoint, payload)

        setData(res.data)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load report')
      } finally {
        setLoading(false)
      }
    },
    [session, endpoint, range]
  )

  const fetchWithParams = useCallback(
    async (params: Record<string, unknown>) => {
      if (!session) return
      setLoading(true)
      setError(null)

      try {
        const res: ApiResponse<T> = await post(endpoint, params)

        setData(res.data)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load report')
      } finally {
        setLoading(false)
      }
    },
    [session, endpoint]
  )

  const applyRange = useCallback(
    (r: DateRange) => {
      setRange(r)
      setLoading(true)
      setError(null)

      const fetchWithRange = async () => {
        try {
          const payload = { startDate: r.startDate, endDate: r.endDate }
          const res: ApiResponse<T> = await post(endpoint, payload)

          setData(res.data)
        } catch (err: any) {
          setError(err?.message ?? 'Failed to load report')
        } finally {
          setLoading(false)
        }
      }

      fetchWithRange()
    },
    [endpoint]
  )

  return { data, loading, error, range, applyRange, fetch, fetchWithParams }
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function getDatePreset(preset: string): DateRange {
  const now = new Date()
  const end = now.toISOString()

  switch (preset) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      
return { startDate: start.toISOString(), endDate: end }
    }

    case 'yesterday': {
      const yesterday = new Date(now)

      yesterday.setDate(yesterday.getDate() - 1)
      const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      const yEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)

      
return { startDate: start.toISOString(), endDate: yEnd.toISOString() }
    }

    case 'thisWeek': {
      const dayOfWeek = now.getDay()
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const monday = new Date(now)

      monday.setDate(now.getDate() - diff)
      monday.setHours(0, 0, 0, 0)
      
return { startDate: monday.toISOString(), endDate: end }
    }

    case 'thisMonth': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      
return { startDate: monthStart.toISOString(), endDate: end }
    }

    case 'lastMonth': {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

      
return { startDate: firstDay.toISOString(), endDate: lastDay.toISOString() }
    }

    case 'tomorrow': {
      const tomorrow = new Date(now)

      tomorrow.setDate(tomorrow.getDate() + 1)
      const start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
      const tEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59)

      
return { startDate: start.toISOString(), endDate: tEnd.toISOString() }
    }

    case 'thisYear': {
      const yearStart = new Date(now.getFullYear(), 0, 1)

      
return { startDate: yearStart.toISOString(), endDate: end }
    }

    default: {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      
return { startDate: thirtyDaysAgo.toISOString(), endDate: end }
    }
  }
}

export const CHART_COLORS = [
  'var(--mui-palette-primary-main)',
  'var(--mui-palette-success-main)',
  'var(--mui-palette-warning-main)',
  'var(--mui-palette-error-main)',
  'var(--mui-palette-info-main)',
  'var(--mui-palette-secondary-main)'
]
