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
  InputLabel,
  Box,
  Grid
} from '@mui/material'

import type { OrderType } from '@/types/apps/orderTypes'
import { get, post, put } from '@/services/apiService'
import { menuEndpoints } from '@/services/endpoints/menu'
import { orderEndpoints } from '@/services/endpoints/order'

const TAX_RATE = 0.18

interface EditableItem {
  rowId: number
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
  const [orderType, setOrderType] = useState<string>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash')
  const [deliveryAddress, setDeliveryAddress] = useState<string>('')
  const [itemsLoading, setItemsLoading] = useState(false)

  const [menuOptions, setMenuOptions] = useState<any[]>([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMenuItemId, setNewMenuItemId] = useState<number | ''>('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedMenuItem = menuOptions.find(m => m.id === newMenuItemId)
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
  const tax = subtotal * TAX_RATE
  const grandTotal = subtotal + tax

  // Fetch actual order items from backend when drawer opens
  useEffect(() => {
    if (!open || !order?.id) return

    setOrderStatus(order.status ?? 'pending')
    setOrderType(order.orderType ?? 'delivery')
    setPaymentMethod((order as any).paymentStatus === 'Cash' || (order as any).paymentStatus === 'Card'
      ? (order as any).paymentStatus
      : 'Cash')
    setDeliveryAddress(typeof order.deliveryAddress === 'string' ? order.deliveryAddress : '')
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
  }, [menuOptions.length])

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
        orderType,
        paymentStatus: paymentMethod,
        deliveryAddress: deliveryAddress || undefined,
        totalAmount: grandTotal,
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

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 520, bgcolor: 'background.default' }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* ── Header ── */}
        <Box sx={{ px: 5, pt: 5, pb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>Edit Order</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              Order #{order?.id}
            </Typography>
          </div>
          <IconButton onClick={onClose} size='small' sx={{ color: 'text.secondary', mt: -0.5 }}>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        <Divider sx={{ mx: 5 }} />

        {/* ── Scrollable Body ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 5, py: 4 }}>
          {/* ── Order Details ── */}
          <Typography
            variant='subtitle2'
            sx={{ fontWeight: 600, mb: 2, color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 11 }}
          >
            Order Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={6}>
              <FormControl fullWidth size='small'>
                <InputLabel>Type</InputLabel>
                <Select label='Type' value={orderType} onChange={e => setOrderType(e.target.value)}>
                  <MenuItem value='delivery'>Delivery</MenuItem>
                  <MenuItem value='pickup'>Pickup</MenuItem>
                  <MenuItem value='pos'>POS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size='small'>
                <InputLabel>Payment</InputLabel>
                <Select label='Payment' value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <MenuItem value='Cash'>Cash</MenuItem>
                  <MenuItem value='Card'>Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {orderType === 'delivery' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size='small'
                  label='Delivery Address'
                  placeholder='123 Main St, City'
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                />
              </Grid>
            )}
            <Grid item xs={6}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select
                  label='Status'
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
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* ── Order Items ── */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 11 }}
            >
              Order Items
              {items.length > 0 && (
                <Typography component='span' variant='body2' color='text.secondary' sx={{ ml: 1, textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 13 }}>
                  ({items.length})
                </Typography>
              )}
            </Typography>
            <Button
              size='small'
              variant={showAddForm ? 'outlined' : 'contained'}
              startIcon={<i className={showAddForm ? 'tabler-x' : 'tabler-plus'} />}
              onClick={() => setShowAddForm(v => !v)}
              sx={{ minWidth: 0, borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: 13 }}
            >
              {showAddForm ? 'Cancel' : 'Add Item'}
            </Button>
          </Box>

          {/* ── Add Item Form ── */}
          {showAddForm && (
            <Paper
              sx={{
                p: 2.5,
                mb: 2.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none'
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
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
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size='small'
                    label='Unit Price'
                    value={selectedMenuItem ? `€${selectedMenuItem.price}` : ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    size='small'
                    label='Qty'
                    value={newItemQuantity}
                    onChange={e => setNewItemQuantity(e.target.value)}
                    type='number'
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={3} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    fullWidth
                    variant='contained'
                    onClick={handleAddItem}
                    disabled={!selectedMenuItem || Number(newItemQuantity) < 1}
                    sx={{ height: 40, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* ── Items Table ── */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              overflowX: 'hidden'
            }}
          >
            <Table size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12, borderBottom: 'none', width: '34%', py: 1.5 }}>Item</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12, borderBottom: 'none', width: '16%', py: 1.5 }} align='center'>Price</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12, borderBottom: 'none', width: '26%', py: 1.5 }} align='center'>Qty</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12, borderBottom: 'none', width: '16%', py: 1.5 }} align='center'>Total</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12, borderBottom: 'none', width: '8%', py: 1.5 }} align='center' />
                </TableRow>
              </TableHead>
              <TableBody>
                {itemsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 5 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : items.length > 0 ? (
                  items.map(item => (
                    <TableRow
                      key={item.rowId}
                      sx={{
                        '&:last-child td': { borderBottom: 'none' },
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background 0.15s'
                      }}
                    >
                      <TableCell sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{item.name}</Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography fontSize={13} color='text.secondary'>€{item.price.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: 'action.selected',
                            borderRadius: 999,
                            px: 0.5,
                            py: 0.25
                          }}
                        >
                          <IconButton
                            size='small'
                            onClick={() => handleDecrease(item.rowId)}
                            disabled={item.quantity <= 1}
                            sx={{ color: 'text.secondary', p: 0.5, '&.Mui-disabled': { opacity: 0.3 } }}
                          >
                            <i className='tabler-minus' style={{ fontSize: 12 }} />
                          </IconButton>
                          <Typography sx={{ minWidth: 22, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size='small'
                            onClick={() => handleIncrease(item.rowId)}
                            sx={{ color: 'text.secondary', p: 0.5 }}
                          >
                            <i className='tabler-plus' style={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography fontSize={13} fontWeight={600}>
                          €{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <IconButton
                          size='small'
                          onClick={() => handleDelete(item.rowId)}
                          sx={{ color: 'error.main', p: 0.5 }}
                        >
                          <i className='tabler-trash' style={{ fontSize: 14 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align='center' sx={{ py: 5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <i className='tabler-shopping-cart-off' style={{ fontSize: 28, opacity: 0.3 }} />
                        <Typography color='text.disabled' fontSize={13}>No items</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Order Summary ── */}
          {items.length > 0 && (
            <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  minWidth: 240
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant='body2' color='text.secondary'>Items ({items.length})</Typography>
                  <Typography variant='body2' fontWeight={600}>€{subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant='body2' color='text.secondary'>Tax (18%)</Typography>
                  <Typography variant='body2' color='text.secondary'>€{tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ mb: 1.5, borderColor: 'divider' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='subtitle2' fontWeight={700}>Grand Total</Typography>
                  <Typography variant='subtitle1' fontWeight={700} color='primary'>€{grandTotal.toFixed(2)}</Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>

        <Divider sx={{ mx: 5 }} />

        {/* ── Sticky Footer ── */}
        <Box sx={{ px: 5, py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='caption' color='text.disabled' sx={{ display: 'block', lineHeight: 1 }}>
              {items.length > 0 ? 'Grand Total' : 'Total'}
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.3, color: items.length > 0 ? 'primary.main' : 'text.primary' }}>
              €{items.length > 0 ? grandTotal.toFixed(2) : '0.00'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant='tonal' onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={() => setConfirmOpen(true)}
              disabled={saving || items.length === 0}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>

        {/* ── Confirm Dialog ── */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth='xs' fullWidth>
          <DialogTitle sx={{ pb: 1 }}>Confirm Save</DialogTitle>
          <DialogContent>
            <Box sx={{ '& > :not(:last-child)': { mb: 0.5 } }}>
              <Typography variant='body2' color='text.secondary'>
                Save changes to Order #{order?.id} with <strong>{items.length}</strong> item(s)?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 260, mt: 2 }}>
                <Typography variant='body2' color='text.secondary'>Subtotal</Typography>
                <Typography variant='body2'>€{subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 260 }}>
                <Typography variant='body2' color='text.secondary'>Tax (18%)</Typography>
                <Typography variant='body2'>€{tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 260 }}>
                <Typography variant='subtitle2' fontWeight={700}>Grand Total</Typography>
                <Typography variant='subtitle2' fontWeight={700} color='primary'>€{grandTotal.toFixed(2)}</Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setConfirmOpen(false)} color='secondary' variant='tonal' sx={{ borderRadius: 2, textTransform: 'none' }}>
              No
            </Button>
            <Button onClick={handleSave} variant='contained' disabled={saving} sx={{ borderRadius: 2, textTransform: 'none' }}>
              {saving ? <CircularProgress size={18} color='inherit' sx={{ mr: 1 }} /> : null}
              {saving ? 'Saving…' : 'Yes, save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Drawer>
  )
}

export default OrderItemsDrawer
