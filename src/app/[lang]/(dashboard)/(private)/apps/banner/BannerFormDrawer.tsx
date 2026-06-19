'use client'

import { useEffect, useRef, useState } from 'react'

import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'

import { useForm, Controller } from 'react-hook-form'

import type { BannerItem } from '@/types/apps/bannerTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (formData: FormData, isEdit: boolean) => Promise<void>
  item: BannerItem | null
}

type FormValues = {
  sortOrder: number
  status: 'true' | 'false'
}

const defaultValues: FormValues = {
  sortOrder: 0,
  status: 'true'
}

const BannerFormDrawer = ({ open, onClose, onSave, item }: Props) => {
  const isEditMode = !!item
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ defaultValues })

  useEffect(() => {
    if (!open) return

    if (item) {
      reset({
        sortOrder: item.sortOrder ?? 0,
        status: item.status ? 'true' : 'false'
      })
      setPreviewUrl(item.imageUrlFull || null)
    } else {
      reset(defaultValues)
      setPreviewUrl(null)
    }

    setFile(null)
    setFileError(null)
  }, [item, open, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]

    if (!f) return

    if (!f.type.startsWith('image/')) {
      setFileError('Only image files are allowed')
      setFile(null)
      
return
    }

    if (f.size > 10 * 1024 * 1024) {
      setFileError('Image must be smaller than 10MB')
      setFile(null)
      
return
    }

    setFileError(null)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const onSubmit = async (formData: FormValues) => {
    if (!isEditMode && !file) {
      setFileError('Banner image is required')
      
return
    }

    const fd = new FormData()

    fd.append('bannerId', isEditMode ? String(item!.id) : '0')
    fd.append('restaurantId', '1')
    fd.append('sortOrder', String(formData.sortOrder))
    fd.append('status', formData.status)
    if (file) fd.append('bannerImage', file)

    setSubmitting(true)

    try {
      await onSave(fd, isEditMode)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 440 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h5'>{isEditMode ? 'Edit Banner' : 'Add New Banner'}</Typography>
          <IconButton size='small' onClick={onClose}>
            <i className='tabler-x text-2xl text-textPrimary' />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
          <form id='banner-form' onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: fileError ? 'error.main' : 'divider',
                    borderRadius: 1,
                    p: 2,
                    textAlign: 'center'
                  }}
                >
                  {previewUrl ? (
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={previewUrl}
                        alt='Banner preview'
                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                      />
                    </Box>
                  ) : (
                    <Typography color='text.secondary' sx={{ mb: 2 }}>
                      No image selected
                    </Typography>
                  )}
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <Button
                    variant='tonal'
                    startIcon={<i className='tabler-upload' />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? 'Replace Image' : 'Choose Image'}
                  </Button>
                  {fileError && <FormHelperText error>{fileError}</FormHelperText>}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='sortOrder'
                  control={control}
                  rules={{
                    required: 'Sort order is required',
                    min: { value: 0, message: 'Must be 0 or more' }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Sort Order'
                      helperText={errors.sortOrder?.message ?? 'Lower numbers appear first in the carousel'}
                      error={!!errors.sortOrder}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select fullWidth label='Status'>
                      <MenuItem value='true'>Active</MenuItem>
                      <MenuItem value='false'>Inactive</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </Box>
        <Box sx={{ p: 4, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type='submit' form='banner-form' variant='contained' disabled={submitting}>
              {isEditMode ? 'Save Changes' : 'Add Banner'}
            </Button>
            <Button onClick={onClose} variant='tonal' color='secondary' disabled={submitting}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default BannerFormDrawer
