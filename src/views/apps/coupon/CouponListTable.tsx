'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
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

// Component Imports
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import { ThemeColor } from '@/@core/types'
import type { CouponProps } from '@/types/apps/couponTypes'
import tableStyles from '@core/styles/table.module.css'
import { Chip } from '@mui/material'

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
  // States
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

const CouponListTable = ({ tableData }: { tableData: CouponProps[] }) => {
  const [addCouponOpen, setAddCouponOpen] = useState(false)
  const [editCouponOpen, setEditCouponOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<CouponTypeWithAction | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<CouponProps[]>(tableData)
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CouponProps | null>(null)

  // Hooks
  const { lang: locale } = useParams()

  useEffect(() => {
    setFilteredData(data)
  }, [data])

  const handleDownloadSelected = (selectedCoupons: CouponTypeWithAction[], allCoupons: CouponTypeWithAction[]) => {
    const couponsToExport = selectedCoupons.length > 0 ? selectedCoupons : allCoupons
    if (couponsToExport.length === 0) return
    const headers = Object.keys(couponsToExport[0])
    const escapeCSV = (value: unknown): string => {
      if (value == null) return ''
      const str = String(value)
      return `"${str.replace(/"/g, '""')}"`
    }

    const rows = couponsToExport.map(coupon => headers.map(header => escapeCSV(coupon[header as keyof CouponTypeWithAction])))
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Coupon-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const couponStatusObj: CouponStatusType = {
    active: 'success',
    inactive: 'secondary',
    expired: 'error'
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setData((prev: CouponProps[] | undefined) =>
        (prev ?? []).filter((item: CouponProps) => item.id !== itemToDelete.id)
      )
    }

    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const columns = useMemo<ColumnDef<CouponTypeWithAction, any>[]>(
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
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('code', {
        header: 'Code',
        cell: ({ row }: { row: any }) => <span>{row.original.code}</span>
      }),
      columnHelper.accessor('discount', {
        header: 'Discount',
        cell: ({ row }: { row: any }) => <span>{row.original.discount}</span>
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: ({ row }: { row: any }) => <span>{row.original.type}</span>
      }),
      columnHelper.accessor('startDate', {
        header: 'Start Date',
        cell: ({ row }) => <span>{new Date(row.original.startDate).toLocaleDateString()}</span>
      }),
      columnHelper.accessor('endDate', {
        header: 'End Date',
        cell: ({ row }) => <span>{new Date(row.original.endDate).toLocaleDateString()}</span>
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }: { row: any }) => {
          const currentDate = new Date();
          const endDate = new Date(row.original.endDate);
          let status: 'active' | 'inactive' | 'expired';
          let label: string;
          if (endDate < currentDate) {
            status = 'expired';
            label = 'Expired';
          } else {
            status = row.original.isActive ? 'active' : 'inactive';
            label = row.original.isActive ? 'Active' : 'Inactive';
          }
          return (
            <Chip
              variant='tonal'
              label={label}
              size='small'
              className='capitalize'
              color={couponStatusObj[status]}
            />
          );
        }
      }),
      columnHelper.accessor('usageCount', {
        header: 'Usage Count',
        cell: ({ row }: { row: any }) => <span>{row.original.usageCount}</span>
      }),
      columnHelper.accessor('maxUsage', {
        header: 'Max Usage',
        cell: ({ row }: { row: any }) => <span>€{row.original.maxUsage}</span>
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }: { row: any }) => (
          <div className='flex items-center'>
            <IconButton
              onClick={() => {
                setSelectedCoupon(row.original)
                setEditCouponOpen(true)
              }}
            >
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
    [data, filteredData]
  )

  const table = useReactTable({
    data: filteredData as CouponProps[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
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
              placeholder='Search Coupon...'
              className='max-sm:is-full'
            />
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
              onClick={() => {
                const selectedRows = table.getSelectedRowModel().rows
                const selectedUsers = selectedRows.map(row => row.original)
                const allUsers = table.getFilteredRowModel().rows.map(row => row.original)

                handleDownloadSelected(selectedUsers, allUsers)
              }}
            >
              Export
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddCouponOpen(!addCouponOpen)}
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
                        <>
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
                        </>
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
                  .map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      {/* <AddCouponDrawer
        open={addCouponOpen || editCouponOpen}
        handleClose={() => {
          setAddCouponOpen(false)
          setEditCouponOpen(false)
          setSelectedCoupon(null)
        }}
        couponData={data}
        setData={setData}
        couponToEdit={selectedCoupon}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name}
        itemType='Coupon'
      /> */}
    </>
  )
}

export default CouponListTable
