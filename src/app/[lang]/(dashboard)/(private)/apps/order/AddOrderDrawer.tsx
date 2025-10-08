// React Imports
import { useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'

// Types Imports
import type { OrderType } from '@/types/apps/orderTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  handleClose: () => void
  orderData?: OrderType[]
  setData: (data: OrderType[]) => void
  orderToEdit?: OrderType | null
}

type FormValidateType = {
  orderType: OrderType['orderType']
  status: OrderType['status']
  paymentStatus: OrderType['paymentStatus']
  totalAmount: number
  deliveryAddress: string
}

const initialData: FormValidateType = {
  orderType: 'delivery',
  status: 'pending',
  paymentStatus: 'unpaid',
  totalAmount: 0,
  deliveryAddress: ''
}

const AddOrderDrawer = (props: Props) => {
  const { open, handleClose, orderData, setData, orderToEdit } = props

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    defaultValues: orderToEdit || initialData
  })

  useEffect(() => {
    resetForm(orderToEdit || initialData)
  }, [orderToEdit, resetForm, open])

  const onSubmit = (data: FormValidateType) => {
    const newOrder: OrderType = {
      id: orderToEdit?.id ?? (orderData?.length ? orderData.length + 1 : 1),
      orderType: data.orderType,
      status: data.status,
      paymentStatus: data.paymentStatus,
      totalAmount: data.totalAmount,
      deliveryAddress: data.deliveryAddress,
      items: orderToEdit?.items || [] // could also add a form for items later
    }

    if (orderToEdit) {
      const updatedOrders = (orderData ?? []).map(order =>
        order.id === orderToEdit.id ? newOrder : order
      )

      setData(updatedOrders)
    } else {
      setData([newOrder, ...(orderData ?? [])])
    }

    handleClose()
    resetForm(initialData)
  }

  const handleReset = () => {
    handleClose()
    resetForm(initialData)
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
        <Typography variant='h5'>{orderToEdit ? 'Edit Order' : 'Add New Order'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-6 p-6'>
          <Controller
            name='orderType'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label='Order Type'
                {...field}
                {...(errors.orderType && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='delivery'>Delivery</MenuItem>
                <MenuItem value='pickup'>Pickup</MenuItem>
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
                label='Order Status'
                {...field}
                {...(errors.status && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='pending'>Pending</MenuItem>
                <MenuItem value='completed'>Completed</MenuItem>
                <MenuItem value='cancelled'>Cancelled</MenuItem>
              </CustomTextField>
            )}
          />

          <Controller
            name='paymentStatus'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label='Payment Status'
                {...field}
                {...(errors.paymentStatus && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='paid'>Paid</MenuItem>
                <MenuItem value='unpaid'>Unpaid</MenuItem>
                <MenuItem value='refunded'>Refunded</MenuItem>
              </CustomTextField>
            )}
          />

          <Controller
            name='totalAmount'
            control={control}
            rules={{ required: true, min: 0 }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                type='number'
                fullWidth
                label='Total Amount'
                placeholder='100.00'
                {...(errors.totalAmount && { error: true, helperText: 'Enter a valid amount.' })}
              />
            )}
          />

          <Controller
            name='deliveryAddress'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Delivery Address'
                placeholder='123 Main St, City, Country'
                {...(errors.deliveryAddress && { error: true, helperText: 'This field is required.' })}
              />
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

export default AddOrderDrawer
