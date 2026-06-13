'use client'

import { useEffect, useMemo, useState } from 'react'

import { createColumnHelper } from '@tanstack/react-table'

import type { OrderTypeReportData } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'
import StatCard from './list/StatCard'

const columnHelper = createColumnHelper<{ date: string; label: string; count: number; revenue: number }>()

const columns = [
  columnHelper.accessor('date', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
  columnHelper.accessor('label', { header: 'Type' }),
  columnHelper.accessor('count', { header: 'Orders', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('revenue', { header: 'Revenue', cell: info => formatCurrency(info.getValue()) })
]

const OrderTypeReport = () => {
  const { data, loading, error, applyRange, fetch } = useReport<OrderTypeReportData>({ endpoint: reportEndpoints.orderType })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => { fetch({ page, limit }) }, [fetch, page, limit])

  const stats = useMemo(() => {
    if (!data?.summary) return []
    
return Object.entries(data.summary).map(([key, val]) => ({
      label: val.label,
      count: val.count,
      revenue: val.revenue,
      key
    }))
  }, [data])

  return (
    <>
      <ReportFilters onApply={r => { applyRange(r); setPage(1) }} loading={loading} />
      {stats.length > 0 && (
        <div className='flex flex-wrap md:flex-nowrap gap-4 mb-4'>
          {stats.map(s => (
            <StatCard key={s.key} className='w-full md:w-1/3' title={s.label} value={s.count} icon='tabler-shopping-bag' color='primary' isSelected={false} onClick={() => {}} />
          ))}
        </div>
      )}
      <ReportTable
        columns={columns}
        data={data?.dailyBreakdown ?? []}
        total={data?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={l => { setLimit(l); setPage(1) }}
        loading={loading}
        error={error}
        emptyMessage='No order type data found'
      />
    </>
  )
}

export default OrderTypeReport
