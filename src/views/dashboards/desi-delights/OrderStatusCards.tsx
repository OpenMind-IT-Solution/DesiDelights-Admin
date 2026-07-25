'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha } from '@mui/material/styles'

import EmptyState from './EmptyState'

interface OrderStatusCardsProps {
  summary: any
}

const STATUS_CONFIG = [
  { key: 'placed', label: 'Pending', icon: 'tabler-clock', color: '#FFB547' },
  { key: 'preparing', label: 'Preparing', icon: 'tabler-flame', color: '#FF6B6B' },
  { key: 'ready', label: 'Ready', icon: 'tabler-checkup-list', color: '#00CFE8' },
  { key: 'completed', label: 'Completed', icon: 'tabler-circle-check', color: '#56CAFB' },
  { key: 'cancelled', label: 'Cancelled', icon: 'tabler-x', color: '#FF4C51' }
]

const OrderStatusCards = ({ summary }: OrderStatusCardsProps) => {
  const breakdown = summary?.statusBreakdown || {}
  const total = summary?.totalOrders || 0

  const statuses = STATUS_CONFIG.map(s => ({
    ...s,
    count: breakdown[s.key] || 0,
    percentage: total > 0 ? ((breakdown[s.key] || 0) / total) * 100 : 0
  }))

  const hasData = statuses.some(s => s.count > 0)

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title='Order Status'
        titleTypographyProps={{ variant: 'h5' }}
        avatar={<i className='tabler-list-details text-xl' />}
      />
      <CardContent>
        {!hasData ? (
          <EmptyState icon='tabler-clipboard' title='No Orders Yet' description='Orders will appear here once customers start ordering' />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {statuses.map(status => (
              <Box key={status.key}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(status.color, 0.12),
                        color: status.color
                      }}
                    >
                      <i className={`${status.icon} text-[1.1rem]`} />
                    </Box>
                    <Typography variant='body2' fontWeight={600}>
                      {status.label}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant='body2' fontWeight={700}>
                      {status.count}
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      {status.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={status.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(status.color, 0.12),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: status.color,
                      transition: 'transform 600ms ease'
                    }
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default OrderStatusCards
