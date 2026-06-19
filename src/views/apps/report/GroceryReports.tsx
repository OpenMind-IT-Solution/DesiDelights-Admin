'use client'

import { useEffect, useMemo, useState } from 'react'

import { useSession } from 'next-auth/react'

import { Box, Card, CardContent, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'

import { post } from '@/services/apiService'
import { groceryEndpoints } from '@/services/endpoints/grocery'
import type { GroceryItem, GroceryStockStatus } from '@/types/apps/groceryTypes'
import StatCard from './list/StatCard'

const GroceryReports = () => {
  const { data: session } = useSession()
  const [items, setItems] = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGroceries = async () => {
      setLoading(true)
      setError(null)

      try {
        const body = {
          search: '',
          page: 1,
          limit: 100,
          status: []
        }

        const res: any = await post(groceryEndpoints.getGroceries, body)
        const rows = res?.data?.groceries ?? []

        const normalized: GroceryItem[] = rows.map((row: any) => ({
          id: Number(row.id),
          name: row.itemName ?? row.name ?? 'Unnamed Item',
          description: row.description ?? null,
          type: row.type ?? row.category ?? 'Unknown',
          store_id: Number(row.storeId ?? row.store_id ?? 0),
          store_name: row.store?.storeName ?? row.storeName ?? null,
          location: row.store?.location ?? row.storeLocation ?? null,
          priority: row.priority ?? null,
          stock_quantity: Number(row.quantity ?? row.stock_quantity ?? 0),
          item_lower_value: Number(row.itemLowerValue ?? row.item_lower_value ?? 0),
          stock_status: (row.status ?? row.stock_status ?? 'In Stock') as GroceryStockStatus
        }))

        setItems(normalized)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load grocery report')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchGroceries()
    }
  }, [session])

  const totals = useMemo(() => {
    const totalItems = items.length
    const inStock = items.filter(item => item.stock_status === 'In Stock').length
    const lowStock = items.filter(item => item.stock_status === 'Low Stock').length
    const outOfStock = items.filter(item => item.stock_status === 'Out of Stock').length

    return { totalItems, inStock, lowStock, outOfStock }
  }, [items])

  const lowStockItems = useMemo(() => items.filter(item => item.stock_status === 'Low Stock').slice(0, 5), [items])

  const statCards = [
    { title: 'Grocery Items', stats: totals.totalItems, icon: 'tabler-box', color: 'primary' },
    { title: 'In Stock', stats: totals.inStock, icon: 'tabler-check', color: 'success' },
    { title: 'Low Stock', stats: totals.lowStock, icon: 'tabler-alert-circle', color: 'warning' },
    { title: 'Out of Stock', stats: totals.outOfStock, icon: 'tabler-x', color: 'error' }
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
                Low Stock Grocery Items
              </Typography>
              {lowStockItems.length === 0 ? (
                <Typography color='text.secondary'>No low stock items found.</Typography>
              ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Store</TableCell>
                        <TableCell align='right'>Quantity</TableCell>
                        <TableCell>Stock Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStockItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.store_name || 'Unknown'}</TableCell>
                          <TableCell align='right'>{item.stock_quantity}</TableCell>
                          <TableCell>{item.stock_status}</TableCell>
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

export default GroceryReports
