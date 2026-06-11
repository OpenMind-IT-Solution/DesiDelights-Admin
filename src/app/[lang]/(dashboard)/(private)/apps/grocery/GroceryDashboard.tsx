'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

// MUI Imports
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import type { TextFieldProps } from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { rankItem, type RankingInfo } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type SortingState
} from '@tanstack/react-table'
import classnames from 'classnames'
import { toast } from 'react-toastify'

// Types and Data
import type { GroceryItem, GroceryStockStatus } from '@/types/apps/groceryTypes'
import type { ThemeColor } from '@core/types'

// Services
import { post, del } from '@/services/apiService'
import { groceryEndpoints } from '@/services/endpoints/grocery'

// Custom Components
import CustomTextField from '@/@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import GroceryFormDrawer from './GroceryFormDrawer'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type GroceryItemWithAction = GroceryItem & {
  action?: string
}

const StatCard = ({
  title,
  value,
  icon,
  color = 'primary',
  isSelected,
  onClick
}: {
  title: string
  value: number
  icon: string
  color?: 'primary' | 'success' | 'warning' | 'error'
  isSelected: boolean
  onClick: () => void
}) => (
  <Card
    onClick={onClick}
    sx={{
      border: 2,
      borderColor: isSelected ? `${color}.main` : 'transparent',
      cursor: 'pointer',
      transition: 'border-color 0.3s'
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant='h5'>{value}</Typography>
          <Typography color='text.secondary'>{title}</Typography>
        </Box>
        <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: `rgba(var(--mui-palette-${color}-mainChannel) / 0.1)` }}>
          <i className={`${icon} text-3xl text-${color}`} />
        </Box>
      </Box>
    </CardContent>
  </Card>
)

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

const mapApiRowToGrocery = (row: any): GroceryItem => ({
  id: row.id,
  name: row.itemName,
  description: row.description ?? null,
  type: row.type,
  store_id: row.storeId,
  store_name: row.store?.storeName ?? row.storeName ?? null,
  location: row.store?.location ?? row.storeLocation ?? null,
  priority: row.priority ?? null,
  stock_quantity: row.quantity,
  item_lower_value: row.itemLowerValue,
  stock_status: row.status as GroceryStockStatus
})

