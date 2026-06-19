'use client'

import { useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'

import type { ApexOptions } from 'apexcharts'
import { useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material'
import {
  Box, Card, CardContent, CardHeader, Chip, CircularProgress, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material'

import Grid from '@mui/material/Grid2'

import { post } from '@/services/apiService'
import CustomTextField from '@core/components/mui/TextField'
import type {
  DateRange, SalesSummary, RevenueTrendData, OrderTypeBreakdownData,
  TopProductsData, CustomerAnalyticsData, CategoryAnalyticsData, PaymentMethodData,
  HourlySalesData, RecentOrdersData, InventoryInsightsData, ProfitReportData
} from '@/types/apps/reportTypes'
import { reportEndpoints } from '@/services/endpoints/report'
import { formatCurrency, formatNumber, getDatePreset } from './common'
import { KpiCardGrid } from './list/KpiCards'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type FilterState = DateRange & {
  paymentMethod?: string
  orderType?: string
}

const cardSx = {
  height: '100%',
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'visible',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    transform: 'translateY(-1px)',
    borderColor: (t: Theme) => t.palette.divider
  }
}

const ChartLoading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
    <CircularProgress size={28} />
  </Box>
)

const ChartEmpty = ({ message }: { message: string }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 6 }}>
    <i className='tabler-chart-dots-3 text-4xl' style={{ opacity: 0.3 }} />
    <Typography variant='body2' color='text.secondary'>{message}</Typography>
  </Box>
)

