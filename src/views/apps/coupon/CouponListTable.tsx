'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

import { Chip } from '@mui/material'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { ColumnDef, FilterFn, PaginationState } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import classnames from 'classnames'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

import type { ThemeColor } from '@/@core/types'
import type { CouponProps } from '@/types/apps/couponTypes'
import { del, get, post } from '@/services/apiService'
import { couponEndpoints } from '@/services/endpoints/coupon'
import DeleteConfirmationDialog from '@/app/[lang]/(dashboard)/(private)/apps/category/DeleteConfirmationDialog'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import AddCouponDrawer from './AddCouponDrawer'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type CouponTypeWithAction = CouponProps & {
  action?: string
}

type CouponStatusType = {
  [key: string]: ThemeColor
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<CouponTypeWithAction>()

const couponStatusObj: CouponStatusType = {
  active: 'success',
  inactive: 'secondary',
  expired: 'error'
}

const CouponListTable = () => {
  const { data: session } = useSession()

  const [addCouponOpen, setAddCouponOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<CouponProps | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<CouponProps[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CouponProps | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalRows, setTotalRows] = useState(0)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const getData = useCallback(
    async (options: { isExport?: boolean } = {}) => {
      if (!session) return
      setLoading(true)
      setError(null)
      const { isExport = false } = options

      try {
        const result: any = await post(couponEndpoints.getCoupons, {
          page: pagination.pageIndex + 1,
          limit: isExport ? 100000 : pagination.pageSize,
          search: globalFilter,
          restaurantId:
            typeof session?.user?.restaurantId === 'string'
              ? JSON.parse(session.user.restaurantId)
              : session?.user?.restaurantId || []
        })

        if (isExport) {
          handleDownload(result.data.coupons || [])
        } else {
          setData(result.data.coupons || [])
          setTotalRows(result.data.total ?? 0)
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch data')
        setData([])
        setTotalRows(0)
      } finally {
        setLoading(false)
      }
    },
    [pagination, globalFilter, session]
  )

  useEffect(() => {
    if (session) {
      getData()
    }
  }, [getData, session])

  const handleEditClick = async (coupon: CouponProps) => {
    setLoading(true)

    try {
      const result = await get(couponEndpoints.getCouponById(coupon.id))

      if (result.status === 'success') {
        setSelectedCoupon(result.data)
        setAddCouponOpen(true)
      } else {
        toast.error(result?.message || 'Failed to fetch coupon details.')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch coupon details.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        const result = await del(couponEndpoints.deleteCoupon(itemToDelete.id))

        if (result.ResponseStatus === 'success' || result.status === 'success') {
          toast.success(result?.message || 'Coupon deleted successfully.')
          await getData()
        } else {
          toast.error(result?.message || 'Failed to delete coupon.')
        }
      } catch (err) {
        console.error('Failed to delete coupon', err)
      }
    }

    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleBulkDelete = async () => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id)

    try {
      const result = await post(couponEndpoints.bulkDeleteCoupon, { ids: selectedIds }) as { status: string; message?: string }

      if (result.status === 'success') {
        toast.success(result?.message || 'Coupons deleted successfully.')
        setRowSelection({})
        await getData()
      } else {
        toast.error(result?.message || 'Failed to delete coupons.')
      }
    } catch (err) {
      console.error('Failed to bulk delete coupons', err)
      toast.error('Failed to delete coupons.')
    }

    setBulkDeleteDialogOpen(false)
  }

  const handleDownload = (couponsToExport: CouponProps[]) => {
    if (!couponsToExport || couponsToExport.length === 0) return
    const headers = Object.keys(couponsToExport[0])

    const escapeCSV = (value: unknown): string => {
      if (value == null) return ''
      const str = String(value)

      return `"${str.replace(/"/g, '""')}"`
    }

    const rows = couponsToExport.map(coupon =>
      headers.map(header => escapeCSV(coupon[header as keyof CouponProps]))
    )

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'Coupon-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const columns = useMemo<ColumnDef<CouponTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('code', {
        header: 'Code',
        cell: ({ row }) => <span>{row.original.code}</span>
      }),
      columnHelper.accessor('discount', {
        header: 'Discount',
        cell: ({ row }) => <span>{row.original.discount}</span>
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: ({ row }) => <span className='capitalize'>{row.original.type}</span>
      }),
      columnHelper.accessor('startDate', {
        header: 'Start Date',
        cell: ({ row }) => <span>{new Date(row.original.startDate).toLocaleDateString()}</span>
      }),
      columnHelper.accessor('endDate', {
        header: 'End Date',
        cell: ({ row }) => <span>{new Date(row.original.endDate).toLocaleDateString()}</span>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const currentDate = new Date()
          const endDate = new Date(row.original.endDate)
          let statusKey: 'active' | 'inactive' | 'expired'
          let label: string

          if (endDate < currentDate) {
            statusKey = 'expired'
            label = 'Expired'
          } else {
            statusKey = row.original.status ? 'active' : 'inactive'
            label = row.original.status ? 'Active' : 'Inactive'
          }

          return (
            <Chip variant='tonal' label={label} size='small' className='capitalize' color={couponStatusObj[statusKey]} />
          )
        }
      }),
      columnHelper.accessor('usageCount', {
        header: 'Usage Count',
        cell: ({ row }) => <span>{row.original.usageCount}</span>
      }),
      columnHelper.accessor('maxUsage', {
        header: 'Max Usage',
        cell: ({ row }) => <span>{row.original.maxUsage}</span>
      }),
      columnHelper.accessor('isCustomerEligible', {
        header: 'Applies To',
        cell: ({ row }) => {
          const customer = row.original.isCustomerEligible !== false
          const admin = row.original.isAdminEligible !== false
          const label = customer && admin ? 'Customer + Admin' : customer ? 'Customer' : admin ? 'Admin / POS' : 'None'

          return <Chip variant='tonal' label={label} size='small' color={customer || admin ? 'primary' : 'secondary'} />
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditClick(row.original)}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton
              onClick={() => {
                setItemToDelete(row.original)
                setDeleteDialogOpen(true)
              }}
            >
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter, pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
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
              placeholder='Search Coupon...'
              className='max-sm:is-full'
            />
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
              onClick={() => getData({ isExport: true })}
            >
              Export
            </Button>
            {table.getSelectedRowModel().rows.length > 0 && (
              <Button
                variant='outlined'
                color='error'
                startIcon={<i className='tabler-trash' />}
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                Delete Selected ({table.getSelectedRowModel().rows.length})
              </Button>
            )}
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddCouponOpen(true)}
              className='max-sm:is-full'
            >
              Add New Coupon
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
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center p-4'>
                    <CircularProgress />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center text-red-500 p-4'>
                    {error}
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center p-4'>
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          component='div'
          count={totalRows}
          rowsPerPage={pagination.pageSize}
          page={pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      <AddCouponDrawer
        open={addCouponOpen}
        handleClose={() => {
          setAddCouponOpen(false)
          setSelectedCoupon(null)
        }}
        onSuccess={getData}
        couponToEdit={selectedCoupon}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.code}
        itemType='Coupon'
      />
      <DeleteConfirmationDialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        itemName={`${table.getSelectedRowModel().rows.length} selected items`}
        itemType='Coupons'
      />
    </>
  )
}

export default CouponListTable
