'use client'

import { useEffect, useMemo } from 'react'

import dynamic from 'next/dynamic'

import type { ApexOptions } from 'apexcharts'
import { useTheme } from '@mui/material/styles'

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material'

import type { GroceryFoodCostReport } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const FoodCostReport = () => {
  const theme = useTheme()
  const { data, loading, error, applyRange, fetch } = useReport<GroceryFoodCostReport>({ endpoint: reportEndpoints.groceryFoodCostReport })

  useEffect(() => { fetch() }, [fetch])

  const primaryColor = theme.palette.primary.main
  const warningColor = theme.palette.warning.main

  const dailyOptions: ApexOptions = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    xaxis: { type: 'datetime', labels: { format: 'MMM dd' } },
    yaxis: { labels: { formatter: (v: number) => formatCurrency(v) } },
    colors: [primaryColor, warningColor],
    grid: { borderColor: 'var(--mui-palette-divider)' },
    legend: { position: 'top' }
  }), [primaryColor, warningColor])

  const dailySeries = useMemo(() => {
    if (!data?.dailyBreakdown) return []
    
return [
      { name: 'Revenue', data: data.dailyBreakdown.map(d => ({ x: new Date(d.date).getTime(), y: d.revenue })) },
      { name: 'Food Cost', data: data.dailyBreakdown.map(d => ({ x: new Date(d.date).getTime(), y: d.foodCost })) }
    ]
  }, [data])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
  if (error) return <Typography color='error'>{error}</Typography>

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r) }} loading={loading} />
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6'>
        <KpiCard title='Total Revenue' value={formatCurrency(data?.totalRevenue ?? 0)} icon='tabler-currency-euro' color='primary' />
        <KpiCard title='Total Orders' value={formatNumber(data?.totalOrders ?? 0)} icon='tabler-shopping-cart' color='info' />
        <KpiCard title='Items Sold' value={formatNumber(data?.totalItemsSold ?? 0)} icon='tabler-box' color='success' />
        <KpiCard title='Est. Food Cost' value={formatCurrency(data?.estimatedFoodCost ?? 0)} icon='tabler-receipt' color='warning' />
        <KpiCard title='Food Cost %' value={data ? `${data.foodCostPercent}%` : '-'} icon='tabler-percentage' color='primary' />
      </div>
      {data?.dailyBreakdown && data.dailyBreakdown.length > 0 ? (
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>Daily Food Cost vs Revenue</Typography>
            <AppReactApexCharts options={dailyOptions} series={dailySeries} type='bar' height={350} />
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}

const KpiCard = ({ title, value, icon, color }: {
  title: string
  value: string | number
  icon: string
  color: string
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Box sx={{
        p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%', backgroundColor: `rgba(var(--mui-palette-${color}-mainChannel) / 0.1)`
      }}>
        <i className={`${icon} text-2xl text-${color}`} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant='body2' color='text.secondary' noWrap>{title}</Typography>
        <Typography variant='h5'>{value}</Typography>
      </Box>
    </CardContent>
  </Card>
)

export default FoodCostReport
