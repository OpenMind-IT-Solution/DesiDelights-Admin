// React Imports
import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'

// Component Imports
import { RestaurantTypes } from '@/types/apps/restaurantTypes'
import CustomTextField from '@core/components/mui/TextField'
import { MenuItem } from '@mui/material'

type Props = {
  open: boolean
  handleClose: () => void
  restaurantData?: RestaurantTypes[]
  setData: (data: RestaurantTypes[]) => void
  restaurantToEdit?: RestaurantTypes | null
}

type FormNonValidateType = {
  email: string
  status: string
  avatar: string
  name: string
  location: string
  contact: string
  registrationName: string
  adminUsername: string
  currentPlan: string
  avatarColor: string
  billing: string
}

type FormValidateType = {
  email: string
  status: string
  avatar: string
  name: string
  location: string
  contact: string
  registrationName: string
  adminUsername: string
  currentPlan: string
  avatarColor: string
  billing: string
}

const initialData = {
  email: '',
  status: '',
  avatar: '',
  name: '',
  location: '',
  contact: '',
  registrationName: '',
  adminUsername: '',
  currentPlan: '',
  avatarColor: '',
  billing: ''
}

const AddRestaurantDrawer = (props: Props) => {
  // Props
  const { open, handleClose, restaurantData, setData, restaurantToEdit } = props

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
      email: restaurantToEdit?.email || '',
      status: restaurantToEdit?.status || '',
      avatar: restaurantToEdit?.avatar || '',
      name: restaurantToEdit?.name || '',
      location: restaurantToEdit?.location || '',
      contact: restaurantToEdit?.contact || '',
      registrationName: restaurantToEdit?.registrationName || '',
      adminUsername: restaurantToEdit?.adminUsername || '',
      currentPlan: restaurantToEdit?.currentPlan || '',
      billing: restaurantToEdit?.billing || ''
    }
  })

  useEffect(() => {
    resetForm({
      email: restaurantToEdit?.email ?? '',
      status: restaurantToEdit?.status ?? '',
      avatar: restaurantToEdit?.avatar ?? '',
      name: restaurantToEdit?.name ?? '',
      location: restaurantToEdit?.location ?? '',
      contact: restaurantToEdit?.contact ?? '',
      registrationName: restaurantToEdit?.registrationName ?? '',
      adminUsername: restaurantToEdit?.adminUsername ?? '',
      currentPlan: restaurantToEdit?.currentPlan ?? '',
      billing: restaurantToEdit?.billing ?? ''
    })
  }, [restaurantToEdit, resetForm, open])

  const onSubmit = (data: FormValidateType) => {
    const newRestaurants: RestaurantTypes = {
      id: restaurantToEdit?.id ?? (restaurantData?.length ? restaurantData.length + 1 : 1),

      email: data.email,
      status: data.status,
      avatar: data.avatar,
      name: data.name,
      location: data.location,
      contact: data.contact,
      registrationName: data.registrationName,
      adminUsername: data.adminUsername,
      currentPlan: data.currentPlan,
      billing: data.billing
    }

    if (restaurantToEdit) {
      const updatedRestaurants = (restaurantData ?? []).map(restaurant => (restaurant.id === restaurantToEdit.id ? newRestaurants : restaurant))

      setData(updatedRestaurants)
    } else {
      setData([newRestaurants, ...(restaurantData ?? [])])
    }

    handleClose()
    setFormData(initialData)
    resetForm()
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
        <Typography variant='h5'>{restaurantToEdit ? 'Edit Restaurant' : 'Add New Restaurant'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-6 p-6'>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Restaurant Name'
                placeholder='Desi Delights'
                {...(errors.name && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='registrationName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Registration Name'
                placeholder='Desi Delights Pvt Ltd'
                {...(errors.registrationName && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          <Controller
            name='adminUsername'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Admin Username'
                placeholder='admin'
                {...(errors.adminUsername && { error: true, helperText: 'This field is required.' })}
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
                label='Email'
                placeholder='john.doe@example.com'
                {...(errors.email && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          <Controller
            name='contact'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Contact'
                placeholder='+34 112 345 6789'
                {...(errors.contact && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          <Controller
            name='location'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Location'
                placeholder='Belgium'
                {...(errors.location && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />



          <Controller
            name='currentPlan'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Current Plan'
                placeholder='Premium'
                {...(errors.currentPlan && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='billing'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='select-billing'
                label='Select Billing Cycle'
                {...field}
                {...(errors.billing && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='monthly'>Monthly</MenuItem>
                <MenuItem value='bi-monthly'>Bi-Monthly</MenuItem>
                <MenuItem value='quarterly'>Quarterly</MenuItem>
                <MenuItem value='yearly'>Yearly</MenuItem>
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
                {/* <MenuItem value='pending'>Pending</MenuItem> */}
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
              </CustomTextField>
            )}
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

export default AddRestaurantDrawer
