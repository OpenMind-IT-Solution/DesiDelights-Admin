'use client'

import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { StaffSalesData, StaffSale } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<StaffSale>()

const columns = [
  columnHelper.accessor('name', { header: 'Staff Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('phone', { header: 'Phone' }),
  columnHelper.accessor('orderCount', { header: 'Orders', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('totalRevenue', { header: 'Revenue', cell: info => formatCurrency(info.getValue()) }),
  columnHelper.accessor('avgOrderValue', { header: 'Avg Order', cell: info => formatCurrency(info.getValue()) })
]

const StaffSalesReports = () => {
  const { data, loading, error, applyRange, fetch } = useReport<StaffSalesData>({ endpoint: reportEndpoints.staffSales })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      <ReportTable<StaffSale>
        columns={columns}
        data={data?.staffSales ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No staff sales data found. Staff must be assigned as waiters on orders.'
      />
    </>
  )
}

export default StaffSalesReports