const GroceryDashboard = () => {
  const [data, setData] = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [filterStatus, setFilterStatus] = useState<GroceryStockStatus | ''>('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<GroceryItem | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(globalFilter), 500)

    return () => clearTimeout(t)
  }, [globalFilter])

  const fetchGroceries = useCallback(async () => {
    setLoading(true)

    try {
      const body = {
        search: debouncedSearch,
        status: filterStatus ? [filterStatus] : [],
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      }

      const res: any = await post(groceryEndpoints.getGroceries, body)
      const rows: GroceryItem[] = (res?.data?.groceries || []).map(mapApiRowToGrocery)

      setData(rows)
      setTotalRows(res?.data?.total ?? rows.length)
    } catch (err: any) {
      console.error(err)
      setData([])
      setTotalRows(0)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterStatus, pagination.pageIndex, pagination.pageSize])

  useEffect(() => {
    fetchGroceries()
  }, [fetchGroceries])

  const stats = useMemo(
    () => ({
      total: totalRows,
      inStock: data.filter(i => i.stock_status === 'In Stock').length,
      lowStock: data.filter(i => i.stock_status === 'Low Stock').length,
      outOfStock: data.filter(i => i.stock_status === 'Out of Stock').length
    }),
    [data, totalRows]
  )

  const handleOpenDrawer = (item: GroceryItem | null) => {
    setEditingItem(item)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setEditingItem(null)
    setIsDrawerOpen(false)
  }

  const handleSaveItem = async (formItem: GroceryItem) => {
    const isEdit = !!editingItem
    const body = {
      groceryId: isEdit ? editingItem!.id : 0,
      restaurantId: [1],
      itemName: formItem.name,
      description: formItem.description ?? '',
      quantity: Number(formItem.stock_quantity),
      type: formItem.type,
      storeId: Number(formItem.store_id),
      priority: Number(formItem.priority ?? 5),
      itemLowerValue: Number(formItem.item_lower_value)
    }

    try {
      const res: any = await post(groceryEndpoints.saveGrocery, body)

      if (res?.status === 'success') {
        toast.success(res.message || `Grocery ${isEdit ? 'updated' : 'created'} successfully`)
        handleCloseDrawer()
        await fetchGroceries()
      } else {
        toast.error(res?.message || 'Failed to save grocery item')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to save grocery item')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return

    try {
      const res: any = await del(groceryEndpoints.deleteGrocery(deletingItem.id))

      if (res?.status === 'success') {
        toast.success(res.message || 'Grocery item deleted successfully')
        setDeletingItem(null)
        await fetchGroceries()
      } else {
        toast.error(res?.message || 'Failed to delete grocery item')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to delete grocery item')
    }
  }

  const handleExportSelected = (itemsToExport: GroceryItemWithAction[]) => {
    if (itemsToExport.length === 0) return
    const headers = ['id', 'name', 'stock_quantity', 'stock_status', 'type', 'store_name', 'location']

    const escapeCSV = (value: unknown): string => {
      if (value == null) return ''

      return `"${String(value).replace(/"/g, '""')}"`
    }

    const rows = itemsToExport.map(item =>
      headers.map(header => escapeCSV(item[header as keyof GroceryItemWithAction]))
    )

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'grocery-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const columnHelper = createColumnHelper<GroceryItemWithAction>()

  const columns = useMemo<ColumnDef<GroceryItemWithAction, any>[]>(
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
      columnHelper.accessor('name', { header: 'Item Name', cell: info => info.getValue() }),
      columnHelper.accessor('stock_status', {
        header: 'Status',
        cell: info => {
          const status = info.getValue() as GroceryStockStatus

          const stockStatusColors: Record<GroceryStockStatus, ThemeColor> = {
            'In Stock': 'success',
            'Low Stock': 'warning',
            'Out of Stock': 'error'
          }

          return <Chip label={status} color={stockStatusColors[status]} size='small' />
        }
      }),
      columnHelper.accessor('stock_quantity', { header: 'Quantity', cell: info => info.getValue() }),
      columnHelper.accessor('type', { header: 'Type', cell: info => info.getValue() }),
      columnHelper.accessor('store_name', { header: 'Store', cell: info => info.getValue() || 'N/A' }),
      columnHelper.accessor('location', { header: 'Location', cell: info => info.getValue() || 'N/A' }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title='Edit Item'>
              <IconButton size='small' onClick={() => handleOpenDrawer(row.original)}>
                <i className='tabler-edit' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete Item'>
              <IconButton size='small' color='error' onClick={() => setDeletingItem(row.original)}>
                <i className='tabler-trash' />
              </IconButton>
            </Tooltip>
          </Box>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    autoResetPageIndex: false,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, sorting, globalFilter, pagination },
    pageCount: Math.max(1, Math.ceil(totalRows / pagination.pageSize)),
    manualPagination: true,
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Out of Stock'
            value={stats.outOfStock}
            icon='tabler-circle-x'
            color='error'
            isSelected={filterStatus === 'Out of Stock'}
            onClick={() => setFilterStatus(filterStatus === 'Out of Stock' ? '' : 'Out of Stock')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Low Stock'
            value={stats.lowStock}
            icon='tabler-alert-circle'
            color='warning'
            isSelected={filterStatus === 'Low Stock'}
            onClick={() => setFilterStatus(filterStatus === 'Low Stock' ? '' : 'Low Stock')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='In Stock'
            value={stats.inStock}
            icon='tabler-circle-check'
            color='success'
            isSelected={filterStatus === 'In Stock'}
            onClick={() => setFilterStatus(filterStatus === 'In Stock' ? '' : 'In Stock')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title='Total Items'
            value={stats.total}
            icon='tabler-fridge'
            color='primary'
            isSelected={filterStatus === ''}
            onClick={() => setFilterStatus('')}
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Typography>Show</Typography>
            <CustomTextField
              select
              value={pagination.pageSize}
              onChange={e => setPagination(p => ({ ...p, pageIndex: 0, pageSize: Number(e.target.value) }))}
              sx={{ width: 80 }}
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search'
            />
            <Button
              variant='tonal'
              color='secondary'
              startIcon={<i className='tabler-upload' />}
              onClick={() => handleExportSelected(table.getSelectedRowModel().rows.map(row => row.original))}
              disabled={table.getSelectedRowModel().rows.length === 0}
            >
              Export
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => handleOpenDrawer(null)}
            >
              Add Item
            </Button>
          </Box>
        </CardContent>

        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell key={header.id} colSpan={header.colSpan}>
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
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            {loading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress size={28} />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} className={classnames({ [tableStyles.selected]: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            )}
          </table>
        </div>

        <TablePaginationComponent table={table} />
      </Card>

      <GroceryFormDrawer open={isDrawerOpen} onClose={handleCloseDrawer} onSave={handleSaveItem} item={editingItem} />
      <DeleteConfirmationDialog
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingItem?.name}
        itemType='Grocery Item'
      />
    </Box>
  )
}

export default GroceryDashboard
