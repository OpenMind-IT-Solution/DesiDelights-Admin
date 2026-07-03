'use client'

import { useEffect } from 'react'

import { Box, Card, CardContent, Typography, CircularProgress, Divider } from '@mui/material'

import Grid from '@mui/material/Grid2'

import type { ProfitReportData } from '@/types/apps/reportTypes'
import { useReport, formatCurrency } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'

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
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant='h6' sx={{ mb: 2 }}>Revenue Breakdown</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Total Revenue</Typography><Typography fontWeight='bold'>{formatCurrency(data.totalRevenue)}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Total Discounts</Typography><Typography fontWeight='bold' color='error'>{formatCurrency(data.totalDiscounts)}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Total VAT</Typography><Typography fontWeight='bold'>{formatCurrency(data.totalTax)}</Typography></Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Estimated COGS</Typography><Typography fontWeight='bold' color='warning'>{formatCurrency(data.estimatedCOGS)}</Typography></Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography fontWeight='bold'>Net Profit</Typography><Typography fontWeight='bold' color='primary'>{formatCurrency(data.netProfit)}</Typography></Box>
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
