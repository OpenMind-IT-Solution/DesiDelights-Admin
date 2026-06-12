'use client'

import { useEffect } from 'react'
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import type { TaxReportData } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'
import StatCard from './list/StatCard'

const columnHelper = createColumnHelper<{ date: string; orderCount: number; taxAmount: number }>()

const columns = [
  columnHelper.accessor('date', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
  columnHelper.accessor('orderCount', { header: 'Orders', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('taxAmount', { header: 'Tax Collected', cell: info => formatCurrency(info.getValue()) })
]

const AccountingReports = () => {
  const { data, loading, error, applyRange, fetch } = useReport<TaxReportData>({ endpoint: reportEndpoints.taxes })

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
            <StatCard className='w-full md:w-1/4' title='Total Orders' value={data.totalOrders} icon='tabler-shopping-cart' color='primary' isSelected={false} onClick={() => {}} />
            <StatCard className='w-full md:w-1/4' title='Total Tax Collected' value={data.totalTaxCollected} icon='tabler-building' color='success' isSelected={false} onClick={() => {}} />
            <StatCard className='w-full md:w-1/4' title='Total Revenue' value={data.totalRevenue} icon='tabler-currency-euro' color='warning' isSelected={false} onClick={() => {}} />
            <StatCard className='w-full md:w-1/4' title='Avg Tax/Order' value={data.avgTaxPerOrder} icon='tabler-calculator' color='error' isSelected={false} onClick={() => {}} />
          </div>
          <ReportTable
            columns={columns}
            data={data.taxBreakdown ?? []}
            total={data.taxBreakdown?.length ?? 0}
            page={1}
            limit={50}
            onPageChange={() => {}}
            onLimitChange={() => {}}
            loading={false}
            error={null}
            emptyMessage='No tax data found'
          />
        </>
      )}
    </>
  )
}

export default AccountingReports
