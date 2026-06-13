'use client'

import { useEffect, useState } from 'react'

import { createColumnHelper } from '@tanstack/react-table'

import Chip from '@mui/material/Chip'

import type { GroceryExpiryReport, GroceryExpiryItem } from '@/types/apps/reportTypes'
import { useReport, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const daysChipColor = (days: number) => {
  if (days >= 180) return 'error'
  if (days >= 90) return 'warning'
  if (days >= 30) return 'info'
  
return 'success'
}

const columnHelper = createColumnHelper<GroceryExpiryItem>()

const columns = [
  columnHelper.accessor('itemName', { header: 'Item Name' }),
  columnHelper.accessor('type', { header: 'Type' }),
  columnHelper.accessor('quantity', { header: 'Qty', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('daysInStock', { header: 'Days in Stock', cell: info => <Chip label={`${info.getValue()} days`} color={daysChipColor(info.getValue()) as any} size='small' /> }),
  columnHelper.accessor('status', { header: 'Status' }),
  columnHelper.accessor('storeName', { header: 'Store' }),
  columnHelper.accessor('createdAt', { header: 'Created', cell: info => new Date(info.getValue()).toLocaleDateString() })
]

const ExpiryReport = () => {
  const { data, loading, error, applyRange, fetch } = useReport<GroceryExpiryReport>({ endpoint: reportEndpoints.groceryExpiryReport })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      <ReportTable<GroceryExpiryItem>
        columns={columns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No expiry data available.'
      />
    </>
  )
}

export default ExpiryReport
