'use client'

// React Imports
import type { FC } from 'react'
import { useEffect, useState } from 'react'

// MUI Imports
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
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'

// Type Imports
import type { OrderType, OrderItemType } from '@/types/apps/orderTypes'
import { post } from '@/services/apiService'
import { menuEndpoints } from '@/services/endpoints/menu'

interface OrderItemsDrawerProps {
  open: boolean
  onClose: () => void
  order: OrderType | null
}

const OrderItemsDrawer: FC<OrderItemsDrawerProps> = ({ open, onClose, order }) => {
  const initialRaw = order?.orderItems ?? order?.items ?? []
  const normalize = (raw: any[]) =>
    raw.map((it, i) => ({
      id: Number(it.id ?? i + 1),
      name: it.name ?? it.title ?? it.productName ?? 'Item',
      quantity: Number(it.quantity ?? it.qty ?? 1),
      price: Number(it.price ?? 0)
    }))

  const [items, setItems] = useState<OrderItemType[]>(normalize(initialRaw))
  const [newMenuItemId, setNewMenuItemId] = useState<number | ''>('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showOrderItems, setShowOrderItems] = useState(false)

  const [menuOptions, setMenuOptions] = useState<any[]>([])
  const [menuLoading, setMenuLoading] = useState(false)

  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [editingQuantity, setEditingQuantity] = useState('1')

  const selectedMenuItem = menuOptions.find(item => item.id === newMenuItemId)

  const fetchMenu = async () => {
    setMenuLoading(true)
    try {
      const payload = { status: true }
      const result: any = await post(menuEndpoints.getMenu, payload)
      // result.data.menuItems or result.data?.menuItems depending on API
      const raw = result?.data?.menuItems || result?.data || []
      // if (!active) return
      const formatted = (raw || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        price: Number(m.price || 0),
        menuImages: m.menuImages || [],
        status: m.status
      }))
      setMenuOptions(formatted.filter((m: any) => m.status !== false))
    } catch (err) {
      console.error('Failed to fetch menu items', err)
    } finally {
      setMenuLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
    const raw = order?.orderItems ?? order?.items ?? []
    setItems(normalize(raw))
  }, [order])

  // Handle increase quantity
  const handleIncreaseQuantity = (itemId: number) => {
    setItems(prevItems => prevItems.map(item => (item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item)))
  }

  // Handle decrease quantity
  const handleDecreaseQuantity = (itemId: number) => {
    setItems(prevItems =>
      prevItems.map(item => (item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item))
    )
  }
  // Calculate total
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  }

  const handleAddItem = () => {
    if (!selectedMenuItem) return

    const quantity = Number(newItemQuantity)
    if (quantity < 1) return

    const nextId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1
    setItems(prevItems => [
      ...prevItems,
      {
        id: nextId,
        name: selectedMenuItem.name,
        price: selectedMenuItem.price,
        quantity,
        menuId: selectedMenuItem.id
      } as any
    ])
    setNewMenuItemId('')
    setNewItemQuantity('1')
  }

  const handleDeleteItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const handleEditItem = (item: OrderItemType) => {
    setEditingItemId(item.id)
    setEditingQuantity(String(item.quantity))
    // Scroll to form
    const formElement = document.getElementById('add-items-form')
    formElement?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSaveEdit = () => {
    if (editingItemId === null) return
    const quantity = Number(editingQuantity)
    if (quantity < 1) return
    setItems(prevItems => prevItems.map(item => (item.id === editingItemId ? { ...item, quantity } : item)))
    setEditingItemId(null)
    setEditingQuantity('1')
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditingQuantity('1')
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
        <div
          style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <div>
            <Typography variant='h5' sx={{ fontWeight: 700, mb: 0.5 }}>
              Order Details
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Order #{order?.id}
            </Typography>
          </div>
          <IconButton onClick={onClose} size='small' sx={{ color: 'text.primary' }}>
            <i className='tabler-x' />
          </IconButton>
        </div>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                Order Type
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {order?.orderType || '-'}
              </Typography>
            </div>
            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                Delivery Address
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 600 }}>
                {order?.deliveryAddress || '-'}
              </Typography>
            </div>
          </div>
          <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 700 }}>
            Order Items
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'none'
            }}
          >
            <Table size='small'>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255,255,255,0.04)' }}>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none' }}>Item</TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none' }} align='center'>
                    Unit Price
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none' }} align='center'>
                    Qty
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none' }} align='center'>
                    Total
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderBottom: 'none' }} align='center'>
                    Action
                  </TableCell>
                  {/* <TableCell sx={{ color: 'text.secondary', borderBottom: 'none' }} align='center'>
                      Edit
                    </TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length > 0 ? (
                  items.map(item => (
                    <TableRow key={item.id} sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {menuOptions.find(i => i.id === item.id)?.name}
                        </Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <Typography>€{item.price}</Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: 999,
                            padding: '4px 8px'
                          }}
                        >
                          <IconButton
                            size='small'
                            onClick={() => handleDecreaseQuantity(item.id)}
                            disabled={item.quantity <= 1}
                            sx={{ color: 'text.primary', minWidth: 28, p: 0.5 }}
                          >
                            <i className='tabler-minus' />
                          </IconButton>
                          <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Typography>
                          <IconButton
                            size='small'
                            onClick={() => handleIncreaseQuantity(item.id)}
                            sx={{ color: 'text.primary', minWidth: 28, p: 0.5 }}
                          >
                            <i className='tabler-plus' />
                          </IconButton>
                        </div>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <Typography>€{(item.price * item.quantity).toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ py: 1.5 }}>
                        <IconButton size='small' onClick={() => handleDeleteItem(item.id)} sx={{ color: 'error.main' }}>
                          <i className='tabler-trash' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                      <Typography color='text.secondary'>No items available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <div className='text-right'>
            <Button variant='contained' onClick={() => setShowOrderItems(!showOrderItems)} sx={{ my: 4 }}>
              {showOrderItems ? 'Close' : 'Add Items'}
            </Button>
          </div>

          {showOrderItems && (
            <>
              <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel id='order-item-select-label'>Item name</InputLabel>
                    <Select
                      labelId='order-item-select-label'
                      label='Item name'
                      value={newMenuItemId}
                      onChange={e => setNewMenuItemId(Number(e.target.value) || '')}
                      disabled={menuLoading}
                    >
                      <MenuItem value=''>{menuLoading ? 'Loading...' : 'Select item'}</MenuItem>
                      {!menuLoading &&
                        menuOptions.map(menuItem => (
                          <MenuItem key={menuItem.id} value={menuItem.id}>
                            {menuItem.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
                  <TextField
                    label='Price'
                    value={selectedMenuItem ? `€${selectedMenuItem.price}` : ''}
                    size='small'
                    fullWidth
                    disabled
                  />
                  <TextField
                    label='Quantity'
                    value={newItemQuantity}
                    onChange={e => setNewItemQuantity(e.target.value)}
                    size='small'
                    type='number'
                    inputProps={{ min: 1, step: 1 }}
                    fullWidth
                  />
                  <Button
                    variant='contained'
                    sx={{ height: 40 }}
                    onClick={handleAddItem}
                    disabled={!selectedMenuItem || Number(newItemQuantity) < 1}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant='subtitle2' color='text.secondary'>
              Updated Total
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              €{calculateTotal()}
            </Typography>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              variant='outlined'
              onClick={onClose}
              sx={{ color: 'text.primary', borderColor: 'rgba(255,255,255,0.12)' }}
            >
              Close
            </Button>
            <Button variant='contained' sx={{ px: 3 }} onClick={() => setConfirmOpen(true)}>
              Save Changes
            </Button>
          </div>
        </div>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Confirm Save</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to save changes to this order?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)} color='secondary' variant='outlined'>
              No
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false)
                onClose()
              }}
              color='primary'
              variant='contained'
            >
              Yes, save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Drawer>
  )
}

export default OrderItemsDrawer
