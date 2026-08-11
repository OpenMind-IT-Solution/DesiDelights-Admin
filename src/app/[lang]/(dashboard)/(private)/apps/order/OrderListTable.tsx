'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Third-party Imports
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { ColumnDef, FilterFn, PaginationState } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import classnames from 'classnames'
import { toast } from 'react-toastify'

// Type Imports
import { useSession } from 'next-auth/react'

import type { OrderType } from '@/types/apps/orderTypes'
import type { ThemeColor } from '@core/types'

// Component Imports
import { post, put } from '@/services/apiService'
import { orderEndpoints } from '@/services/endpoints/order'
import OrderItemsDrawer from '@components/dialogs/OrderItemsDrawer'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import AddOrderDrawer from './AddOrderDrawer'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import ReceiptDialog from '@/components/dialogs/receipt-dialog/ReceiptDialog'
import TableFilters from './TableFilters'
import ExportMonthlyDialog from './ExportMonthlyDialog'

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
// const Icon = styled('i')({})

const parseDeliveryAddress = (address: string | null | undefined): string => {
  if (!address) return '-'

  try {
    const parsed = JSON.parse(address)

    if (parsed && typeof parsed === 'object' && (parsed.customerName || parsed.customerPhone || parsed.customerNotes)) {
      const parts: string[] = []

      if (parsed.customerName) parts.push(parsed.customerName)
      if (parsed.customerPhone) parts.push(parsed.customerPhone)
      if (parsed.customerNotes) parts.push(`(${parsed.customerNotes})`)
      
return parts.join(' | ')
    }
  } catch {
    // not JSON
  }

  
return address
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })
  
return itemRank.passed
}

const searchByIdFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  if (columnId !== 'id') return false

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
  pending: 'warning',
  placed: 'info',
  confirmed: 'primary',
  out_for_delivery: 'info',
  completed: 'success',
  cancelled: 'secondary',
  deleted: 'error'
}

// Column Definitions
const columnHelper = createColumnHelper<OrderTypeWithAction>()

