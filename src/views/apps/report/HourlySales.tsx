'use client'

import { useEffect } from 'react'

import { createColumnHelper } from '@tanstack/react-table'

import type { HourlySalesData, HourlySale } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<HourlySale>()

const columns = [
  columnHelper.accessor('hour', { header: 'Hour', cell: info => `${String(info.getValue()).padStart(2, '0')}:00` }),
  columnHelper.accessor('orderCount', { header: 'Orders', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('revenue', { header: 'Revenue', cell: info => formatCurrency(info.getValue()) })
]

const HourlySales = () => {
  const { data, loading, error, applyRange, fetch } = useReport<HourlySalesData>({ endpoint: reportEndpoints.hourlySales })

  useEffect(() => { fetch() }, [fetch])

  return (
    <>
      <ReportFilters onApply={applyRange} loading={loading} />
      <ReportTable<HourlySale>
        columns={columns}
        data={data?.hourlySales ?? []}
        total={data?.hourlySales?.length ?? 0}
        page={1}
        limit={24}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        loading={loading}
        error={error}
        emptyMessage='No hourly sales data found'
      />
    </>
  )
}

export default HourlySales
