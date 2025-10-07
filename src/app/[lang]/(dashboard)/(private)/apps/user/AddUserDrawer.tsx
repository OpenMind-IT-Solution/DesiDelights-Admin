// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Types Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Define the props that the component accepts
type Props = {
  open: boolean
  handleClose: () => void
  onSuccess: () => void // Callback to signal the parent component
  userToEdit?: UsersType | null
}

// Define the shape of the form data
type FormValidateType = {
  fullName: string
  username: string
  email: string
  role: string
  status: string
}

// Define the shape for non-validated form fields
type FormNonValidateType = {
  contact: string
}

// Initial state for non-validated fields
const initialData: FormNonValidateType = {
  contact: ''
}

const AddUserDrawer = (props: Props) => {
  // Props
  const { open, handleClose, userToEdit, onSuccess } = props

  // States
  const [formData, setFormData] = useState<FormNonValidateType>(initialData)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    // Set default values based on whether we are editing or adding a user
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      role: '',
      status: ''
    }
  })

  // Effect to reset the form when the drawer opens or the userToEdit changes
  useEffect(() => {
    if (open) {
      resetForm({
        fullName: userToEdit?.fullName || '',
        username: userToEdit?.username || '',
        email: userToEdit?.email || '',
        role: userToEdit?.role || '',
        status: userToEdit?.status || ''
      })
      setFormData({
        contact: userToEdit?.phoneNumber || ''
      })
    }
  }, [userToEdit, open, resetForm])

  // Handle form submission
  const onSubmit = (data: FormValidateType) => {
    // NOTE: Here you would add your API call logic to save the user data.
    // For example:
    /*
    const userDataToSubmit = {
      ...data,
      phoneNumber: formData.contact
    };

    if (userToEdit) {
      // API call to update the user
      // await updateUserApi(userToEdit.id, userDataToSubmit);
    } else {
      // API call to create a new user
      // await createUserApi(userDataToSubmit);
    }
    */

    // After the API call succeeds, call onSuccess to trigger a data refresh in the parent table.
    onSuccess()

    // Close the drawer and reset the form to its initial state
    handleClose()
    setFormData(initialData)
    resetForm({
      fullName: '',
      username: '',
      email: '',
      role: '',
      status: ''
    })
  }

  // Handle closing the drawer without saving
  const handleReset = () => {
    handleClose()
    setFormData(initialData)
    resetForm({
        fullName: '',
        username: '',
        email: '',
        role: '',
        status: ''
      })
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
        <Typography variant='h5'>{userToEdit ? 'Edit User' : 'Add New User'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
          <Controller
            name='fullName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Full Name'
                placeholder='John Doe'
                {...(errors.fullName && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='email'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='email'
                label='Email'
                placeholder='johndoe@gmail.com'
                {...(errors.email && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='role'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='select-role'
                label='Select Role'
                {...field}
                {...(errors.role && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='admin'>Admin</MenuItem>
                <MenuItem value='author'>Author</MenuItem>
                <MenuItem value='editor'>Editor</MenuItem>
                <MenuItem value='maintainer'>Maintainer</MenuItem>
                <MenuItem value='user'>User</MenuItem>
              </CustomTextField>
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
                <MenuItem value='pending'>Pending</MenuItem>
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
              </CustomTextField>
            )}
          />
          <CustomTextField
            label='Contact'
            type='tel'
            fullWidth
            placeholder='(397) 294-5153'
            value={formData.contact}
            onChange={e => setFormData({ ...formData, contact: e.target.value })}
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

export default AddUserDrawer
