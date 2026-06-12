'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ApexOptions } from 'apexcharts'
import { useTheme } from '@mui/material/styles'
import type { GroceryInventoryValue } from '@/types/apps/reportTypes'
import { useReport, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import { Box, Card, CardContent, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const InventoryValueReport = () => {
  const theme = useTheme()
  const { data, loading, error, applyRange, fetch } = useReport<GroceryInventoryValue>({ endpoint: reportEndpoints.groceryInventoryValueReport })

  useEffect(() => { fetch() }, [fetch])

  const primaryColor = theme.palette.primary.main
  const infoColor = theme.palette.info.main

  const barOptions: ApexOptions = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    xaxis: { type: 'datetime', labels: { format: 'MMM dd' } },
    yaxis: { labels: { formatter: (v: number) => formatNumber(v) } },
    colors: [primaryColor],
    grid: { borderColor: 'var(--mui-palette-divider)' }
  }), [primaryColor])

  const valueTrendSeries = useMemo(() => {
    if (!data?.monthlyTrend) return []
    return [{
      name: 'Items',
      data: data.monthlyTrend.map(t => ({ x: new Date(t.date).getTime(), y: t.count }))
    }]
  }, [data])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
  if (error) return <Typography color='error'>{error}</Typography>

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r) }} loading={loading} />
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <Card><CardContent sx={{ textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>Total Items</Typography>
          <Typography variant='h4'>{formatNumber(data?.totalItems ?? 0)}</Typography>
        </CardContent></Card>
        <Card><CardContent sx={{ textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>Total Quantity</Typography>
          <Typography variant='h4'>{formatNumber(data?.totalQuantity ?? 0)}</Typography>
        </CardContent></Card>
        <Card><CardContent sx={{ textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>Avg Qty/Item</Typography>
          <Typography variant='h4'>{data && data.totalItems > 0 ? (data.totalQuantity / data.totalItems).toFixed(1) : '0'}</Typography>
        </CardContent></Card>
      </div>

      <Grid container spacing={4}>
        {data?.valueByType && data.valueByType.length > 0 && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>By Type</Typography>
                <TableContainer>
                  <Table size='small'>
                    <TableHead><TableRow><TableCell>Type</TableCell><TableCell align='right'>Items</TableCell><TableCell align='right'>Qty</TableCell></TableRow></TableHead>
                    <TableBody>
                      {data.valueByType.map(t => (
                        <TableRow key={t.type}>
                          <TableCell>{t.type || 'Unknown'}</TableCell>
                          <TableCell align='right'>{formatNumber(t.count)}</TableCell>
                          <TableCell align='right'>{formatNumber(t.totalQuantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
        {data?.valueByStore && data.valueByStore.length > 0 && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>By Store</Typography>
                <TableContainer>
                  <Table size='small'>
                    <TableHead><TableRow><TableCell>Store</TableCell><TableCell align='right'>Items</TableCell><TableCell align='right'>Qty</TableCell></TableRow></TableHead>
                    <TableBody>
                      {data.valueByStore.map(s => (
                        <TableRow key={s.storeId}>
                          <TableCell>{s.storeName}</TableCell>
                          <TableCell align='right'>{formatNumber(s.count)}</TableCell>
                          <TableCell align='right'>{formatNumber(s.totalQuantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
        {data?.monthlyTrend && data.monthlyTrend.length > 0 && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>Trend (Last 30 Days)</Typography>
                <AppReactApexCharts options={barOptions} series={valueTrendSeries} type='bar' height={250} />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default InventoryValueReport
