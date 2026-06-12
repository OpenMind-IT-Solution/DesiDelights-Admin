'use client'

import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { GroceryMovementReport, GroceryMovement } from '@/types/apps/reportTypes'
import { useReport, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'
import Chip from '@mui/material/Chip'

const statusColor = (status: string) => {
  switch (status) {
    case 'In Stock': return 'success'
    case 'Low Stock': return 'warning'
    case 'Out of Stock': return 'error'
    default: return 'default'
  }
}

const columnHelper = createColumnHelper<GroceryMovement>()

const columns = [
  columnHelper.accessor('itemName', { header: 'Item Name' }),
  columnHelper.accessor('type', { header: 'Type' }),
  columnHelper.accessor('quantity', { header: 'Current Qty', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('status', { header: 'Status', cell: info => <Chip label={info.getValue()} color={statusColor(info.getValue()) as any} size='small' /> }),
  columnHelper.accessor('storeName', { header: 'Store' }),
  columnHelper.accessor('updatedAt', { header: 'Last Updated', cell: info => new Date(info.getValue()).toLocaleDateString() })
]

const StockMovementReport = () => {
  const { data, loading, error, applyRange, fetch } = useReport<GroceryMovementReport>({ endpoint: reportEndpoints.groceryStockMovementReport })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      <ReportTable<GroceryMovement>
        columns={columns}
        data={data?.movements ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No stock movement data found.'
      />
    </>
  )
}

export default StockMovementReport