const OrderListTable = () => {
  const { data: session } = useSession()
  const [addOrderOpen, setAddOrderOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<OrderType[]>([])
  const [filteredData, setFilteredData] = useState<OrderType[]>(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkCancelDialogOpen, setBulkCancelDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<OrderTypeWithAction | null>(null)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState<OrderType | null>(null)
  const [, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [, setTotalRows] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const { lang: locale } = useParams()

  useEffect(() => {
    setFilteredData(showDeleted ? data : data.filter(o => o.status !== 'deleted'))
  }, [data, showDeleted])

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter])

  useEffect(() => {
    let active = true

    const fetchOrders = async () => {
      if (!session) return
      setLoading(true)
      setError(null)

      try {
        const res: any = await post(orderEndpoints.getOrders, {
          search: '',
          page: 1,
          limit: 10000,
          status: []
        })

        if (!active) return

        console.log('Orders API response:', res)
        const orders = res?.data?.orders ?? res?.data ?? []

        setData(orders)
        setFilteredData(orders)
        setTotalRows(res?.data?.total ?? orders.length)
      } catch (err: any) {
        if (!active) return

        console.error(err)
        setError(err?.message || 'Failed to fetch orders')
        setData([])
        setTotalRows(0)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    if (session) {
      fetchOrders()
    }

    return () => {
      active = false
    }
  }, [session, refreshKey])

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return
    const deleteId = orderToDelete.id

    try {
      await put(orderEndpoints.updateOrderStatus(deleteId), { status: 'deleted' })
      setData(prev => prev.filter(order => order.id !== deleteId))
      setFilteredData(prev => prev.filter(order => order.id !== deleteId))
      toast.success('Order deleted')
    } catch (err) {
      console.error('Failed to delete order', err)
      toast.error('Failed to delete order')
    }

    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  const handleBulkCancel = async () => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id)

    try {
      const result = await post(orderEndpoints.bulkCancelOrder, { ids: selectedIds }) as { status: string; message?: string }

      if (result.status === 'success') {
        toast.success(result?.message || 'Orders deleted successfully.')
        setRowSelection({})
        setRefreshKey(k => k + 1)
      } else {
        toast.error(result?.message || 'Failed to delete orders.')
      }
    } catch (err) {
      console.error('Failed to bulk delete orders', err)
      toast.error('Failed to delete orders.')
    }

    setBulkCancelDialogOpen(false)
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
            <Checkbox checked={allPageSelected} indeterminate={somePageSelected} onChange={toggleAllPageSelected} />
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
            label={row.original.status?.replace(/_/g, ' ')}
            size='small'
            color={orderStatusObj[row.original.status] || 'default'}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('totalAmount', {
        header: 'Total Amount',
        cell: ({ row }) => <Typography>€{row.original.totalAmount}</Typography>
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
            {parseDeliveryAddress(row.original.deliveryAddress)}
          </Typography>
        )
      }),
      columnHelper.accessor('orderItems', {
        header: 'Order Items',
        cell: ({ row }) => {
          const orderItems = row.original.orderItems ?? row.original.items ?? []

          
return <Typography>{Array.isArray(orderItems) ? `${orderItems.length} items` : '0 items'}</Typography>
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton
              onClick={() => {
                setReceiptOrder(row.original)
                setReceiptDialogOpen(true)
              }}
            >
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
            <IconButton
              onClick={() => {
                setSelectedOrder(row.original)
                setDrawerOpen(true)
              }}
            >
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            {row.original.status !== 'deleted' && (
              <IconButton
                onClick={() => {
                  setOrderToDelete(row.original)
                  setDeleteDialogOpen(true)
                }}
                color='error'
              >
                <i className='tabler-trash' />
              </IconButton>
            )}
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
    autoResetPageIndex: false,
    filterFns: { fuzzy: fuzzyFilter },
    state: { pagination, rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: searchByIdFilter,
    onPaginationChange: setPagination,
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
            onChange={e => setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })}
            className='max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
            <MenuItem value='100'>100</MenuItem>
          </CustomTextField>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Order'
              className='max-sm:is-full'
            />
            <Button
              variant={showDeleted ? 'contained' : 'tonal'}
              color={showDeleted ? 'error' : 'secondary'}
              startIcon={<i className='tabler-filter' />}
              className='max-sm:is-full'
              onClick={e => setFilterAnchorEl(e.currentTarget)}
            >
              {showDeleted ? 'Deleted ON' : 'Show Deleted'}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => setFilterAnchorEl(null)}
            >
              <TableFilters showDeleted={showDeleted} setShowDeleted={setShowDeleted} onClose={() => setFilterAnchorEl(null)} />
            </Menu>
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
              onClick={() => setExportDialogOpen(true)}
            >
              Export
            </Button>
            {table.getSelectedRowModel().rows.length > 0 && (
              <Button
                variant='outlined'
                color='error'
                startIcon={<i className='tabler-trash' />}
                onClick={() => setBulkCancelDialogOpen(true)}
              >
                Delete Selected ({table.getSelectedRowModel().rows.length})
              </Button>
            )}
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
                  .getRowModel().rows
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

      <OrderItemsDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onSaved={() => setRefreshKey(k => k + 1)}
      />

      <AddOrderDrawer
        open={addOrderOpen}
        handleClose={() => {
          setAddOrderOpen(false)
        }}
        onSuccess={() => setRefreshKey(k => k + 1)}
      />

      <ExportMonthlyDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        orders={data}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <DeleteConfirmationDialog
        open={bulkCancelDialogOpen}
        onClose={() => setBulkCancelDialogOpen(false)}
        onConfirm={handleBulkCancel}
        itemName={`${table.getSelectedRowModel().rows.length} selected orders`}
        itemType='Orders'
      />

      <ReceiptDialog
        open={receiptDialogOpen}
        onClose={() => {
          setReceiptDialogOpen(false)
          setReceiptOrder(null)
        }}
        orderNumber={receiptOrder?.id ?? null}
        items={(receiptOrder?.orderItems || receiptOrder?.items || []).map((item: any) => ({
          name: item.menuItemName || item.name,
          quantity: item.quantity,
          total: item.price * item.quantity
        }))}
        subtotal={Number((receiptOrder as any)?.subtotal || 0)}
        vatTotal={Number((receiptOrder as any)?.taxAmount || 0)}
        total={Number(receiptOrder?.totalAmount || 0)}
        grandTotal={Number(receiptOrder?.totalAmount || 0)}
        discountAmount={Number((receiptOrder as any)?.discountAmount || 0)}
        readOnly
        paymentMethod={(receiptOrder as any)?.paymentMethod || 'cash'}
        orderType={(receiptOrder as any)?.orderType || 'pos'}
        terminalId={(receiptOrder as any)?.terminalId ?? undefined}
        receiptNumber={receiptOrder?.id ? String(receiptOrder.id).padStart(6, '0') : undefined}
        customerName={receiptOrder?.customerName || ''}
        createdAt={(receiptOrder as any)?.createdAt || null}
      />
    </>
  )
}

export default OrderListTable
