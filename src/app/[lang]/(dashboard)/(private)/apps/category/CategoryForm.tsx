'use client'

// React and MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// Types
import type { Category } from '@/types/apps/categoryTypes'

// Custom Components
import CustomTextField from '@core/components/mui/TextField'
import { RequiredLabel } from '@/components/RequierdLabel'

// Props for the unified form remain the same
type CategoryFormProps = {
  mode: 'add' | 'edit'
  category?: Category // Optional: only needed for 'edit' mode
  onSave: (data: Category | Omit<Category, 'id'>) => void
  onCancel: () => void
}

// Validation schema using Yup
const validationSchema = yup.object({
  name: yup.string().trim().required('Category Name is required'),
  description: yup.string().trim().required('Description is required'),
  status: yup.string().oneOf(['active', 'inactive']).required('Status is required')
})

const CategoryForm = ({ mode, category, onSave, onCancel }: CategoryFormProps) => {
  // useFormik hook to manage form state, validation, and submission
  const formik = useFormik({
    // Initial values are determined by the mode ('add' or 'edit')
    initialValues: {
      name: category?.name || '',
      description: category?.description || '',
      status: category?.status || 'active'
    },
    validationSchema: validationSchema,
    // This is crucial for allowing the form to re-initialize with new props
    enableReinitialize: true,
    onSubmit: values => {
      // On submission, call the onSave prop with the correct data structure
      if (mode === 'edit' && category) {
        // In edit mode, we merge the original category data (like the ID) with the new form values
        onSave({ ...category, ...values })
      } else {
        // In add mode, we just pass the new form values
        onSave(values)
      }
    }
  })

  const isEditMode = mode === 'edit'
  const submitButtonText = isEditMode ? 'Save Changes' : 'Submit'

  return (
    <form onSubmit={formik.handleSubmit} className='flex flex-col gap-4'>
      <CustomTextField
        fullWidth
        name='name'
        label={<RequiredLabel label='Category Name' isRequired={true} />}
        placeholder='Enter category name'
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur} 
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
      />

      <CustomTextField
        fullWidth
        name='description'
        label={<RequiredLabel label='Description' isRequired={true} />}
        multiline
        rows={4}
        placeholder='Enter category description'
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
      />

      <CustomTextField
        select
        fullWidth
        name='status'
        label={<RequiredLabel label='Status' isRequired={true} />}
        value={formik.values.status}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.status && Boolean(formik.errors.status)}
        helperText={formik.touched.status && formik.errors.status}
      >
        <MenuItem value='active'>Active</MenuItem>
        <MenuItem value='inactive'>Inactive</MenuItem>
      </CustomTextField>

      <Box className='flex gap-4'>
        <Button type='submit' variant='contained' disabled={formik.isSubmitting}>
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
