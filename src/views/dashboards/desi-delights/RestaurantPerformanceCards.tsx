'use client'

import { useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

interface RestaurantPerformanceCardsProps {
  summary: any
  customerAnalytics: any
  orderTypeBreakdown: any[]
}

const RestaurantPerformanceCards = ({
  summary,
  customerAnalytics
}: RestaurantPerformanceCardsProps) => {
  const metrics = useMemo(() => {
    const s = summary || {}
    const ca = customerAnalytics || {}
    const totalOrders = s.totalOrders || 0
    const refundedCount = s.refundedCount || 0
    const totalCustomers = ca.totalCustomers || 0
    const repeatCustomers = ca.repeatCustomers || 0
    const successRate = totalOrders > 0 ? ((totalOrders - refundedCount) / totalOrders) * 100 : 0
    const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0
    const avgOrderValue = s.averageOrderValue || 0
    const totalRevenue = s.totalRevenue || 0

    return [
      {
        title: 'Order Success Rate',
        value: `${successRate.toFixed(1)}%`,
        icon: 'tabler-circle-check',
        color: '#56CAFB',
        detail: `${totalOrders - refundedCount} of ${totalOrders} orders`
      },
      {
        title: 'Repeat Customers',
        value: `${repeatRate.toFixed(1)}%`,
        icon: 'tabler-heart',
        color: '#FF4C51',
        detail: `${repeatCustomers} of ${totalCustomers} customers`
      },
      {
        title: 'Avg Order Value',
        value: `€${avgOrderValue.toFixed(2)}`,
        icon: 'tabler-receipt',
        color: '#7367F0',
        detail: `${totalOrders} total orders`
      },
      {
        title: 'Revenue per Customer',
        value: `€${totalCustomers > 0 ? (totalRevenue / totalCustomers).toFixed(2) : '0.00'}`,
        icon: 'tabler-cash',
        color: '#00CFE8',
        detail: `${totalCustomers} customers`
      },
      {
        title: 'Refund Rate',
        value: `${totalOrders > 0 ? ((refundedCount / totalOrders) * 100).toFixed(1) : 0}%`,
        icon: 'tabler-rotate-left',
        color: '#FFB547',
        detail: `${refundedCount} refunded orders`
      }
    ]
  }, [summary, customerAnalytics])

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title='Restaurant Performance' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-chart-line text-xl' />} />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {metrics.map(metric => (
            <Box
              key={metric.title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                transition: 'all 150ms ease',
                '&:hover': {
                  bgcolor: alpha(metric.color, 0.08),
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(metric.color, 0.12),
                  color: metric.color,
                  flexShrink: 0
                }}
              >
                <i className={`${metric.icon} text-[1.2rem]`} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='body2' color='text.disabled' sx={{ fontSize: '0.75rem' }}>
                  {metric.title}
                </Typography>
                <Typography variant='h5' fontWeight={700}>
                  {metric.value}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.disabled' sx={{ textAlign: 'right' }}>
                {metric.detail}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default RestaurantPerformanceCards
