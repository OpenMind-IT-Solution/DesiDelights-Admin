'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'


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

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'
import type { RoleType } from './AddRoleDrawer' // Adjust the import path as needed
import type { ThemeColor } from '@core/types'

// Component Imports
import RoleDrawer from './AddRoleDrawer' // Adjust the import path as needed
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'


// Styled Components
const Icon = styled('i')({})

// Types and Objects for Role Display
type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

const userRoleObj: UserRoleType = {
  admin: { icon: 'tabler-crown', color: 'error' },
  author: { icon: 'tabler-device-desktop', color: 'warning' },
  editor: { icon: 'tabler-edit', color: 'info' },
  maintainer: { icon: 'tabler-chart-pie', color: 'success' },
  user: { icon: 'tabler-user', color: 'primary' }
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// This type alias is for internal table use
type RoleTypeWithAction = RoleType & {
  action?: string
}

// Maps role status to a color for the Chip component
const roleStatusObj: Record<RoleType['status'], ThemeColor> = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
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
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper<RoleTypeWithAction>()

const RolesTable = ({ tableData }: { tableData?: UsersType[] }) => {
  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<RoleType | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [roles, setRoles] = useState<RoleTypeWithAction[]>([])

  useEffect(() => {
    if (tableData) {
      // Get unique role names from the user data
      const uniqueRoles = [...new Set(tableData.map(user => user.role))]

      // Create the role data structure for the table
      const processedRoles: RoleTypeWithAction[] = uniqueRoles.map((roleName, index) => ({
        id: index + 1,
        roleName: roleName.charAt(0).toUpperCase() + roleName.slice(1),
        status: 'active', // Assign a default status
        // In a real application, permissions should be fetched from the backend for each role
        permissions: {
          dashboard: { all: false, view: true, create: false, edit: false, delete: false },
          users: { all: false, view: false, create: false, edit: false, delete: false },
          roles: { all: false, view: false, create: false, edit: false, delete: false }
        }
      }))
      setRoles(processedRoles)
    }
  }, [tableData])

  // Handlers
  const handleOpenDrawer = () => {
    setRoleToEdit(null)
    setIsDrawerOpen(true)
  }

  const handleEditRole = (role: RoleType) => {
    setRoleToEdit(role)
    setIsDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setRoleToEdit(null)
    setIsDrawerOpen(false)
  }

  const columns = useMemo<ColumnDef<RoleTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
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
      columnHelper.accessor('roleName', {
        header: 'Role',
        cell: ({ row }) => {
            // ✅ FIX: Convert roleName to lowercase for lookup and provide a fallback
            const roleKey = row.original.roleName.toLowerCase();
            const roleConfig = userRoleObj[roleKey] || { icon: 'tabler-user', color: 'secondary' };

            return (
                <div className='flex items-center gap-2'>
                  <Icon
                    className={roleConfig.icon}
                    sx={{ color: `var(--mui-palette-${roleConfig.color}-main)` }}
                  />
                  <Typography className='font-medium capitalize' color='text.primary'>
                    {row.original.roleName}
                  </Typography>
                </div>
            )
        }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status}
            color={roleStatusObj[row.original.status]}
            size='small'
            variant='tonal'
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditRole(row.original)}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton onClick={() => setRoles(prevRoles => prevRoles.filter(role => role.id !== row.original.id))}>
              <i className='tabler-trash text-error' />
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
    data: roles,
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
        <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
          <div className='flex items-center gap-2'>
            <Typography>Show</Typography>
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
          </div>
          <div className='flex gap-4 flex-col !items-start max-sm:is-full sm:flex-row sm:items-center'>
            <DebouncedInput
              value={globalFilter ?? ''}
              className='max-sm:is-full min-is-[250px]'
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Role'
            />
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              className='max-sm:is-full'
              onClick={handleOpenDrawer}
            >
              Add New Role
            </Button>
          </div>
        </CardContent>
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
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <RoleDrawer
        open={isDrawerOpen}
        handleClose={handleDrawerClose}
        roleData={roles}
        setData={setRoles as (data: RoleType[]) => void}
        roleToEdit={roleToEdit}
      />
    </>
  )
}

export default RolesTable
