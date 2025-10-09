'use client'

// React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'

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

// Type Imports
import type { ModulePermissions, RoleType } from './AddRoleDrawer'
import type { ThemeColor } from '@core/types'

// Component Imports
import RoleDrawer from './AddRoleDrawer'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Service Imports
import { get, post } from '@/services/apiService'
import { roleEndpoints } from '@/services/endpoints/role'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Styled Components
const Icon = styled('i')({})

// Table status color mapping
const roleStatusObj: Record<RoleType['status'], ThemeColor> = {
  active: 'success',
  inactive: 'secondary'
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
} & Omit<React.ComponentProps<typeof CustomTextField>, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Fuzzy filter for global search
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<RoleType>()

const RolesTable = () => {
  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<RoleType | null>(null)
  const [roles, setRoles] = useState<RoleType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [totalRows, setTotalRows] = useState(0)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const getRoles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res: any = await post(roleEndpoints.getRole, {
        search: globalFilter,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      })

      const roleData =
        res?.data?.roles?.map((r: any) => ({
          id: r.id,
          roleName: r.name,
          status: r.status ? 'active' : 'inactive'
        })) || []

      setRoles(roleData)
      setTotalRows(res?.data?.total || roleData.length || 0)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to fetch roles')
      setRoles([])
    } finally {
      setLoading(false)
    }
  }, [pagination, globalFilter])

  // Fetch roles when filters or pagination change
  useEffect(() => {
    getRoles()
  }, [getRoles])

  // Drawer Handlers
  const handleOpenDrawer = () => {
    setRoleToEdit(null)
    setIsDrawerOpen(true)
  }

  const handleEditRole = async (role: RoleType) => {
    setLoading(true)
    try {
      const endpoint = roleEndpoints.getRoleById(role.id)
      const result: any = await get(endpoint)

      if (result.status === 'success') {
        const r = result.data

        const permissionMap: ModulePermissions = {}
        r.permission.forEach((p: any) => {
          permissionMap[p.moduleName] = {
            all: p.view && p.create && p.edit && p.delete,
            view: p.view,
            create: p.create,
            edit: p.edit,
            delete: p.delete
          }
        })

        const roleDetails: RoleType = {
          id: r.id,
          roleName: r.name,
          status: r.status ? 'active' : 'inactive',
          permissions: permissionMap
        }

        setRoleToEdit(roleDetails)
        setIsDrawerOpen(true)
      } else {
        console.error(result.message || 'Failed to fetch role details')
      }
    } catch (error: any) {
      console.error(error)
      setError(error.message || 'Failed to load role details')
    } finally {
      setLoading(false)
    }
  }

  const handleDrawerClose = () => {
    setRoleToEdit(null)
    setIsDrawerOpen(false)
  }

  const columns = useMemo<ColumnDef<RoleType, any>[]>(
    () => [
      columnHelper.accessor('roleName', {
        header: 'Role Name',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium capitalize'>
            {row.original.roleName}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.status || 'inactive'}
            color={roleStatusObj[row.original.status] || 'secondary'}
            size='small'
            variant='tonal'
            className='capitalize'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleEditRole(row.original)}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton color='error'>
              <i className='tabler-trash' />
            </IconButton>
          </div>
        )
      })
    ],
    []
  )

  // Table Instance
  const table = useReactTable({
    data: roles,
    columns,
    state: { rowSelection, globalFilter, pagination },
    onPaginationChange: setPagination,
    filterFns: { fuzzy: fuzzyFilter },
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <>
      <Card>
        {/* Header */}
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

        {/* Table */}
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

        {/* Pagination */}
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={totalRows}
          rowsPerPage={pagination.pageSize}
          page={pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />
      </Card>

      {/* Drawer */}
      <RoleDrawer
        open={isDrawerOpen}
        handleClose={handleDrawerClose}
        roleData={roles}
        setData={setRoles}
        roleToEdit={roleToEdit}
      />
    </>
  )
}

export default RolesTable
