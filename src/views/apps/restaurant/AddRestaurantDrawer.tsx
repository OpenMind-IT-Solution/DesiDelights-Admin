// React Imports
import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { RestaurantTypes } from '@/types/apps/restaurantTypes'

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
  country: string
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
  country: string
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
  country: '',
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

    }
  })

  useEffect(() => {
    resetForm({
      email: restaurantToEdit?.email ?? '',
      status: restaurantToEdit?.status ?? '',
      avatar: restaurantToEdit?.avatar ?? '',
      name: restaurantToEdit?.name ?? '',
      country: restaurantToEdit?.country ?? '',
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
      country: data.country,
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
          <CustomTextField
            label='Contact'
            type='tel'
            fullWidth
            placeholder='(397) 294-5153'
            value={formData.contact}
            onChange={e => setFormData({ ...formData, contact: e.target.value })}
          />
          <CustomTextField
            label='Registration Name'
            fullWidth
            placeholder='John Doe'
            value={formData.registrationName}
            onChange={e => setFormData({ ...formData, registrationName: e.target.value })}
          />
          <CustomTextField
            label='Admin Username'
            fullWidth
            placeholder='admin'
            value={formData.adminUsername}
            onChange={e => setFormData({ ...formData, adminUsername: e.target.value })}
          />
          <CustomTextField
            label='Current Plan'
            fullWidth
            placeholder='Basic'
            value={formData.currentPlan}
            onChange={e => setFormData({ ...formData, currentPlan: e.target.value })}
          />
          <CustomTextField
            label='Billing'
            fullWidth
            placeholder='Monthly'
            value={formData.billing}
            onChange={e => setFormData({ ...formData, billing: e.target.value })}
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
