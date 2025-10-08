'use client'

// React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

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

import { rankItem } from '@tanstack/match-sorter-utils'

import { toast } from 'react-toastify'

import { useSession } from 'next-auth/react'

import type { UsersType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'
import type { ThemeColor } from '@core/types'

import CustomTextField from '@core/components/mui/TextField'
import AddUserDrawer from './AddUserDrawer'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import TableFilters from './TableFilters'

import { getLocalizedUrl } from '@/utils/i18n'

import { del, get, post } from '@/services/apiService'
import { userEndpoints } from '@/services/endpoints/user'
import tableStyles from '@core/styles/table.module.css'

type UsersTypeWithAction = UsersType & {
  action?: string
}

type UserStatusType = {
  [key: string]: ThemeColor
}

export type FilterType = {
  status: 'All' | 'active' | 'inactive'
  roleId: string | null
}

const Icon = styled('i')({})

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

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })
  
return true
}

const userRoleObj: { [key: string]: { icon: string; color: string } } = {
  'Super Admin': { icon: 'tabler-crown', color: 'error' },
  'Restaurant Admin': { icon: 'tabler-crown', color: 'error' },
  Manager: { icon: 'tabler-device-desktop', color: 'warning' },
  Chef: { icon: 'tabler-edit', color: 'info' },
  'Technical Support': { icon: 'tabler-chart-pie', color: 'success' },
  default: { icon: 'tabler-user', color: 'primary' }
}

const userStatusObj: UserStatusType = {
  active: 'success',
  inactive: 'secondary'
}

const columnHelper = createColumnHelper<UsersTypeWithAction>()

const UserListTable = () => {
  const { data: session } = useSession()
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsersType | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<UsersTypeWithAction[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UsersTypeWithAction | null>(null)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false) // State for filter popover

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalRows, setTotalRows] = useState(0)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const [filters, setFilters] = useState<FilterType>({
    status: 'All',
    roleId: null,
  })

  const { lang: locale } = useParams()

  const getData = useCallback(
    async (options: { isExport?: boolean } = {}) => {
      if (!session) return
      setLoading(true)
      setError(null)
      const { isExport = false } = options

      try {
        const result: any = await post(userEndpoints.getUser, {
          page: pagination.pageIndex + 1,
          limit: isExport ? 100000 : pagination.pageSize,
          search: globalFilter,
          status: filters.status === 'All' ? null : [filters.status === 'active'],
          roleId: filters.roleId ? [filters.roleId] : null,
          restaurantId:
            typeof session?.user?.restaurantId === 'string'
              ? JSON.parse(session.user.restaurantId)
              : session?.user?.restaurantId || []
        })

        const formattedUsers = (result.data.users || []).map((user: any) => ({
          ...user,
          status: user.status ? 'active' : 'inactive'
        })) as UsersTypeWithAction[]

        if (isExport) {
          handleDownload(formattedUsers)
        } else {
          setData(formattedUsers)
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
    [pagination, globalFilter, filters, session]
  )

  useEffect(() => {
    if (session) {
      getData()
    }
  }, [getData, session])

  const handleEditClick = async (userData: UsersType) => {
    setLoading(true)

    try {
      const endpoint = userEndpoints.getUserById(userData.id)
      const result = await get(endpoint)

      if (result.status === 'success') {
        setSelectedUser(result.data)
        setAddUserOpen(true)
      } else {
        toast.error(result?.Message || 'Failed to fetch user details.')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        const endpoint = userEndpoints.deleteUser(userToDelete.id)
        const result = await del(endpoint)

        if (result.ResponseStatus === 'success') {
          toast.success(result?.Message || 'User deleted successfully.')
          await getData()
        } else {
          toast.error(result?.Message || 'Failed to delete user.')
        }
      } catch (err) {
        console.error('Failed to delete user', err)
      }
    }

    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
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
      columnHelper.accessor('fullName', {
        header: 'User',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.fullName}
          </Typography>
        )
      }),
      columnHelper.accessor('roleName', {
        header: 'Role',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Icon
              className={userRoleObj[row.original.roleName]?.icon || userRoleObj.default.icon}
              sx={{
                color: `var(--mui-palette-${userRoleObj[row.original.roleName]?.color || userRoleObj.default.color}-main)`
              }}
            />
            <Typography className='capitalize' color='text.primary'>
              {row.original.roleName}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.status}
            size='small'
            color={userStatusObj[row.original.status]}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
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
            <IconButton>
              <Link href={getLocalizedUrl(`/apps/user/view/${row.original.id}`, locale as Locale)} className='flex'>
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>
            <IconButton
              onClick={() => {
                setUserToDelete(row.original)
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
    [locale]
  )

  const handleDownload = (usersToExport: UsersTypeWithAction[]) => {
    if (!usersToExport || usersToExport.length === 0) return
    const headers = Object.keys(usersToExport[0])

    const escapeCSV = (value: unknown): string => {
      if (value == null) return ''
      const str = String(value)

      
return `"${str.replace(/"/g, '""')}"`
    }

    const rows = usersToExport.map(user => headers.map(header => escapeCSV(user[header as keyof UsersTypeWithAction])))
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'users-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const table = useReactTable<UsersTypeWithAction>({
    data: data as UsersTypeWithAction[],
    columns,
    state: { pagination, globalFilter, rowSelection },
    onPaginationChange: setPagination,
    filterFns: { fuzzy: fuzzyFilter },
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
              placeholder='Search User'
              className='max-sm:is-full'
            />
            <CustomTextField
              select
              value=''
              SelectProps={{
                open: filterMenuOpen,
                onClose: () => setFilterMenuOpen(false),
                displayEmpty: true,
                IconComponent: () => (
                  <IconButton onClick={() => setFilterMenuOpen(prev => !prev)} sx={{ p: 1.25 }}>
                    <i
                      className='tabler-filter text-textSecondary text-base'
                      style={{ transform: 'none', transition: 'none' }}
                    />
                  </IconButton>
                )
              }}
              onClick={e => e.preventDefault()}
              sx={{ '& .MuiSelect-select': { p: '0 !important' } }}
            >
              <TableFilters filters={filters} setFilters={setFilters} onClose={() => setFilterMenuOpen(false)} />
            </CustomTextField>
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
              onClick={() => getData({ isExport: true })}
            >
              Export
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddUserOpen(!addUserOpen)}
              className='max-sm:is-full'
            >
              Add New User
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

      <AddUserDrawer
        open={addUserOpen}
        handleClose={() => {
          setAddUserOpen(false)
          setSelectedUser(null)
        }}
        onSuccess={getData}
        userToEdit={
          selectedUser
            ? {
                userId: selectedUser.id,
                fullName: selectedUser.fullName,
                username: selectedUser.userName,
                email: selectedUser.email,
                roleId: selectedUser.roleId ? Number(selectedUser.roleId) : undefined,
                status: !!selectedUser.status,
                phoneNumber: selectedUser.phoneNumber
              }
            : null
        }
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.fullName}
      />
    </>
  )
}

export default UserListTable
