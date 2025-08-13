'use client'

// React and MUI Imports
import { useEffect, useState } from 'react'

import Image from 'next/image' // For displaying images

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { useDropzone } from 'react-dropzone' // Import Dropzone

// Type Imports
import type { MenuItem as MenuItemType } from '@/types/apps/menuTypes'
import CustomTextField from '@core/components/mui/TextField'

// Props remain the same
type Props = {
  open: boolean
  handleClose: () => void
  menuData?: MenuItemType[]
  setData: (data: MenuItemType[]) => void
  itemToEdit?: MenuItemType | null
}

// Form validation type
type FormValidateType = {
  name: string
  description: string
  price: number
  tag: string
  offer: string
  status: boolean
}

// Styled component for the dropzone area
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
  const { open, handleClose, menuData, setData, itemToEdit } = props

  // State to manage files (both URLs and new File objects)
  const [files, setFiles] = useState<(File | string)[]>([])

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

  // React-Dropzone hook
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    onDrop: (acceptedFiles: File[]) => {
      // Add new files to the existing file state
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles.map(file => Object.assign(file))])
    }
  })

  // Effect to populate form and files when editing
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

      // Set existing images
      setFiles(itemToEdit.menuImages || [])
    } else {
      resetForm({
        name: '',
        description: '',
        price: 0,
        tag: '',
        offer: '0',
        status: true
      })
      setFiles([])
    }
  }, [itemToEdit, open, resetForm])

  // Function to remove an image (works for both URLs and Files)
  const handleRemoveFile = (fileToRemove: File | string) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove))
  }

  // Generate preview thumbnails for all files
  const renderFilePreview = (file: File | string) => {
    const src = typeof file === 'string' ? file : URL.createObjectURL(file)

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

  const onSubmit = (data: FormValidateType) => {
    // In a real application, you would upload the new `File` objects to a server
    // and get back URLs. Here, we'll simulate this by keeping existing URLs
    // and using blob URLs for new files for demonstration.
    const newImageUrls = files.map(file => (typeof file === 'string' ? file : URL.createObjectURL(file)))

    const newItem: MenuItemType = {
      id: itemToEdit?.id ?? (menuData ? Math.max(...menuData.map(item => item.id)) + 1 : 1),
      ...data,
      menuImages: newImageUrls
    }

    if (itemToEdit) {
      const updatedData = (menuData ?? []).map(item => (item.id === itemToEdit.id ? newItem : item))

      setData(updatedData)
    } else {
      setData([newItem, ...(menuData ?? [])])
    }

    handleClose()
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
          {/* Text fields for item details remain the same */}
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
              <CustomTextField
                select
                fullWidth
                label='Select Status'
                {...field}
                defaultValue={itemToEdit?.status ?? true}
              >
                <MenuItem value={'true'}>Active</MenuItem>
                <MenuItem value={'false'}>Inactive</MenuItem>
              </CustomTextField>
            )}
          />

          {/* NEW: Image Upload Section */}
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
            <Button variant='contained' type='submit'>
              Submit
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
