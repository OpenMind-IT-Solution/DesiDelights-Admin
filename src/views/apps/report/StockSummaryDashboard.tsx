'use client'

import { useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'

import type { ApexOptions } from 'apexcharts'
import { useTheme } from '@mui/material/styles'
import {
  Box, Card, CardContent, CardHeader, Chip, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import { post } from '@/services/apiService'
import type {
  GroceryDashboardSummary, GroceryStockSummary, GroceryInventoryValue,
  TrendReport, TopConsumedReport
} from '@/types/apps/reportTypes'
import { reportEndpoints } from '@/services/endpoints/report'
import { formatCurrency, formatNumber, getDatePreset } from './common'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const StockSummaryDashboard = () => {
  const theme = useTheme()
  const { data: session } = useSession()

  const [activePreset, setActivePreset] = useState('thisMonth')
  const [filter, setFilter] = useState(() => getDatePreset('thisMonth'))
  const [dashboard, setDashboard] = useState<GroceryDashboardSummary | null>(null)
  const [stockSummary, setStockSummary] = useState<GroceryStockSummary | null>(null)
  const [inventoryValue, setInventoryValue] = useState<GroceryInventoryValue | null>(null)
  const [purchaseTrend, setPurchaseTrend] = useState<TrendReport | null>(null)
  const [consumptionTrend, setConsumptionTrend] = useState<TrendReport | null>(null)
  const [topConsumed, setTopConsumed] = useState<TopConsumedReport | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const triggerLoading = (key: string) => setLoading(prev => ({ ...prev, [key]: true }))
  const doneLoading = (key: string) => setLoading(prev => ({ ...prev, [key]: false }))

  const fetchAll = async (range: typeof filter) => {
    if (!session) return
    const payload = { startDate: range.startDate, endDate: range.endDate }

    const fetches = [
      { key: 'dashboard', ep: reportEndpoints.groceryDashboardSummary, setter: setDashboard },
      { key: 'stock', ep: reportEndpoints.groceryStockSummary, setter: setStockSummary },
      { key: 'value', ep: reportEndpoints.groceryInventoryValueReport, setter: setInventoryValue },
      { key: 'purchaseTrend', ep: reportEndpoints.groceryPurchaseTrend, setter: setPurchaseTrend },
      { key: 'consumptionTrend', ep: reportEndpoints.groceryConsumptionTrend, setter: setConsumptionTrend },
      { key: 'topConsumed', ep: reportEndpoints.groceryTopConsumedIngredients, setter: setTopConsumed },
    ]

    fetches.forEach(({ key, ep, setter }) => {
      triggerLoading(key)
      post(ep, payload)
        .then((res: any) => { setter(res.data) })
        .catch(() => {})
        .finally(() => doneLoading(key))
    })
  }

  useEffect(() => {
    fetchAll(filter)
  }, [session])

  const datePresets = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'lastMonth'] as const

  const handlePreset = (preset: string) => {
    setActivePreset(preset)
    const r = getDatePreset(preset)

    setFilter(r)
    fetchAll(r)
  }

  const chartColors = useMemo(() => ({
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main
  }), [theme])

  const areaOptions: ApexOptions = useMemo(() => ({
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { type: 'datetime', labels: { format: 'MMM dd' } },
    yaxis: { labels: { formatter: (v: number) => formatNumber(v) } },
    colors: [chartColors.primary, chartColors.success],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1 } },
    legend: { position: 'top' },
    grid: { borderColor: 'var(--mui-palette-divider)' }
  }), [chartColors])

  const barOptions: ApexOptions = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    xaxis: { type: 'datetime', labels: { format: 'MMM dd' } },
    yaxis: { labels: { formatter: (v: number) => formatNumber(v) } },
    colors: [chartColors.primary],
    grid: { borderColor: 'var(--mui-palette-divider)' },
    legend: { position: 'top' }
  }), [chartColors])

  const trendSeries = useMemo(() => {
    if (!purchaseTrend?.trend && !consumptionTrend?.trend) return []
    const series = []

    if (purchaseTrend?.trend) {
      series.push({ name: 'Purchases', data: purchaseTrend.trend.map(t => ({ x: new Date(t.date).getTime(), y: t.quantity })) })
    }

    if (consumptionTrend?.trend) {
      series.push({ name: 'Consumption', data: consumptionTrend.trend.map(t => ({ x: new Date(t.date).getTime(), y: t.quantity })) })
    }

    
return series
  }, [purchaseTrend, consumptionTrend])

  const valueTrendSeries = useMemo(() => {
    if (!inventoryValue?.monthlyTrend) return []
    
return [{
      name: 'Items Count',
      data: inventoryValue.monthlyTrend.map(t => ({ x: new Date(t.date).getTime(), y: t.count }))
    }]
  }, [inventoryValue])

  const topConsumedSeries = useMemo(() => {
    if (!topConsumed?.items) return []
    
return [{
      name: 'Quantity',
      data: topConsumed.items.map(i => i.totalQuantity)
    }]
  }, [topConsumed])

  const topConsumedCategories = useMemo(() => {
    return topConsumed?.items.map(i => i.name) || []
  }, [topConsumed])

  const topConsumedOptions: ApexOptions = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
    dataLabels: { enabled: true, formatter: (v: number) => formatNumber(v) },
    xaxis: { categories: topConsumedCategories },
    colors: [chartColors.info],
    grid: { borderColor: 'var(--mui-palette-divider)' }
  }), [topConsumedCategories, chartColors])

  if (!session) return null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {datePresets.map(preset => (
          <Chip
            key={preset}
            label={preset.charAt(0).toUpperCase() + preset.slice(1)}
            color={activePreset === preset ? 'primary' : 'default'}
            onClick={() => handlePreset(preset)}
            variant={activePreset === preset ? 'filled' : 'outlined'}
            size='small'
          />
        ))}
      </Box>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6'>
        <KpiCard title='Inventory Value (Qty)' value={formatNumber(dashboard?.totalQuantity ?? 0)} icon='tabler-packages' color='primary' loading={loading['dashboard']} />
        <KpiCard title='Total Ingredients' value={formatNumber(dashboard?.totalItems ?? 0)} icon='tabler-box' color='info' loading={loading['dashboard']} />
        <KpiCard title='Low Stock Items' value={formatNumber(dashboard?.lowStockItems ?? 0)} icon='tabler-alert-triangle' color='warning' loading={loading['dashboard']} />
        <KpiCard title='Out of Stock' value={formatNumber(dashboard?.outOfStockItems ?? 0)} icon='tabler-x' color='error' loading={loading['dashboard']} />
        <KpiCard title='Expiring Soon' value={formatNumber(dashboard?.expiringSoonCount ?? 0)} icon='tabler-calendar-exclamation' color='warning' loading={loading['dashboard']} />
        <KpiCard title='Monthly Purchases' value={formatNumber(dashboard?.monthlyPurchaseItems ?? 0)} icon='tabler-shopping-cart-plus' color='success' loading={loading['dashboard']} />
        <KpiCard title='Purchase Qty' value={formatNumber(dashboard?.monthlyPurchaseQuantity ?? 0)} icon='tabler-scale' color='primary' loading={loading['dashboard']} />
        <KpiCard title='Monthly Revenue' value={formatCurrency(dashboard?.monthlyRevenue ?? 0)} icon='tabler-currency-euro' color='success' loading={loading['dashboard']} />
        <KpiCard title='Est. Food Cost' value={formatCurrency(dashboard?.estimatedFoodCost ?? 0)} icon='tabler-receipt' color='warning' loading={loading['dashboard']} />
        <KpiCard title='Food Cost %' value={dashboard ? `${dashboard.foodCostPercent}%` : '-'} icon='tabler-percentage' color='primary' loading={loading['dashboard']} />
      </div>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader title='Purchase & Consumption Trends' />
            <CardContent>
              {purchaseTrend || consumptionTrend ? (
                <AppReactApexCharts options={areaOptions} series={trendSeries} type='area' height={300} />
              ) : loading['purchaseTrend'] || loading['consumptionTrend'] ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
              ) : (
                <Typography color='text.secondary'>No trend data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader title='Top Consumed Items' />
            <CardContent>
              {topConsumed?.items && topConsumed.items.length > 0 ? (
                <AppReactApexCharts options={topConsumedOptions} series={topConsumedSeries} type='bar' height={300} />
              ) : loading['topConsumed'] ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
              ) : (
                <Typography color='text.secondary'>No consumption data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title='Inventory Value Trend' />
            <CardContent>
              {inventoryValue?.monthlyTrend && inventoryValue.monthlyTrend.length > 0 ? (
                <AppReactApexCharts options={barOptions} series={valueTrendSeries} type='bar' height={300} />
              ) : loading['value'] ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
              ) : (
                <Typography color='text.secondary'>No inventory trend data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title='Stock Health' />
            <CardContent>
              {stockSummary ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant='body2' color='text.secondary'>Stock Health: {stockSummary.stockHealthPercent.toFixed(1)}%</Typography>
                  </Box>
                  <TableContainer>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Status</TableCell>
                          <TableCell align='right'>Count</TableCell>
                          <TableCell align='right'>Total Qty</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ color: 'success.main' }}>In Stock</TableCell>
                          <TableCell align='right'>{formatNumber(stockSummary.inStockCount)}</TableCell>
                          <TableCell align='right'>{formatNumber(stockSummary.typeBreakdown.reduce((a, t) => a + t.totalQuantity, 0) - stockSummary.lowStockCount - stockSummary.outOfStockCount)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'warning.main' }}>Low Stock</TableCell>
                          <TableCell align='right'>{formatNumber(stockSummary.lowStockCount)}</TableCell>
                          <TableCell align='right'>-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: 'error.main' }}>Out of Stock</TableCell>
                          <TableCell align='right'>{formatNumber(stockSummary.outOfStockCount)}</TableCell>
                          <TableCell align='right'>-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Total</strong></TableCell>
                          <TableCell align='right'><strong>{formatNumber(stockSummary.totalItems)}</strong></TableCell>
                          <TableCell align='right'><strong>{formatNumber(stockSummary.totalQuantity)}</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : loading['stock'] ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
              ) : (
                <Typography color='text.secondary'>No stock data</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

const KpiCard = ({ title, value, icon, color, loading }: {
  title: string
  value: string | number
  icon: string
  color: string
  loading?: boolean
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
        {loading
          ? <CircularProgress size={18} sx={{ mt: 0.5 }} />
          : <Typography variant='h5'>{value}</Typography>
        }
      </Box>
    </CardContent>
  </Card>
)

export default StockSummaryDashboard
