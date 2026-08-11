// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'

// Type Imports
import type { RestaurantTypes } from '@/types/apps/restaurantTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

import { post } from '@/services/apiService'
import { restaurantEndpoints } from '@/services/endpoints/restaurant'
import { RequiredLabel } from '@/components/RequierdLabel'

type Props = {
  open: boolean
  handleClose: () => void
  onSuccess: () => void
  restaurantToEdit?: RestaurantTypes | null
}

// Form data structure
type FormData = {
  name: string
  address: string
  phoneNumber: string
  email: string
  website: string
  vatNumber: string
  posId: string
  rel: string
  terminal: string
  pluHash: string
  ticketTeller: string
  ticketSignature: string
  controlModuleId: string
  vatCardId: string
  description: string
  status: 'active' | 'inactive' | 'pending' | string
}

const AddRestaurantDrawer = (props: Props) => {
  // Props
  const { open, handleClose, onSuccess, restaurantToEdit } = props

  // States
  const [loading, setLoading] = useState(false)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      website: '',
      vatNumber: '',
      posId: '',
      rel: '',
      terminal: '',
      pluHash: '',
      ticketTeller: '',
      ticketSignature: '',
      controlModuleId: '',
      vatCardId: '',
      description: '',
      status: 'active'
    }
  })

  // Populate form with data when editing
  useEffect(() => {
    if (open) {
      resetForm({
        name: restaurantToEdit?.name ?? '',
        address: restaurantToEdit?.address ?? '',
        phoneNumber: restaurantToEdit?.phoneNumber ?? '',
        email: restaurantToEdit?.email ?? '',
        website: restaurantToEdit?.website ?? '',
        vatNumber: restaurantToEdit?.vatNumber ?? '',
        posId: restaurantToEdit?.posId ?? '',
        rel: restaurantToEdit?.rel ?? '',
        terminal: restaurantToEdit?.terminal ?? '',
        pluHash: restaurantToEdit?.pluHash ?? '',
        ticketTeller: restaurantToEdit?.ticketTeller ?? '',
        ticketSignature: restaurantToEdit?.ticketSignature ?? '',
        controlModuleId: restaurantToEdit?.controlModuleId ?? '',
        vatCardId: restaurantToEdit?.vatCardId ?? '',
        description: restaurantToEdit?.description ?? '',
        status: restaurantToEdit?.status ?? 'active'
      })
    }
  }, [restaurantToEdit, open, resetForm])

  // Handle form submission for both add and edit
  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      // Construct the payload to match the API's requirements
      const payload = {
        restaurantId: restaurantToEdit?.id || 0, // 0 for new, ID for edit
        name: data.name,
        address: data.address,
        phoneNumber: data.phoneNumber,
        email: data.email,
        website: data.website || null,
        vatNumber: data.vatNumber || null,
        posId: data.posId || null,
        rel: data.rel || null,
        terminal: data.terminal || null,
        pluHash: data.pluHash || null,
        ticketTeller: data.ticketTeller || null,
        ticketSignature: data.ticketSignature || null,
        controlModuleId: data.controlModuleId || null,
        vatCardId: data.vatCardId || null,
        description: data.description,
        status: data.status === 'active' // Convert status to boolean
      }

      // Call the single 'save' endpoint
      const result: any = await post(restaurantEndpoints.saveRestaurant, payload)

      // Handle the API response
      if (result.status === 'success') {
        // Optionally, add a success toast notification here
        onSuccess() // Refresh the data grid in the parent component
        handleReset() // Close the drawer and reset the form
      } else {
        // Handle API error responses (e.g., validation errors)
        console.error('API Error:', result.message)

        // Optionally, add an error toast notification here
      }
    } catch (error) {
      console.error('Failed to save restaurant:', error)

      // Optionally, add a generic error toast notification here
    } finally {
      setLoading(false)
    }
  }

  // Handle closing and resetting the form
  const handleReset = () => {
    handleClose()
    resetForm({
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      website: '',
      vatNumber: '',
      posId: '',
      rel: '',
      terminal: '',
      pluHash: '',
      ticketTeller: '',
      ticketSignature: '',
      controlModuleId: '',
      vatCardId: '',
      description: '',
      status: 'active'
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
        <Typography variant='h5'>{restaurantToEdit ? 'Edit Restaurant' : 'Add New Restaurant'}</Typography>
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
            rules={{ required: 'This field is required.' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={<RequiredLabel label='Restaurant Name' isRequired={true} />}
                placeholder='Desi Delights'
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name='email'
            control={control}
            rules={{
              required: 'This field is required.',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: 'Invalid email address'
              }
            }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='email'
                label={<RequiredLabel label='Email' isRequired={true} />}
                placeholder='contact@desidelights.com'
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name='phoneNumber'
            control={control}
            rules={{ required: 'This field is required.' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='tel'
                label={<RequiredLabel label='Phone Number' isRequired={true} />}
                placeholder='+1 123 456 7890'
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
              />
            )}
          />

          <Controller
            name='website'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='url'
                label='Website'
                placeholder='https://www.desidelights.com'
              />
            )}
          />

          <Controller
            name='vatNumber'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='VAT Number'
                placeholder='BE0123.456.789'
              />
            )}
          />

          <Typography variant='subtitle2' sx={{ mt: 1 }}>
            Fiscal / Legal Footer (BTW-KASTICKET)
          </Typography>

          <Controller
            name='posId'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='POS ID' placeholder='AQU00045903482' />
            )}
          />

          <Controller
            name='rel'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='Rel' placeholder='QT240115BE' />
            )}
          />

          <Controller
            name='terminal'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='Terminal' placeholder='1 - 70:4A:0E:E1:5B:14' />
            )}
          />

          <Controller
            name='pluHash'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='PLU-Hash' placeholder='8934247F' />
            )}
          />

          <Controller
            name='ticketTeller'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='Ticket teller' placeholder='90411/90838 NS' />
            )}
          />

          <Controller
            name='ticketSignature'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='Ticket handtekening' placeholder='5B16097DB3EED508244627831C7A909AAE4F2E99' />
            )}
          />

          <Controller
            name='controlModuleId'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='Controlemodule-id' placeholder='BMC05056482' />
            )}
          />

          <Controller
            name='vatCardId'
            control={control}
            render={({ field }) => (
              <CustomTextField {...field} fullWidth label='VAT signing card-id' placeholder='0889732894-001' />
            )}
          />

          <Controller
            name='address'
            control={control}
            rules={{ required: 'This field is required.' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={<RequiredLabel label='Address' isRequired={true} />}
                placeholder='123 Curry Lane, Delhi'
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />

          <Controller
            name='description'
            control={control}
            rules={{ required: 'This field is required.' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                rows={3}
                label={<RequiredLabel label='Description' isRequired={true} />}
                placeholder='Authentic Indian cuisine...'
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />

          <Controller
            name='status'
            control={control}
            rules={{ required: 'This field is required.' }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='select-status'
                label={<RequiredLabel label='Select Status' isRequired={true} />}
                {...field}
                error={!!errors.status}
                helperText={errors.status?.message}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
              </CustomTextField>
            )}
          />

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

export default AddRestaurantDrawer
