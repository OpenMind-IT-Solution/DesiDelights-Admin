'use client'

// React Imports
import { useCallback, useEffect, useState } from 'react'

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material'


// Type Imports
import {
  MinusCircleOutline,
  PlusCircleOutline,
  Printer,
  Receipt,
  ShoppingOutline,
  TrashCanOutline
} from 'mdi-material-ui'

import type { Category } from '@/types/apps/categoryTypes'
import type { MenuItems } from '@/types/apps/menuTypes'
import type { CartItem, OrderSummary } from '@/types/apps/posTypes'

// API Imports
import CustomTextField from '@/@core/components/mui/TextField'
import { RequiredLabel } from '@/components/RequierdLabel'
import { post } from '@/services/apiService'
import { categoriesEndpoints } from '@/services/endpoints/category'
import { menuEndpoints } from '@/services/endpoints/menu'
import { posEndpoints } from '@/services/endpoints/pos'
import { getImageUrl } from '@/utils/getImageUrl'

const TAX_RATE = 0  // 0% tax

const Pos = () => {
  // States
  const [menuItems, setMenuItems] = useState<MenuItems[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const body = {
        page: 1,
        limit: 1000, // Fetch all categories
        status: true // Only active categories
      }

      const result: any = await post(categoriesEndpoints.getCategories, body)

      if (result.status === 'success') {
        const formattedCategories = (result.data.categories || []).map((cat: any) => ({
          id: Number(cat.id),
          name: cat.name,
          description: cat.description,
          status: cat.status ? 'active' : 'inactive'
        }))

        setCategories(formattedCategories)
      } else {
        throw new Error(result.message || 'Failed to fetch categories')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch categories')
    }
  }, [])

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    try {
      const payload = {
        page: 1,
        limit: 1000, // Fetch all menu items
        status: true // Only active items
      }

      const result: any = await post(menuEndpoints.getMenu, payload)

      if (result.status === 'success') {
        const formattedMenuItems = (result.data.menuItems || []).map((item: any) => {
          const category = typeof item.category === 'string' ? JSON.parse(item.category) : item.category

          return {
            ...item,
            menuImages: typeof item.menuImages === 'string' ? JSON.parse(item.menuImages) : item.menuImages,
            category
          }
        })

        setMenuItems(formattedMenuItems)
      } else {
        throw new Error(result.message || 'Failed to fetch menu items')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch menu items')
    }
  }, [])

  const getMenuItemCategoryId = (item: MenuItems) => {
    if (item.category?.id != null) {
      return Number(item.category.id)
    }

    if ((item as any).categoryId != null) {
      return Number((item as any).categoryId)
    }

    return null
  }

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      await Promise.all([fetchCategories(), fetchMenuItems()])
      setLoading(false)
    }

    fetchData()
  }, [fetchCategories, fetchMenuItems])

  // Filter menu items by category
  const filteredMenuItems =
    selectedCategory !== null ? menuItems.filter(item => getMenuItemCategoryId(item) === selectedCategory) : menuItems

  // Get active categories for filter
  const activeCategories = categories.filter(cat => cat.status === 'active')

  // Calculate order summary
  const orderSummary: OrderSummary = {
    items: cart,
    subtotal: cart.reduce((sum, item) => sum + item.total, 0),
    tax: cart.reduce((sum, item) => sum + item.total, 0) * TAX_RATE,
    total: cart.reduce((sum, item) => sum + item.total, 0) * (1 + TAX_RATE)
  }

  // Add item to cart
  const addToCart = (item: MenuItems) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)

    if (existingItem) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                total: (cartItem.quantity + 1) * cartItem.price
              }
            : cartItem
        )
      )
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          total: item.price,
          image: item.menuImages[0]
        }
      ])
    }
  }

  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId)

    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map(cartItem =>
          cartItem.id === itemId
            ? {
                ...cartItem,
                quantity: cartItem.quantity - 1,
                total: (cartItem.quantity - 1) * cartItem.price
              }
            : cartItem
        )
      )
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId))
    }
  }

  // Delete item from cart
  const deleteFromCart = (itemId: number) => {
    setCart(cart.filter(cartItem => cartItem.id !== itemId))
  }

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) return

    try {
      const payload = {
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: orderSummary.subtotal,
        tax: orderSummary.tax,
        total: orderSummary.total,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerNotes: customerNotes.trim() || undefined,
        paymentMethod
      }

      const result: any = await post(posEndpoints.saveOrder, payload)

      if (result.status === 'success') {
        setOrderNumber(result.data.orderId)
      } else {
        setOrderNumber(Math.floor(Math.random() * 10000) + 1)
      }
    } catch {
      setOrderNumber(Math.floor(Math.random() * 10000) + 1)
    }

    setOrderPlaced(true)
    setShowReceipt(true)
  }

  // Print receipt
  const printReceipt = () => {
    const receiptWindow = window.open('', '_blank', 'width=350,height=600')

    if (!receiptWindow) {
      console.error('Unable to open print window')

      return
    }

    const itemsHtml = cart
      .map(
        item => `
        <tr>
          <td>${item.name} x${item.quantity}</td>
          <td style="text-align:right;">€${item.total}</td>
        </tr>
      `
      )
      .join('')

    receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: monospace;
            width: 280px;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
          }
          .center { text-align: center; }
          img {
            width: 90px;
            margin-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            padding: 3px 0;
          }
          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .bold {
            font-weight: bold;
          }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="center">
          <img src="/logo.png" alt="Logo" />
          <h3>DESI DELIGHTS</h3>
          <p>info@desidelights.be</p>
          <p>+32 XXX XXX XXX</p>
          <hr />
        </div>

        <p>Order #: ${orderNumber}</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Time: ${new Date().toLocaleTimeString()}</p>
        ${customerName ? `<p>Customer: ${customerName}</p>` : ''}
        ${customerPhone ? `<p>Phone: ${customerPhone}</p>` : ''}
        ${customerNotes ? `<p>Notes: ${customerNotes}</p>` : ''}
        <p>Payment: ${paymentMethod === 'cash' ? 'Cash' : 'Card'}</p>

        <hr />

        <table>
          ${itemsHtml}
        </table>

        <hr />

        <table>
          <tr>
            <td>Subtotal</td>
            <td style="text-align:right;">€${orderSummary.subtotal.toFixed(2)}</td>
          </tr>
          <tr class="bold">
            <td>Total</td>
            <td style="text-align:right;">€${orderSummary.total.toFixed(2)}</td>
          </tr>
        </table>

        <hr />

        <div class="center">
          <p>Thank you for dining with us!</p>
        </div>
      </body>
    </html>
  `)

    receiptWindow.document.close()
  }

  // Reset for new order
  const newOrder = () => {
    setCart([])
    setOrderPlaced(false)
    setOrderNumber(null)
    setShowReceipt(false)
    setCustomerName('')
    setCustomerPhone('')
    setCustomerNotes('')
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant='h4' component='h1' align='center'>
          Desi Delights - POS Kiosk
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Menu */}
        <Box sx={{ width: '70%', p: 2, overflow: 'auto' }}>
          {/* Category Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={selectedCategory === null ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory(null)}
                size='small'
              >
                All
              </Button>
              {activeCategories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCategory(Number(category.id))}
                  size='small'
                >
                  {category.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Menu Items Grid */}
          <Grid container spacing={2}>
            {loading ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : error ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color='error'>{error}</Typography>
                </Box>
              </Grid>
            ) : filteredMenuItems.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant='body2' color='text.secondary'>
                    No menu items available
                  </Typography>
                </Box>
              </Grid>
            ) : (
              filteredMenuItems.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}
                    onClick={() => addToCart(item)}
                  >
                    <CardMedia
                      component='img'
                      height='140'
                      image={getImageUrl(item.menuImages[0]) || '/images/cards/default.png'}
                      alt={item.name}
                    />
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant='h6' component='h3' sx={{ flex: 1, mr: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant='h6' color='primary'>
                          €{item.price}
                        </Typography>
                      </Box>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1, height: 40, overflow: 'hidden' }}>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {item.tag && <Chip label={item.tag} size='small' color='primary' variant='outlined' />}
                        {item.offer && item.offer !== '0' && (
                          <Chip label={`${item.offer}% OFF`} size='small' color='success' />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Right Panel - Order Summary */}
        <Box sx={{ width: '30%', p: 2, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <Paper sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              {/* <ShoppingCartIcon sx={{ mr: 1 }} /> */}
              <ShoppingOutline sx={{ mr: 1 }} />
              Order Summary
            </Typography>

            {/* Cart Items */}
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {cart.length === 0 ? (
                <Typography variant='body2' color='text.secondary' align='center' sx={{ py: 4 }}>
                  No items in cart. Click on menu items to add them.
                </Typography>
              ) : (
                <List>
                  {cart.map(item => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemText primary={item.name} secondary={`€${item.price} x ${item.quantity}`} />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton size='small' onClick={() => removeFromCart(item.id)}>
                            <MinusCircleOutline />
                            {/* <RemoveIcon /> */}
                          </IconButton>
                          <Typography>{item.quantity}</Typography>
                          <IconButton size='small' onClick={() => addToCart(menuItems.find(m => m.id === item.id)!)}>
                            <PlusCircleOutline />
                            {/* <AddIcon /> */}
                          </IconButton>
                          <IconButton size='small' color='error' onClick={() => deleteFromCart(item.id)}>
                            <TrashCanOutline />
                            {/* <DeleteIcon /> */}
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* Order Total */}
            {cart.length > 0 && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>€{orderSummary.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='h6'>Total:</Typography>
                  <Typography variant='h6' color='primary'>
                    €{orderSummary.total.toFixed(2)}
                  </Typography>
                </Box>

                <Button variant='contained' fullWidth size='large' onClick={placeOrder} disabled={cart.length === 0}>
                  Place Order
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 3 }}>
          {/* <ReceiptIcon sx={{ mr: 1 }} /> */}
          <Receipt sx={{ mr: 1 }} />
          Order Receipt #{orderNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CustomTextField
                select
                fullWidth
                name='paymentMethod'
                label={<RequiredLabel label='Payment Method' isRequired={true} />}
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <MenuItem value='cash'>Cash</MenuItem>
                <MenuItem value='card'>Card</MenuItem>
              </CustomTextField>
            </Box>
          </Box>
          <Divider sx={{ mb: 1.5 }} />
          <Typography variant='subtitle2' gutterBottom color='text.secondary' sx={{ mb: 1 }}>
            Customer Details (Optional)
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
            <TextField
              label='Customer Name'
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              fullWidth
              size='small'
            />
            <TextField
              label='Phone Number'
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              fullWidth
              size='small'
            />
          </Box>
          <TextField
            label='Notes'
            value={customerNotes}
            onChange={e => setCustomerNotes(e.target.value)}
            fullWidth
            size='small'
            sx={{ mb: 1 }}
          />
          <List>
            {cart.map(item => (
              <ListItem key={item.id} sx={{ px: 0 }}>
                <ListItemText primary={item.name} secondary={`€${item.price} x ${item.quantity} = €${item.total}`} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Subtotal:</Typography>
            <Typography>€{orderSummary.subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant='h6'>Total:</Typography>
            <Typography variant='h6'>€{orderSummary.total.toFixed(2)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceipt(false)}>Close</Button>
          <Button variant='contained' onClick={printReceipt} startIcon={<Printer />}>
            Print Receipt
          </Button>
          <Button variant='outlined' onClick={newOrder}>
            Place Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for New Order */}
      {orderPlaced && !showReceipt && (
        <Fab color='primary' sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={newOrder}>
          AddICon
          {/* <AddIcon /> */}
        </Fab>
      )}
    </Box>
  )
}

export default Pos
