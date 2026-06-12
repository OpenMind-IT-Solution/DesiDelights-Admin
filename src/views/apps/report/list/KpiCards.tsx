'use client'

import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import { formatCurrency, formatNumber } from '../common'

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

type KpiCardGridProps = {
  data?: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    totalDiscounts: number
    totalTax: number
    refundedTotal: number
    totalSubTotal: number
    todayRevenue: number
  }
  profit?: {
    grossProfit: number
    profitMargin: number
    netProfit: number
  }
  customers?: {
    totalCustomers: number
  }
  loading?: boolean
}

const KpiCardGrid = ({ data, profit, customers, loading }: KpiCardGridProps) => {
  if (!data) return null

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6'>
      <KpiCard title='Total Revenue' value={formatCurrency(data.totalRevenue)} icon='tabler-currency-euro' color='primary' loading={loading} />
      <KpiCard title='Net Revenue' value={formatCurrency(data.totalRevenue - data.totalDiscounts)} icon='tabler-receipt' color='success' loading={loading} />
      <KpiCard title='Total Orders' value={formatNumber(data.totalOrders)} icon='tabler-shopping-cart' color='info' loading={loading} />
      <KpiCard title='Avg Order Value' value={formatCurrency(data.averageOrderValue)} icon='tabler-calculator' color='warning' loading={loading} />
      <KpiCard title='Gross Profit' value={profit ? formatCurrency(profit.grossProfit) : '-'} icon='tabler-trending-up' color='success' loading={loading} />
      <KpiCard title='Profit Margin' value={profit ? `${profit.profitMargin.toFixed(1)}%` : '-'} icon='tabler-percentage' color='primary' loading={loading} />
      <KpiCard title='Total Customers' value={customers ? formatNumber(customers.totalCustomers) : '-'} icon='tabler-users' color='info' loading={loading} />
      <KpiCard title='Refund Amount' value={formatCurrency(data.refundedTotal)} icon='tabler-refresh' color='error' loading={loading} />
      <KpiCard title='Tax Collected' value={formatCurrency(data.totalTax)} icon='tabler-building' color='warning' loading={loading} />
      <KpiCard title='Discount Amount' value={formatCurrency(data.totalDiscounts)} icon='tabler-discount' color='error' loading={loading} />
    </div>
  )
}

export { KpiCard, KpiCardGrid }
export default KpiCardGrid
