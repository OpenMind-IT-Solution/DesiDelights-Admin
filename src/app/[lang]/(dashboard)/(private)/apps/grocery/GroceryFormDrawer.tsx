'use client'

import { useEffect, useState } from 'react'

import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'

import { useForm, Controller } from 'react-hook-form'

import type { GroceryItem, GroceryStockStatus } from '@/types/apps/groceryTypes'

import { post } from '@/services/apiService'
import { storeEndpoints } from '@/services/endpoints/store'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (item: GroceryItem) => void
  item: GroceryItem | null
}

type StoreOption = {
  id: number
  storeName: string
  location: string
}

type FormValues = {
  name: string
  description: string
  type: string
  store_id: number | ''
  priority: number
  stock_quantity: number
  item_lower_value: number
}

const defaultValues: FormValues = {
  name: '',
  description: '',
  type: 'Other',
  store_id: '',
  priority: 5,
  stock_quantity: 0,
  item_lower_value: 10
}

const getStockStatus = (quantity: number, lower: number): GroceryStockStatus => {
  if (quantity <= 0) return 'Out of Stock'
  if (quantity < lower) return 'Low Stock'

  return 'In Stock'
}

const GroceryFormDrawer = ({ open, onClose, onSave, item }: Props) => {
  const isEditMode = !!item
  const [stores, setStores] = useState<StoreOption[]>([])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ defaultValues })

  useEffect(() => {
    if (!open) return

    let cancelled = false

    ;(async () => {
      try {
        const res: any = await post(storeEndpoints.storeDropdown, {})

        if (!cancelled) setStores(Array.isArray(res?.data) ? res.data : [])
      } catch (err) {
        console.error('Failed to load stores', err)
        if (!cancelled) setStores([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    if (item) {
      reset({
        name: item.name ?? '',
        description: item.description ?? '',
        type: item.type ?? 'Other',
        store_id: item.store_id ?? '',
        priority: item.priority ?? 5,
        stock_quantity: item.stock_quantity ?? 0,
        item_lower_value: item.item_lower_value ?? 10
      })
    } else {
      reset(defaultValues)
    }
  }, [item, open, reset])

  const onSubmit = (formData: FormValues) => {
    const quantity = Number(formData.stock_quantity)
    const lower = Number(formData.item_lower_value)
    const selectedStore = stores.find(s => s.id === Number(formData.store_id))

    const dataToSave: GroceryItem = {
      id: item?.id ?? 0,
      name: formData.name,
      description: formData.description || null,
      type: formData.type,
      store_id: Number(formData.store_id),
      store_name: selectedStore?.storeName ?? item?.store_name ?? null,
      location: selectedStore?.location ?? item?.location ?? null,
      priority: Number(formData.priority),
      stock_quantity: quantity,
      item_lower_value: lower,
      stock_status: getStockStatus(quantity, lower)
    }

    onSave(dataToSave)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h5'>{isEditMode ? 'Edit Item' : 'Add New Item'}</Typography>
          <IconButton size='small' onClick={onClose}>
            <i className='tabler-x text-2xl text-textPrimary' />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
          <form id='grocery-form' onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Controller
                  name='name'
                  control={control}
                  rules={{ required: 'Item name is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      autoFocus
                      fullWidth
                      label='Item Name'
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='stock_quantity'
                  control={control}
                  rules={{ required: 'Quantity is required', min: { value: 0, message: 'Must be 0 or more' } }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Quantity'
                      error={!!errors.stock_quantity}
                      helperText={errors.stock_quantity?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='item_lower_value'
                  control={control}
                  rules={{ required: 'Low-stock threshold is required', min: { value: 0, message: 'Must be 0 or more' } }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Low Stock Threshold'
                      helperText={errors.item_lower_value?.message ?? 'Quantity below this is marked Low Stock'}
                      error={!!errors.item_lower_value}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='type'
                  control={control}
                  rules={{ required: 'Type is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Type'
                      placeholder='e.g. Grain, Spice, Dairy'
                      error={!!errors.type}
                      helperText={errors.type?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='store_id'
                  control={control}
                  rules={{ required: 'Store is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label='Store'
                      value={field.value === '' ? '' : String(field.value)}
                      onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                      onBlur={field.onBlur}
                      error={!!errors.store_id}
                      helperText={
                        errors.store_id?.message ??
                        (stores.length === 0 ? 'Loading stores...' : `${stores.length} stores available`)
                      }
                    >
                      <MenuItem value=''>
                        <em>Select a store</em>
                      </MenuItem>
                      {stores.map(store => (
                        <MenuItem key={store.id} value={String(store.id)}>
                          {store.storeName} — {store.location}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} fullWidth multiline rows={3} label='Description (Optional)' />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='priority'
                  control={control}
                  rules={{
                    required: 'Priority is required',
                    min: { value: 1, message: 'Min 1' },
                    max: { value: 10, message: 'Max 10' }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Priority (1-10)'
                      error={!!errors.priority}
                      helperText={errors.priority?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </Box>
        <Box sx={{ p: 4, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type='submit' form='grocery-form' variant='contained'>
              {isEditMode ? 'Save Changes' : 'Add Item'}
            </Button>
            <Button onClick={onClose} variant='tonal' color='secondary'>
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default GroceryFormDrawer
