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
  Divider,
  Fab,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Typography
} from '@mui/material'

// Type Imports
import {
  CloseCircleOutline,
  Magnify,
  MinusCircleOutline,
  PlusCircleOutline,
  ShoppingOutline,
  TrashCanOutline
} from 'mdi-material-ui'

import type { Category } from '@/types/apps/categoryTypes'
import type { MenuItems } from '@/types/apps/menuTypes'
import type { CartItem, OrderSummary } from '@/types/apps/posTypes'

// API Imports
import CustomTextField from '@/@core/components/mui/TextField'
import { post, put } from '@/services/apiService'
import { categoriesEndpoints } from '@/services/endpoints/category'
import { menuEndpoints } from '@/services/endpoints/menu'
import { couponEndpoints } from '@/services/endpoints/coupon'
import { orderEndpoints } from '@/services/endpoints/order'
import { posEndpoints } from '@/services/endpoints/pos'
import { getImageUrl } from '@/utils/getImageUrl'
import ReceiptDialog from '@/components/dialogs/receipt-dialog/ReceiptDialog'
import type { ReceiptDialogHandle } from '@/components/dialogs/receipt-dialog/ReceiptDialog'

const DEFAULT_VAT_RATE = 0.12

const Pos = () => {
  // States
  const [menuItems, setMenuItems] = useState<MenuItems[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
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
  const receiptDialogRef = useRef<ReceiptDialogHandle>(null)

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
        setAvailableCoupons((result.data.coupons || []).filter((c: any) => c.isAdminEligible !== false))
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

  // Filter menu items by category and search
  const filteredMenuItems = menuItems.filter(item => {
    const ids = item.categories?.map(c => c.id) || (item as any).categoryId || []
    const matchesCategory = selectedCategory === null || ids.includes(selectedCategory)

    const matchesSearch =
      searchQuery.trim() === '' || item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())

    return matchesCategory && matchesSearch
  })

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
      const result: any = await post(posEndpoints.validateCoupon, {
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
    const imgData = await receiptDialogRef.current?.captureReceiptImage()

    if (imgData && newOrderId) {
      try {
        await put(orderEndpoints.updateOrder(newOrderId), { receiptImage: imgData })
      } catch {
        // Silently fail - receipt image save is non-critical
      }
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

  // Save order before dialog captures and prints
  const handleBeforePrint = async () => {
    if (cart.length === 0) return

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
      const newOrderId = result.status === 'success' ? result.data.orderId : Math.floor(Math.random() * 10000) + 1

      setOrderNumber(newOrderId)
      setOrderPlaced(true)
      removeCoupon()
    } catch {
      // Silently fail
    }
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
          {/* Search Bar */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <CustomTextField
              size='small'
              placeholder='Search menu items...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{
                width: 350,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: theme => theme.shadows[1],
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  '&:hover, &.Mui-focused': {
                    boxShadow: theme => `0 0 0 3px ${theme.palette.primary.main}22`
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Magnify sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position='end'>
                    <IconButton size='small' onClick={() => setSearchQuery('')} aria-label='Clear search'>
                      <CloseCircleOutline fontSize='small' />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {searchQuery.trim() !== '' && (
              <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, textAlign: 'right', display: 'block' }}>
                {filteredMenuItems.length} {filteredMenuItems.length === 1 ? 'item' : 'items'} found
                {selectedCategory !== null ? ' in this category' : ''}
              </Typography>
            )}
          </Box>

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
      <ReceiptDialog
        ref={receiptDialogRef}
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        orderNumber={orderNumber}
        items={cart.map(item => {
          const menuItem = menuItems.find(m => m.id === item.id)

          return {
            name: item.name,
            quantity: item.quantity,
            total: item.total,
            vatRate: menuItem?.vatRate ?? 12
          }
        })}
        subtotal={orderSummary.subtotal}
        vatByRate={Object.fromEntries(
          Object.entries(vatByRate).map(([k, v]) => [k, v])
        )}
        vatTotal={orderSummary.vatTotal}
        total={orderSummary.total}
        discountAmount={discountAmount}
        showPlaceOrder
        isPlacing={isPlacing}
        onPlaceOrder={placeOrder}
        onBeforePrint={handleBeforePrint}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        customerName={customerName}
        onCustomerNameChange={setCustomerName}
        customerPhone={customerPhone}
        onCustomerPhoneChange={setCustomerPhone}
        customerNotes={customerNotes}
        onCustomerNotesChange={setCustomerNotes}
      />

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
