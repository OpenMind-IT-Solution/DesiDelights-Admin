'use client'

import { useEffect, useState } from 'react'
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import type { DailySalesData, DailySale } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'
import { createColumnHelper } from '@tanstack/react-table'

const columnHelper = createColumnHelper<DailySale>()

const columns = [
  columnHelper.accessor('date', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
  columnHelper.accessor('orderCount', { header: 'Orders', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('revenue', { header: 'Revenue', cell: info => formatCurrency(info.getValue()) }),
  columnHelper.accessor('discounts', { header: 'Discounts', cell: info => formatCurrency(info.getValue()) }),
  columnHelper.accessor('tax', { header: 'Tax', cell: info => formatCurrency(info.getValue()) }),
  columnHelper.accessor('avgOrderValue', { header: 'Avg Order', cell: info => formatCurrency(info.getValue()) })
]

const DailySales = () => {
  const { data, loading, error, applyRange, fetch } = useReport<DailySalesData>({ endpoint: reportEndpoints.dailySales })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      <ReportTable<DailySale>
        columns={columns}
        data={data?.dailySales ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No daily sales data found'
      />
    </>
  )
}

export default DailySales
