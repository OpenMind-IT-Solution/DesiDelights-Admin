'use client'

import { useEffect } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Types
import type { GroceryItem } from '@/types/apps/groceryTypes'

// Custom Components
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (item: GroceryItem) => void
  item: GroceryItem | null
}

// Add 'location' to the default values
const defaultValues = {
  name: '',
  description: '',
  unit: 'Kg',
  type: 'Other' as GroceryItem['type'],
  store_name: '',
  location: '', // ADDED
  priority: 5,
  stock_quantity: 0
}

const getStockStatus = (quantity: number): GroceryItem['stock_status'] => {
  if (quantity <= 0) return 'Out of Stock'
  if (quantity < 10) return 'Low Stock'
  return 'In Stock'
}

const GroceryFormDrawer = ({ open, onClose, onSave, item }: Props) => {
  const isEditMode = !!item

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues
  })

  useEffect(() => {
    if (open) {
      if (item) {
        const formValues = {
          ...defaultValues,
          ...item,
          description: item.description || '',
          store_name: item.store_name || '',
          location: item.location || '',
          priority: item.priority || 5
        }
        reset(formValues)
      } else {
        reset(defaultValues)
      }
    }
  }, [item, open, reset])

  const onSubmit = (formData: any) => {
    const dataToSave = {
      ...(item || {}),
      ...formData,
      stock_status: getStockStatus(formData.stock_quantity)
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
                  name='unit'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField select fullWidth label='Unit' {...field}>
                      <MenuItem value='Kg'>Kg</MenuItem>
                      <MenuItem value='L'>L</MenuItem>
                      <MenuItem value='ml'>ml</MenuItem>
                      <MenuItem value='Packet'>Packet</MenuItem>
                      <MenuItem value='Piece'>Piece</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='type'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField select fullWidth label='Type' {...field}>
                      <MenuItem value='Dairy'>Dairy</MenuItem>
                      <MenuItem value='Disposable'>Disposable</MenuItem>
                      <MenuItem value='Other'>Other</MenuItem>
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
                  name='store_name'
                  control={control}
                  render={({ field }) => <CustomTextField {...field} fullWidth label='Store Name (Optional)' />}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='location'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Location (Optional)'
                      placeholder='e.g., Brussels, Belgium'
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='priority'
                  control={control}
                  rules={{ min: 1, max: 10 }}
                  render={({ field }) => <CustomTextField {...field} fullWidth type='number' label='Priority (1-10)' />}
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
