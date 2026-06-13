'use client'

import { useEffect, useState } from 'react'

import { createColumnHelper } from '@tanstack/react-table'

import { Box, Card, CardContent, Typography } from '@mui/material'

import type { GroceryWastageReport, GroceryStockItem } from '@/types/apps/reportTypes'
import { useReport, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<GroceryStockItem>()

const columns = [
  columnHelper.accessor('itemName', { header: 'Item Name' }),
  columnHelper.accessor('type', { header: 'Type' }),
  columnHelper.accessor('quantity', { header: 'Wasted Qty', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('storeName', { header: 'Store' }),
  columnHelper.accessor('updatedAt', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() })
]

const WastageReport = () => {
  const { data, loading, error, applyRange, fetch } = useReport<GroceryWastageReport>({ endpoint: reportEndpoints.groceryWastageReport })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  if (loading) return null
  if (error) return null

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      {data?.summary ? (
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>Total Wasted Items</Typography>
              <Typography variant='h5'>{formatNumber(data.summary.totalWastedItems)}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>Total Wasted Quantity</Typography>
              <Typography variant='h5'>{formatNumber(data.summary.totalWastedQuantity)}</Typography>
            </CardContent>
          </Card>
        </Box>
      ) : null}
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
        emptyMessage='No wastage recorded.'
      />
    </>
  )
}

export default WastageReport
