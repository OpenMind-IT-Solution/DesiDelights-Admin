'use client'

import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

import { toast } from 'react-toastify'

import { post, del } from '@/services/apiService'
import { storeEndpoints } from '@/services/endpoints/store'

import CustomTextField from '@core/components/mui/TextField'

type StoreOption = {
  id: number
  storeName: string
  location: string
}

type Props = {
  open: boolean
  onClose: () => void
  onStoreCreated?: (store: StoreOption) => void
  editStore?: StoreOption | null
}

const StoreDialog = ({ open, onClose, onStoreCreated, editStore = null }: Props) => {
  const [stores, setStores] = useState<StoreOption[]>([])
  const [loading, setLoading] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [location, setLocation] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const fetchStores = async () => {
    setLoading(true)

    try {
      const res: any = await post(storeEndpoints.getStores, { page: 1, limit: 100 })

      if (res?.data?.stores) {
        setStores(res.data.stores)
      } else {
        setStores([])
      }
    } catch (err) {
      console.error('Failed to load stores', err)
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchStores()

      if (editStore) {
        setStoreName(editStore.storeName)
        setLocation(editStore.location)
        setEditingId(editStore.id)
      } else {
        setStoreName('')
        setLocation('')
        setEditingId(null)
      }
    }
  }, [open, editStore])

  const handleSave = async () => {
    if (!storeName.trim()) {
      toast.error('Store name is required')

      return
    }

    if (!location.trim()) {
      toast.error('Location is required')

      return
    }

    try {
      const body: any = {
        storeName: storeName.trim(),
        location: location.trim(),
        restaurantId: [1]
      }

      if (editingId) {
        body.storeId = editingId
      }

      const res: any = await post(storeEndpoints.saveStore, body)

      if (res?.status === 'success') {
        toast.success(editingId ? 'Store updated successfully' : 'Store created successfully')
        setStoreName('')
        setLocation('')
        setEditingId(null)
        await fetchStores()

        if (!editingId && res?.data && onStoreCreated) {
          onStoreCreated(res.data)
        }
      } else {
        toast.error(res?.message || 'Failed to save store')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save store')
    }
  }

  const handleEdit = (store: StoreOption) => {
    setStoreName(store.storeName)
    setLocation(store.location)
    setEditingId(store.id)
  }

  const handleCancelEdit = () => {
    setStoreName('')
    setLocation('')
    setEditingId(null)
  }

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return

    try {
      const res: any = await del(storeEndpoints.deleteStore(deletingId))

      if (res?.status === 'success') {
        toast.success('Store deleted successfully')
        setConfirmDeleteOpen(false)
        setDeletingId(null)
        await fetchStores()
      } else {
        toast.error(res?.message || 'Failed to delete store')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete store')
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='h5'>
                  {editingId ? 'Edit Store' : 'Manage Stores'}
                </Typography>
                <IconButton size='small' onClick={onClose}>
                  <i className='tabler-x' />
                </IconButton>
              </Box>
            }
          />
          <Divider />
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle2' sx={{ mb: 2 }}>
                {editingId ? 'Edit Store' : 'Add New Store'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <CustomTextField
                  fullWidth
                  size='small'
                  label='Store Name'
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder='Enter store name'
                />
                <CustomTextField
                  fullWidth
                  size='small'
                  label='Location'
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder='Enter location'
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant='contained' size='small' onClick={handleSave}>
                  {editingId ? 'Update' : 'Add'}
                </Button>
                {editingId && (
                  <Button variant='outlined' size='small' color='secondary' onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant='subtitle2' sx={{ mb: 2 }}>
              All Stores ({stores.length})
            </Typography>
            {loading ? (
              <Typography color='text.secondary'>Loading stores...</Typography>
            ) : stores.length === 0 ? (
              <Typography color='text.secondary'>No stores found</Typography>
            ) : (
              <List dense>
                {stores.map(store => (
                  <ListItem
                    key={store.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='body2' fontWeight={500}>
                            {store.storeName}
                          </Typography>
                          <Chip label={store.location} size='small' variant='outlined' />
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size='small' color='primary' onClick={() => handleEdit(store)}>
                        <i className='tabler-edit text-lg' />
                      </IconButton>
                      <IconButton size='small' color='error' onClick={() => handleDeleteClick(store.id)}>
                        <i className='tabler-trash text-lg' />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end', p: 3 }}>
            <Button variant='tonal' color='secondary' onClick={onClose}>
              Close
            </Button>
          </CardActions>
        </Card>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>
          <Typography variant='h5'>Confirm Deletion</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this store?
          </Typography>
          <Typography color='text.secondary' sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <CardActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button variant='outlined' color='secondary' onClick={() => setConfirmDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant='contained' color='error' onClick={handleConfirmDelete}>
            Yes, Delete
          </Button>
        </CardActions>
      </Dialog>
    </>
  )
}

export default StoreDialog
