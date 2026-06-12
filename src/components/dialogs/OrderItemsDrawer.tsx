'use client'

import type { FC } from 'react'
import { useEffect, useState } from 'react'

import {
  Drawer,
  Button,
  Typography,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel
} from '@mui/material'

import type { OrderType } from '@/types/apps/orderTypes'
import { get, post, put } from '@/services/apiService'
import { menuEndpoints } from '@/services/endpoints/menu'
import { orderEndpoints } from '@/services/endpoints/order'

interface EditableItem {
  rowId: number        // local key
  menuItemId: number
  name: string
  price: number
  quantity: number
}

interface OrderItemsDrawerProps {
  open: boolean
  onClose: () => void
  order: OrderType | null
  onSaved?: () => void
}

const OrderItemsDrawer: FC<OrderItemsDrawerProps> = ({ open, onClose, order, onSaved }) => {
  const [items, setItems] = useState<EditableItem[]>([])
  const [orderStatus, setOrderStatus] = useState<string>('pending')
  const [itemsLoading, setItemsLoading] = useState(false)

  const [menuOptions, setMenuOptions] = useState<any[]>([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMenuItemId, setNewMenuItemId] = useState<number | ''>('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedMenuItem = menuOptions.find(m => m.id === newMenuItemId)

  // Fetch actual order items from backend when drawer opens
  useEffect(() => {
    if (!open || !order?.id) return

    setOrderStatus(order.status ?? 'pending')
    setShowAddForm(false)
    setNewMenuItemId('')
    setNewItemQuantity('1')

    const fetchOrderDetail = async () => {
      setItemsLoading(true)
      try {
        const result: any = await get(orderEndpoints.getOrderById(order.id))
        const raw: any[] = result?.data?.orderItems ?? []
        setItems(
          raw.map((it: any, i: number) => ({
            rowId: i + 1,
            menuItemId: it.menuItemId,
            name: it.menuItem?.name ?? `Item #${it.menuItemId}`,
            price: Number(it.price),
            quantity: Number(it.quantity)
          }))
        )
      } catch (err) {
        console.error('Failed to fetch order details', err)
        // fall back to whatever the list row already has
        const raw: any[] = (order as any).orderItems ?? (order as any).items ?? []
        setItems(
          raw.map((it: any, i: number) => ({
            rowId: i + 1,
            menuItemId: it.menuItemId ?? it.id,
            name: it.name ?? it.menuItemName ?? 'Item',
            price: Number(it.price),
            quantity: Number(it.quantity)
          }))
        )
      } finally {
        setItemsLoading(false)
      }
    }

    fetchOrderDetail()
  }, [open, order?.id])

  // Fetch menu catalogue once
  useEffect(() => {
    if (menuOptions.length > 0) return
    const fetchMenu = async () => {
      setMenuLoading(true)
      try {
        const result: any = await post(menuEndpoints.getMenu, { status: true })
        const raw = result?.data?.menuItems || result?.data || []
        const formatted = raw.map((m: any) => ({
          id: m.id,
          name: m.name,
          price: Number(m.price || 0),
          status: m.status
        }))
        setMenuOptions(formatted.filter((m: any) => m.status !== false))
      } catch (err) {
        console.error('Failed to fetch menu', err)
      } finally {
        setMenuLoading(false)
      }
    }
    fetchMenu()
  }, [])

  const calculateTotal = () =>
    items.reduce((sum, it) => sum + it.price * it.quantity, 0).toFixed(2)

  const handleIncrease = (rowId: number) =>
    setItems(prev => prev.map(it => it.rowId === rowId ? { ...it, quantity: it.quantity + 1 } : it))

  const handleDecrease = (rowId: number) =>
    setItems(prev => prev.map(it => it.rowId === rowId && it.quantity > 1 ? { ...it, quantity: it.quantity - 1 } : it))

  const handleDelete = (rowId: number) =>
    setItems(prev => prev.filter(it => it.rowId !== rowId))

  const handleAddItem = () => {
    if (!selectedMenuItem) return
    const quantity = Number(newItemQuantity)
    if (quantity < 1) return
    const nextRowId = items.length > 0 ? Math.max(...items.map(it => it.rowId)) + 1 : 1
    setItems(prev => [
      ...prev,
      { rowId: nextRowId, menuItemId: selectedMenuItem.id, name: selectedMenuItem.name, price: selectedMenuItem.price, quantity }
    ])
    setNewMenuItemId('')
    setNewItemQuantity('1')
    setShowAddForm(false)
  }

  const handleSave = async () => {
    if (!order?.id) return
    setSaving(true)
    try {
      await put(orderEndpoints.updateOrder(order.id), {
        status: orderStatus,
        totalAmount: parseFloat(calculateTotal()),
        items: items.map(it => ({
          menuItemId: it.menuItemId,
          quantity: it.quantity,
          price: it.price
        }))
      })
      onSaved?.()
      onClose()
    } catch (err) {
      console.error('Failed to save order', err)
    } finally {
      setSaving(false)
      setConfirmOpen(false)
    }
  }

  const formatStatus = (val: string) =>
    val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const cardStyle = {
    padding: 16,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)'
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 520,
          bgcolor: 'background.default',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          color: 'text.primary'
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Typography variant='h5' sx={{ fontWeight: 700, mb: 0.5 }}>Order Details</Typography>
            <Typography variant='body2' color='text.secondary'>Order #{order?.id}</Typography>
          </div>
          <IconButton onClick={onClose} size='small' sx={{ color: 'text.primary' }}>
            <i className='tabler-x' />
          </IconButton>
        </div>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          {/* Info cards */}
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {/* Order Type */}
            <div style={cardStyle}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Order Type</Typography>
              <Typography variant='body1' sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {order?.orderType || '-'}
              </Typography>
            </div>

            {/* Delivery Address */}
            <div style={cardStyle}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>Delivery Address</Typography>
              {(() => {
                if (!order?.deliveryAddress) return <Typography variant='body1'>-</Typography>
                try {
                  const addr = JSON.parse(order.deliveryAddress)
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {addr.customerName && <Typography variant='body2'><strong>Name:</strong> {addr.customerName}</Typography>}
                      {addr.customerPhone && <Typography variant='body2'><strong>Phone:</strong> {addr.customerPhone}</Typography>}
                      {addr.customerAddress && <Typography variant='body2'><strong>Address:</strong> {addr.customerAddress}</Typography>}
                      {addr.city && <Typography variant='body2'><strong>City:</strong> {addr.city}</Typography>}
                      {addr.postalCode && <Typography variant='body2'><strong>Postal Code:</strong> {addr.postalCode}</Typography>}
                    </div>
                  )
                } catch {
                  return <Typography variant='body2'>{order.deliveryAddress}</Typography>
                }
              })()}
            </div>

            {/* Order Status */}
            <div style={cardStyle}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>Order Status</Typography>
              <FormControl fullWidth size='small'>
                <Select
                  value={orderStatus}
                  onChange={e => setOrderStatus(e.target.value)}
                  renderValue={(val: string) => formatStatus(val)}
                >
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='placed'>Placed</MenuItem>
                  <MenuItem value='confirmed'>Confirmed</MenuItem>
                  <MenuItem value='out_for_delivery'>Out for Delivery</MenuItem>
                  <MenuItem value='completed'>Completed</MenuItem>
                  <MenuItem value='cancelled'>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {/* Order Items */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Order Items</Typography>
            <Button size='small' variant='tonal' onClick={() => setShowAddForm(v => !v)}>
              {showAddForm ? 'Cancel' : '+ Add Item'}
            </Button>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <div style={{ ...cardStyle, marginBottom: 16, display: 'grid', gap: 12 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Item</InputLabel>
                <Select
                  label='Item'
                  value={newMenuItemId}
                  onChange={e => setNewMenuItemId(Number(e.target.value) || '')}
                  disabled={menuLoading}
                >
                  <MenuItem value=''>{menuLoading ? 'Loading…' : 'Select item'}</MenuItem>
                  {menuOptions.map(m => (
                    <MenuItem key={m.id} value={m.id}>{m.name} — €{m.price}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <TextField label='Price' value={selectedMenuItem ? `€${selectedMenuItem.price}` : ''} size='small' disabled />
                <TextField
                  label='Quantity'
                  value={newItemQuantity}
                  onChange={e => setNewItemQuantity(e.target.value)}
                  size='small'
                  type='number'
                  inputProps={{ min: 1, step: 1 }}
                />
                <Button variant='contained' sx={{ height: 40 }} onClick={handleAddItem} disabled={!selectedMenuItem || Number(newItemQuantity) < 1}>
                  Add
                </Button>
              </div>
            </div>
          )}

          <TableContainer
            component={Paper}
            sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none', overflowX: 'hidden' }}
          >
            <Table size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255,255,255,0.04)' }}>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none', width: '34%' }}>Item</TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none', width: '16%' }} align='center'>Price</TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none', width: '26%' }} align='center'>Qty</TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none', width: '16%' }} align='center'>Total</TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none', width: '8%' }} align='center' />
                </TableRow>
              </TableHead>
              <TableBody>
                {itemsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : items.length > 0 ? (
                  items.map(item => (
                    <TableRow key={item.rowId} sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{item.name}</Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <Typography fontSize={13}>€{item.price}</Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 999, padding: '2px 6px' }}>
                          <IconButton size='small' onClick={() => handleDecrease(item.rowId)} disabled={item.quantity <= 1} sx={{ color: 'text.primary', p: 0.5 }}>
                            <i className='tabler-minus' style={{ fontSize: 12 }} />
                          </IconButton>
                          <Typography sx={{ minWidth: 20, textAlign: 'center', fontSize: 13 }}>{item.quantity}</Typography>
                          <IconButton size='small' onClick={() => handleIncrease(item.rowId)} sx={{ color: 'text.primary', p: 0.5 }}>
                            <i className='tabler-plus' style={{ fontSize: 12 }} />
                          </IconButton>
                        </div>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <Typography fontSize={13}>€{(item.price * item.quantity).toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <IconButton size='small' onClick={() => handleDelete(item.rowId)} sx={{ color: 'error.main', p: 0.5 }}>
                          <i className='tabler-trash' style={{ fontSize: 14 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 6 }}>
                      <Typography color='text.secondary'>No items</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* Footer */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant='subtitle2' color='text.secondary'>Total</Typography>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>€{calculateTotal()}</Typography>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant='outlined' onClick={onClose} sx={{ color: 'text.primary', borderColor: 'rgba(255,255,255,0.12)' }}>
              Close
            </Button>
            <Button variant='contained' sx={{ px: 3 }} onClick={() => setConfirmOpen(true)} disabled={saving}>
              Save Changes
            </Button>
          </div>
        </div>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Save</DialogTitle>
          <DialogContent>
            <Typography>Save changes to Order #{order?.id}?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)} color='secondary' variant='outlined'>No</Button>
            <Button onClick={handleSave} color='primary' variant='contained' disabled={saving}>
              {saving ? 'Saving…' : 'Yes, save'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Drawer>
  )
}

export default OrderItemsDrawer
