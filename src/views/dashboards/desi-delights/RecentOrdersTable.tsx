'use client'

import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Chip from '@mui/material/Chip'
import { alpha } from '@mui/material/styles'

import EmptyState from './EmptyState'

interface RecentOrdersTableProps {
  orders: any[]
}

const STATUS_COLORS: Record<string, string> = {
  placed: '#FFB547',
  pending: '#FFB547',
  preparing: '#FF6B6B',
  ready: '#00CFE8',
  completed: '#56CAFB',
  delivered: '#56CAFB',
  cancelled: '#FF4C51',
  refunded: '#FF4C51'
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  pickup: 'Takeaway',
  delivery: 'Delivery',
  pos: 'Dine-In'
}

const PAYMENT_ICONS: Record<string, string> = {
  cash: 'tabler-cash',
  card: 'tabler-credit-card',
  online: 'tabler-world',
  wallet: 'tabler-wallet'
}

const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')

  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return []

    const q = search.toLowerCase()

    return orders.filter((o: any) => {
      if (!q) return true

      return (
        `#${o.id}`.includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.orderType || '').toLowerCase().includes(q) ||
        (o.paymentMethod || '').toLowerCase().includes(q) ||
        (o.status || '').toLowerCase().includes(q)
      )
    })
  }, [orders, search])

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [filteredOrders, page, rowsPerPage])

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader title='Recent Orders' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-receipt text-xl' />} />
        <CardContent>
          <EmptyState icon='tabler-shopping-cart' title='No Orders Found' description='Orders will appear here once they are placed' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Recent Orders'
        titleTypographyProps={{ variant: 'h5' }}
        avatar={<i className='tabler-receipt text-xl' />}
        action={
          <TextField
            size='small'
            placeholder='Search orders...'
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(0)
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='tabler-search text-[1.1rem]' style={{ color: 'var(--mui-palette-text-disabled)' }} />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 220 }}
          />
        }
      />
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {['Order ID', 'Customer', 'Type', 'Payment', 'Amount', 'Status', 'Time'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap', color: 'text.disabled', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order: any) => {
              const statusColor = STATUS_COLORS[order.status] || '#999'

              return (
                <TableRow
                  key={order.id}
                  hover
                  sx={{
                    '&:last-child td': { border: 0 },
                    transition: 'background-color 150ms ease',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <TableCell>
                    <Typography variant='body2' fontWeight={600} color='primary'>
                      #{order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{order.customerName || 'Walk-in'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label={ORDER_TYPE_LABELS[order.orderType] || order.orderType}
                      variant='outlined'
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <i
                        className={`${PAYMENT_ICONS[order.paymentMethod] || 'tabler-help'} text-[1rem]`}
                        style={{ color: 'var(--mui-palette-text-secondary)' }}
                      />
                      <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                        {order.paymentMethod || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' fontWeight={600}>
                      €{Number(order.totalAmount || 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label={order.status}
                      sx={{
                        bgcolor: alpha(statusColor, 0.12),
                        color: statusColor,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        fontSize: '0.7rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant='caption' color='text.disabled' sx={{ whiteSpace: 'nowrap' }}>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString('en-GB', {
                            timeZone: 'Europe/Brussels',
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component='div'
        count={filteredOrders.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={e => {
          setRowsPerPage(parseInt(e.target.value))
          setPage(0)
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Card>
  )
}

export default RecentOrdersTable
