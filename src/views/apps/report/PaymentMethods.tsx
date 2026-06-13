'use client'

import { useEffect } from 'react'

import { Box } from '@mui/material'
import { createColumnHelper } from '@tanstack/react-table'

import type { PaymentMethodData, PaymentMethodSale } from '@/types/apps/reportTypes'
import { useReport, formatCurrency, formatNumber } from './common'
import { reportEndpoints } from '@/services/endpoints/report'
import ReportFilters from './list/ReportFilters'
import ReportTable from './list/ReportTable'

const columnHelper = createColumnHelper<PaymentMethodSale>()

const columns = [
  columnHelper.accessor('method', { header: 'Payment Method', cell: info => (
    <Box sx={{ textTransform: 'capitalize' }}>{info.getValue()}</Box>
  )}),
  columnHelper.accessor('count', { header: 'Orders', cell: info => formatNumber(info.getValue()) }),
  columnHelper.accessor('total', { header: 'Total', cell: info => formatCurrency(info.getValue()) })
]

const PaymentMethods = () => {
  const { data, loading, error, applyRange, fetch } = useReport<PaymentMethodData>({ endpoint: reportEndpoints.paymentMethods })

  useEffect(() => { fetch() }, [fetch])

  return (
    <>
      <ReportFilters onApply={applyRange} loading={loading} />
      <ReportTable<PaymentMethodSale>
        columns={columns}
        data={data?.paymentMethods ?? []}
        total={data?.paymentMethods?.length ?? 0}
        page={1}
        limit={20}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        loading={loading}
        error={error}
        emptyMessage='No payment method data found'
      />
    </>
  )
}

export default PaymentMethods
