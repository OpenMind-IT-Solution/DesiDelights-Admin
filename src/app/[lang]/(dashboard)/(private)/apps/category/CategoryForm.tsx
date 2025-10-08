'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Types
import type { Category } from '@/types/apps/categoryTypes'

// Custom Components
import CustomTextField from '@core/components/mui/TextField'

// Props for the unified form
type CategoryFormProps = {
  mode: 'add' | 'edit'
  category?: Category // Optional: only needed for 'edit' mode
  onSave: (data: Category | Omit<Category, 'id'>) => void
  onCancel: () => void
}

// Initial state for a new category
const initialData: Omit<Category, 'id'> = {
  name: '',
  description: '',
  status: 'active'
}

const CategoryForm = ({ mode, category, onSave, onCancel }: CategoryFormProps) => {
  // State to manage form data
  const [formData, setFormData] = useState(initialData)

  // Set form data when in 'edit' mode or reset for 'add' mode
  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status
      })
    } else {
      setFormData(initialData)
    }
  }, [mode, category])

  // Handle input changes
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Name and Description cannot be empty.') // Or use a more sophisticated notification
      
return
    }

    // Pass data to the onSave handler
    if (mode === 'edit' && category) {
      onSave({ ...category, ...formData })
    } else {
      onSave(formData)
    }
  }

  const isEditMode = mode === 'edit'
  const title = isEditMode ? `Editing: ${category?.name}` : 'Add New Category'
  const submitButtonText = isEditMode ? 'Save Changes' : 'Submit'

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <Typography variant='h5'>{title}</Typography>
      <CustomTextField
        fullWidth
        label='Category Name'
        value={formData.name}
        onChange={e => handleChange('name', e.target.value)}
        placeholder='Enter category name'
        required
      />
      <CustomTextField
        fullWidth
        label='Description'
        multiline
        rows={4}
        value={formData.description}
        onChange={e => handleChange('description', e.target.value)}
        placeholder='Enter category description'
        required
      />
      <CustomTextField
        select
        fullWidth
        label='Status'
        value={formData.status}
        onChange={e => handleChange('status', e.target.value)}
      >
        <MenuItem value='active'>Active</MenuItem>
        <MenuItem value='inactive'>Inactive</MenuItem>
        <MenuItem value='pending'>Pending</MenuItem>
      </CustomTextField>
      <Box className='flex gap-4'>
        <Button type='submit' variant='contained'>
          {submitButtonText}
        </Button>
        <Button type='button' variant='tonal' color='secondary' onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </form>
  )
}

export default CategoryForm
