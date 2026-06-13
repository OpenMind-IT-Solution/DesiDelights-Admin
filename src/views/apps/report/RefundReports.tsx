'use client'

import { useEffect } from 'react'

import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material'

import Grid from '@mui/material/Grid2'
import { createColumnHelper } from '@tanstack/react-table'

import type { RefundReportData } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'
import StatCard from './list/StatCard'

const columnHelper = createColumnHelper<{ date: string; status: string; count: number; amount: number }>()

const columns = [
  columnHelper.accessor('date', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
  columnHelper.accessor('status', { header: 'Status', cell: info => <Box sx={{ textTransform: 'capitalize' }}>{info.getValue()}</Box> }),
  columnHelper.accessor('count', { header: 'Count', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('amount', { header: 'Amount', cell: info => formatCurrency(info.getValue()) })
]

const RefundReports = () => {
  const { data, loading, error, applyRange, fetch } = useReport<RefundReportData>({ endpoint: reportEndpoints.refunds })

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
            <StatCard className='w-full md:w-1/4' title='Total Refunds' value={data.totalRefunds} icon='tabler-refresh' color='primary' isSelected={false} onClick={() => {}} />
            <StatCard className='w-full md:w-1/4' title='Total Refund Amount' value={data.totalRefundAmount} icon='tabler-currency-euro' color='error' isSelected={false} onClick={() => {}} />
          </div>
          {data.statusBreakdown && Object.keys(data.statusBreakdown).length > 0 && (
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' sx={{ mb: 2 }}>Refund Status Breakdown</Typography>
                    {Object.entries(data.statusBreakdown).map(([status, info]) => (
                      <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography textTransform='capitalize'>{status}</Typography>
                        <Typography>{info.count} orders ({formatCurrency(info.amount)})</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          <ReportTable
            columns={columns}
            data={data.dailyBreakdown ?? []}
            total={data.dailyBreakdown?.length ?? 0}
            page={1}
            limit={50}
            onPageChange={() => {}}
            onLimitChange={() => {}}
            loading={false}
            error={null}
            emptyMessage='No refund data found'
          />
        </>
      )}
    </>
  )
}

export default RefundReports
