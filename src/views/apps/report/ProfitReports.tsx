'use client'

import { useEffect } from 'react'
import { Box, Card, CardContent, Typography, CircularProgress, Grid } from '@mui/material'
import type { ProfitReportData } from '@/types/apps/reportTypes'
import { useReport, formatCurrency } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import StatCard from './list/StatCard'

const ProfitReports = () => {
  const { data, loading, error, applyRange, fetch } = useReport<ProfitReportData>({ endpoint: reportEndpoints.profit })

  useEffect(() => { fetch() }, [fetch])

  if (loading && !data) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
  }

  if (error && !data) {
    return <Typography color='error' sx={{ p: 4 }}>{error}</Typography>
  }

  return (
    <>
      <ReportFilters onApply={applyRange} loading={loading} />
      {loading && <CircularProgress size={20} sx={{ mb: 2 }} />}
      {data && (
        <>
          <div className='flex flex-wrap md:flex-nowrap gap-4 mb-4'>
            <StatCard className='w-full md:w-1/4' title='Gross Profit' value={data.grossProfit} icon='tabler-trending-up' color='success' isSelected={false} onClick={() => {}} />
            <StatCard className='w-full md:w-1/4' title='Net Profit' value={data.netProfit} icon='tabler-currency-euro' color='primary' isSelected={false} onClick={() => {}} />
            <StatCard className='w-full md:w-1/4' title='Profit Margin' value={data.profitMargin} icon='tabler-percentage' color='warning' isSelected={false} onClick={() => {}} />
          </div>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant='h6' sx={{ mb: 2 }}>Revenue Breakdown</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Total Revenue</Typography><Typography fontWeight='bold'>{formatCurrency(data.totalRevenue)}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Total Discounts</Typography><Typography fontWeight='bold' color='error'>{formatCurrency(data.totalDiscounts)}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Total Tax</Typography><Typography fontWeight='bold'>{formatCurrency(data.totalTax)}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Estimated COGS</Typography><Typography fontWeight='bold' color='warning'>{formatCurrency(data.estimatedCOGS)}</Typography></Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}

export default ProfitReports
