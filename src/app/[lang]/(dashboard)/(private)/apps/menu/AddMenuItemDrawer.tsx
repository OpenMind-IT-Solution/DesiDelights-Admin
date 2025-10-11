'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image' 

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

import { useForm, Controller } from 'react-hook-form'
import { useDropzone } from 'react-dropzone' 
import { toast } from 'react-toastify'

import type { MenuItem as MenuItemType } from '@/types/apps/menuTypes'
import CustomTextField from '@core/components/mui/TextField'
import { postFormData } from '@/services/apiService'
import { menuEndpoints } from '@/services/endpoints/menu' 

type Props = {
  open: boolean
  handleClose: () => void
  itemToEdit?: MenuItemType | null
  refetchData: () => void
}

type FormValidateType = {
  name: string
  description: string
  price: number
  tag: string
  offer: string
  status: boolean
}

const Dropzone = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  padding: theme.spacing(6),
  borderRadius: theme.shape.borderRadius,
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main
  }
}))

const AddMenuItemDrawer = (props: Props) => {
  const { open, handleClose, itemToEdit, refetchData } = props

  const [files, setFiles] = useState<(File | string)[]>([])
  const [loading, setLoading] = useState(false)

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      tag: '',
      offer: '0',
      status: true
    }
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    onDrop: (acceptedFiles: File[]) => {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles.map(file => Object.assign(file))])
    }
  })

  useEffect(() => {
    if (itemToEdit) {
      resetForm({
        name: itemToEdit.name || '',
        description: itemToEdit.description || '',
        price: itemToEdit.price || 0,
        tag: itemToEdit.tag || '',
        offer: itemToEdit.offer || '0',
        status: itemToEdit.status ?? true
      })

      setFiles(itemToEdit.menuImages || [])
    } else {
      resetForm() 
      setFiles([])
    }
  }, [itemToEdit, open, resetForm])

  const handleRemoveFile = (fileToRemove: File | string) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove))
  }

  const renderFilePreview = (file: File | string) => {
    let src: string

    if (typeof file === 'string') {
      src = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${file}`
    } else {
      src = URL.createObjectURL(file)
    }

    return (
      <div key={typeof file === 'string' ? file : file.name} className='relative m-2'>
        <Image src={src} alt='preview' width={100} height={100} style={{ borderRadius: '8px', objectFit: 'cover' }} />
        <IconButton
          size='small'
          onClick={() => handleRemoveFile(file)}
          className='absolute top-0 right-0 bg-white rounded-full p-1 shadow-md'
          style={{ transform: 'translate(50%, -50%)' }}
        >
          <i className='tabler-x text-sm' />
        </IconButton>
      </div>
    )
  }

  const onSubmit = async (data: FormValidateType) => {
    setLoading(true)

    const formData = new FormData()

    formData.append('id', itemToEdit?.id ? String(itemToEdit.id) : '0')

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    const existingImages: string[] = []

    files.forEach(file => {
      if (typeof file === 'string') {
        existingImages.push(file)
      } else {
        formData.append('menuImages', file)
      }
    })

    formData.append('menuImages', JSON.stringify(existingImages))

    try {
      const result = await postFormData(menuEndpoints.saveMenu, formData)

      if (result.status === 'success') {
        toast.success(itemToEdit ? 'Item updated successfully!' : 'Item added successfully!')
        refetchData() 
        handleClose() 
      } else {
        toast.error(result.message || 'An error occurred.')
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
    setFiles([])
    resetForm({ name: '', description: '', price: 0, tag: '', offer: '0', status: true })
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>{itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Item Name'
                placeholder='Masala Dosa'
                {...(errors.name && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                rows={3}
                label='Description'
                {...(errors.description && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='price'
            control={control}
            rules={{ required: true, min: 0 }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='Price'
                {...(errors.price && { error: true, helperText: 'Price must be a positive number.' })}
              />
            )}
          />
          <Controller
            name='tag'
            control={control}
            render={({ field }) => <CustomTextField {...field} fullWidth label='Tag' placeholder="Chef's Special" />}
          />
          <Controller
            name='offer'
            control={control}
            rules={{ required: true, min: 0 }}
            render={({ field }) => <CustomTextField {...field} fullWidth label='Offer (%)' placeholder='15' />}
          />
          <Controller
            name='status'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField select fullWidth label='Select Status' value={field.value} onChange={field.onChange}>
                <MenuItem value={'true'}>Active</MenuItem>
                <MenuItem value={'false'}>Inactive</MenuItem>
              </CustomTextField>
            )}
          />

          <div>
            <Typography variant='body2' className='mb-2'>
              Menu Images
            </Typography>
            <Dropzone {...getRootProps()}>
              <input {...getInputProps()} />
              <Typography>Drag & drop images here, or click to select files</Typography>
            </Dropzone>
            {files.length > 0 && <div className='flex flex-wrap mt-4'>{files.map(renderFilePreview)}</div>}
          </div>

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
            <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddMenuItemDrawer
