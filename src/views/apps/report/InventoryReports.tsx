'use client'

import { useEffect, useState } from 'react'

import { Box, CircularProgress, Typography } from '@mui/material'

import { post } from '@/services/apiService'
import { reportEndpoints } from '@/services/endpoints/report'
import type { GroceryDashboardSummary } from '@/types/apps/reportTypes'
import StatCard from './list/StatCard'

const InventoryReports = () => {
  const [data, setData] = useState<GroceryDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await post(reportEndpoints.groceryDashboardSummary, {})

        if (res?.data) {
          setData(res.data)
        } else {
          setError('No data returned')
        }
      } catch (err) {
        setError('Failed to load inventory data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
  }

  if (error) {
    return <Typography color='error' sx={{ p: 4 }}>{error}</Typography>
  }

  return (
    <>
      <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
        <StatCard
          className='w-full md:w-1/4'
          title='Inventory Items'
          value={data?.totalItems ?? 0}
          icon='tabler-shopping-cart'
          color='primary'
          isSelected={false}
          onClick={() => {}}
        />
        <StatCard
          className='w-full md:w-1/4'
          title='Low Stock items'
          value={data?.lowStockItems ?? 0}
          icon='tabler-box'
          color='error'
          isSelected={false}
          onClick={() => {}}
        />
        <StatCard
          className='w-full md:w-1/4'
          title='Monthly Purchase Items'
          value={data?.monthlyPurchaseItems ?? 0}
          icon='tabler-clipboard-list'
          color='warning'
          isSelected={false}
          onClick={() => {}}
        />
        <StatCard
          className='w-full md:w-1/4'
          title='Estimated Food Cost'
          value={data?.estimatedFoodCost ?? 0}
          icon='tabler-currency-euro'
          color='success'
          isSelected={false}
          onClick={() => {}}
        />
      </div>
    </>
  )
}

export default InventoryReports
