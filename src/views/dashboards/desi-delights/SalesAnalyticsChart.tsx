'use client'

import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

type Metric = 'revenue' | 'orders' | 'netCollection' | 'vat'
type Granularity = 'daily' | 'weekly' | 'monthly'

interface SalesAnalyticsChartProps {
  dailySales: any[]
  hourlySales: any[]
  revenueTrend: any[]
}

const METRICS: { value: Metric; label: string }[] = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'netCollection', label: 'Net Collection' },
  { value: 'vat', label: 'VAT' },
  { value: 'orders', label: 'Orders' }
]

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

function getMetricValue(d: any, metric: Metric) {
  switch (metric) {
    case 'revenue':
      return d.revenue || 0
    case 'orders':
      return d.orderCount || d.orders || 0
    case 'netCollection':
      return (d.revenue || 0) - (d.discounts || 0)
    case 'vat':
      return d.tax || d.vat || 0
    default:
      return d.revenue || 0
  }
}

function aggregateData(data: any[], granularity: Granularity, metric: Metric) {
  if (!Array.isArray(data) || data.length === 0) return { labels: [], values: [] }

  const safeData = data.filter((d: any) => d && typeof d === 'object')

  if (granularity === 'daily') {
    return {
      labels: safeData.map((d: any) => new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })),
      values: safeData.map(d => getMetricValue(d, metric))
    }
  }

  if (granularity === 'weekly') {
    const weeks: Record<string, number[]> = {}

    safeData.forEach((d: any) => {
      const date = new Date(d.date)
      const weekStart = new Date(date)

      weekStart.setDate(date.getDate() - date.getDay())

      const key = weekStart.toISOString().split('T')[0]

      if (!weeks[key]) weeks[key] = []
      weeks[key].push(getMetricValue(d, metric))
    })

    const sortedKeys = Object.keys(weeks).sort()

    return {
      labels: sortedKeys.map(k => `W/C ${new Date(k).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`),
      values: sortedKeys.map(k => weeks[k].reduce((a, b) => a + b, 0))
    }
  }

  if (granularity === 'monthly') {
    const months: Record<string, number[]> = {}

    safeData.forEach((d: any) => {
      const date = new Date(d.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!months[key]) months[key] = []
      months[key].push(getMetricValue(d, metric))
    })

    const sortedKeys = Object.keys(months).sort()

    return {
      labels: sortedKeys.map(k => {
        const [y, m] = k.split('-')

        return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
      }),
      values: sortedKeys.map(k => months[k].reduce((a, b) => a + b, 0))
    }
  }

  return { labels: [], values: [] }
}

function formatValue(val: number, isCurrency: boolean) {
  if (!isCurrency) return Math.round(val).toLocaleString()
  if (val >= 1000000) return `€${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `€${(val / 1000).toFixed(1)}K`

  return `€${val.toFixed(2)}`
}

const SalesAnalyticsChart = ({ dailySales, revenueTrend }: SalesAnalyticsChartProps) => {
  const theme = useTheme()
  const [metric, setMetric] = useState<Metric>('revenue')
  const [granularity, setGranularity] = useState<Granularity>('daily')

  const chartData = useMemo(() => {
    const sourceData = Array.isArray(dailySales) && dailySales.length > 0
      ? dailySales
      : Array.isArray(revenueTrend) ? revenueTrend : []

    return aggregateData(sourceData, granularity, metric)
  }, [dailySales, revenueTrend, metric, granularity])

  const isCurrency = metric !== 'orders'
  const totalValue = chartData.values.reduce((a, b) => a + b, 0)
  const metricLabel = METRICS.find(m => m.value === metric)?.label || metric
  const maxVal = Math.max(...chartData.values, 1)

  const chartHeight = 280
  const barWidth = Math.max(4, Math.min(24, 600 / Math.max(chartData.values.length, 1) - 2))

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <i className='tabler-chart-line text-xl' style={{ color: '#7367F0' }} />
            <Typography variant='h5'>Sales Analytics</Typography>
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {METRICS.map(m => (
              <Button
                key={m.value}
                size='small'
                variant={metric === m.value ? 'contained' : 'outlined'}
                onClick={() => setMetric(m.value)}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.72rem',
                  fontWeight: metric === m.value ? 600 : 400,
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  ...(metric !== m.value && { borderColor: 'divider', color: 'text.secondary' })
                }}
              >
                {m.label}
              </Button>
            ))}
          </Box>
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {GRANULARITIES.map(g => (
              <Button
                key={g.value}
                size='small'
                variant={granularity === g.value ? 'contained' : 'text'}
                color={granularity === g.value ? 'primary' : 'inherit'}
                onClick={() => setGranularity(g.value)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '0.72rem', px: 2, py: 0.5 }}
              >
                {g.label}
              </Button>
            ))}
          </Box>
          {totalValue > 0 && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant='caption' color='text.disabled'>Total {metricLabel}</Typography>
              <Typography variant='h6' fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {formatValue(totalValue, isCurrency)}
              </Typography>
            </Box>
          )}
        </Box>

        {chartData.values.length > 0 ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${Math.max(1, Math.floor(400 / chartData.values.length))}px`, height: chartHeight, px: 1 }}>
              {chartData.values.map((val, i) => {
                const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0

                return (
                  <Box
                    key={i}
                    sx={{
                      flex: 1,
                      minWidth: barWidth,
                      maxWidth: 40,
                      height: `${heightPct}%`,
                      bgcolor: '#7367F0',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease',
                      position: 'relative',
                      '&:hover': { bgcolor: '#5C52D6' },
                      '&:hover .tooltip': { opacity: 1, visibility: 'visible' }
                    }}
                  >
                    <Box
                      className='tooltip'
                      sx={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: 'grey.900',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.65rem',
                        whiteSpace: 'nowrap',
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'all 0.15s ease',
                        zIndex: 10,
                        pointerEvents: 'none'
                      }}
                    >
                      {formatValue(val, isCurrency)}
                    </Box>
                  </Box>
                )
              })}
            </Box>
            <Box sx={{ display: 'flex', gap: `${Math.max(1, Math.floor(400 / chartData.labels.length))}px`, px: 1, mt: 0.5, overflow: 'hidden' }}>
              {chartData.labels.map((label, i) => (
                <Box key={i} sx={{ flex: 1, minWidth: barWidth, maxWidth: 40, textAlign: 'center' }}>
                  {(chartData.labels.length <= 15 || i % Math.ceil(chartData.labels.length / 10) === 0) && (
                    <Typography variant='caption' sx={{ fontSize: '0.55rem', color: 'text.disabled', whiteSpace: 'nowrap' }}>
                      {label}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: chartHeight }}>
            <Box sx={{ textAlign: 'center' }}>
              <i className='tabler-chart-line text-[3rem]' style={{ color: theme.palette.text.disabled }} />
              <p style={{ color: theme.palette.text.disabled, marginTop: 8 }}>No sales data available</p>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default SalesAnalyticsChart
