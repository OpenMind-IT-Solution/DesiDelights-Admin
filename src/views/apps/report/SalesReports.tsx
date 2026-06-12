'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { post } from '@/services/apiService'
import type { ApexOptions } from 'apexcharts'
import { useTheme } from '@mui/material/styles'
import {
  Box, Card, CardContent, CardHeader, Chip, CircularProgress, Grid, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material'
import CustomTextField from '@core/components/mui/TextField'
import type {
  SalesSummary, RevenueTrendData, OrderTypeBreakdownData,
  TopProductsData, CustomerAnalyticsData, HourlySalesData,
  RecentOrdersData, InventoryInsightsData, ProfitReportData
} from '@/types/apps/reportTypes'
import { reportEndpoints } from '@/services/endpoints/report'
import { formatCurrency, formatNumber, getDatePreset } from './common'
import { KpiCardGrid } from './list/KpiCards'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

type FilterState = DateRange & {
  paymentMethod?: string
  orderType?: string
}

const SalesReports = () => {
  const theme = useTheme()
  const { data: session } = useSession()

  const [activePreset, setActivePreset] = useState('thisMonth')
  const [filter, setFilter] = useState<FilterState>(() => getDatePreset('thisMonth'))
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
    triggerLoading('recent')
    post(reportEndpoints.recentOrders, {}).then((res: any) => { setRecentOrders(res.data); clearError('recent') }).catch((e: any) => setErrors(p => ({ ...p, recent: e.message }))).finally(() => doneLoading('recent'))
    triggerLoading('inventory')
    post(reportEndpoints.inventoryInsights, {}).then((res: any) => { setInventory(res.data); clearError('inventory') }).catch((e: any) => setErrors(p => ({ ...p, inventory: e.message }))).finally(() => doneLoading('inventory'))
  }

  useEffect(() => {
    fetchAll(filter, extraFilters)
    post(reportEndpoints.filterOptions, {}).then((res: any) => setFilterOptions(res.data)).catch(() => {})
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  const datePresets = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'lastMonth'] as const

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
    chart: { parentHeightOffset: 0, toolbar: { show: false }, zoom: { enabled: false } },
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
      type: 'category', labels: { style: { colors: 'var(--mui-palette-text-secondary)' } },
      axisTicks: { show: false }, axisBorder: { show: false }
    },
    yaxis: { labels: { style: { colors: 'var(--mui-palette-text-secondary)' }, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v) } },
    tooltip: { y: { formatter: (v: number) => formatCurrency(v) } }
  }

  const donutOptions: ApexOptions = {
    chart: { type: 'donut' },
    colors: [chartColors.primary, chartColors.success, chartColors.warning, chartColors.error, chartColors.info],
    labels: [],
    legend: { position: 'bottom', horizontalAlign: 'center' },
    dataLabels: { enabled: true, formatter: (v: number) => `${v.toFixed(1)}%` },
    plotOptions: { pie: { donut: { size: '60%' } } },
    responsive: [{ breakpoint: 992, options: { chart: { height: 300 }, legend: { position: 'bottom' } } }]
  }

  const barOptions: ApexOptions = {
    chart: { parentHeightOffset: 0, toolbar: { show: false } },
    colors: [chartColors.info],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    grid: { borderColor: 'var(--mui-palette-divider)', padding: { top: -20, bottom: -10 } },
    xaxis: { labels: { style: { colors: 'var(--mui-palette-text-secondary)' } }, axisTicks: { show: false }, axisBorder: { show: false } },
    yaxis: { labels: { style: { colors: 'var(--mui-palette-text-secondary)' } } }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <Typography variant='subtitle2' sx={{ mr: 1 }}>Period:</Typography>
        {datePresets.map(p => (
          <Chip key={p} label={p.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            color={activePreset === p ? 'primary' : 'default'}
            variant={activePreset === p ? 'filled' : 'outlined'}
            onClick={() => handlePreset(p)} size='small'
          />
        ))}
        {filterOptions && (
          <>
            <CustomTextField select size='small' value={extraFilters.paymentMethod || ''} label='Payment'
              sx={{ minWidth: 130 }} onChange={e => {
                const val = e.target.value
                const newFilters = { ...extraFilters, paymentMethod: val }
                setExtraFilters(newFilters)
                if (val) setExtraFilters(newFilters); else { const { paymentMethod: _, ...rest } = extraFilters; setExtraFilters(rest) }
                fetchAll(filter, val ? { ...extraFilters, paymentMethod: val } : extraFilters)
              }}>
              <MenuItem value=''>All</MenuItem>
              {filterOptions.paymentMethods.map(p => <MenuItem key={p} value={p} sx={{ textTransform: 'capitalize' }}>{p}</MenuItem>)}
            </CustomTextField>
            <CustomTextField select size='small' value={extraFilters.orderType || ''} label='Type'
              sx={{ minWidth: 120 }} onChange={e => {
                const val = e.target.value
                const newFilters = val ? { ...extraFilters, orderType: val } : (() => { const { orderType: _, ...rest } = extraFilters; return rest })()
                setExtraFilters(newFilters)
                fetchAll(filter, newFilters)
              }}>
              <MenuItem value=''>All</MenuItem>
              {filterOptions.orderTypes.map(t => <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>)}
            </CustomTextField>
            <CustomTextField select size='small' value={extraFilters.categoryId || ''} label='Category'
              sx={{ minWidth: 150 }} onChange={e => {
                const val = e.target.value
                const newFilters = val ? { ...extraFilters, categoryId: val } : (() => { const { categoryId: _, ...rest } = extraFilters; return rest })()
                setExtraFilters(newFilters)
                fetchAll(filter, newFilters)
              }}>
              <MenuItem value=''>All</MenuItem>
              {filterOptions.categories.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
            </CustomTextField>
          </>
        )}
      </Box>

      {/* KPI Cards */}
      <KpiCardGrid data={summary ?? undefined} profit={profit ?? undefined} customers={customerAnalytics ?? undefined}
        loading={loading['summary'] || loading['profit'] || loading['customers']} />

      {/* Charts Row 1 */}
      <Grid container spacing={4}>
        {/* Revenue Trend */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardHeader title='Sales Trend' subheader={revenueTrend ? `${revenueTrend.dailyTrend.length} days` : ' '}
              action={loading['revenue'] ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null} />
            <CardContent>
              {errors['revenue'] ? <Typography color='error'>{errors['revenue']}</Typography>
                : !revenueTrend || revenueTrend.dailyTrend.length === 0
                  ? <Typography color='text.secondary' sx={{ py: 6, textAlign: 'center' }}>No revenue data available</Typography>
                  : <AppReactApexCharts type='area' height={300}
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
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Order Type' action={loading['orderTypes'] ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null} />
            <CardContent>
              {errors['orderTypes'] ? <Typography color='error'>{errors['orderTypes']}</Typography>
                : !orderTypes || orderTypes.orderTypes.length === 0
                  ? <Typography color='text.secondary' sx={{ py: 6, textAlign: 'center' }}>No data</Typography>
                  : <>
                      <AppReactApexCharts type='donut' height={280}
                        options={{ ...donutOptions, labels: orderTypes.orderTypes.map(o => o.label) }}
                        series={orderTypes.orderTypes.map(o => o.count)}
                      />
                      {orderTypes.orderTypes.map(o => (
                        <Box key={o.orderType} sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 0.5 }}>
                          <Typography variant='body2'>{o.label}</Typography>
                          <Typography variant='body2' fontWeight='bold'>{formatNumber(o.count)}</Typography>
                        </Box>
                      ))}
                    </>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={4}>
        {/* Payment Method */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Payment Methods' action={loading['payments'] ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null} />
            <CardContent>
              {errors['payments'] ? <Typography color='error'>{errors['payments']}</Typography>
                : !payments || payments.paymentMethods.length === 0
                  ? <Typography color='text.secondary' sx={{ py: 6, textAlign: 'center' }}>No data</Typography>
                  : <>
                      <AppReactApexCharts type='donut' height={250}
                        options={{ ...donutOptions, labels: payments.paymentMethods.map(p => p.method) }}
                        series={payments.paymentMethods.map(p => p.total)}
                      />
                      <Table size='small'>
                        <TableHead>
                          <TableRow><TableCell>Method</TableCell><TableCell align='right'>Orders</TableCell><TableCell align='right'>Total</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                          {payments.paymentMethods.map(p => (
                            <TableRow key={p.method}>
                              <TableCell sx={{ textTransform: 'capitalize' }}>{p.method}</TableCell>
                              <TableCell align='right'>{formatNumber(p.count)}</TableCell>
                              <TableCell align='right'>{formatCurrency(p.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Category Performance */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Category Performance' action={loading['categories'] ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null} />
            <CardContent>
              {errors['categories'] ? <Typography color='error'>{errors['categories']}</Typography>
                : !categories || categories.categories.length === 0
                  ? <Typography color='text.secondary' sx={{ py: 6, textAlign: 'center' }}>No data</Typography>
                  : <>
                      <AppReactApexCharts type='donut' height={250}
                        options={{ ...donutOptions, labels: categories.categories.map(c => c.categoryName) }}
                        series={categories.categories.map(c => c.totalRevenue)}
                      />
                      <Table size='small'>
                        <TableHead>
                          <TableRow><TableCell>Category</TableCell><TableCell align='right'>Qty</TableCell><TableCell align='right'>Revenue</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                          {categories.categories.map(c => (
                            <TableRow key={c.categoryId}>
                              <TableCell>{c.categoryName}</TableCell>
                              <TableCell align='right'>{formatNumber(c.totalQuantity)}</TableCell>
                              <TableCell align='right'>{formatCurrency(c.totalRevenue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Peak Hours' action={loading['hourly'] ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null} />
            <CardContent>
              {errors['hourly'] ? <Typography color='error'>{errors['hourly']}</Typography>
                : !hourlySales || hourlySales.hourlySales.length === 0
                  ? <Typography color='text.secondary' sx={{ py: 6, textAlign: 'center' }}>No data</Typography>
                  : <AppReactApexCharts type='bar' height={320}
                      options={{
                        ...barOptions,
                        xaxis: { ...barOptions.xaxis, categories: hourlySales.hourlySales.map(h => `${String(h.hour).padStart(2, '0')}:00`) },
                        plotOptions: { bar: { ...((barOptions.plotOptions as any)?.bar || {}), horizontal: false } },
                        colors: [chartColors.info],
                        yaxis: [{ ...barOptions.yaxis, title: { text: 'Orders' } }]
                      }}
                      series={[{ name: 'Orders', data: hourlySales.hourlySales.map(h => h.orderCount) }]}
                    />
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 3 */}
      <Grid container spacing={4}>
        {/* Top Selling Items */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Top Selling Items' action={loading['topProducts'] ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null} />
            <CardContent sx={{ p: 0 }}>
              {errors['topProducts'] ? <Typography color='error' sx={{ p: 3 }}>{errors['topProducts']}</Typography>
                : !topProducts || topProducts.products.length === 0
                  ? <Typography color='text.secondary' sx={{ p: 3, textAlign: 'center' }}>No data</Typography>
                  : <Table size='small'>
                      <TableHead>
                        <TableRow><TableCell>Item</TableCell><TableCell align='right'>Qty</TableCell><TableCell align='right'>Revenue</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        {topProducts.products.map(p => (
                          <TableRow key={p.menuItemId}>
                            <TableCell>{p.name}</TableCell>
                            <TableCell align='right'>{formatNumber(p.totalQuantity)}</TableCell>
                            <TableCell align='right'>{formatCurrency(p.totalRevenue)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Insights */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Customer Insights' action={loading['customers'] ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null} />
            <CardContent>
              {errors['customers'] ? <Typography color='error'>{errors['customers']}</Typography>
                : !customerAnalytics
                  ? <Typography color='text.secondary' sx={{ py: 6, textAlign: 'center' }}>No data</Typography>
                  : <>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant='h5'>{formatNumber(customerAnalytics.totalCustomers)}</Typography>
                          <Typography variant='caption'>Total</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant='h5'>{formatNumber(customerAnalytics.repeatCustomers)}</Typography>
                          <Typography variant='caption'>Repeat</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant='h5'>{formatNumber(customerAnalytics.newCustomers)}</Typography>
                          <Typography variant='caption'>New</Typography>
                        </Box>
                      </Box>
                      <Typography variant='subtitle2' sx={{ mb: 1 }}>Top Customers</Typography>
                      <Table size='small'>
                        <TableHead>
                          <TableRow><TableCell>Name</TableCell><TableCell align='right'>Orders</TableCell><TableCell align='right'>Spent</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                          {customerAnalytics.topCustomers.map(c => (
                            <TableRow key={c.customerId}>
                              <TableCell>{c.name}</TableCell>
                              <TableCell align='right'>{c.orderCount}</TableCell>
                              <TableCell align='right'>{formatCurrency(c.totalSpent)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Insights */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title='Inventory Insights' action={loading['inventory'] ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null} />
            <CardContent>
              {errors['inventory'] ? <Typography color='error'>{errors['inventory']}</Typography>
                : !inventory
                  ? <Typography color='text.secondary' sx={{ py: 6, textAlign: 'center' }}>No data</Typography>
                  : <>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant='h5'>{formatNumber(inventory.totalItems)}</Typography>
                          <Typography variant='caption'>Total Items</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant='h5' color='error'>{formatNumber(inventory.lowStockCount)}</Typography>
                          <Typography variant='caption'>Low Stock</Typography>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant='h5'>{inventory.stockHealthPercent.toFixed(0)}%</Typography>
                          <Typography variant='caption'>Health</Typography>
                        </Box>
                      </Box>
                      {inventory.lowStockItems.length > 0 && (
                        <>
                          <Typography variant='subtitle2' sx={{ mb: 1 }}>Low Stock Items</Typography>
                          <Table size='small'>
                            <TableHead>
                              <TableRow><TableCell>Item</TableCell><TableCell align='right'>Qty</TableCell><TableCell>Status</TableCell></TableRow>
                            </TableHead>
                            <TableBody>
                              {inventory.lowStockItems.slice(0, 5).map(item => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.itemName}</TableCell>
                                  <TableCell align='right'>{item.quantity}</TableCell>
                                  <TableCell>
                                    <Chip label={item.status} size='small'
                                      color={item.status === 'Out of Stock' ? 'error' : item.status === 'Low Stock' ? 'warning' : 'success'} />
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

      {/* Recent Orders */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Recent Orders' action={loading['recent'] ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null} />
            <CardContent sx={{ p: 0 }}>
              {errors['recent'] ? <Typography color='error' sx={{ p: 3 }}>{errors['recent']}</Typography>
                : !recentOrders || recentOrders.orders.length === 0
                  ? <Typography color='text.secondary' sx={{ p: 3, textAlign: 'center' }}>No recent orders</Typography>
                  : <TableContainer>
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell>Order #</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Payment</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Date/Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentOrders.orders.map(o => (
                            <TableRow key={o.id}>
                              <TableCell>#{o.id}</TableCell>
                              <TableCell>{o.customerName}</TableCell>
                              <TableCell>{formatCurrency(o.totalAmount)}</TableCell>
                              <TableCell><Chip label={o.status} size='small' color={o.status === 'placed' || o.status === 'confirmed' ? 'info' : o.status === 'completed' ? 'success' : o.status === 'cancelled' ? 'error' : 'default'} /></TableCell>
                              <TableCell><Chip label={o.paymentStatus} size='small' color={o.paymentStatus === 'paid' ? 'success' : o.paymentStatus === 'pending' ? 'warning' : 'error'} /></TableCell>
                              <TableCell sx={{ textTransform: 'capitalize' }}>{o.orderType}</TableCell>
                              <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SalesReports
