'use client'

import { useEffect } from 'react'
import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'
import type { CategorySalesData, CategorySale } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<CategorySale>()

const columns = [
  columnHelper.accessor('categoryName', { header: 'Category' }),
  columnHelper.accessor('totalQuantity', { header: 'Qty Sold', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('totalRevenue', { header: 'Revenue', cell: info => formatCurrency(info.getValue()) })
]

const CategorySales = () => {
  const { data, loading, error, applyRange, fetch } = useReport<CategorySalesData>({ endpoint: reportEndpoints.categorySales })

  useEffect(() => { fetch() }, [fetch])

  return (
    <>
      <ReportFilters onApply={applyRange} loading={loading} />
      <ReportTable<CategorySale>
        columns={columns}
        data={data?.categorySales ?? []}
        total={data?.categorySales?.length ?? 0}
        page={1}
        limit={50}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        loading={loading}
        error={error}
        emptyMessage='No category sales data found'
      />
    </>
  )
}

export default CategorySales
