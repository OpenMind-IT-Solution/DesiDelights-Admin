'use client'

import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material'

import { formatCurrency, formatNumber } from '../common'

type PaletteColorKey = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

type KpiCardProps = {
  title: string
  value: string | number
  icon: string
  color: PaletteColorKey
  subtitle?: string
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' }
  loading?: boolean
}

const KpiCard = ({ title, value, icon, color, subtitle, trend, loading }: KpiCardProps) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        boxShadow: t => `0 8px 32px ${t.palette[color].main}18, 0 0 0 1px ${t.palette[color].main}20`,
        transform: 'translateY(-3px)',
        borderColor: t => t.palette[color].main
      }
    }}
  >
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2.5,
          background: t => `linear-gradient(135deg, ${t.palette[color].main}, ${t.palette[color].dark})`,
          boxShadow: t => `0 4px 12px ${t.palette[color].main}40`,
          minWidth: 44,
          minHeight: 44
        }}
      >
        <i className={`${icon} text-xl`} style={{ color: '#fff' }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500, letterSpacing: 0.3, display: 'block', mb: 0.25 }}>
          {title}
        </Typography>
        {loading
          ? <Skeleton variant='rounded' width={100} height={28} sx={{ mt: 0.5 }} />
          : (
            <Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {value}
            </Typography>
          )
        }
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          {subtitle && !loading && (
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
              {subtitle}
            </Typography>
          )}
          {trend && !loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              {trend.direction === 'up' && <i className='tabler-trending-up text-sm' style={{ color: 'var(--mui-palette-success-main)' }} />}
              {trend.direction === 'down' && <i className='tabler-trending-down text-sm' style={{ color: 'var(--mui-palette-error-main)' }} />}
              {trend.direction === 'neutral' && <i className='tabler-minus text-sm' style={{ color: 'var(--mui-palette-text-disabled)' }} />}
              <Typography
                variant='caption'
                sx={{
                  fontWeight: 600,
                  color: trend.direction === 'up' ? 'success.main' : trend.direction === 'down' ? 'error.main' : 'text.disabled'
                }}
              >
                {trend.value}
              </Typography>
            </Box>
          )}
        </Box>
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
  customers?: {
    totalCustomers: number
  }
  loading?: boolean
}

const KpiCardGrid = ({ data, customers, loading }: KpiCardGridProps) => {
  if (!data) return null

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2.5, mb: 4 }}>
      <KpiCard title='Total Sell' value={formatCurrency(data.totalRevenue)} icon='tabler-currency-euro' color='primary' loading={loading}
        trend={{ value: '+12.5%', direction: 'up' }} />
      <KpiCard title='VAT Collection' value={formatCurrency(data.totalTax)} icon='tabler-building' color='warning' loading={loading} />
      <KpiCard title='Net Total Sell' value={formatCurrency(data.totalRevenue - data.totalTax)} icon='tabler-receipt' color='success' loading={loading} subtitle='After VAT'
        trend={{ value: '+5.2%', direction: 'up' }} />
      <KpiCard title='Avg Order Value' value={formatCurrency(data.averageOrderValue)} icon='tabler-calculator' color='warning' loading={loading}
        trend={{ value: '+3.8%', direction: 'up' }} />
      <KpiCard title='Total Customers' value={customers ? formatNumber(customers.totalCustomers) : '-'} icon='tabler-users' color='info' loading={loading}
        trend={{ value: '+15.2%', direction: 'up' }} />

      <KpiCard title='Discount Amount' value={formatCurrency(data.totalDiscounts)} icon='tabler-discount' color='error' loading={loading} />
      <KpiCard title='Refund Amount' value={formatCurrency(data.refundedTotal)} icon='tabler-refresh' color='error' loading={loading} />
      <KpiCard title='Total Orders' value={formatNumber(data.totalOrders)} icon='tabler-shopping-cart' color='info' loading={loading}
        trend={{ value: '+8.3%', direction: 'up' }} />
    </Box>
  )
}

export { KpiCard, KpiCardGrid }
export default KpiCardGrid
