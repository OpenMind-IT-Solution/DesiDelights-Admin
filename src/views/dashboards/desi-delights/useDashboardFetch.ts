'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import { useSession } from 'next-auth/react'

import { post } from '@/services/apiService'
import { reportEndpoints } from '@/services/endpoints/report'

import { useDashboardContext } from './DashboardContext'

interface DashboardData {
  salesSummary: any
  dailySales: any[]
  hourlySales: any[]
  itemSales: any[]
  categorySales: any[]
  categoryPerformance: any[]
  paymentMethods: any[]
  customerAnalytics: any
  recentOrders: any[]
  topProducts: any[]
  inventoryInsights: any
  revenueTrend: any[]
  taxes: any
  discounts: any
  prevSalesSummary: any
  prevDailySales: any[]
  prevPaymentMethods: any[]
  prevTopProducts: any[]
}

interface UseDashboardFetchReturn {
  data: DashboardData
  loading: boolean
  error: string | null
}

const EMPTY_DATA: DashboardData = {
  salesSummary: null,
  dailySales: [],
  hourlySales: [],
  itemSales: [],
  categorySales: [],
  categoryPerformance: [],
  paymentMethods: [],
  customerAnalytics: null,
  recentOrders: [],
  topProducts: [],
  inventoryInsights: null,
  revenueTrend: [],
  taxes: null,
  discounts: null,
  prevSalesSummary: null,
  prevDailySales: [],
  prevPaymentMethods: [],
  prevTopProducts: []
}

export function useDashboardFetch(): UseDashboardFetchReturn {
  const { data: session } = useSession()
  const { dateRange, previousDateRange, refreshKey, selectedRestaurantId } = useDashboardContext()
  const [data, setData] = useState<DashboardData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(0)

  const fetchAll = useCallback(async () => {
    const reqId = ++abortRef.current

    setLoading(true)
    setError(null)

    const base = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      ...(selectedRestaurantId ? { restaurantId: selectedRestaurantId } : {})
    }

    const prevBase = {
      startDate: previousDateRange.startDate,
      endDate: previousDateRange.endDate,
      ...(selectedRestaurantId ? { restaurantId: selectedRestaurantId } : {})
    }

    try {
      const results = await Promise.allSettled([
        post(reportEndpoints.salesSummary, base),                              // 0
        post(reportEndpoints.dailySales, { ...base, limit: 365 }),             // 1
        post(reportEndpoints.hourlySales, base),                                // 2
        post(reportEndpoints.itemSales, { ...base, limit: 50 }),              // 3
        post(reportEndpoints.categorySales, base),                              // 4
        post(reportEndpoints.categoryPerformance, base),                        // 5
        post(reportEndpoints.paymentMethods, base),                             // 6
        post(reportEndpoints.customerAnalytics, base),                          // 7
        post(reportEndpoints.recentOrders, { ...base, limit: 20 }),            // 8
        post(reportEndpoints.topProducts, { ...base, limit: 10 }),             // 9
        post(reportEndpoints.inventoryInsights, base),                          // 10
        post(reportEndpoints.revenueTrend, base),                               // 11
        post(reportEndpoints.taxes, base),                                      // 12
        post(reportEndpoints.discounts, base),                                  // 13
        post(reportEndpoints.salesSummary, prevBase),                           // 14
        post(reportEndpoints.dailySales, { ...prevBase, limit: 365 }),         // 15
        post(reportEndpoints.paymentMethods, prevBase),                         // 16
        post(reportEndpoints.topProducts, { ...prevBase, limit: 10 })          // 17
      ])

      if (reqId !== abortRef.current) return

      const extract = (r: PromiseSettledResult<any>) =>
        r.status === 'fulfilled' ? (r.value?.data ?? r.value ?? null) : null

      setData({
        salesSummary: extract(results[0]),
        dailySales: extract(results[1])?.dailySales ?? [],
        hourlySales: extract(results[2])?.hourlySales ?? [],
        itemSales: extract(results[3])?.itemSales ?? [],
        categorySales: extract(results[4])?.categorySales ?? [],
        categoryPerformance: extract(results[5])?.categories ?? [],
        paymentMethods: extract(results[6])?.paymentMethods ?? [],
        customerAnalytics: extract(results[7]),
        recentOrders: extract(results[8])?.orders ?? [],
        topProducts: extract(results[9])?.products ?? [],
        inventoryInsights: extract(results[10]),
        revenueTrend: extract(results[11])?.dailyTrend ?? [],
        taxes: extract(results[12]),
        discounts: extract(results[13]),
        prevSalesSummary: extract(results[14]),
        prevDailySales: extract(results[15])?.dailySales ?? [],
        prevPaymentMethods: extract(results[16])?.paymentMethods ?? [],
        prevTopProducts: extract(results[17])?.products ?? []
      })
    } catch (e: any) {
      if (reqId !== abortRef.current) return
      setError(e?.message || 'Failed to load dashboard data')
    } finally {
      if (reqId === abortRef.current) setLoading(false)
    }
  }, [dateRange, previousDateRange, selectedRestaurantId])

  useEffect(() => {
    if (session?.user) fetchAll()
  }, [fetchAll, session, refreshKey])

  return { data, loading, error }
}
