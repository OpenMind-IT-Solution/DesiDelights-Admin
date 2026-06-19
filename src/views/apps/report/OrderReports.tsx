'use client'

import { useEffect, useMemo, useState } from 'react'

import { useSession } from 'next-auth/react'

import { Box, Card, CardContent, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'

import { post } from '@/services/apiService'
import { orderEndpoints } from '@/services/endpoints/order'
import type { OrderType } from '@/types/apps/orderTypes'
import StatCard from './list/StatCard'

const OrderReports = () => {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<OrderType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)

      try {
        const body = {
          search: '',
          page: 1,
          limit: 100,
          status: []
        }

        const res: any = await post(orderEndpoints.getOrders, body)
        const rows = res?.data?.orders ?? []

        const normalized: OrderType[] = rows.map((row: any) => ({
          id: Number(row.id),
          status: row.status,
          totalAmount: Number(row.totalAmount ?? row.amount ?? 0),
          paymentStatus: row.paymentStatus,
          orderType: row.orderType,
          deliveryAddress: row.deliveryAddress,
          orderItems: row.orderItems ?? row.items ?? []
        }))

        setOrders(normalized)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load order report')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchOrders()
    }
  }, [session])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const paidOrders = orders.filter(order => order.paymentStatus === 'paid').length
    const deliveryOrders = orders.filter(order => order.orderType === 'delivery').length

    return { totalOrders, totalRevenue, averageOrder, paidOrders, deliveryOrders }
  }, [orders])

  const topOrders = useMemo(
    () => [...orders].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5),
    [orders]
  )

  const statCards = [
    { title: 'Total Orders', stats: stats.totalOrders, icon: 'tabler-shopping-bag', color: 'primary' },
    { title: 'Total Revenue', stats: stats.totalRevenue, icon: 'tabler-currency-rupee', color: 'success' },
    { title: 'Avg Order Value', stats: Number(stats.averageOrder.toFixed(2)), icon: 'tabler-calculator', color: 'warning' },
    { title: 'Paid Orders', stats: stats.paidOrders, icon: 'tabler-wallet', color: 'error' }
  ]

  return (
    <>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color='error'>{error}</Typography>
      ) : (
        <>
          <div className='flex flex-wrap md:flex-nowrap gap-4 mb-4'>
            {statCards.map((card, index) => (
              <StatCard
                key={index}
                className='w-full md:w-1/4'
                title={card.title}
                value={card.stats}
                color={card.color as 'primary' | 'success' | 'warning' | 'error'}
                icon={card.icon}
                isSelected={false}
                onClick={() => {}}
              />
            ))}
          </div>

          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Top Orders by Revenue
              </Typography>
              {topOrders.length === 0 ? (
                <Typography color='text.secondary'>No order data available.</Typography>
              ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align='right'>Amount</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topOrders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell align='right'>€{order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>{order.paymentStatus}</TableCell>
                          <TableCell>{order.orderType}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}

export default OrderReports
