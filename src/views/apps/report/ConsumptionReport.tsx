'use client'

import { useEffect, useState } from 'react'

import { createColumnHelper } from '@tanstack/react-table'

import type { InventoryConsumptionData, InventoryConsumptionItem } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<InventoryConsumptionItem>()

const columns = [
  columnHelper.accessor('name', { header: 'Item Name' }),
  columnHelper.accessor('category', { header: 'Category' }),
  columnHelper.accessor('totalQuantity', { header: 'Qty Consumed', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('totalValue', { header: 'Total Value', cell: info => formatCurrency(info.getValue()) })
]

const ConsumptionReport = () => {
  const { data, loading, error, applyRange, fetch } = useReport<InventoryConsumptionData>({ endpoint: reportEndpoints.groceryConsumptionReport })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      <ReportTable<InventoryConsumptionItem>
        columns={columns}
        data={data?.consumption ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No consumption data found.'
      />
    </>
  )
}

export default ConsumptionReport
