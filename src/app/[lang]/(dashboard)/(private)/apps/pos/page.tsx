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
import type { MenuItem } from '@/types/apps/menuTypes'
import type { CartItem, OrderSummary } from '@/types/apps/posTypes'

// API Imports
import { post } from '@/services/apiService'
import { categoriesEndpoints } from '@/services/endpoints/category'
import { menuEndpoints } from '@/services/endpoints/menu'
import { posEndpoints } from '@/services/endpoints/pos'
import { getImageUrl } from '@/utils/getImageUrl'

const TAX_RATE = 0.18 // 18% GST

const Pos = () => {
  // States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
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
  const logoUrl = getImageUrl('/assets/logo.png')

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
          id: cat.id,
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
        const formattedMenuItems = (result.data.menuItems || []).map((item: any) => ({
          ...item,
          menuImages: typeof item.menuImages === 'string' ? JSON.parse(item.menuImages) : item.menuImages
        }))

        setMenuItems(formattedMenuItems)
      } else {
        throw new Error(result.message || 'Failed to fetch menu items')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch menu items')
    }
  }, [])

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
  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category?.id === selectedCategory)
    : menuItems

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
  const addToCart = (item: MenuItem) => {
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
        customerNotes: customerNotes.trim() || undefined
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
        <base href="${window.location.origin}" />
        <title>Receipt</title>
        <style>
          body {
            width: 280px;
            margin: 0 auto 10px;
            padding: 5px;
            font-size: 15px;
          }
          .center { text-align: center; }
          img {
            width: 90px;
            margin-bottom: 2px;
          }
          .details-row {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin: 0 0 5px;
          }
          .detail-item {
            flex: 1 1 130px;
            min-width: 130px;
            font-size: 14px;
          }
          .notes {
            margin: 0 0 8px;
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
      <body>
        <div class="center">
          <img src='${logoUrl}' alt="Logo" width='90'/>
          <h4 style="margin: 2px 0; line-height: normal;">Quick Bites, Happy vibes</h4>
          <p style="margin: 2px 0; line-height: normal;">Insta: @desidelights.be</p>
          <p style="margin: 2px 0; line-height: normal;">(+32) 4568 63496</p>
          <hr />
        </div>
        <div class="details-row">
          <div class="detail-item">Order #: ${orderNumber}</div>
          <div class="detail-item">Date: ${new Date().toLocaleDateString()}</div>
          <div class="detail-item">Time: ${new Date().toLocaleTimeString()}</div>
        </div>
        ${customerName && `<p style="margin: 0; line-height: 1.4;">Customer: ${customerName}</p>`}
        ${
          customerNotes &&
          `<p style="margin: 0; line-height: 1.4;" class="notes"><strong>Notes:</strong> ${customerNotes}</p>`
        }
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
          <tr>
            <td>Tax (18%)</td>
            <td style="text-align:right;">€${orderSummary.tax.toFixed(2)}</td>
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
        <script>
          (function(){
            const img = document.querySelector('img');
            const doPrint = () => { setTimeout(() => { window.print(); window.close(); }, 100); };
            if (!img) { doPrint(); return; }
            if (img.complete) { doPrint(); return; }
            img.addEventListener('load', doPrint);
            img.addEventListener('error', doPrint);
            // fallback timeout
            setTimeout(doPrint, 4000);
          })();
        </script>
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
                  onClick={() => setSelectedCategory(category.id)}
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
        <Box sx={{ width: '30%', p: 2, display: 'flex', flexDirection: 'column' }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax (18%):</Typography>
                  <Typography>€{orderSummary.tax.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='h6'>Total:</Typography>
                  <Typography variant='h6' color='primary'>
                    €{orderSummary.total.toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />
                <Typography variant='subtitle2' gutterBottom color='text.secondary'>
                  Customer Details (optional)
                </Typography>
                <TextField
                  label='Customer Name'
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  fullWidth
                  size='small'
                  sx={{ mb: 1 }}
                />
                <TextField
                  label='Phone Number'
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  fullWidth
                  size='small'
                  sx={{ mb: 1 }}
                />
                <TextField
                  label='Notes'
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  fullWidth
                  size='small'
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />

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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {/* <ReceiptIcon sx={{ mr: 1 }} /> */}
          <Receipt sx={{ mr: 1 }} />
          Order Receipt #{orderNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </Typography>
            {customerName && (
              <Typography variant='body2' color='text.secondary'>
                Customer: {customerName}
              </Typography>
            )}
            {customerPhone && (
              <Typography variant='body2' color='text.secondary'>
                Phone: {customerPhone}
              </Typography>
            )}
            {customerNotes && (
              <Typography variant='body2' color='text.secondary'>
                Notes: {customerNotes}
              </Typography>
            )}
          </Box>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Tax (18%):</Typography>
            <Typography>€{orderSummary.tax.toFixed(2)}</Typography>
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
            New Order
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
