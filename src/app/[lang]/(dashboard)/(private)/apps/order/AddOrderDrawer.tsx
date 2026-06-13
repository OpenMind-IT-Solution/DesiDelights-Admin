'use client'

import { useEffect, useState } from 'react'

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify'

import { get, post } from '@/services/apiService'
import { menuEndpoints } from '@/services/endpoints/menu'
import { orderEndpoints } from '@/services/endpoints/order'

type Props = {
  open: boolean
  handleClose: () => void
  onSuccess?: () => void
}

interface LineItem {
  rowId: number
  menuItemId: number
  name: string
  price: number
  quantity: number
}

const AddOrderDrawer = ({ open, handleClose, onSuccess }: Props) => {
  // Order fields
  const [orderType, setOrderType] = useState('delivery')
  const [status, setStatus] = useState('pending')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [customerId, setCustomerId] = useState('')

  // Items
  const [items, setItems] = useState<LineItem[]>([])
  const [menuOptions, setMenuOptions] = useState<any[]>([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMenuItemId, setNewMenuItemId] = useState<number | ''>('')
  const [newQty, setNewQty] = useState('1')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedMenuItem = menuOptions.find(m => m.id === newMenuItemId)
  const calculateTotal = () => items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)

  // Reset on open + pre-fill walk-in customer ID
  useEffect(() => {
    if (!open) return
    setOrderType('delivery')
    setStatus('pending')
    setPaymentStatus('unpaid')
    setDeliveryAddress('')
    setCustomerId('')
    setItems([])
    setShowAddForm(false)
    setNewMenuItemId('')
    setNewQty('1')

    const fetchWalkIn = async () => {
      try {
        const res: any = await get(orderEndpoints.walkInCustomer)

        if (res?.data?.id) setCustomerId(String(res.data.id))
      } catch { /* walk-in not seeded, leave blank */ }
    }

    fetchWalkIn()
  }, [open])

  // Fetch menu once
  useEffect(() => {
    if (menuOptions.length > 0) return

    const fetchMenu = async () => {
      setMenuLoading(true)

      try {
        const res: any = await post(menuEndpoints.getMenu, { status: true })
        const raw = res?.data?.menuItems || res?.data || []

        setMenuOptions(
          raw.filter((m: any) => m.status !== false)
            .map((m: any) => ({ id: m.id, name: m.name, price: Number(m.price || 0) }))
        )
      } catch { /* ignore */ } finally { setMenuLoading(false) }
    }

    fetchMenu()
  }, [])

  const handleAddItem = () => {
    if (!selectedMenuItem || Number(newQty) < 1) return
    const nextRowId = items.length > 0 ? Math.max(...items.map(i => i.rowId)) + 1 : 1

    setItems(prev => [...prev, {
      rowId: nextRowId,
      menuItemId: selectedMenuItem.id,
      name: selectedMenuItem.name,
      price: selectedMenuItem.price,
      quantity: Number(newQty)
    }])
    setNewMenuItemId('')
    setNewQty('1')
    setShowAddForm(false)
  }

  const handleIncrease = (rowId: number) =>
    setItems(prev => prev.map(i => i.rowId === rowId ? { ...i, quantity: i.quantity + 1 } : i))

  const handleDecrease = (rowId: number) =>
    setItems(prev => prev.map(i => i.rowId === rowId && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i))

  const handleDelete = (rowId: number) =>
    setItems(prev => prev.filter(i => i.rowId !== rowId))

  const handleSave = async () => {
    if (items.length === 0) {
      toast.error('Add at least one item')
      setConfirmOpen(false)
      
return
    }

    setSaving(true)

    try {
      await post(orderEndpoints.adminCreateOrder, {
        customerId: Number(customerId),
        status,
        paymentStatus,
        orderType,
        deliveryAddress: deliveryAddress || undefined,
        items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, price: i.price }))
      })
      toast.success('Order created successfully')
      onSuccess?.()
      handleClose()
    } catch { /* toast shown by apiService */ } finally {
      setSaving(false)
      setConfirmOpen(false)
    }
  }

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
      onClose={handleClose}
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
            <Typography variant='h5' sx={{ fontWeight: 700, mb: 0.5 }}>Add New Order</Typography>
            <Typography variant='body2' color='text.secondary'>Fill in details to create an order</Typography>
          </div>
          <IconButton onClick={handleClose} size='small' sx={{ color: 'text.primary' }}>
            <i className='tabler-x' />
          </IconButton>
        </div>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>

            {/* Order Type */}
            <div style={cardStyle}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>Order Type</Typography>
              <FormControl fullWidth size='small'>
                <Select value={orderType} onChange={e => setOrderType(e.target.value)}>
                  <MenuItem value='delivery'>Delivery</MenuItem>
                  <MenuItem value='pickup'>Pickup</MenuItem>
                  <MenuItem value='pos'>POS</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Delivery Address */}
            {orderType === 'delivery' && (
              <div style={cardStyle}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>Delivery Address</Typography>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='123 Main St, City'
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                />
              </div>
            )}

            {/* Order Status */}
            <div style={cardStyle}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>Order Status</Typography>
              <FormControl fullWidth size='small'>
                <Select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  renderValue={(val: string) => val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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

            {/* Payment Status */}
            <div style={cardStyle}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>Payment Status</Typography>
              <FormControl fullWidth size='small'>
                <Select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                  <MenuItem value='paid'>Paid</MenuItem>
                  <MenuItem value='unpaid'>Unpaid</MenuItem>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='refunded'>Refunded</MenuItem>
                  <MenuItem value='cancelled'>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Order Items</Typography>
            <Button size='small' variant='tonal' onClick={() => setShowAddForm(v => !v)}>
              {showAddForm ? 'Cancel' : '+ Add Item'}
            </Button>
          </div>

          {showAddForm && (
            <div style={{ ...cardStyle, marginBottom: 16, display: 'grid', gap: 12 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Menu Item</InputLabel>
                <Select
                  label='Menu Item'
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
                  label='Qty'
                  value={newQty}
                  onChange={e => setNewQty(e.target.value)}
                  size='small'
                  type='number'
                  inputProps={{ min: 1 }}
                />
                <Button
                  variant='contained'
                  sx={{ height: 40 }}
                  onClick={handleAddItem}
                  disabled={!selectedMenuItem || Number(newQty) < 1}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          <TableContainer
            component={Paper}
            sx={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'none',
              overflowX: 'hidden'
            }}
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
                {items.length > 0 ? (
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
                      <Typography color='text.secondary' fontSize={13}>No items added yet</Typography>
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
            <Button variant='outlined' onClick={handleClose} sx={{ color: 'text.primary', borderColor: 'rgba(255,255,255,0.12)' }}>
              Cancel
            </Button>
            <Button variant='contained' sx={{ px: 3 }} onClick={() => setConfirmOpen(true)} disabled={saving}>
              Create Order
            </Button>
          </div>
        </div>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Create</DialogTitle>
          <DialogContent>
            <Typography>Create this order with {items.length} item(s) totalling €{calculateTotal()}?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)} color='secondary' variant='outlined'>Cancel</Button>
            <Button onClick={handleSave} color='primary' variant='contained' disabled={saving}>
              {saving ? <CircularProgress size={16} color='inherit' /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Drawer>
  )
}

export default AddOrderDrawer
