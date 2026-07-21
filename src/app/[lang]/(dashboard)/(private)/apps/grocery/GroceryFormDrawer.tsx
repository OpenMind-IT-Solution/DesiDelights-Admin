'use client'

import { useEffect, useState } from 'react'

import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { toast } from 'react-toastify'

import { useForm, Controller } from 'react-hook-form'

import type { GroceryItem, GroceryStockStatus } from '@/types/apps/groceryTypes'

import { post, del } from '@/services/apiService'
import { storeEndpoints } from '@/services/endpoints/store'

import CustomTextField from '@core/components/mui/TextField'
import StoreDialog from './StoreDialog'

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
  const [storeDialogOpen, setStoreDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreOption | null>(null)
  const [deletingStore, setDeletingStore] = useState<StoreOption | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({ defaultValues })

  const fetchStores = async () => {
    try {
      const res: any = await post(storeEndpoints.storeDropdown, {})

      if (Array.isArray(res?.data)) {
        setStores(res.data)
      } else {
        setStores([])
      }
    } catch (err) {
      console.error('Failed to load stores', err)
      setStores([])
    }
  }

  useEffect(() => {
    if (!open) return

    fetchStores()
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

  const handleEditStore = (e: React.MouseEvent, store: StoreOption) => {
    e.stopPropagation()
    setEditingStore(store)
    setStoreDialogOpen(true)
  }

  const handleDeleteStore = (e: React.MouseEvent, store: StoreOption) => {
    e.stopPropagation()
    setDeletingStore(store)
  }

  const handleConfirmDelete = async () => {
    if (!deletingStore) return

    try {
      const res: any = await del(storeEndpoints.deleteStore(deletingStore.id))

      if (res?.status === 'success') {
        toast.success('Store deleted successfully')

        if (watch('store_id') === deletingStore.id) {
          setValue('store_id', '')
        }

        setDeletingStore(null)
        await fetchStores()
      } else {
        toast.error(res?.message || 'Failed to delete store')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete store')
    }
  }

  const selectedStore = stores.find(s => s.id === Number(watch('store_id')))

  return (
    <>
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
                      <Box>
                        <Autocomplete
                          options={[...stores, { id: -1, storeName: '+ Add New Store', location: '' }]}
                          getOptionLabel={option => {
                            if (option.id === -1) return '+ Add New Store'

                            return option.storeName
                          }}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          value={selectedStore ?? null}
                          onChange={(_event, newValue) => {
                            if (newValue && newValue.id === -1) {
                              setEditingStore(null)
                              setStoreDialogOpen(true)

                              return
                            }

                            field.onChange(newValue ? Number(newValue.id) : '')
                          }}
                          renderOption={(props, option) => {
                            if (option.id === -1) {
                              return (
                                <li {...props} key='add-new'>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                                    <i className='tabler-plus text-primary' />
                                    <Typography color='primary' fontWeight={600}>
                                      Add New Store
                                    </Typography>
                                  </Box>
                                </li>
                              )
                            }

                            return (
                              <li {...props} key={option.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                  <Typography variant='body2' fontWeight={500} noWrap>
                                    {option.storeName}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary' noWrap>
                                    {option.location}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0 }}>
                                  <IconButton
                                    size='small'
                                    color='primary'
                                    onClick={e => handleEditStore(e, option)}
                                    sx={{ p: 0.5 }}
                                  >
                                    <i className='tabler-edit text-lg' />
                                  </IconButton>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={e => handleDeleteStore(e, option)}
                                    sx={{ p: 0.5 }}
                                  >
                                    <i className='tabler-trash text-lg' />
                                  </IconButton>
                                </Box>
                              </li>
                            )
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Store'
                              placeholder='Search stores...'
                              error={!!errors.store_id}
                              helperText={
                                errors.store_id?.message ??
                                (stores.length === 0 ? 'Loading stores...' : `${stores.length} stores available`)
                              }
                            />
                          )}
                          filterOptions={(options, state) => {
                            const filtered = options.filter(
                              opt =>
                                opt.id === -1 ||
                                opt.storeName.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                                opt.location.toLowerCase().includes(state.inputValue.toLowerCase())
                            )

                            return filtered
                          }}
                        />
                      </Box>
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

      <StoreDialog
        open={storeDialogOpen}
        onClose={() => {
          setStoreDialogOpen(false)
          setEditingStore(null)
          fetchStores()
        }}
        onStoreCreated={newStore => {
          fetchStores().then(() => {
            setValue('store_id', newStore.id)
          })
          setStoreDialogOpen(false)
          setEditingStore(null)
        }}
        editStore={editingStore}
      />

      <Dialog open={!!deletingStore} onClose={() => setDeletingStore(null)}>
        <DialogTitle>
          <Typography variant='h5'>Confirm Deletion</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete store &quot;{deletingStore?.storeName}&quot;?
          </Typography>
          <Typography color='text.secondary' sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button variant='outlined' color='secondary' onClick={() => setDeletingStore(null)}>
            Cancel
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDelete}>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default GroceryFormDrawer
