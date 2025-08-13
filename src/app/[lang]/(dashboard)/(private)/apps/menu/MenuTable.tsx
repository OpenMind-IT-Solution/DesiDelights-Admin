'use client'

import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import type { TextFieldProps } from '@mui/material/TextField'
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

import type { MenuItem as MenuItemType } from '@/types/apps/menuTypes'
import type { ThemeColor } from '@core/types'

import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'
import AddMenuItemDrawer from './AddMenuItemDrawer'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'

type MenuItemWithAction = MenuItemType & { action?: string }
type StatusType = { [key: string]: ThemeColor }

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })
  
return itemRank.passed
}

const DebouncedInput = (
  props: {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
  } & Omit<TextFieldProps, 'onChange'>
) => {
  const { value: initialValue, onChange, debounce = 500, ...rest } = props
  const [value, setValue] = useState(initialValue)

  useEffect(() => setValue(initialValue), [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)

    
return () => clearTimeout(timeout)
  }, [value, onChange, debounce])
  
return <CustomTextField {...rest} value={value} onChange={e => setValue(e.target.value)} />
}

const statusObj: StatusType = {
  true: 'success',
  false: 'secondary'
}

const columnHelper = createColumnHelper<MenuItemWithAction>()

const MenuTable = ({ tableData }: { tableData?: MenuItemType[] }) => {
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [editItemOpen, setEditItemOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(tableData ?? [])
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItemType | null>(null)

  useEffect(() => setData(tableData ?? []), [tableData])

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setData(prev => prev.filter(item => item.id !== itemToDelete.id))
    }

    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const columns = useMemo<ColumnDef<MenuItemWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
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
      columnHelper.accessor('menuImages', {
        header: 'Image',
        enableSorting: false,
        cell: ({ row }) => {
          const imageUrl = row.original.menuImages?.[0]

          
return imageUrl ? (
            <Image
              src={imageUrl}
              alt={row.original.name}
              width={50}
              height={50}
              style={{ borderRadius: '8px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 50,
                height: 50,
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className='tabler-photo-off' style={{ color: '#888' }} />
            </div>
          )
        }
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary' className='font-medium'>
              {row.original.name}
            </Typography>
            <Typography variant='body2'>{row.original.tag}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: ({ row }) => {
          const originalPrice = row.original.price
          const offerPercentage = parseFloat(row.original.offer || '0')

          // If there is no valid offer, just show the original price
          if (offerPercentage <= 0) {
            return <Typography>₹{originalPrice}</Typography>
          }

          // Calculate the discounted price
          const finalPrice = Math.round(originalPrice * (1 - offerPercentage / 100))

          return (
            <div className='flex items-center gap-3'>
              {/* Container for the original price and the cross line */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {/* The original price text, with muted color */}
                <Typography component='span' color='text.secondary'>
                  ₹{originalPrice}
                </Typography>

                {/* The visual "cross line" element */}
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '-5%', 
                    width: '110%', 
                    height: '1.5px', 
                    backgroundColor: 'red', 
                    transform: 'rotate(-15deg)' 
                  }}
                />
              </div>

              <Typography component='span' color='text.primary' className='font-medium'>
                ₹{finalPrice}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.status ? 'Active' : 'Inactive'}
            size='small'
            color={statusObj[String(row.original.status)]}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('offer', {
        header: 'Offer',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={`${row.original.offer}%`}
            size='small'
            color={'warning'}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton
              onClick={() => {
                setSelectedItem(row.original)
                setEditItemOpen(true)
              }}
            >
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton
              onClick={() => {
                setItemToDelete(row.original)
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
    []
  )

  const table = useReactTable({
    data,
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
              placeholder='Search Menu'
              className='max-sm:is-full'
            />
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddItemOpen(!addItemOpen)}
              className='max-sm:is-full'
            >
              Add New Item
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
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
      <AddMenuItemDrawer
        open={addItemOpen || editItemOpen}
        handleClose={() => {
          setAddItemOpen(false)
          setEditItemOpen(false)
          setSelectedItem(null)
        }}
        menuData={data}
        setData={setData}
        itemToEdit={selectedItem}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name}
        itemType='Menu Item'
      />
    </>
  )
}

export default MenuTable
