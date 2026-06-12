'use client'

import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { ItemSalesData, ItemSale } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<ItemSale>()

const columns = [
  columnHelper.accessor('name', { header: 'Item Name' }),
  columnHelper.accessor('category', { header: 'Category' }),
  columnHelper.accessor('unitPrice', { header: 'Unit Price', cell: info => formatCurrency(info.getValue()) }),
  columnHelper.accessor('totalQuantity', { header: 'Qty Sold', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('totalRevenue', { header: 'Revenue', cell: info => formatCurrency(info.getValue()) })
]

const ItemSales = () => {
  const { data, loading, error, applyRange, fetch } = useReport<ItemSalesData>({ endpoint: reportEndpoints.itemSales })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      <ReportTable<ItemSale>
        columns={columns}
        data={data?.itemSales ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No item sales data found'
      />
    </>
  )
}

export default ItemSales
