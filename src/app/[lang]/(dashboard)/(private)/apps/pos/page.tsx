'use client'

// React Imports
import { useCallback, useEffect, useRef, useState } from 'react'

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
import { post, put } from '@/services/apiService'
import { categoriesEndpoints } from '@/services/endpoints/category'
import { menuEndpoints } from '@/services/endpoints/menu'
import { couponEndpoints } from '@/services/endpoints/coupon'
import { orderEndpoints } from '@/services/endpoints/order'
import { posEndpoints } from '@/services/endpoints/pos'
import { getImageUrl } from '@/utils/getImageUrl'

const DEFAULT_VAT_RATE = 0.12

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
  const [couponCode, setCouponCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([])
  const [isPlacing, setIsPlacing] = useState(false)
  const receiptCaptureRef = useRef<HTMLDivElement>(null)

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
          return {
            ...item,
            menuImages: typeof item.menuImages === 'string' ? JSON.parse(item.menuImages) : item.menuImages,
            categoryId: item.categoryId || []
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

  // Fetch available coupons
  const fetchCoupons = useCallback(async () => {
    try {
      const result: any = await post(couponEndpoints.getCoupons, {
        page: 1,
        limit: 1000,
        status: true
      })

      if (result.status === 'success') {
        setAvailableCoupons(result.data.coupons || [])
      }
    } catch {
      // Silently fail - coupons are optional
    }
  }, [])

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      await Promise.all([fetchCategories(), fetchMenuItems(), fetchCoupons()])
      setLoading(false)
    }

    fetchData()
  }, [fetchCategories, fetchMenuItems, fetchCoupons])

  // Filter menu items by category
  const filteredMenuItems =

    // Filter items by category
    selectedCategory !== null
      ? menuItems.filter(item => {
          const ids = item.categories?.map(c => c.id) || (item as any).categoryId || []

          
return ids.includes(selectedCategory)
        })
      : menuItems

  // Get active categories for filter
  const activeCategories = categories.filter(cat => cat.status === 'active')

  // Calculate order summary with VAT
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)

  const vatByRate: Record<number, number> = {}

  const vatTotal = cart.reduce((sum, item) => {
    const menuItem = menuItems.find(m => m.id === item.id)
    const rate = menuItem?.vatRate != null ? menuItem.vatRate / 100 : DEFAULT_VAT_RATE
    const vat = item.total * rate
    const pct = Math.round(rate * 100)

    vatByRate[pct] = (vatByRate[pct] || 0) + vat

    return sum + vat
  }, 0)

  const orderSummary: OrderSummary = {
    items: cart,
    subtotal,
    foodSubtotal: subtotal,
    drinksSubtotal: 0,
    foodVat: vatTotal,
    drinksVat: 0,
    vatTotal,
    total: subtotal + vatTotal
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

  // Apply coupon
  const applyCoupon = async (code: string) => {
    if (!code.trim()) return

    setCouponLoading(true)
    setCouponError('')

    try {
      const result: any = await post(couponEndpoints.validateCoupon, {
        couponCode: code.trim(),
        subtotal: orderSummary.subtotal
      })

      if (result.status === 'success') {
        setCouponCode(code)
        setDiscountAmount(result.data.discountAmount)
      } else {
        setCouponCode('')
        setDiscountAmount(0)
        setCouponError(result.message || 'Invalid coupon')
      }
    } catch (err: any) {
      setCouponCode('')
      setDiscountAmount(0)
      setCouponError(err?.message || 'Failed to validate coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')

    setDiscountAmount(0)
    setCouponError('')
  }

  // Handle coupon dropdown selection
  const handleCouponChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const code = e.target.value as string

    if (code) {
      applyCoupon(code)
    } else {
      removeCoupon()
    }
  }

  // Helper to capture receipt image
  const captureReceiptImage = async (): Promise<string | null> => {
    const el = receiptCaptureRef.current

    if (!el) return null

    let origLeft: string | null = null

    try {
      await new Promise(r => setTimeout(r, 500))
      const logoImg = new Image()

      logoImg.src = '/logo.png'
      if (!logoImg.complete)
        await new Promise(r => {
          logoImg.onload = r
          logoImg.onerror = r
        })

      origLeft = el.style.left
      el.style.left = '0'

      await new Promise(r => requestAnimationFrame(r))

      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      return canvas.toDataURL('image/png')
    } catch {
      return null
    } finally {
      if (origLeft !== null) el.style.left = origLeft
    }
  }

  // Helper to save receipt image to backend
  const saveReceiptImage = async (orderId: number, imgData: string) => {
    try {
      await put(orderEndpoints.updateOrder(orderId), { receiptImage: imgData })
    } catch {
      // Silently fail - receipt image save is non-critical
    }
  }

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0 || isPlacing) return

    setIsPlacing(true)

    try {
      let newOrderId: number | null = null

      try {
        const payload = {
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal: orderSummary.subtotal,
          tax: orderSummary.vatTotal,
          total: orderSummary.total,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          customerNotes: customerNotes.trim() || undefined,
          paymentMethod,
          couponCode: couponCode.trim() || undefined,
          discountAmount
        }

      const result: any = await post(posEndpoints.saveOrder, payload)

      newOrderId = result.status === 'success' ? result.data.orderId : Math.floor(Math.random() * 10000) + 1
    } catch {
      newOrderId = Math.floor(Math.random() * 10000) + 1
    }

    setOrderNumber(newOrderId)

    // Capture receipt image and save to backend
    const imgData = await captureReceiptImage()

    if (imgData && newOrderId) {
      await saveReceiptImage(newOrderId, imgData)
    }

    setOrderPlaced(true)
    setCart([])
    setShowReceipt(false)
    removeCoupon()
  } catch {
    // Order failed, reset state
  } finally {
    setIsPlacing(false)
  }
}

  // Print receipt
  const printReceipt = async () => {
    if (cart.length === 0) return

    // Save order first
    let newOrderId: number | null = null

    try {
      const payload = {
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: orderSummary.subtotal,
        tax: orderSummary.vatTotal,
        total: orderSummary.total,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerNotes: customerNotes.trim() || undefined,
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
        discountAmount
      }

      const result: any = await post(posEndpoints.saveOrder, payload)

      newOrderId = result.status === 'success' ? result.data.orderId : Math.floor(Math.random() * 10000) + 1
    } catch {
      newOrderId = Math.floor(Math.random() * 10000) + 1
    }

    setOrderNumber(newOrderId)
    setOrderPlaced(true)
    removeCoupon()

    // Capture receipt image and save to backend, then open print window
    const imgData = await captureReceiptImage()

    if (imgData && newOrderId) {
      await saveReceiptImage(newOrderId, imgData)
    }

    if (imgData) {
      const w = window.open('', '_blank')

      if (w) {
        w.document.write(`<!DOCTYPE html><html><head><style>
          @page { size: 80mm 297mm; margin: 0; }
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:Arial,sans-serif;background:#f5f5f5}
          .receipt-wrapper{padding-top:30px;display:flex;flex-direction:column;align-items:center}
          .receipt-img{width:80mm;height:auto;display:block;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
          .actions{margin-top:20px;display:flex;gap:12px;padding-bottom:40px}
          .actions button,.actions a{padding:10px 24px;border:none;border-radius:6px;font-size:14px;cursor:pointer;text-decoration:none;font-weight:600}
          .btn-print{background:#1976d2;color:#fff}
          .btn-download{background:#fff;color:#1976d2;border:2px solid #1976d2}
          @media print{.actions{display:none!important}}
</style></head><body>
<div class="receipt-wrapper">
  <img class="receipt-img" src="${imgData}" />
  <div class="actions">
    <button class="btn-print" onclick="window.print()">Print</button>
    <a class="btn-download" href="${imgData}" download="receipt.png">Download</a>
  </div>
</div>
</body></html>`)
        w.document.close()
      }
    }

    setCart([])
    setShowReceipt(false)
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
                          €{(item.price * (1 + (item.vatRate || 12) / 100)).toFixed(2)}
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
                      <ListItemText primary={item.name} secondary={`€${item.price.toFixed(2)} x ${item.quantity}`} />
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
                {Object.entries(vatByRate).map(([rate, vat]) => (
                  <Box key={rate} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant='body2' color='text.secondary'>VAT {rate}%{rate === '12' ? ' (Food)' : ' (Drink)'}:</Typography>
                    <Typography variant='body2' color='text.secondary'>€{vat.toFixed(2)}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant='h6'>Total:</Typography>
                  <Typography variant='h6' color='primary'>
                    €{orderSummary.total.toFixed(2)}
                  </Typography>
                </Box>

                {/* Coupon */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant='body2' sx={{ mb: 0.5 }}>Coupon</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <CustomTextField
                      select
                      size='small'
                      placeholder='Select coupon'
                      value={discountAmount > 0 ? couponCode : ''}
                      onChange={handleCouponChange}
                      disabled={couponLoading}
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value=''>
                        <em>No coupon</em>
                      </MenuItem>
                      {availableCoupons.map((c: any) => (
                        <MenuItem key={c.id} value={c.code}>
                          {c.code} {c.type === 'percentage' ? `(${c.discount}%)` : `(€${c.discount})`}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                    {discountAmount > 0 && (
                      <Button size='small' color='error' variant='tonal' onClick={removeCoupon}>
                        Remove
                      </Button>
                    )}
                  </Box>
                  {couponLoading && <CircularProgress size={16} sx={{ mr: 1 }} />}
                  {couponError && (
                    <Typography variant='caption' color='error'>{couponError}</Typography>
                  )}
                  {discountAmount > 0 && !couponLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2' color='success.main'>Discount:</Typography>
                      <Typography variant='body2' color='success.main'>-€{discountAmount.toFixed(2)}</Typography>
                    </Box>
                  )}
                </Box>

                <Button
                  variant='contained'
                  fullWidth
                  size='large'
                  onClick={() => setShowReceipt(true)}
                  disabled={cart.length === 0}
                >
                  Review Order
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
          {orderNumber ? `Order Receipt #${orderNumber}` : 'Review Order'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              Date:{' '}
              <span suppressHydrationWarning>
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </span>
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
          <Box sx={{ width: '100%', fontSize: 13 }}>
            <Box sx={{ display: 'flex', fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', pb: 0.5, mb: 0.5 }}>
              <Typography sx={{ width: 24 }}>#</Typography>
              <Typography sx={{ flex: 1 }}>Item</Typography>
              <Typography sx={{ width: 65, textAlign: 'right' }}>Net</Typography>
              <Typography sx={{ width: 45, textAlign: 'right' }}>VAT%</Typography>
            </Box>
            {cart.map((item, i) => {
              const menuItem = menuItems.find(m => m.id === item.id)
              const rate = menuItem?.vatRate != null ? menuItem.vatRate : 12

              return (
                <Box key={item.id} sx={{ display: 'flex', py: 0.5 }}>
                  <Typography sx={{ width: 24 }}>{i + 1}</Typography>
                  <Typography sx={{ flex: 1 }}>{item.name} x{item.quantity}</Typography>
                  <Typography sx={{ width: 65, textAlign: 'right' }}>€{item.total.toFixed(2)}</Typography>
                  <Typography sx={{ width: 45, textAlign: 'right' }}>{rate}%</Typography>
                </Box>
              )
            })}
          </Box>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Subtotal:</Typography>
            <Typography>€{orderSummary.subtotal.toFixed(2)}</Typography>
          </Box>
          {Object.entries(vatByRate).map(([rate, vat]) => (
            <Box key={rate} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant='body2' color='text.secondary'>VAT {rate}%{rate === '12' ? ' (Food)' : ' (Drink)'}:</Typography>
              <Typography variant='body2' color='text.secondary'>€{vat.toFixed(2)}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant='h6'>Total:</Typography>
            <Typography variant='h6'>€{orderSummary.total.toFixed(2)}</Typography>
          </Box>
          {discountAmount > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography color='success.main'>Discount:</Typography>
                <Typography color='success.main'>-€{discountAmount.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant='h6'>Grand Total:</Typography>
                <Typography variant='h6' color='primary'>€{(orderSummary.total - discountAmount).toFixed(2)}</Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceipt(false)}>Close</Button>
          <Button variant='contained' onClick={printReceipt} startIcon={<Printer />}>
            Print Receipt
          </Button>
          <Button variant='outlined' onClick={placeOrder} disabled={isPlacing}>
            {isPlacing ? 'Placing...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden receipt template for image capture */}
      <div
        ref={receiptCaptureRef}
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          background: '#fff',
          color: '#000',
          padding: 30,
          fontFamily: 'monospace',
          fontSize: 13,
          textAlign: 'center',
          width: 320
        }}
      >
        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: 18, letterSpacing: 2 }}>DESI DELIGHTS</p>
        <p style={{ margin: '0 0 8px 0', fontSize: 11 }}>Quick Bites, Happy Vibes</p>
        <p style={{ margin: '2px 0' }}>admin@desidelights.be</p>
        <hr style={{ border: 'none', borderTop: '1px dashed #999', margin: '10px 0' }} />
        <p style={{ textAlign: 'left', margin: '4px 0' }}>Order #{orderNumber || 'N/A'}</p>
        <p style={{ textAlign: 'left', margin: '4px 0' }} suppressHydrationWarning>
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
        {customerName && <p style={{ textAlign: 'left', margin: '4px 0' }}>Customer: {customerName}</p>}
        {customerPhone && <p style={{ textAlign: 'left', margin: '4px 0' }}>Phone: {customerPhone}</p>}
        {customerNotes && <p style={{ textAlign: 'left', margin: '4px 0' }}>Notes: {customerNotes}</p>}
        <hr style={{ border: 'none', borderTop: '1px dashed #999', margin: '10px 0' }} />
        <div style={{ width: '100%', fontSize: 10, margin: '4px 0' }}>
          <div style={{ display: 'flex', fontWeight: 'bold', borderBottom: '1px dashed #999', padding: '2px 0' }}>
            <span style={{ width: 20 }}>#</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Item</span>
            <span style={{ width: 55, textAlign: 'right' }}>Net</span>
            <span style={{ width: 35, textAlign: 'right' }}>VAT%</span>
          </div>
          {cart.map((item, i) => {
            const menuItem = menuItems.find(m => m.id === item.id)
            const rate = menuItem?.vatRate != null ? menuItem.vatRate : 12

            return (
              <div key={item.id} style={{ display: 'flex', padding: '2px 0' }}>
                <span style={{ width: 20 }}>{i + 1}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{item.name} x{item.quantity}</span>
                <span style={{ width: 55, textAlign: 'right' }}>€{item.total.toFixed(2)}</span>
                <span style={{ width: 35, textAlign: 'right' }}>{rate}%</span>
              </div>
            )
          })}
        </div>
        <hr style={{ border: 'none', borderTop: '1px dashed #999', margin: '10px 0' }} />
        <div style={{ textAlign: 'right', fontSize: 11 }}>
          <p style={{ margin: '2px 0' }}>
            Net total: <strong>€{orderSummary.subtotal.toFixed(2)}</strong>
          </p>
          {Object.entries(vatByRate).map(([rate, vat]) => (
            <p key={rate} style={{ margin: '2px 0', fontSize: 11 }}>
              VAT {rate}%{rate === '12' ? ' (Food)' : ' (Drinks)'}: €{vat.toFixed(2)}
            </p>
          ))}
          <p style={{ margin: '2px 0', fontSize: 15 }}>
            Total: <strong>€{orderSummary.total.toFixed(2)}</strong>
          </p>
          {discountAmount > 0 && (
            <>
              <p style={{ margin: '2px 0', fontSize: 11, color: 'green' }}>
                Discount: -€{discountAmount.toFixed(2)}
              </p>
              <p style={{ margin: '2px 0', fontSize: 15 }}>
                Grand Total: <strong>€{(orderSummary.total - discountAmount).toFixed(2)}</strong>
              </p>
            </>
          )}
        </div>
        <hr style={{ border: 'none', borderTop: '1px dashed #999', margin: '10px 0' }} />
        <p style={{ margin: '8px 0' }}>Thank you for your order!</p>
      </div>

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
