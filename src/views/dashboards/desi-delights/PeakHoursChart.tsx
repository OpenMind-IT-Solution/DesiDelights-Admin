'use client'

import { useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import EmptyState from './EmptyState'

interface PeakHoursChartProps {
  hourlySales: any[]
}

const RESTAURANT_OPEN = 11
const RESTAURANT_CLOSE = 21

const PIE_COLORS = [
  '#E8E0F7', '#D1C4F0', '#BA9DE8', '#A37BE0', '#8C5FD8',
  '#7C4DD0', '#7367F0', '#6358D4', '#564DB8', '#4A429C'
]

const PeakHoursChart = ({ hourlySales }: PeakHoursChartProps) => {
  const chartData = useMemo(() => {
    const hours = Array.from({ length: RESTAURANT_CLOSE - RESTAURANT_OPEN }, (_, i) => RESTAURANT_OPEN + i)
    const hourMap = new Map((hourlySales || []).map((h: any) => [h.hour, h]))

    const segments = hours.map((h, i) => ({
      label: `${h.toString().padStart(2, '0')}:00`,
      orders: hourMap.get(h)?.orderCount || 0,
      color: PIE_COLORS[i % PIE_COLORS.length]
    })).filter(s => s.orders > 0)

    const total = segments.reduce((a, b) => a + b.orders, 0)

    return { segments, total }
  }, [hourlySales])

  if (!chartData || chartData.segments.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <i className='tabler-clock text-xl' style={{ color: '#FFB547' }} />
              <Typography variant='h5'>Peak Hours</Typography>
            </Box>
          }
        />
        <CardContent>
          <EmptyState icon='tabler-clock' title='No Hourly Data' description='Peak hours will appear here once orders are recorded' />
        </CardContent>
      </Card>
    )
  }

  const size = 220
  const radius = 85
  const cx = size / 2
  const cy = size / 2
  const strokeWidth = 40
  const circumference = 2 * Math.PI * radius

  let cumulative = 0

  const arcs = chartData.segments.map((seg) => {
    const pct = chartData.total > 0 ? seg.orders / chartData.total : 0
    const sweepDeg = pct * 360
    const startAngle = cumulative

    cumulative += sweepDeg

    const dashLen = (sweepDeg / 360) * circumference
    const gapLen = circumference - dashLen
    const dashOffset = -((startAngle - 90) / 360) * circumference

    return { ...seg, pct, dashLen, gapLen, dashOffset }
  })

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <i className='tabler-clock text-xl' style={{ color: '#FFB547' }} />
            <Typography variant='h5'>Peak Hours</Typography>
          </Box>
        }
        subheader={
          <Typography variant='caption' color='text.secondary'>
            11:00–21:00 · {chartData.total} total orders
          </Typography>
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size}>
              {arcs.map((arc, i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill='none'
                  stroke={arc.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${arc.dashLen} ${arc.gapLen}`}
                  strokeDashoffset={arc.dashOffset}
                  strokeLinecap='round'
                  style={{ transition: 'all 0.3s ease' }}
                />
              ))}
            </svg>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}
            >
              <Typography variant='h5' fontWeight={700} sx={{ lineHeight: 1.1 }}>
                {chartData.total}
              </Typography>
              <Typography variant='caption' color='text.disabled'>orders</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, maxHeight: 220, overflow: 'auto' }}>
            {chartData.segments.map((seg) => (
              <Box key={seg.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: seg.color, flexShrink: 0 }} />
                  <Typography variant='body2' fontWeight={500} sx={{ fontSize: '0.8rem' }}>{seg.label}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant='body2' fontWeight={600}>{seg.orders}</Typography>
                  <Typography variant='caption' color='text.disabled' sx={{ minWidth: 36, textAlign: 'right' }}>
                    {chartData.total > 0 ? ((seg.orders / chartData.total) * 100).toFixed(1) : 0}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PeakHoursChart
