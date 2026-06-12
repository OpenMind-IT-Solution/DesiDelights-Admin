'use client'

import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { GrocerySupplierReport, GrocerySupplier } from '@/types/apps/reportTypes'
import { useReport, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'
import { Box, Card, CardContent, Typography } from '@mui/material'

const columnHelper = createColumnHelper<GrocerySupplier>()

const columns = [
  columnHelper.accessor('storeName', { header: 'Store / Supplier' }),
  columnHelper.accessor('location', { header: 'Location' }),
  columnHelper.accessor('itemCount', { header: 'Items', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('totalQuantity', { header: 'Total Qty', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('inStockCount', { header: 'In Stock', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('lowStockCount', { header: 'Low Stock', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('outOfStockCount', { header: 'Out of Stock', cell: info => formatNumber(info.getValue()) })
]

const SupplierReport = () => {
  const { data, loading, error, applyRange, fetch } = useReport<GrocerySupplierReport>({ endpoint: reportEndpoints.grocerySupplierReport })

  useEffect(() => { fetch() }, [fetch])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r) }} loading={loading} />
      {loading ? null : error ? null : data?.suppliers && data.suppliers.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
          {data.suppliers.map(s => (
            <Card key={s.storeId}>
              <CardContent>
                <Typography variant='h6'>{s.storeName}</Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>{s.location}</Typography>
                <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                  <Box><Typography variant='body2' color='text.secondary'>Items</Typography><Typography variant='h6'>{formatNumber(s.itemCount)}</Typography></Box>
                  <Box><Typography variant='body2' color='text.secondary'>Total Qty</Typography><Typography variant='h6'>{formatNumber(s.totalQuantity)}</Typography></Box>
                  <Box><Typography variant='body2' color='text.secondary' sx={{ color: 'success.main' }}>In Stock</Typography><Typography variant='h6'>{formatNumber(s.inStockCount)}</Typography></Box>
                  <Box><Typography variant='body2' color='text.secondary' sx={{ color: 'warning.main' }}>Low</Typography><Typography variant='h6'>{formatNumber(s.lowStockCount)}</Typography></Box>
                  <Box><Typography variant='body2' color='text.secondary' sx={{ color: 'error.main' }}>Out</Typography><Typography variant='h6'>{formatNumber(s.outOfStockCount)}</Typography></Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      <ReportTable<GrocerySupplier>
        columns={columns}
        data={data?.suppliers ?? []}
        total={data?.suppliers?.length ?? 0}
        page={1}
        limit={100}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        loading={loading}
        error={error}
        emptyMessage='No suppliers found.'
      />
    </>
  )
}

export default SupplierReport
