// React Imports
import { useState } from 'react'

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
import { useEffect } from 'react'

type Props = {
  open: boolean
  handleClose: () => void
  userData?: UsersType[]
  setData: (data: UsersType[]) => void
  userToEdit?: UsersType | null
}

type FormValidateType = {
  fullName: string
  username: string
  email: string
  role: string
  plan: string
  status: string
}

type FormNonValidateType = {
  company: string
  country: string
  contact: string
}

// Vars
const initialData = {
  company: '',
  country: '',
  contact: ''
}

const AddUserDrawer = (props: Props) => {
  // Props
  const { open, handleClose, userData, setData, userToEdit } = props

  // States
  const [formData, setFormData] = useState<FormNonValidateType>(initialData)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    defaultValues: {
      fullName: userToEdit?.fullName || '',
      username: userToEdit?.username || '',
      email: userToEdit?.email || '',
      role: userToEdit?.role || '',
      plan: userToEdit?.currentPlan || '',
      status: userToEdit?.status || ''
    }
  })

  useEffect(() => {
    resetForm({
      fullName: userToEdit?.fullName || '',
      username: userToEdit?.username || '',
      email: userToEdit?.email || '',
      role: userToEdit?.role || '',
      plan: userToEdit?.currentPlan || '',
      status: userToEdit?.status || ''
    })
    setFormData({
      company: userToEdit?.company || '',
      country: userToEdit?.country || '',
      contact: userToEdit?.contact || ''
    })
  }, [userToEdit, resetForm, open])

  const onSubmit = (data: FormValidateType) => {
    const newUser: UsersType = {
      id: userToEdit?.id ?? (userData?.length ? userData.length + 1 : 1),
      avatar: userToEdit?.avatar ?? `/images/avatars/${Math.floor(Math.random() * 8) + 1}.png`,
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      role: data.role,
      currentPlan: data.plan,
      status: data.status,
      company: formData.company,
      country: formData.country,
      contact: formData.contact,
      billing: userToEdit?.billing ?? userData?.[Math.floor(Math.random() * userData.length)]?.billing ?? 'Auto Debit'
    }

    if (userToEdit) {
      const updatedUsers = (userData ?? []).map(user => (user.id === userToEdit.id ? newUser : user))
      setData(updatedUsers)
    } else {
      setData([newUser, ...(userData ?? [])])
    }

    handleClose()
    setFormData(initialData)
    resetForm({
      fullName: '',
      username: '',
      email: '',
      role: '',
      plan: '',
      status: ''
    })
  }

  const handleReset = () => {
    handleClose()
    setFormData(initialData)
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
        <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-6 p-6'>
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
          {/* <Controller
            name='username'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Username'
                placeholder='johndoe'
                {...(errors.username && { error: true, helperText: 'This field is required.' })}
              />
            )}
          /> */}
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
          {/* <Controller
            name='plan'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='select-plan'
                label='Select Plan'
                {...field}
                slotProps={{
                  htmlInput: { placeholder: 'Select Plan' }
                }}
                {...(errors.plan && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='basic'>Basic</MenuItem>
                <MenuItem value='company'>Company</MenuItem>
                <MenuItem value='enterprise'>Enterprise</MenuItem>
                <MenuItem value='team'>Team</MenuItem>
              </CustomTextField>
            )}
          /> */}
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
          {/* <CustomTextField
            label='Company'
            fullWidth
            placeholder='Company PVT LTD'
            value={formData.company}
            onChange={e => setFormData({ ...formData, company: e.target.value })}
          /> */}
          {/* <CustomTextField
            select
            fullWidth
            id='country'
            value={formData.country}
            onChange={e => setFormData({ ...formData, country: e.target.value })}
            label='Select Country'
            slotProps={{
              htmlInput: { placeholder: 'Country' }
            }}
          >
            <MenuItem value='India'>India</MenuItem>
            <MenuItem value='USA'>USA</MenuItem>
            <MenuItem value='Australia'>Australia</MenuItem>
            <MenuItem value='Germany'>Germany</MenuItem>
          </CustomTextField> */}
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
            <Button variant='tonal' color='error' type='reset' onClick={() => handleReset()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
