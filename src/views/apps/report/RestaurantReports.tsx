'use client'

import { useEffect } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { BranchWiseData, BranchSale } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<BranchSale>()

const columns = [
  columnHelper.accessor('restaurantName', { header: 'Branch' }),
  columnHelper.accessor('orderCount', { header: 'Orders', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('revenue', { header: 'Revenue', cell: info => formatCurrency(info.getValue()) }),
  columnHelper.accessor('discounts', { header: 'Discounts', cell: info => formatCurrency(info.getValue()) }),
  columnHelper.accessor('tax', { header: 'Tax', cell: info => formatCurrency(info.getValue()) })
]

const RestaurantReports = () => {
  const { data, loading, error, applyRange, fetch } = useReport<BranchWiseData>({ endpoint: reportEndpoints.branchWise })

  useEffect(() => { fetch() }, [fetch])

  return (
    <>
      <ReportFilters onApply={applyRange} loading={loading} />
      <ReportTable<BranchSale>
        columns={columns}
        data={data?.branchSales ?? []}
        total={data?.branchSales?.length ?? 0}
        page={1}
        limit={50}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        loading={loading}
        error={error}
        emptyMessage='No branch data found'
      />
    </>
  )
}

export default RestaurantReports
