'use client'

import { useEffect, useRef, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

interface KPICardProps {
  title: string
  value: number | string
  icon: string
  color: string
  change?: number
  prefix?: string
  suffix?: string
  sparklineData?: number[]
}

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number | string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState('0')
  const frameRef = useRef<number | null>(null)
  const prevRef = useRef(0)

  useEffect(() => {
    const numVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 : value
    const start = prevRef.current
    const diff = numVal - start
    const duration = 600
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + diff * eased

      if (numVal >= 1000000) {
        setDisplay(`${prefix}${(current / 1000000).toFixed(1)}M${suffix}`)
      } else if (numVal >= 10000) {
        setDisplay(`${prefix}${(current / 1000).toFixed(1)}K${suffix}`)
      } else if (numVal % 1 !== 0) {
        setDisplay(`${prefix}${current.toFixed(2)}${suffix}`)
      } else {
        setDisplay(`${prefix}${Math.round(current).toLocaleString()}${suffix}`)
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        prevRef.current = numVal
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, prefix, suffix])

  return <>{display}</>
}

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 32
  const padding = 2

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((v - min) / range) * (height - padding * 2)

    return `${x},${y}`
  })

  const areaPoints = `${padding},${height - padding} ${points.join(' ')} ${width - padding},${height - padding}`

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor={color} stopOpacity={0.3} />
          <stop offset='100%' stopColor={color} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace('#', '')})`} />
      <polyline points={points.join(' ')} fill='none' stroke={color} strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

const KPICard = ({ title, value, icon, color, change, prefix, suffix, sparklineData }: KPICardProps) => {
  const isPositive = (change ?? 0) >= 0

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 180ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px -5px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ p: '20px !important', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}18`,
              color: color
            }}
          >
            <i className={`${icon} text-[1.4rem]`} />
          </Box>
          {sparklineData && sparklineData.length > 0 && <MiniSparkline data={sparklineData} color={color} />}
        </Box>
        <Box>
          <Typography variant='body2' color='text.disabled' sx={{ mb: 0.5, fontSize: '0.8rem' }}>
            {title}
          </Typography>
          <Typography variant='h4' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          </Typography>
        </Box>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size='small'
              variant='tonal'
              color={isPositive ? 'success' : 'error'}
              label={`${isPositive ? '+' : ''}${change.toFixed(1)}%`}
              sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
            />
            <Typography variant='caption' color='text.disabled'>
              vs prev. period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default KPICard
