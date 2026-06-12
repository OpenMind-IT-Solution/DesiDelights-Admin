'use client'

import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { GroceryStockReport, GroceryStockItem } from '@/types/apps/reportTypes'
import { useReport, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'
import Chip from '@mui/material/Chip'

const columnHelper = createColumnHelper<GroceryStockItem>()

const columns = [
  columnHelper.accessor('itemName', { header: 'Item Name' }),
  columnHelper.accessor('type', { header: 'Type' }),
  columnHelper.accessor('quantity', { header: 'Current Qty', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('itemLowerValue', { header: 'Min Qty', cell: info => formatNumber(info.getValue()) }),
  { id: 'deficit', header: 'Deficit', cell: ({ row }) => formatNumber(Math.max(0, row.original.itemLowerValue - row.original.quantity)) },
  columnHelper.accessor('storeName', { header: 'Store' }),
  columnHelper.accessor('status', { header: 'Status', cell: () => <Chip label='Low Stock' color='warning' size='small' /> })
]

const LowStockReport = () => {
  const { data, loading, error, applyRange, fetch } = useReport<GroceryStockReport>({ endpoint: reportEndpoints.groceryLowStockReport })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      <ReportTable<GroceryStockItem>
        columns={columns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No low stock items found.'
      />
    </>
  )
}

export default LowStockReport
