'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { OrderType } from '@/types/apps/orderTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import TableFilters from './TableFilters'
import AddOrderDrawer from './AddOrderDrawer'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type OrderTypeWithAction = OrderType & {
  action?: string
}

type OrderStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)
    return () => clearTimeout(timeout)
  }, [value, onChange, debounce])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const orderStatusObj: OrderStatusType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper<OrderTypeWithAction>()

const OrderListTable = ({ tableData }: { tableData?: OrderType[] }) => {
  const [addOrderOpen, setAddOrderOpen] = useState(false)
  const [editOrderOpen, setEditOrderOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[tableData])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderTypeWithAction | null>(null)

  const { lang: locale } = useParams()

  useEffect(() => {
    setFilteredData(data)
  }, [data])

  const handleDownloadSelected = (ordersToExport: OrderTypeWithAction[]) => {
    if (ordersToExport.length === 0) return
    const headers = Object.keys(ordersToExport[0])

    const escapeCSV = (value: unknown): string => {
      if (value == null) return ''
      const str = String(value)
      return `"${str.replace(/"/g, '""')}"`
    }

    const rows = ordersToExport.map(order => headers.map(header => escapeCSV(order[header as keyof OrderTypeWithAction])))
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'orders-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      const updatedData = data?.filter(order => order.id !== orderToDelete.id) ?? []
      setData(updatedData)
      setFilteredData(updatedData)
    }
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => {
          const pageRows = table.getRowModel().rows
          const allPageSelected = pageRows.length > 0 && pageRows.every(row => row.getIsSelected())
          const somePageSelected = pageRows.some(row => row.getIsSelected()) && !allPageSelected

          const toggleAllPageSelected = () => {
            if (allPageSelected) {
              pageRows.forEach(row => row.toggleSelected(false))
            } else {
              pageRows.forEach(row => row.toggleSelected(true))
            }
          }

          return (
            <Checkbox
              checked={allPageSelected}
              indeterminate={somePageSelected}
              onChange={toggleAllPageSelected}
            />
          )
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('id', {
        header: 'Order ID',
        cell: ({ row }) => <Typography>{row.original.id}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.status}
            size='small'
            color={orderStatusObj[row.original.status] || 'default'}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('totalAmount', {
        header: 'Total Amount',
        cell: ({ row }) => <Typography>₹{row.original.totalAmount}</Typography>
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'Payment Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.paymentStatus}
            size='small'
            color={row.original.paymentStatus === 'paid' ? 'success' : 'warning'}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('orderType', {
        header: 'Order Type',
        cell: ({ row }) => <Typography className='capitalize'>{row.original.orderType}</Typography>
      }),
      columnHelper.accessor('deliveryAddress', {
        header: 'Delivery Address',
        cell: ({ row }) => (
          <Typography sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.original.deliveryAddress}
          </Typography>
        )
      }),
      columnHelper.accessor('items', {
        header: 'Items',
        cell: ({ row }) => (
          <Typography>
            {Array.isArray(row.original.items) ? row.original.items.length : 0} items
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton
              onClick={() => {
                setSelectedOrder(row.original)
                setEditOrderOpen(true)
              }}
            >
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton
              onClick={() => {
                setOrderToDelete(row.original)
                setDeleteDialogOpen(true)
              }}
              color='error'
            >
              <i className='tabler-trash' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [data, filteredData, locale]
  )

  const table = useReactTable({
    data: filteredData as OrderType[],
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Order'
              className='max-sm:is-full'
            />
            <CustomTextField
              select
              value=''
              slotProps={{
                select: {
                  displayEmpty: true,
                  IconComponent: () => (
                    <i
                      className='tabler-filter text-textSecondary text-base'
                      style={{ transform: 'none', transition: 'none' }}
                    />
                  )
                }
              }}
            >
              <TableFilters setData={setFilteredData} tableData={data} />
            </CustomTextField>
            <Button
              disabled={table.getSelectedRowModel().rows.length === 0}
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
              onClick={() => {
                const selectedOrders = table.getSelectedRowModel().rows.map(row => row.original)
                handleDownloadSelected(selectedOrders)
              }}
            >
              Export
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddOrderOpen(!addOrderOpen)}
              className='max-sm:is-full'
            >
              Add New Order
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />
      </Card>

      <AddOrderDrawer
        open={addOrderOpen || editOrderOpen}
        handleClose={() => {
          setAddOrderOpen(false)
          setEditOrderOpen(false)
          setSelectedOrder(null)
        }}
        orderData={data}
        setData={setData}
        orderToEdit={selectedOrder}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

export default OrderListTable
