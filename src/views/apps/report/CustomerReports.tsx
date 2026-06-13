'use client'

import { useEffect, useState } from 'react'

import { createColumnHelper } from '@tanstack/react-table'

import type { CustomerSalesData, CustomerSale } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<CustomerSale>()

const columns = [
  columnHelper.accessor('name', { header: 'Customer Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('phone', { header: 'Phone' }),
  columnHelper.accessor('orderCount', { header: 'Orders', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('totalSpent', { header: 'Total Spent', cell: info => formatCurrency(info.getValue()) })
]

const CustomerReports = () => {
  const { data, loading, error, applyRange, fetch } = useReport<CustomerSalesData>({ endpoint: reportEndpoints.customerSales })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      <ReportTable<CustomerSale>
        columns={columns}
        data={data?.customerSales ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No customer sales data found'
      />
    </>
  )
}

export default CustomerReports
