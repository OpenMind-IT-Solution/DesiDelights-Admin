'use client'

import { useMemo } from 'react'
import Card from '@mui/material/Card'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import classnames from 'classnames'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'
import { CircularProgress } from '@mui/material'

type ReportTableProps<T> = {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  loading: boolean
  error: string | null
  emptyMessage?: string
}

const ReportTable = <T extends Record<string, unknown>>({
  columns, data, total, page, limit, onPageChange, onLimitChange, loading, error, emptyMessage = 'No data available'
}: ReportTableProps<T>) => {
  const table = useReactTable({
    data: data as T[],
    columns,
    rowCount: total,
    state: { pagination: { pageIndex: page - 1, pageSize: limit } },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className='text-center'>
                  <CircularProgress sx={{ my: 4 }} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className='text-center text-red-500'>
                  {error}
                </td>
              </tr>
            ) : data.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className='text-center'>
                  <Typography color='text.secondary'>{emptyMessage}</Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={total}
        rowsPerPage={limit}
        page={page - 1}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={e => onLimitChange(Number(e.target.value))}
      />
    </Card>
  )
}

export default ReportTable
