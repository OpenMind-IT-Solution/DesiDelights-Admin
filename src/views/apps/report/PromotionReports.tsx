'use client'

import { useEffect } from 'react'
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import type { DiscountReportData } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'
import StatCard from './list/StatCard'

const columnHelper = createColumnHelper<{ date: string; orderCount: number; discountAmount: number }>()

const columns = [
  columnHelper.accessor('date', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
  columnHelper.accessor('orderCount', { header: 'Orders with Discount', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('discountAmount', { header: 'Discount Given', cell: info => formatCurrency(info.getValue()) })
]

const PromotionReports = () => {
  const { data, loading, error, applyRange, fetch } = useReport<DiscountReportData>({ endpoint: reportEndpoints.discounts })

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
            <StatCard className='w-full md:w-1/4' title='Orders with Discount' value={data.totalOrdersWithDiscount} icon='tabler-percentage' color='primary' isSelected={false} onClick={() => {}} />
            <StatCard className='w-full md:w-1/4' title='Total Discount Given' value={data.totalDiscountAmount} icon='tabler-discount' color='success' isSelected={false} onClick={() => {}} />
            <StatCard className='w-full md:w-1/4' title='Revenue After Discount' value={data.totalRevenueAfterDiscount} icon='tabler-currency-euro' color='warning' isSelected={false} onClick={() => {}} />
            <StatCard className='w-full md:w-1/4' title='Avg Discount/Order' value={data.avgDiscountPerOrder} icon='tabler-calculator' color='error' isSelected={false} onClick={() => {}} />
          </div>
          <ReportTable
            columns={columns}
            data={data.discountBreakdown ?? []}
            total={data.discountBreakdown?.length ?? 0}
            page={1}
            limit={50}
            onPageChange={() => {}}
            onLimitChange={() => {}}
            loading={false}
            error={null}
            emptyMessage='No discount data found'
          />
        </>
      )}
    </>
  )
}

export default PromotionReports
