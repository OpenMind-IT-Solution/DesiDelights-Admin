'use client'

import { useMemo, useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import { CardHeader, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type FilterFn
} from '@tanstack/react-table'
import { rankItem, type RankingInfo } from '@tanstack/match-sorter-utils'
import classnames from 'classnames'

// Types and Data
import type { GroceryItem } from '@/types/apps/groceryTypes'
import { db } from '@/fake-db/apps/grocery'
import type { ThemeColor } from '@core/types'

// Custom Components
import CustomTextField from '@/@core/components/mui/TextField'
import GroceryFormDrawer from './GroceryFormDrawer'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import TablePaginationComponent from '@/components/TablePaginationComponent'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Extend Tanstack Table interfaces
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

// A reusable Stat Card for the top of the dashboard
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

// FUZZY FILTER FUNCTION for smart searching
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// DEBOUNCED INPUT COMPONENT
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

const GroceryDashboard = () => {
  // State Management
  const [data, setData] = useState<GroceryItem[]>(db.groceryItems)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [filterStatus, setFilterStatus] = useState<GroceryItem['stock_status'] | ''>('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<GroceryItem | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  // Memoized calculations
  const stats = useMemo(
    () => ({
      total: data.length,
      inStock: data.filter(i => i.stock_status === 'In Stock').length,
      lowStock: data.filter(i => i.stock_status === 'Low Stock').length,
      outOfStock: data.filter(i => i.stock_status === 'Out of Stock').length
    }),
    [data]
  )

  const filteredData = useMemo(() => {
    return data.filter(item => (filterStatus ? item.stock_status === filterStatus : true))
  }, [data, filterStatus])

  // Handlers
  const handleOpenDrawer = (item: GroceryItem | null) => {
    setEditingItem(item)
    setIsDrawerOpen(true)
  }
  const handleCloseDrawer = () => {
    setEditingItem(null)
    setIsDrawerOpen(false)
  }

  const handleSaveItem = (itemData: GroceryItem) => {
    if (editingItem) {
      setData(data.map(i => (i.id === itemData.id ? { ...itemData, updated_at: new Date().toISOString() } : i)))
    } else {
      setData([
        {
          ...itemData,
          id: (data.length > 0 ? Math.max(...data.map(i => i.id)) : 0) + 1,
          created_at: new Date().toISOString()
        },
        ...data
      ])
    }
    handleCloseDrawer()
  }

  const handleDeleteConfirm = () => {
    if (deletingItem) {
      setData(data.filter(i => i.id !== deletingItem.id))
      setDeletingItem(null)
    }
  }

  const handleExportSelected = (itemsToExport: GroceryItemWithAction[]) => {
    if (itemsToExport.length === 0) return
    const headers = ['id', 'name', 'stock_quantity', 'unit', 'stock_status', 'type', 'store_name', 'location']
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

  // Column Definitions
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
          const status = info.getValue() as GroceryItem['stock_status']
          const stockStatusColors: Record<GroceryItem['stock_status'], ThemeColor> = {
            'In Stock': 'success',
            'Low Stock': 'warning',
            'Out of Stock': 'error'
          }
          return <Chip label={status} color={stockStatusColors[status]} size='small' />
        }
      }),
      columnHelper.accessor('stock_quantity', {
        header: 'Quantity',
        cell: info => `${info.getValue()} ${info.row.original.unit}`
      }),
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
    data: filteredData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, sorting, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
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
      {/* Stat Cards Section */}
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

      {/* Table Card */}
      <Card>
        <CardContent
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Typography>Show</Typography>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
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
            {table.getFilteredRowModel().rows.length === 0 ? (
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
