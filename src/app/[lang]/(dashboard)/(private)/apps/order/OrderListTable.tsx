'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
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

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const { lang: locale } = useParams()

  useEffect(() => {
    setFilteredData(data)
  }, [data])

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

        setData(res.data.orders)
        setFilteredData(res.data.orders)
        setTotalRows(res.data.total)
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

  const handleDownloadSelected = (ordersToExport: OrderTypeWithAction[]) => {
    if (ordersToExport.length === 0) return
    const headers = Object.keys(ordersToExport[0])

    const escapeCSV = (value: unknown): string => {
      if (value == null) return ''
      const str = String(value)

      
return `"${str.replace(/"/g, '""')}"`
    }

    const rows = ordersToExport.map(order =>
      headers.map(header => escapeCSV(order[header as keyof OrderTypeWithAction]))
    )

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'orders-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

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
            {/* <CustomTextField
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
            </CustomTextField> */}
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

      <Dialog
        open={receiptDialogOpen}
        onClose={() => {
          setReceiptDialogOpen(false)
          setReceiptOrder(null)
        }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Receipt #{receiptOrder?.id}</DialogTitle>
        <DialogContent>
          {receiptOrder?.receiptImage ? (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={receiptOrder.receiptImage}
                alt={`Receipt #${receiptOrder.id}`}
                style={{ width: '100%', maxWidth: 320 }}
              />
            </Box>
          ) : (
            <Box sx={{ fontFamily: 'monospace', fontSize: 13, maxWidth: 320, mx: 'auto' }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
                  DESI DELIGHTS
                </Typography>
                <Typography variant='caption'>Quick Bites, Happy Vibes</Typography>
              </Box>
              <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
              <Box sx={{ mb: 1 }}>
                <Typography variant='caption' display='block'>Order #{receiptOrder?.id}</Typography>
                <Typography variant='caption' display='block'>
                  {receiptOrder?.createdAt
                    ? new Date(receiptOrder.createdAt).toLocaleDateString() + ' ' + new Date(receiptOrder.createdAt).toLocaleTimeString()
                    : '-'}
                </Typography>
                {receiptOrder?.customerName && (
                  <Typography variant='caption' display='block'>Customer: {receiptOrder.customerName}</Typography>
                )}
                {receiptOrder?.paymentMethod && (
                  <Typography variant='caption' display='block' className='capitalize'>Paid via: {receiptOrder.paymentMethod}</Typography>
                )}
              </Box>
              <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
              <Box sx={{ display: 'flex', fontWeight: 'bold', borderBottom: '1px dashed #999', py: 0.5, fontSize: 11 }}>
                <Box sx={{ width: 20 }}>#</Box>
                <Box sx={{ flex: 1 }}>Item</Box>
                <Box sx={{ width: 60, textAlign: 'right' }}>Price</Box>
              </Box>
              {(receiptOrder?.orderItems || receiptOrder?.items || []).map((item: any, i: number) => (
                <Box key={item.id || i} sx={{ display: 'flex', py: 0.5, fontSize: 11 }}>
                  <Box sx={{ width: 20 }}>{i + 1}</Box>
                  <Box sx={{ flex: 1 }}>{item.menuItemName || item.name} x{item.quantity}</Box>
                  <Box sx={{ width: 60, textAlign: 'right' }}>€{(item.price * item.quantity).toFixed(2)}</Box>
                </Box>
              ))}
              <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
              <Box sx={{ textAlign: 'right', fontSize: 12 }}>
                <Typography variant='caption' display='block'>
                  Subtotal: €{Number((receiptOrder as any)?.subtotal || 0).toFixed(2)}
                </Typography>
                {Number((receiptOrder as any)?.taxAmount) > 0 && (
                  <Typography variant='caption' display='block'>
                    VAT: €{Number((receiptOrder as any).taxAmount).toFixed(2)}
                  </Typography>
                )}
                <Typography variant='subtitle2' display='block'>
                  Total: €{Number(receiptOrder?.totalAmount || 0).toFixed(2)}
                </Typography>
                {Number((receiptOrder as any)?.discountAmount) > 0 && (
                  <>
                    <Typography variant='caption' display='block' color='success.main'>
                      Discount: -€{Number((receiptOrder as any).discountAmount).toFixed(2)}
                    </Typography>
                    <Typography variant='subtitle2' display='block'>
                      Grand Total: €{Math.max(0, Number(receiptOrder?.totalAmount || 0) - Number((receiptOrder as any).discountAmount || 0)).toFixed(2)}
                    </Typography>
                  </>
                )}
              </Box>
              <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
              <Typography variant='caption' display='block' sx={{ textAlign: 'center', mt: 1 }}>
                Thank you for your order!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            startIcon={<i className='tabler-printer' />}
            onClick={() => {
              const w = window.open('', '_blank')

              if (!w || !receiptOrder) return
              const o = receiptOrder
              const items = o.orderItems || o.items || []
              const subtotal = Number((o as any).subtotal || 0)
              const taxAmount = Number((o as any).taxAmount || 0)
              const discountAmount = Number((o as any).discountAmount || 0)
              const totalAmount = Number(o.totalAmount || 0)

              const dateStr = o.createdAt
                ? new Date(o.createdAt).toLocaleDateString() + ' ' + new Date(o.createdAt).toLocaleTimeString()
                : '-'

              if (o.receiptImage) {
                w.document.write(`<!DOCTYPE html><html><head><style>
                  @page { size: 80mm 297mm; margin: 0; }
                  *{margin:0;padding:0;box-sizing:border-box}
                  body{font-family:Arial,sans-serif;background:#f5f5f5}
                  .receipt-wrapper{padding-top:30px;display:flex;flex-direction:column;align-items:center}
                  .receipt-img{width:80mm;height:auto;display:block;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
                  .actions{margin-top:20px;display:flex;gap:12px;padding-bottom:40px}
                  .actions button{padding:10px 24px;border:none;border-radius:6px;font-size:14px;cursor:pointer;font-weight:600}
                  .btn-print{background:#1976d2;color:#fff}
                  @media print{.actions{display:none!important}}
                </style></head><body>
                <div class="receipt-wrapper">
                  <img class="receipt-img" src="${o.receiptImage}" />
                  <div class="actions">
                    <button class="btn-print" onclick="window.print()">Print</button>
                  </div>
                </div>
                </body></html>`)
              } else {
                w.document.write(`<!DOCTYPE html><html><head><style>
                  @page { size: 80mm 297mm; margin: 0; }
                  *{margin:0;padding:0;box-sizing:border-box}
                  body{font-family:'Courier New',monospace;font-size:12px;color:#000;background:#fff;padding:20px;width:80mm}
                  .header{text-align:center;margin-bottom:10px}
                  .header h2{margin:0;letter-spacing:2px;font-size:16px}
                  .header p{margin:2px 0;font-size:10px;color:#555}
                  hr{border:none;border-top:1px dashed #999;margin:8px 0}
                  .info{font-size:11px;margin:4px 0}
                  table{width:100%;font-size:10px;border-collapse:collapse}
                  th{border-bottom:1px dashed #999;padding:4px 0;text-align:left}
                  td{padding:3px 0;vertical-align:top}
                  .amount{text-align:right}
                  .totals{text-align:right;font-size:11px;margin-top:4px}
                  .totals p{margin:2px 0}
                  .footer{text-align:center;margin-top:10px;font-size:10px}
                  @media print{body{padding:0}button{display:none!important}}
                </style></head><body>
                  <div class="header">
                    <h2>DESI DELIGHTS</h2>
                    <p>Quick Bites, Happy Vibes</p>
                  </div>
                  <hr />
                  <div class="info">Order #${o.id}</div>
                  <div class="info">${dateStr}</div>
                  ${o.customerName ? `<div class="info">Customer: ${o.customerName}</div>` : ''}
                  ${(o as any).paymentMethod ? `<div class="info">Paid via: ${(o as any).paymentMethod}</div>` : ''}
                  <hr />
                  <table>
                    <tr><th style="width:20px">#</th><th>Item</th><th class="amount" style="width:70px">Amount</th></tr>
                    ${items.map((item: any, i: number) => `
                      <tr>
                        <td>${i + 1}</td>
                        <td>${item.menuItemName || item.name} x${item.quantity}</td>
                        <td class="amount">€${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </table>
                  <hr />
                  <div class="totals">
                    <p>Net total: <strong>€${subtotal.toFixed(2)}</strong></p>
                    ${taxAmount > 0 ? `<p>VAT: €${taxAmount.toFixed(2)}</p>` : ''}
                    <p style="font-size:14px">Total: <strong>€${totalAmount.toFixed(2)}</strong></p>
                    ${discountAmount > 0 ? `
                      <p style="color:green">Discount: -€${discountAmount.toFixed(2)}</p>
                      <p style="font-size:14px">Grand Total: <strong>€${Math.max(0, totalAmount - discountAmount).toFixed(2)}</strong></p>
                    ` : ''}
                  </div>
                  <hr />
                  <div class="footer">Thank you for your order!</div>
                  <div style="text-align:center;margin-top:20px"><button onclick="window.print()" style="padding:8px 20px;background:#1976d2;color:#fff;border:none;border-radius:4px;font-size:13px;cursor:pointer">Print</button></div>
                </body></html>`)
              }

              w.document.close()
            }}
          >
            Print
          </Button>
          <Button
            variant='tonal'
            onClick={() => {
              setReceiptDialogOpen(false)
              setReceiptOrder(null)
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default OrderListTable
