'use client'

import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { GroceryPurchaseReport, GroceryPurchase } from '@/types/apps/reportTypes'
import { useReport, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<GroceryPurchase>()

const columns = [
  columnHelper.accessor('itemName', { header: 'Item Name' }),
  columnHelper.accessor('type', { header: 'Type' }),
  columnHelper.accessor('quantity', { header: 'Quantity', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('storeName', { header: 'Store' }),
  columnHelper.accessor('createdAt', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() })
]

const PurchaseReport = () => {
  const { data, loading, error, applyRange, fetch } = useReport<GroceryPurchaseReport>({ endpoint: reportEndpoints.groceryPurchaseReport })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      <ReportTable<GroceryPurchase>
        columns={columns}
        data={data?.purchases ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No purchase data found.'
      />
    </>
  )
}

export default PurchaseReport
