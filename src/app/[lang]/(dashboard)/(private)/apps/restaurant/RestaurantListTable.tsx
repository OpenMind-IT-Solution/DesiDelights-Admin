'use client'

// React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// MUI Imports
import { Chip, CircularProgress } from '@mui/material'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
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
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import classnames from 'classnames'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import type { ThemeColor } from '@/@core/types'
import type { RestaurantTypes } from '@/types/apps/restaurantTypes'
import tableStyles from '@core/styles/table.module.css'

// Local Component Imports
import AddRestaurantDrawer from './AddRestaurantDrawer'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'

// API Imports
// ❗ Adjust import paths if they differ in your project
import { get, post, del } from '@/services/apiService'
import { restaurantEndpoints } from '@/services/endpoints/restaurant'
import { useSession } from 'next-auth/react'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type RestaurantTypeWithAction = RestaurantTypes & {
  action?: string
}

type RestaurantStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

// Fuzzy Filter Function
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

// Debounced Input Component
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
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions Helper
const columnHelper = createColumnHelper<RestaurantTypeWithAction>()

const RestaurantListTable = () => {
  const { data: session } = useSession()
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false)
  const [editRestaurantOpen, setEditRestaurantOpen] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantTypeWithAction | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<RestaurantTypes[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<RestaurantTypes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalRows, setTotalRows] = useState(0)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  // Fetch all restaurants
  const getRestaurants = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError(null)
    try {
      const res: any = await post(restaurantEndpoints.getRestaurant, {
        search: globalFilter,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        status: []
      })

      const restaurantData =
        res?.data?.restaurants?.map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          address: r.address,
          phoneNumber: r.phoneNumber,
          description: r.description,
          status: r.status ? 'active' : 'inactive'
        })) || []

      setData(restaurantData)
      setTotalRows(res?.data?.total || 0)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to fetch restaurants')
      setData([])
      setTotalRows(0)
    } finally {
      setLoading(false)
    }
  }, [globalFilter, pagination, session])

  useEffect(() => {
    if (session) {
      getRestaurants()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, globalFilter, pagination.pageIndex, pagination.pageSize])

  const handleEditClick = async (restaurant: RestaurantTypeWithAction) => {
    setLoading(true)
    try {
      const endpoint = restaurantEndpoints.getRestaurantById(restaurant.id)
      const result: any = await get(endpoint)

      if (result.status === 'success') {
        const fetchedRestaurant = result.data

        const mappedRestaurantData = {
          ...fetchedRestaurant,
          status: fetchedRestaurant.status ? 'active' : 'inactive'
        }

        setSelectedRestaurant(mappedRestaurantData)
        setEditRestaurantOpen(true)
      } else {
        console.error(result?.message || 'Failed to fetch restaurant details.')
        // Optionally add a toast error message here
      }
    } catch (error: any) {
      console.error(error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // CSV Export
  const handleDownloadSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
    const allRows = table.getCoreRowModel().rows.map(row => row.original)
    const restaurantsToExport = selectedRows.length > 0 ? selectedRows : allRows

    if (restaurantsToExport.length === 0) return

    const headers = ['ID', 'Name', 'Email', 'Status', 'Contact']
    const csvData = restaurantsToExport.map(r => [r.id, r.name, r.email, r.status, r.phoneNumber])

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'Restaurants-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Delete Confirmation
  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        const endpoint = restaurantEndpoints.deleteRestaurant(itemToDelete.id)
        const result: any = await del(endpoint)

        if (result.status === 'success') {
          console.log(result?.Message || 'Restaurant deleted successfully.')
          await getRestaurants() // Refresh the data grid
        } else {
          // Optionally add an error toast, e.g., toast.error(result.message)
          console.error(result?.message || 'Failed to delete restaurant.')
        }
      } catch (err) {
        console.error('Failed to delete restaurant', err)
        // Optionally add a generic error toast
      }
    }

    // Close the dialog and reset the state
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const restaurantStatusObj: RestaurantStatusType = {
    active: 'success',
    inactive: 'secondary'
  }

  // Column Definitions
  const columns = useMemo<ColumnDef<RestaurantTypeWithAction, any>[]>(
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
      columnHelper.accessor('name', {
        header: 'Restaurant Name',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.status}
            size='small'
            color={restaurantStatusObj[row.original.status]}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('phoneNumber', {
        header: 'Contact',
        cell: ({ row }) => <Typography>{row.original.phoneNumber}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditClick(row.original)}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton
              color='error'
              onClick={() => {
                setItemToDelete(row.original)
                setDeleteDialogOpen(true)
              }}
            >
              <i className='tabler-trash' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // React Table Instance
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    state: { pagination, globalFilter, rowSelection },
    onPaginationChange: setPagination,
    filterFns: { fuzzy: fuzzyFilter },
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: true,
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
              placeholder='Search Restaurant...'
              className='max-sm:is-full'
            />
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
              onClick={handleDownloadSelected}
            >
              Export
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddRestaurantOpen(true)}
              className='max-sm:is-full'
            >
              Add New Restaurant
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
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center text-red-500'>
                    {error}
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
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
      <AddRestaurantDrawer
        open={addRestaurantOpen || editRestaurantOpen}
        handleClose={() => {
          setAddRestaurantOpen(false)
          setEditRestaurantOpen(false)
          setSelectedRestaurant(null)
        }}
        onSuccess={getRestaurants}
        restaurantToEdit={selectedRestaurant}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name}
        itemType='Restaurant'
      />
    </>
  )
}

export default RestaurantListTable
