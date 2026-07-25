'use client'

import { useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import EmptyState from './EmptyState'

const CHART_COLORS = [
  '#7367F0', '#00CFE8', '#FFB547', '#FF4C51', '#56CAFB',
  '#73D8B7', '#E5749A', '#F5A623', '#6C8EBF', '#B8860B',
  '#9B59B6', '#2ECC71', '#E74C3C', '#3498DB', '#1ABC9C'
]

interface CategoryPerformanceChartProps {
  categoryPerformance: any[]
  categorySales: any[]
}

const CategoryPerformanceChart = ({ categoryPerformance, categorySales }: CategoryPerformanceChartProps) => {
  const chartData = useMemo(() => {
    const source = categoryPerformance?.length > 0 ? categoryPerformance : categorySales

    if (!source || source.length === 0) return null

    const sorted = [...source].sort((a: any, b: any) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
    const totalRevenue = sorted.reduce((sum: number, c: any) => sum + (c.totalRevenue || 0), 0)

    return {
      categories: sorted.map((c: any) => c.categoryName || c.name || 'Unknown'),
      revenues: sorted.map((c: any) => c.totalRevenue || 0),
      quantities: sorted.map((c: any) => c.totalQuantity || 0),
      totalRevenue
    }
  }, [categoryPerformance, categorySales])

  if (!chartData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <i className='tabler-chart-bar text-xl' style={{ color: '#00CFE8' }} />
              <Typography variant='h5'>Category Performance</Typography>
            </Box>
          }
        />
        <CardContent>
          <EmptyState icon='tabler-chart-bar' title='No Category Data' description='Category performance will appear here once sales are recorded' />
        </CardContent>
      </Card>
    )
  }

  const { categories: catNames, revenues, quantities, totalRevenue: totalRev } = chartData
  const colors = catNames.map((_: string, i: number) => CHART_COLORS[i % CHART_COLORS.length])

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <i className='tabler-chart-bar text-xl' style={{ color: '#00CFE8' }} />
            <Typography variant='h5'>Category Performance</Typography>
          </Box>
        }
        subheader={
          <Typography variant='caption' color='text.secondary'>
            {catNames.length} categories · Total €{totalRev.toLocaleString()}
          </Typography>
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {catNames.map((cat, i) => {
            const rev = revenues[i]
            const qty = quantities[i]
            const share = totalRev > 0 ? (rev / totalRev) * 100 : 0
            const color = colors[i]

            return (
              <Box key={`${cat}-${i}`}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                    <Typography variant='body2' fontWeight={500}>{cat}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant='caption' color='text.secondary'>{qty} sold</Typography>
                    <Typography variant='body2' fontWeight={700}>€{rev.toLocaleString()}</Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ minWidth: 40, textAlign: 'right' }}>
                      {share.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(color, 0.12),
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${share}%`,
                      borderRadius: 4,
                      bgcolor: color,
                      transition: 'width 0.6s ease'
                    }}
                  />
                </Box>
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default CategoryPerformanceChart
