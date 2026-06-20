'use client'

import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
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

// const TAX_RATE = 0  // ⬅ TAX DISABLED

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
  const [orderType, setOrderType] = useState('delivery')
  const [status, setStatus] = useState('pending')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [customerId, setCustomerId] = useState<number | null>(null)

  const [items, setItems] = useState<LineItem[]>([])
  const [menuOptions, setMenuOptions] = useState<any[]>([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMenuItemId, setNewMenuItemId] = useState<number | ''>('')
  const [newQty, setNewQty] = useState('1')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const selectedMenuItem = menuOptions.find(m => m.id === newMenuItemId)
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const grandTotal = subtotal           // ⬅ TAX DISABLED — grandTotal = subtotal

  useEffect(() => {
    if (!open) return
    setOrderType('delivery')
    setStatus('pending')
    setPaymentMethod('Cash')
    setPaymentStatus('pending')
    setDeliveryAddress('')
    setCustomerId(null)
    setItems([])
    setShowAddForm(false)
    setNewMenuItemId('')
    setNewQty('1')

    const fetchWalkIn = async () => {
      try {
        const res: any = await get(orderEndpoints.walkInCustomer)

        if (res?.data?.id) setCustomerId(Number(res.data.id))
      } catch { /* ignore */ }
    }

    fetchWalkIn()
  }, [open])

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
  }, [menuOptions.length])

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
        customerId: customerId || 0,
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

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: 520, bgcolor: 'background.default' }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* ── Header ── */}
        <Box sx={{ px: 5, pt: 5, pb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Typography variant='h5' sx={{ fontWeight: 700, lineHeight: 1.2 }}>Add New Order</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              Fill in details to create an order
            </Typography>
          </div>
          <IconButton onClick={handleClose} size='small' sx={{ color: 'text.secondary', mt: -0.5 }}>
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
                <InputLabel>Payment Method</InputLabel>
                <Select label='Payment Method' value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
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
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size='small'>
                <InputLabel>Payment Status</InputLabel>
                <Select label='Payment Status' value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='paid'>Paid</MenuItem>
                  <MenuItem value='unpaid'>Unpaid</MenuItem>
                  <MenuItem value='failed'>Failed</MenuItem>
                  <MenuItem value='refunded'>Refunded</MenuItem>
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
                    value={newQty}
                    onChange={e => setNewQty(e.target.value)}
                    type='number'
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={3} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    fullWidth
                    variant='contained'
                    onClick={handleAddItem}
                    disabled={!selectedMenuItem || Number(newQty) < 1}
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
                {items.length > 0 ? (
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
                        <Typography color='text.disabled' fontSize={13}>No items added yet</Typography>
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
                  <Typography variant='body2' color='text.secondary'>€0.00</Typography>
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
            <Button variant='tonal' onClick={handleClose} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={() => setConfirmOpen(true)}
              disabled={saving || items.length === 0}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              Create Order
            </Button>
          </Box>
        </Box>

        {/* ── Confirm Dialog ── */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth='xs' fullWidth>
          <DialogTitle sx={{ pb: 1 }}>Confirm Order</DialogTitle>
          <DialogContent>
            <Box sx={{ '& > :not(:last-child)': { mb: 0.5 } }}>
              <Typography variant='body2' color='text.secondary'>
                Create this order with <strong>{items.length}</strong> item(s)?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 260, mt: 2 }}>
                <Typography variant='body2' color='text.secondary'>Subtotal</Typography>
                <Typography variant='body2'>€{subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 260 }}>
                <Typography variant='body2' color='text.secondary'>Tax (18%)</Typography>
                <Typography variant='body2'>€0.00</Typography>
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
              Cancel
            </Button>
            <Button onClick={handleSave} variant='contained' disabled={saving} sx={{ borderRadius: 2, textTransform: 'none' }}>
              {saving ? <CircularProgress size={18} color='inherit' sx={{ mr: 1 }} /> : null}
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Drawer>
  )
}

export default AddOrderDrawer
