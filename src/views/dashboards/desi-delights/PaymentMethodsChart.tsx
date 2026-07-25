'use client'

import { useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import EmptyState from './EmptyState'

interface PaymentMethodsChartProps {
  paymentMethods: any[]
}

const COLORS = ['#7367F0', '#00CFE8', '#56CAFB', '#FFB547', '#FF4C51', '#73D8B7', '#E5749A']

const PaymentMethodsChart = ({ paymentMethods }: PaymentMethodsChartProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const chartData = useMemo(() => {
    if (!paymentMethods || paymentMethods.length === 0) return null

    const sorted = [...paymentMethods]
      .map((m: any) => ({
        label: (m.method || m.paymentMethod || 'Unknown').charAt(0).toUpperCase() + (m.method || m.paymentMethod || 'Unknown').slice(1),
        total: m.total || m.amount || 0
      }))
      .sort((a, b) => b.total - a.total)

    const grandTotal = sorted.reduce((a, b) => a + b.total, 0)

    return { segments: sorted.map((s, i) => ({ ...s, color: COLORS[i % COLORS.length] })), grandTotal }
  }, [paymentMethods])

  if (!chartData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <i className='tabler-credit-card text-xl' style={{ color: '#7367F0' }} />
              <Typography variant='h5'>Payment Methods</Typography>
            </Box>
          }
        />
        <CardContent>
          <EmptyState icon='tabler-wallet' title='No Payment Data' description='Payment method breakdown will appear here' />
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
    const pct = chartData.grandTotal > 0 ? seg.total / chartData.grandTotal : 0
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
            <i className='tabler-credit-card text-xl' style={{ color: '#7367F0' }} />
            <Typography variant='h5'>Payment Methods</Typography>
          </Box>
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
                  strokeWidth={hoveredIdx === i ? strokeWidth + 8 : strokeWidth}
                  strokeDasharray={`${arc.dashLen} ${arc.gapLen}`}
                  strokeDashoffset={arc.dashOffset}
                  strokeLinecap='round'
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}
            </svg>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
              }}
            >
              {hoveredIdx !== null ? (
                <>
                  <Typography variant='h6' fontWeight={700} sx={{ lineHeight: 1.1, color: arcs[hoveredIdx].color }}>
                    {arcs[hoveredIdx].label}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {(arcs[hoveredIdx].pct * 100).toFixed(1)}%
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant='h5' fontWeight={700} sx={{ lineHeight: 1.1 }}>
                    €{chartData.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant='caption' color='text.disabled'>Total</Typography>
                </>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
            {arcs.map((arc, i) => (
              <Box
                key={arc.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: hoveredIdx === i ? `${arc.color}12` : 'transparent',
                  transition: 'background-color 0.15s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: arc.color, flexShrink: 0 }} />
                  <Typography variant='body2' fontWeight={hoveredIdx === i ? 700 : 500}>{arc.label}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant='body2' fontWeight={600}>€{arc.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
                  <Typography variant='caption' color='text.disabled' sx={{ minWidth: 36, textAlign: 'right' }}>
                    {(arc.pct * 100).toFixed(1)}%
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

export default PaymentMethodsChart
