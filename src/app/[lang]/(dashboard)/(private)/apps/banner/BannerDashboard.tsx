'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import type { TextFieldProps } from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table'
import classnames from 'classnames'
import { toast } from 'react-toastify'

import type { BannerItem } from '@/types/apps/bannerTypes'

import { post, del, postFormData } from '@/services/apiService'
import { bannerEndpoints } from '@/services/endpoints/banner'

import CustomTextField from '@/@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import BannerFormDrawer from './BannerFormDrawer'

import tableStyles from '@core/styles/table.module.css'

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

type StatusFilter = 'all' | 'active' | 'inactive'

const BannerDashboard = () => {
  const [data, setData] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [inactiveCount, setInactiveCount] = useState(0)
  const [globalFilter, setGlobalFilter] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BannerItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<BannerItem | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(globalFilter), 500)

    return () => clearTimeout(t)
  }, [globalFilter])

  const fetchBanners = useCallback(async () => {
    setLoading(true)

    try {
      const body: any = {
        search: debouncedSearch,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      }
      if (filterStatus !== 'all') body.status = filterStatus === 'active'

      const res: any = await post(bannerEndpoints.getBanners, body)
      const rows: BannerItem[] = res?.data?.banners || []

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

  const fetchCounts = useCallback(async () => {
    try {
      const [activeRes, inactiveRes]: any = await Promise.all([
        post(bannerEndpoints.getBanners, { page: 1, limit: 1, status: true }),
        post(bannerEndpoints.getBanners, { page: 1, limit: 1, status: false })
      ])
      setActiveCount(activeRes?.data?.total ?? 0)
      setInactiveCount(inactiveRes?.data?.total ?? 0)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  const handleOpenDrawer = (item: BannerItem | null) => {
    setEditingItem(item)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setEditingItem(null)
    setIsDrawerOpen(false)
  }

  const handleSaveItem = async (fd: FormData, isEdit: boolean) => {
    try {
      const res: any = await postFormData(bannerEndpoints.saveBanner, fd)

      if (res?.status === 'success') {
        toast.success(res.message || `Banner ${isEdit ? 'updated' : 'created'} successfully`)
        handleCloseDrawer()
        await Promise.all([fetchBanners(), fetchCounts()])
      } else {
        toast.error(res?.message || 'Failed to save banner')
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return

    try {
      const res: any = await del(bannerEndpoints.deleteBanner(deletingItem.id))

      if (res?.status === 'success') {
        toast.success(res.message || 'Banner deleted successfully')
        setDeletingItem(null)
        await Promise.all([fetchBanners(), fetchCounts()])
      } else {
        toast.error(res?.message || 'Failed to delete banner')
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  const handleToggleStatus = async (item: BannerItem) => {
    try {
      const res: any = await post(bannerEndpoints.toggleBannerStatus(item.id), {})

      if (res?.status === 'success') {
        toast.success(res.message || 'Status updated')
        await Promise.all([fetchBanners(), fetchCounts()])
      } else {
        toast.error(res?.message || 'Failed to toggle status')
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  const columnHelper = createColumnHelper<BannerItem>()

  const columns = useMemo<ColumnDef<BannerItem, any>[]>(
    () => [
      columnHelper.accessor('imageUrlFull', {
        header: 'Preview',
        cell: info => {
          const url = info.getValue() as string | null
          if (!url) return <Typography color='text.secondary'>N/A</Typography>
          return (
            <img
              src={url}
              alt='Banner'
              style={{ width: 90, height: 50, objectFit: 'cover', borderRadius: 4 }}
            />
          )
        }
      }),
      columnHelper.accessor('imageUrl', {
        header: 'File',
        cell: info => (
          <Typography variant='body2' sx={{ wordBreak: 'break-all', maxWidth: 220 }}>
            {info.getValue()}
          </Typography>
        )
      }),
      columnHelper.accessor('sortOrder', { header: 'Order', cell: info => info.getValue() }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
          const row = info.row.original
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                size='small'
                checked={!!info.getValue()}
                onChange={() => handleToggleStatus(row)}
              />
              <Chip
                label={info.getValue() ? 'Active' : 'Inactive'}
                color={info.getValue() ? 'success' : 'default'}
                size='small'
              />
            </Box>
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title='Edit Banner'>
              <IconButton size='small' onClick={() => handleOpenDrawer(row.original)}>
                <i className='tabler-edit' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete Banner'>
              <IconButton size='small' color='error' onClick={() => setDeletingItem(row.original)}>
                <i className='tabler-trash' />
              </IconButton>
            </Tooltip>
          </Box>
        )
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    pageCount: Math.max(1, Math.ceil(totalRows / pagination.pageSize)),
    manualPagination: true,
    onPaginationChange: setPagination,
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
        <Grid item xs={12} sm={4}>
          <StatCard
            title='Total Banners'
            value={activeCount + inactiveCount}
            icon='tabler-photo'
            color='primary'
            isSelected={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title='Active'
            value={activeCount}
            icon='tabler-circle-check'
            color='success'
            isSelected={filterStatus === 'active'}
            onClick={() => setFilterStatus(filterStatus === 'active' ? 'all' : 'active')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title='Inactive'
            value={inactiveCount}
            icon='tabler-circle-x'
            color='error'
            isSelected={filterStatus === 'inactive'}
            onClick={() => setFilterStatus(filterStatus === 'inactive' ? 'all' : 'inactive')}
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
              placeholder='Search by filename'
            />
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => handleOpenDrawer(null)}
            >
              Add Banner
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
                    No banners available
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
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

      <BannerFormDrawer open={isDrawerOpen} onClose={handleCloseDrawer} onSave={handleSaveItem} item={editingItem} />
      <DeleteConfirmationDialog
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingItem?.imageUrl}
        itemType='Banner'
      />
    </Box>
  )
}

export default BannerDashboard