const SectionLabel = ({ label }: { label: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    <Box sx={{ width: 3, height: 20, borderRadius: 2, bgcolor: 'primary.main' }} />
    <Typography variant='subtitle2' sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
      {label}
    </Typography>
  </Box>
)

const SalesReports = () => {
  const theme = useTheme()
  const { data: session } = useSession()

  const [activePreset, setActivePreset] = useState('today')
  const [filter, setFilter] = useState<FilterState>(() => getDatePreset('today'))
  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData | null>(null)
  const [orderTypes, setOrderTypes] = useState<OrderTypeBreakdownData | null>(null)
  const [payments, setPayments] = useState<PaymentMethodData | null>(null)
  const [categories, setCategories] = useState<CategoryAnalyticsData | null>(null)
  const [topProducts, setTopProducts] = useState<TopProductsData | null>(null)
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalyticsData | null>(null)
  const [hourlySales, setHourlySales] = useState<HourlySalesData | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrdersData | null>(null)
  const [inventory, setInventory] = useState<InventoryInsightsData | null>(null)
  const [profit, setProfit] = useState<ProfitReportData | null>(null)

  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  const triggerLoading = (key: string) => setLoading(prev => ({ ...prev, [key]: true }))
  const clearError = (key: string) => setErrors(prev => ({ ...prev, [key]: null }))
  const doneLoading = (key: string) => setLoading(prev => ({ ...prev, [key]: false }))

  const [filterOptions, setFilterOptions] = useState<{ paymentMethods: string[]; orderTypes: string[]; categories: { id: number; name: string }[] } | null>(null)
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({})
  const [recentPage, setRecentPage] = useState(1)
  const [recentLimit, setRecentLimit] = useState(10)

  const fetchRecentOrders = async (range: DateRange, pageNum: number, limitNum: number) => {
    if (!session) return
    triggerLoading('recent')
    post(reportEndpoints.recentOrders, { startDate: range.startDate, endDate: range.endDate, page: pageNum, limit: limitNum })
      .then((res: any) => { setRecentOrders(res.data); clearError('recent') })
      .catch((e: any) => setErrors(prev => ({ ...prev, recent: e.message })))
      .finally(() => doneLoading('recent'))
  }

  const fetchAll = async (range: DateRange, extras?: Record<string, string>) => {
    if (!session) return
    const payload: Record<string, unknown> = { startDate: range.startDate, endDate: range.endDate }

    if (extras) Object.assign(payload, extras)

    const fetches = [
      { key: 'summary', ep: reportEndpoints.salesSummary, setter: setSummary },
      { key: 'revenue', ep: reportEndpoints.revenueTrend, setter: setRevenueTrend },
      { key: 'orderTypes', ep: reportEndpoints.orderTypeBreakdown, setter: setOrderTypes },
      { key: 'payments', ep: reportEndpoints.paymentMethods, setter: setPayments },
      { key: 'categories', ep: reportEndpoints.categoryPerformance, setter: setCategories },
      { key: 'topProducts', ep: reportEndpoints.topProducts, setter: setTopProducts },
      { key: 'customers', ep: reportEndpoints.customerAnalytics, setter: setCustomerAnalytics },
      { key: 'hourly', ep: reportEndpoints.hourlySales, setter: setHourlySales },
      { key: 'profit', ep: reportEndpoints.profit, setter: setProfit },
    ]

    fetches.forEach(({ key, ep, setter }) => {
      triggerLoading(key)
      post(ep, payload).then((res: any) => { setter(res.data); clearError(key) }).catch((e: any) => { setErrors(p => ({ ...p, [key]: e.message })) }).finally(() => doneLoading(key))
    })
    setRecentPage(1)
    fetchRecentOrders(range, 1, recentLimit)
    triggerLoading('inventory')
    post(reportEndpoints.inventoryInsights, {}).then((res: any) => { setInventory(res.data); clearError('inventory') }).catch((e: any) => setErrors(p => ({ ...p, inventory: e.message }))).finally(() => doneLoading('inventory'))
  }

  useEffect(() => {
    fetchAll(filter, extraFilters)
    post(reportEndpoints.filterOptions, {}).then((res: any) => setFilterOptions(res.data)).catch(() => {})
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  const periodOptions = ['today', 'tomorrow', 'thisWeek', 'thisMonth', 'thisYear'] as const

  const handlePreset = (preset: string) => {
    setActivePreset(preset)
    setExtraFilters({})
    const r = getDatePreset(preset)

    setFilter(r)
    fetchAll(r, {})
  }

  const chartColors = useMemo(() => ({
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main
  }), [theme])

  const trendOptions: ApexOptions = {
    chart: { parentHeightOffset: 0, toolbar: { show: false }, zoom: { enabled: false }, foreColor: 'var(--mui-palette-text-secondary)' },
    colors: [chartColors.primary, chartColors.success],
    stroke: { curve: 'smooth', width: 3 },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: {
        opacityTo: 0, opacityFrom: 0.4, shadeIntensity: 1,
        stops: [0, 100],
        colorStops: [
          { offset: 0, opacity: 0.3, color: chartColors.primary },
          { offset: 100, opacity: 0, color: 'var(--mui-palette-background-paper)' }
        ]
      }
    },
    grid: { borderColor: 'var(--mui-palette-divider)', padding: { top: -20, bottom: -10 } },
    xaxis: {
      type: 'category', labels: { style: { colors: 'var(--mui-palette-text-secondary)', fontSize: '11px' } },
      axisTicks: { show: false }, axisBorder: { show: false },
      crosshairs: { show: true, stroke: { color: 'var(--mui-palette-divider)' } }
    },
    yaxis: { labels: { style: { colors: 'var(--mui-palette-text-secondary)', fontSize: '11px' }, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v) } },
    tooltip: {
      y: { formatter: (v: number) => formatCurrency(v) },
      theme: 'light',
      style: { fontSize: '12px' },
      marker: { show: true }
    }
  }

  const donutOptions: ApexOptions = {
    chart: { type: 'donut', foreColor: 'var(--mui-palette-text-secondary)' },
    colors: [chartColors.primary, chartColors.success, chartColors.warning, chartColors.error, chartColors.info],
    labels: [],
    legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px', markers: { radius: 4 } },
    dataLabels: { enabled: true, formatter: (v: number) => `${v.toFixed(1)}%`, style: { fontSize: '11px', fontWeight: 600 } },
    plotOptions: { pie: { donut: { size: '62%' } } },
    tooltip: { theme: 'light', style: { fontSize: '12px' } },
    responsive: [{ breakpoint: 992, options: { chart: { height: 300 }, legend: { position: 'bottom' } } }]
  }

  const barOptions: ApexOptions = {
    chart: { parentHeightOffset: 0, toolbar: { show: false }, foreColor: 'var(--mui-palette-text-secondary)' },
    colors: [chartColors.info],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    grid: { borderColor: 'var(--mui-palette-divider)', padding: { top: -20, bottom: -10 } },
    xaxis: { labels: { style: { colors: 'var(--mui-palette-text-secondary)', fontSize: '11px' } }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: 'var(--mui-palette-text-secondary)', fontSize: '11px' } } },
    tooltip: { theme: 'light', style: { fontSize: '12px' } }
  }

  const presetLabels: Record<string, string> = {
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year'
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Filter Toolbar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          px: 3,
          py: 1.5
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          <CustomTextField select size='small' value={activePreset}
            sx={{ minWidth: 140 }}
            onChange={e => handlePreset(e.target.value)}
          >
            {periodOptions.map(p => (
              <MenuItem key={p} value={p}>{presetLabels[p]}</MenuItem>
            ))}
          </CustomTextField>

          {filterOptions && (
            <>
              <CustomTextField select size='small' value={extraFilters.paymentMethod || ''}
                sx={{ minWidth: 150 }}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    renderValue: (v: unknown) => {
                      const val = v as string

                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <i className='tabler-credit-card text-base' />
                          {val || 'All Payments'}
                        </Box>
                      )
                    }
                  }
                }}
                onChange={e => {
                  const val = e.target.value
                  const newFilters = val ? { ...extraFilters, paymentMethod: val } : Object.fromEntries(Object.entries(extraFilters).filter(([k]) => k !== 'paymentMethod'))

                  setExtraFilters(newFilters)
                  fetchAll(filter, newFilters)
                }}>
                <MenuItem value=''>All Payments</MenuItem>
                {filterOptions.paymentMethods.map(p => <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>)}
              </CustomTextField>

              <CustomTextField select size='small' value={extraFilters.orderType || ''}
                sx={{ minWidth: 150 }}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    renderValue: (v: unknown) => {
                      const val = v as string

                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <i className='tabler-shopping-cart text-base' />
                          {val || 'All Types'}
                        </Box>
                      )
                    }
                  }
                }}
                onChange={e => {
                  const val = e.target.value
                  const newFilters = val ? { ...extraFilters, orderType: val } : Object.fromEntries(Object.entries(extraFilters).filter(([k]) => k !== 'orderType'))

                  setExtraFilters(newFilters)
                  fetchAll(filter, newFilters)
                }}>
                <MenuItem value=''>All Types</MenuItem>
                {filterOptions.orderTypes.map(t => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>)}
              </CustomTextField>

              <CustomTextField select size='small' value={extraFilters.categoryId || ''}
                sx={{ minWidth: 150 }}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    renderValue: (v: unknown) => {
                      const val = v as string
                      const cat = filterOptions.categories.find(c => String(c.id) === val)

                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <i className='tabler-category text-base' />
                          {cat?.name || 'All Categories'}
                        </Box>
                      )
                    }
                  }
                }}
                onChange={e => {
                  const val = e.target.value
                  const newFilters = val ? { ...extraFilters, categoryId: val } : Object.fromEntries(Object.entries(extraFilters).filter(([k]) => k !== 'categoryId'))

                  setExtraFilters(newFilters)
                  fetchAll(filter, newFilters)
                }}>
                <MenuItem value=''>All Categories</MenuItem>
                {filterOptions.categories.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
              </CustomTextField>
            </>
          )}
        </Box>
      </Box>

      {/* KPI Cards */}
      <KpiCardGrid data={summary ?? undefined} profit={profit ?? undefined} customers={customerAnalytics ?? undefined}
        loading={loading['summary'] || loading['profit'] || loading['customers']} />

      {/* Revenue Trend */}
      <Box>
        <SectionLabel label='Revenue Overview' />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={cardSx}>
              <CardHeader
                title={<Typography variant='h6' sx={{ fontWeight: 600 }}>Sales Trend</Typography>}
                subheader={revenueTrend ? `${revenueTrend.dailyTrend.length} days` : ' '}
                action={loading['revenue'] ? <CircularProgress size={20} /> : null}
              />
              <CardContent>
                {loading['revenue'] ? <ChartLoading />
                  : errors['revenue'] ? <Typography color='error' textAlign='center' py={4}>{errors['revenue']}</Typography>
                    : !revenueTrend || revenueTrend.dailyTrend.length === 0
                      ? <ChartEmpty message='No Data Available' />
                      : <AppReactApexCharts type='area' height={320}
                          options={{ ...trendOptions, xaxis: { ...trendOptions.xaxis, categories: revenueTrend.dailyTrend.map(d => new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })) } }}
                          series={[
                            { name: 'Revenue', data: revenueTrend.dailyTrend.map(d => d.revenue) },
                            { name: 'Orders', data: revenueTrend.dailyTrend.map(d => d.orders) }
                          ]}
                        />
                }
              </CardContent>
            </Card>
          </Grid>

          {/* Order Type Donut */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={cardSx}>
              <CardHeader
                title={<Typography variant='h6' sx={{ fontWeight: 600 }}>Order Type</Typography>}
                action={loading['orderTypes'] ? <CircularProgress size={20} /> : null}
              />
              <CardContent>
                {loading['orderTypes'] ? <ChartLoading />
                  : errors['orderTypes'] ? <Typography color='error' textAlign='center' py={4}>{errors['orderTypes']}</Typography>
                    : !orderTypes || orderTypes.orderTypes.length === 0
                      ? <ChartEmpty message='No Data Available' />
                      : <>
                          <AppReactApexCharts type='donut' height={260}
                            options={{ ...donutOptions, labels: orderTypes.orderTypes.map(o => o.label) }}
                            series={orderTypes.orderTypes.map(o => o.count)}
                          />
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                            {orderTypes.orderTypes.map(o => (
                              <Box key={o.orderType} sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 0.75, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                                <Typography variant='body2' fontWeight={500}>{o.label}</Typography>
                                <Typography variant='body2' fontWeight={600}>{formatNumber(o.count)}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </>
                }
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Charts Row 2 */}
      <Box>
        <SectionLabel label='Payment & Category' />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={cardSx}>
              <CardHeader
                title={<Typography variant='h6' sx={{ fontWeight: 600 }}>Payment Methods</Typography>}
                action={loading['payments'] ? <CircularProgress size={20} /> : null}
              />
              <CardContent>
                {loading['payments'] ? <ChartLoading />
                  : errors['payments'] ? <Typography color='error' textAlign='center' py={4}>{errors['payments']}</Typography>
                    : !payments || payments.paymentMethods.length === 0
                      ? <ChartEmpty message='No Data Available' />
                      : <>
                          <AppReactApexCharts type='donut' height={240}
                            options={{ ...donutOptions, labels: payments.paymentMethods.map(p => p.method) }}
                            series={payments.paymentMethods.map(p => p.total)}
                          />
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                                <TableCell align='right' sx={{ fontWeight: 600 }}>Orders</TableCell>
                                <TableCell align='right' sx={{ fontWeight: 600 }}>Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {payments.paymentMethods.map(p => (
                                <TableRow key={p.method} sx={{ '&:last-child td': { border: 0 } }}>
                                  <TableCell sx={{ textTransform: 'capitalize' }}>{p.method}</TableCell>
                                  <TableCell align='right'>{formatNumber(p.count)}</TableCell>
                                  <TableCell align='right' sx={{ fontWeight: 600 }}>{formatCurrency(p.total)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </>
                }
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={cardSx}>
              <CardHeader
                title={<Typography variant='h6' sx={{ fontWeight: 600 }}>Category Performance</Typography>}
                action={loading['categories'] ? <CircularProgress size={20} /> : null}
              />
              <CardContent>
                {loading['categories'] ? <ChartLoading />
                  : errors['categories'] ? <Typography color='error' textAlign='center' py={4}>{errors['categories']}</Typography>
                    : !categories || categories.categories.length === 0
                      ? <ChartEmpty message='No Data Available' />
                      : <>
                          <AppReactApexCharts type='donut' height={240}
                            options={{ ...donutOptions, labels: categories.categories.map(c => c.categoryName) }}
                            series={categories.categories.map(c => c.totalRevenue)}
                          />
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                                <TableCell align='right' sx={{ fontWeight: 600 }}>Qty</TableCell>
                                <TableCell align='right' sx={{ fontWeight: 600 }}>Revenue</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {categories.categories.map(c => (
                                <TableRow key={c.categoryId} sx={{ '&:last-child td': { border: 0 } }}>
                                  <TableCell>{c.categoryName}</TableCell>
                                  <TableCell align='right'>{formatNumber(c.totalQuantity)}</TableCell>
                                  <TableCell align='right' sx={{ fontWeight: 600 }}>{formatCurrency(c.totalRevenue)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </>
                }
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={cardSx}>
              <CardHeader
                title={<Typography variant='h6' sx={{ fontWeight: 600 }}>Peak Hours</Typography>}
                action={loading['hourly'] ? <CircularProgress size={20} /> : null}
              />
              <CardContent>
                {loading['hourly'] ? <ChartLoading />
                  : errors['hourly'] ? <Typography color='error' textAlign='center' py={4}>{errors['hourly']}</Typography>
                    : !hourlySales || hourlySales.hourlySales.length === 0
                      ? <ChartEmpty message='No Data Available' />
                      : (() => {
                          const operatingHours = hourlySales.hourlySales.filter(h => h.hour >= 11 && h.hour <= 19)

                          if (operatingHours.length === 0) return <ChartEmpty message='No Data Available' />

                          return (
                            <AppReactApexCharts type='bar' height={320}
                              options={{
                                ...barOptions,
                                xaxis: {
                                  ...barOptions.xaxis,
                                  categories: operatingHours.map(h => `${String(h.hour).padStart(2, '0')}:00`),
                                  tickAmount: operatingHours.length,
                                  labels: { ...barOptions.xaxis?.labels, rotate: 0, style: { ...barOptions.xaxis?.labels?.style, fontSize: '10px' } }
                                },
                                plotOptions: { bar: { ...((barOptions.plotOptions as any)?.bar || {}), horizontal: false } },
                                colors: [chartColors.info],
                                yaxis: [{ ...barOptions.yaxis, title: { text: 'Orders' } }]
                              }}
                              series={[{ name: 'Orders', data: operatingHours.map(h => h.orderCount) }]}
                            />
                          )
                        })()
                }
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Charts Row 3 */}
      <Box>
        <SectionLabel label='Insights' />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={cardSx}>
              <CardHeader
                title={<Typography variant='h6' sx={{ fontWeight: 600 }}>Top Selling Items</Typography>}
                action={loading['topProducts'] ? <CircularProgress size={20} /> : null}
              />
              <CardContent sx={{ p: 0 }}>
                {loading['topProducts'] ? <ChartLoading />
                  : errors['topProducts'] ? <Typography color='error' sx={{ p: 3 }}>{errors['topProducts']}</Typography>
                    : !topProducts || topProducts.products.length === 0
                      ? <Box sx={{ py: 4 }}><ChartEmpty message='No Data Available' /></Box>
                      : <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                              <TableCell align='right' sx={{ fontWeight: 600 }}>Qty</TableCell>
                              <TableCell align='right' sx={{ fontWeight: 600 }}>Revenue</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {topProducts.products.map(p => (
                              <TableRow key={p.menuItemId} sx={{ '&:last-child td': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                                <TableCell align='right'>{formatNumber(p.totalQuantity)}</TableCell>
                                <TableCell align='right' sx={{ fontWeight: 600 }}>{formatCurrency(p.totalRevenue)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                }
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={cardSx}>
              <CardHeader
                title={<Typography variant='h6' sx={{ fontWeight: 600 }}>Customer Insights</Typography>}
                action={loading['customers'] ? <CircularProgress size={20} /> : null}
              />
              <CardContent>
                {loading['customers'] ? <ChartLoading />
                  : errors['customers'] ? <Typography color='error' textAlign='center' py={4}>{errors['customers']}</Typography>
                    : !customerAnalytics
                      ? <ChartEmpty message='No Data Available' />
                      : <>
                          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                              <Typography variant='h5' sx={{ fontWeight: 700 }}>{formatNumber(customerAnalytics.totalCustomers)}</Typography>
                              <Typography variant='caption' color='text.secondary'>Total</Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                              <Typography variant='h5' sx={{ fontWeight: 700 }}>{formatNumber(customerAnalytics.repeatCustomers)}</Typography>
                              <Typography variant='caption' color='text.secondary'>Repeat</Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                              <Typography variant='h5' sx={{ fontWeight: 700 }}>{formatNumber(customerAnalytics.newCustomers)}</Typography>
                              <Typography variant='caption' color='text.secondary'>New</Typography>
                            </Box>
                          </Box>
                          <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 600 }}>Top Customers</Typography>
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell align='right' sx={{ fontWeight: 600 }}>Orders</TableCell>
                                <TableCell align='right' sx={{ fontWeight: 600 }}>Spent</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {customerAnalytics.topCustomers.map(c => (
                                <TableRow key={c.customerId} sx={{ '&:last-child td': { border: 0 } }}>
                                  <TableCell>{c.name}</TableCell>
                                  <TableCell align='right'>{c.orderCount}</TableCell>
                                  <TableCell align='right' sx={{ fontWeight: 600 }}>{formatCurrency(c.totalSpent)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </>
                }
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Card sx={cardSx}>
              <CardHeader
                title={<Typography variant='h6' sx={{ fontWeight: 600 }}>Inventory Insights</Typography>}
                action={loading['inventory'] ? <CircularProgress size={20} /> : null}
              />
              <CardContent>
                {loading['inventory'] ? <ChartLoading />
                  : errors['inventory'] ? <Typography color='error' textAlign='center' py={4}>{errors['inventory']}</Typography>
                    : !inventory
                      ? <ChartEmpty message='No Data Available' />
                      : <>
                          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                              <Typography variant='h5' sx={{ fontWeight: 700 }}>{formatNumber(inventory.totalItems)}</Typography>
                              <Typography variant='caption' color='text.secondary'>Total Items</Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                              <Typography variant='h5' color='error' sx={{ fontWeight: 700 }}>{formatNumber(inventory.lowStockCount)}</Typography>
                              <Typography variant='caption' color='text.secondary'>Low Stock</Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                              <Typography variant='h5' sx={{ fontWeight: 700 }}>{inventory.stockHealthPercent.toFixed(0)}%</Typography>
                              <Typography variant='caption' color='text.secondary'>Health</Typography>
                            </Box>
                          </Box>
                          {inventory.lowStockItems.length > 0 && (
                            <>
                              <Typography variant='subtitle2' sx={{ mb: 1.5, fontWeight: 600 }}>Low Stock Items</Typography>
                              <Table size='small'>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                                    <TableCell align='right' sx={{ fontWeight: 600 }}>Qty</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {inventory.lowStockItems.slice(0, 5).map(item => (
                                    <TableRow key={item.id} sx={{ '&:last-child td': { border: 0 } }}>
                                      <TableCell>{item.itemName}</TableCell>
                                      <TableCell align='right'>{item.quantity}</TableCell>
                                      <TableCell>
                                        <Chip label={item.status} size='small'
                                          color={item.status === 'Out of Stock' ? 'error' : item.status === 'Low Stock' ? 'warning' : 'success'}
                                          sx={{ borderRadius: 1.5, fontWeight: 500 }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </>
                          )}
                        </>
                }
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box>
        <SectionLabel label='Recent Activity' />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <Card sx={cardSx}>
              <CardHeader
                title={<Typography variant='h6' sx={{ fontWeight: 600 }}>Recent Orders</Typography>}
                action={loading['recent'] ? <CircularProgress size={20} /> : null}
                subheader={
                  recentOrders && recentOrders.total ? (
                    <Typography variant='caption' color='text.secondary'>
                      Showing {((recentPage - 1) * recentLimit) + 1}–{Math.min(recentPage * recentLimit, recentOrders.total)} of {recentOrders.total}
                    </Typography>
                  ) : null
                }
              />
              <CardContent sx={{ p: 0 }}>
                {loading['recent'] ? <ChartLoading />
                  : errors['recent'] ? <Typography color='error' sx={{ p: 3 }}>{errors['recent']}</Typography>
                    : !recentOrders || recentOrders.orders.length === 0
                      ? <Box sx={{ py: 6 }}><ChartEmpty message='No Recent Activity Found' /></Box>
                      : <TableContainer>
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date/Time</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {recentOrders.orders.map(o => (
                                <TableRow key={o.id} sx={{ '&:last-child td': { border: 0 } }}>
                                  <TableCell sx={{ fontWeight: 500 }}>#{o.id}</TableCell>
                                  <TableCell>{o.customerName}</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(o.totalAmount)}</TableCell>
                                  <TableCell>
                                    <Chip label={o.status.charAt(0).toUpperCase() + o.status.slice(1)} size='small'
                                      color={o.status === 'placed' || o.status === 'confirmed' ? 'info' : o.status === 'completed' ? 'success' : o.status === 'cancelled' ? 'error' : 'default'}
                                      sx={{ borderRadius: 1.5, fontWeight: 500, textTransform: 'capitalize' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={o.paymentStatus.charAt(0).toUpperCase() + o.paymentStatus.slice(1)} size='small'
                                      color={o.paymentStatus === 'paid' ? 'success' : o.paymentStatus === 'pending' ? 'warning' : 'error'}
                                      sx={{ borderRadius: 1.5, fontWeight: 500, textTransform: 'capitalize' }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ textTransform: 'capitalize' }}>{o.orderType}</TableCell>
                                  <TableCell>
                                    <Typography variant='body2' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
                                      {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>Rows:</Typography>
                              <CustomTextField select size='small' value={String(recentLimit)} sx={{ minWidth: 70 }}
                                onChange={e => {
                                  const newLimit = parseInt(e.target.value)

                                  setRecentLimit(newLimit)
                                  setRecentPage(1)
                                  fetchRecentOrders(filter, 1, newLimit)
                                }}
                              >
                                <MenuItem value='10'>10</MenuItem>
                                <MenuItem value='20'>20</MenuItem>
                                <MenuItem value='50'>50</MenuItem>
                              </CustomTextField>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Chip
                                label='Previous'
                                size='small'
                                variant='outlined'
                                disabled={recentPage <= 1}
                                onClick={() => {
                                  const prev = recentPage - 1

                                  setRecentPage(prev)
                                  fetchRecentOrders(filter, prev, recentLimit)
                                }}
                                sx={{ borderRadius: 1.5, fontWeight: 500 }}
                              />
                              <Chip
                                label='Next'
                                size='small'
                                variant='outlined'
                                disabled={recentOrders && recentOrders.total ? recentPage * recentLimit >= recentOrders.total : true}
                                onClick={() => {
                                  const next = recentPage + 1

                                  setRecentPage(next)
                                  fetchRecentOrders(filter, next, recentLimit)
                                }}
                                sx={{ borderRadius: 1.5, fontWeight: 500 }}
                              />
                            </Box>
                          </Box>
                        </TableContainer>
                }
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default SalesReports
