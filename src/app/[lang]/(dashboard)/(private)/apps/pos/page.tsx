'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  IconButton,
  Divider,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab
} from '@mui/material'

// Icon Imports
// import AddIcon from '@mui/icons-material/Add'
// import RemoveIcon from '@mui/icons-material/Remove'
// import DeleteIcon from '@mui/icons-material/Delete'
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
// import PrintIcon from '@mui/icons-material/Print'
// import ReceiptIcon from '@mui/icons-material/Receipt'

// Type Imports
import type { MenuItem } from '@/types/apps/menuTypes'
import type { Category } from '@/types/apps/categoryTypes'
import type { CartItem, OrderSummary } from '@/types/apps/posTypes'

// Data Imports
import { db as menuData } from '@/fake-db/apps/menuList'
import { db as categoryData } from '@/fake-db/apps/categoryList'

const TAX_RATE = 0.18 // 18% GST

const Pos = () => {
  // States
  const [menuItems] = useState<MenuItem[]>(menuData.menuItems)
  const [categories] = useState<Category[]>(categoryData.categories)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  // Filter menu items by category
  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category?.id === selectedCategory)
    : menuItems

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
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
              total: (cartItem.quantity + 1) * cartItem.price
            }
          : cartItem
      ))
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        total: item.price,
        image: item.menuImages[0]
      }])
    }
  }

  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId)

    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? {
              ...cartItem,
              quantity: cartItem.quantity - 1,
              total: (cartItem.quantity - 1) * cartItem.price
            }
          : cartItem
      ))
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId))
    }
  }

  // Delete item from cart
  const deleteFromCart = (itemId: number) => {
    setCart(cart.filter(cartItem => cartItem.id !== itemId))
  }

  // Place order
  const placeOrder = () => {
    if (cart.length === 0) return

    const newOrderNumber = Math.floor(Math.random() * 10000) + 1
    setOrderNumber(newOrderNumber)
    setOrderPlaced(true)
    setShowReceipt(true)
  }

  // Print receipt
  const printReceipt = () => {
    const receiptContent = `
      ===== DESI DELIGHTS RECEIPT =====
      Order #${orderNumber}
      Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}

      Items:
      ${cart.map(item => `${item.name} x${item.quantity} - ₹${item.total}`).join('\n')}

      Subtotal: ₹${orderSummary.subtotal.toFixed(2)}
      Tax (18%): ₹${orderSummary.tax.toFixed(2)}
      Total: ₹${orderSummary.total.toFixed(2)}

      Thank you for dining with us!
      ================================
    `

    console.log('Printing receipt:', receiptContent)
    // In a real application, this would send to a thermal printer
    alert('Receipt printed successfully!')
  }

  // Reset for new order
  const newOrder = () => {
    setCart([])
    setOrderPlaced(false)
    setOrderNumber(null)
    setShowReceipt(false)
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" component="h1" align="center">
          Desi Delights - POS Kiosk
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Menu */}
        <Box sx={{ width: '70%', p: 2, overflow: 'auto' }}>
          {/* Category Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={selectedCategory === null ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory(null)}
                size="small"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCategory(category.id)}
                  size="small"
                >
                  {category.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Menu Items Grid */}
          <Grid container spacing={2}>
            {filteredMenuItems.map(item => (
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
                    component="img"
                    height="140"
                    image={item.menuImages[0] || '/images/cards/default.png'}
                    alt={item.name}
                  />
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ flex: 1, mr: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{item.price}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: 40, overflow: 'hidden' }}>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {item.tag && (
                        <Chip label={item.tag} size="small" color="primary" variant="outlined" />
                      )}
                      {item.offer && item.offer !== '0' && (
                        <Chip label={`${item.offer}% OFF`} size="small" color="success" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Right Panel - Order Summary */}
        <Box sx={{ width: '30%', p: 2, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              {/* <ShoppingCartIcon sx={{ mr: 1 }} /> */}
              shoppingCart
              Order Summary
            </Typography>

            {/* Cart Items */}
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {cart.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No items in cart. Click on menu items to add them.
                </Typography>
              ) : (
                <List>
                  {cart.map(item => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`₹${item.price} x ${item.quantity}`}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Remove
                          <IconButton size="small" onClick={() => removeFromCart(item.id)}>
                            removeIcon
                            {/* <RemoveIcon /> */}
                          </IconButton>
                          <Typography>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => addToCart(menuItems.find(m => m.id === item.id)!)}>
                            Add
                            {/* <AddIcon /> */}
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => deleteFromCart(item.id)}>
                            delete
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
                  <Typography>₹{orderSummary.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax (18%):</Typography>
                  <Typography>₹{orderSummary.tax.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{orderSummary.total.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={placeOrder}
                  disabled={cart.length === 0}
                >
                  Place Order
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onClose={() => setShowReceipt(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          {/* <ReceiptIcon sx={{ mr: 1 }} /> */}
          ReceiptIcon
          Order Receipt #{orderNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </Typography>
          </Box>

          <List>
            {cart.map(item => (
              <ListItem key={item.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={item.name}
                  secondary={`₹${item.price} x ${item.quantity} = ₹${item.total}`}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Subtotal:</Typography>
            <Typography>₹{orderSummary.subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Tax (18%):</Typography>
            <Typography>₹{orderSummary.tax.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">₹{orderSummary.total.toFixed(2)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceipt(false)}>Close</Button>
          <Button variant="contained" onClick={printReceipt} startIcon={/* <PrintIcon /> */ 'printIcon'}>
            Print Receipt
          </Button>
          <Button variant="outlined" onClick={newOrder}>
            New Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for New Order */}
      {orderPlaced && !showReceipt && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={newOrder}
        >
          AddICon
          {/* <AddIcon /> */}
        </Fab>
      )}
    </Box>
  )
}

export default Pos
