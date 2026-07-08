'use client'
import { useEffect } from 'react'

import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

import type { CouponProps } from '@/types/apps/couponTypes'
import { post } from '@/services/apiService'
import { couponEndpoints } from '@/services/endpoints/coupon'
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  handleClose: () => void
  onSuccess: () => void
  couponToEdit?: CouponProps | null
}

type FormValues = {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  startDate: string
  endDate: string
  status: 'active' | 'inactive'
  usageCount: number
  maxUsage: number
  isCustomerEligible: boolean
}

const toDateInputValue = (dateStr: string | undefined) => {
  if (!dateStr) return ''

  return new Date(dateStr).toISOString().slice(0, 10)
}

const AddCouponDrawer = ({ open, handleClose, onSuccess, couponToEdit }: Props) => {
  const { data: session } = useSession()

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues: {
      code: '',
      discount: 0,
      type: 'percentage',
      startDate: '',
      endDate: '',
      status: 'active',
      usageCount: 0,
      maxUsage: 0,
      isCustomerEligible: true
    }
  })

  useEffect(() => {
    if (open) {
      reset({
        code: couponToEdit?.code ?? '',
        discount: couponToEdit?.discount ?? 0,
        type: couponToEdit?.type ?? 'percentage',
        startDate: toDateInputValue(couponToEdit?.startDate),
        endDate: toDateInputValue(couponToEdit?.endDate),
        status: couponToEdit?.status === false ? 'inactive' : 'active',
        usageCount: couponToEdit?.usageCount ?? 0,
        maxUsage: couponToEdit?.maxUsage ?? 0,
        isCustomerEligible: couponToEdit?.isCustomerEligible ?? true
      })
    }
  }, [couponToEdit, open, reset])

  const onSubmit = async (data: FormValues) => {
    const restaurantId =
      typeof session?.user?.restaurantId === 'string'
        ? JSON.parse(session.user.restaurantId)
        : session?.user?.restaurantId || []

    const payload = {
      couponId: couponToEdit?.id ?? 0,
      restaurantId,
      code: data.code,
      discount: Number(data.discount),
      type: data.type,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      expiryDate: new Date(data.endDate).toISOString(),
      status: data.status === 'active',
      usageCount: Number(data.usageCount),
      maxUsage: Number(data.maxUsage),
      isCustomerEligible: data.isCustomerEligible
    }

    try {
      const result: any = await post(couponEndpoints.saveCoupon, payload)

      if (result.status === 'success') {
        toast.success(result?.message || (couponToEdit ? 'Coupon updated successfully.' : 'Coupon created successfully.'))
        onSuccess()
        handleClose()
      } else {
        toast.error(result?.message || 'Failed to save coupon.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save coupon.')
    }
  }

  const handleReset = () => {
    handleClose()
    reset()
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
        <Typography variant='h5'>{couponToEdit ? 'Edit Coupon' : 'Add New Coupon'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
          <Controller
            name='code'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Coupon Code'
                placeholder='SUMMER20'
                {...(errors.code && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='type'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label='Coupon Type'
                {...field}
                {...(errors.type && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='percentage'>Percentage</MenuItem>
                <MenuItem value='fixed'>Fixed Amount</MenuItem>
              </CustomTextField>
            )}
          />
          <Controller
            name='discount'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='Discount'
                placeholder='10'
                {...(errors.discount && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='startDate'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='date'
                label='Start Date'
                InputLabelProps={{ shrink: true }}
                {...(errors.startDate && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='endDate'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='date'
                label='End Date'
                InputLabelProps={{ shrink: true }}
                {...(errors.endDate && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='usageCount'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='Usage Count'
                placeholder='0'
              />
            )}
          />
          <Controller
            name='maxUsage'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='Max Usage'
                placeholder='100'
              />
            )}
          />
          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label='Status'
                {...field}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
              </CustomTextField>
            )}
          />
          <Controller
            name='isCustomerEligible'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                label='Eligible for customers'
              />
            )}
          />
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Submit'}
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

export default AddCouponDrawer
