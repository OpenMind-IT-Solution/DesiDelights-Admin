'use client'

import { useEffect } from 'react'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

import { Controller, useForm } from 'react-hook-form'

import type { Category } from '@/types/apps/categoryTypes'

import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  handleClose: () => void
  categoryData?: Category[]
  setData: (data: Category[]) => void
  categoryToEdit?: Category | null
}

type FormValidateType = {
  name: string
  description: string
  status: string
}

const AddCategoryDrawer = (props: Props) => {
  const { open, handleClose, categoryData, setData, categoryToEdit } = props

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    defaultValues: {
      name: '',
      description: '',
      status: 'active'
    }
  })

  useEffect(() => {
    if (categoryToEdit) {
      resetForm({
        name: categoryToEdit.name || '',
        description: categoryToEdit.description || '',
        status: categoryToEdit.status || 'active'
      })
    } else {
      resetForm({
        name: '',
        description: '',
        status: 'active'
      })
    }
  }, [categoryToEdit, open, resetForm])

  const onSubmit = (data: FormValidateType) => {
    const newCategory: Category = {
      id: categoryToEdit?.id ?? (categoryData?.length ? Math.max(...categoryData.map(c => c.id)) + 1 : 1),
      name: data.name,
      description: data.description,
      status: data.status
    }

    if (categoryToEdit) {
      const updatedCategories = (categoryData ?? []).map(cat => (cat.id === categoryToEdit.id ? newCategory : cat))

      setData(updatedCategories)
    } else {
      setData([newCategory, ...(categoryData ?? [])])
    }

    handleClose()
    resetForm({ name: '', description: '', status: 'active' })
  }

  const handleReset = () => {
    handleClose()
    resetForm({ name: '', description: '', status: 'active' })
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
        <Typography variant='h5'>{categoryToEdit ? 'Edit Category' : 'Add New Category'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Category Name'
                placeholder='Category name'
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
                placeholder='Category description'
                {...(errors.description && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='status'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='select-status'
                label='Select Status'
                {...field}
                {...(errors.status && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
              </CustomTextField>
            )}
          />
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

export default AddCategoryDrawer
