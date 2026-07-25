'use client'

import { useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled, alpha } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import type { TimelineProps } from '@mui/lab/Timeline'

import EmptyState from './EmptyState'

const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': { display: 'none' }
  }
})

interface RecentActivitiesTimelineProps {
  recentOrders: any[]
  customerAnalytics: any
}

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

const ACTIVITY_ICONS: Record<string, { icon: string; color: string }> = {
  order: { icon: 'tabler-shopping-cart', color: '#7367F0' },
  completed: { icon: 'tabler-circle-check', color: '#56CAFB' },
  preparing: { icon: 'tabler-flame', color: '#FF6B6B' },
  pending: { icon: 'tabler-clock', color: '#FFB547' },
  cancelled: { icon: 'tabler-x', color: '#FF4C51' },
  default: { icon: 'tabler-bell', color: '#7367F0' }
}

const RecentActivitiesTimeline = ({ recentOrders, customerAnalytics }: RecentActivitiesTimelineProps) => {
  const activities = useMemo(() => {
    const items: Array<{ id: string; title: string; subtitle: string; time: string; icon: string; color: string }> = []

    if (recentOrders && recentOrders.length > 0) {
      recentOrders.slice(0, 8).forEach((order: any) => {
        const config = ACTIVITY_ICONS[order.status] || ACTIVITY_ICONS.order

        items.push({
          id: `order-${order.id}`,
          title: `Order #${order.id} ${order.status}`,
          subtitle: `${order.customerName || 'Walk-in'} \u2022 \u20AC${Number(order.totalAmount || 0).toFixed(2)}`,
          time: order.createdAt ? getRelativeTime(order.createdAt) : '',
          icon: config.icon,
          color: config.color
        })
      })
    }

    if (customerAnalytics?.topCustomers && customerAnalytics.topCustomers.length > 0) {
      customerAnalytics.topCustomers.slice(0, 2).forEach((c: any) => {
        items.push({
          id: `customer-${c.customerId || c.id}`,
          title: `Top customer: ${c.name || 'Unknown'}`,
          subtitle: `${c.orderCount || 0} orders \u2022 \u20AC${Number(c.totalSpent || 0).toFixed(2)} spent`,
          time: '',
          icon: 'tabler-user',
          color: '#00CFE8'
        })
      })
    }

    return items.slice(0, 10)
  }, [recentOrders, customerAnalytics])

  if (activities.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title='Recent Activities' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-list-details text-xl' />} />
        <CardContent>
          <EmptyState icon='tabler-bell' title='No Activities Yet' description='Recent activities will appear here' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title='Recent Activities' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-list-details text-xl' />} />
      <CardContent className='flex flex-col gap-2 pbe-5'>
        <Timeline>
          {activities.map(activity => (
            <TimelineItem key={activity.id}>
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    bgcolor: alpha(activity.color, 0.15),
                    boxShadow: 'none',
                    width: 32,
                    height: 32,
                    border: `2px solid ${activity.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className={`${activity.icon} text-[0.9rem]`} style={{ color: activity.color }} />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant='body2' fontWeight={600}>
                      {activity.title}
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      {activity.subtitle}
                    </Typography>
                  </Box>
                  {activity.time && (
                    <Typography variant='caption' color='text.disabled' sx={{ whiteSpace: 'nowrap', ml: 2 }}>
                      {activity.time}
                    </Typography>
                  )}
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default RecentActivitiesTimeline
