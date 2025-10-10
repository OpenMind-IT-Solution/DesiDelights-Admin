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
import { MenuItem } from '@mui/material'

import type { CouponProps } from '@/types/apps/couponTypes'
import CustomTextField from '@core/components/mui/TextField'

type Props = {
  open: boolean
  handleClose: () => void
  couponData?: CouponProps[]
  setData: (data: CouponProps[]) => void
  couponToEdit?: CouponProps | null
}

type FormValidateType = {
  id: number;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageCount: number;
  maxUsage: number;
}

const initialData = {
  id: 0,
  code: '',
  discount: 0,
  type: 'percentage',
  startDate: new Date(),
  endDate: new Date(),
  isActive: true,
  usageCount: 0,
  maxUsage: 0
}

// Ensure type is either "percentage" or "fixed"
const allowedTypes = ["percentage", "fixed"] as const

type CouponType = typeof allowedTypes[number]

const AddCouponDrawer = (props: Props) => {
  // Props
  const { open, handleClose, couponData, setData, couponToEdit } = props

  // States
  const [formData, setFormData] = useState<FormValidateType>(initialData)

  console.log("🚀 ~ AddCouponDrawer ~ formData:", formData)

  // Hooks
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    defaultValues: {
      code: '',
      discount: 0,
      type: 'percentage',
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      usageCount: 0,
      maxUsage: 0
    }
  })

  useEffect(() => {
    resetForm({
      code: couponToEdit?.code ?? '',
      discount: couponToEdit?.discount ?? 0,
      type: couponToEdit?.type ?? 'percentage',
      startDate: couponToEdit?.startDate ?? new Date(),
      endDate: couponToEdit?.endDate ?? new Date(),
      isActive: couponToEdit?.isActive ?? true,
      usageCount: couponToEdit?.usageCount ?? 0,
      maxUsage: couponToEdit?.maxUsage ?? 0
    })
  }, [couponToEdit, resetForm, open])

  const onSubmit = (data: FormValidateType) => {
    const newCoupon: CouponProps = {
      id: couponToEdit?.id ?? (couponData?.length ? couponData.length + 1 : 1),
      code: data.code,
      discount: data.discount,
      type: allowedTypes.includes(data.type as CouponType) ? (data.type as CouponType) : "percentage",
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
      usageCount: data.usageCount,
      maxUsage: data.maxUsage
    }

    if (couponToEdit) {
      const updatedCoupons = (couponData ?? []).map(coupon =>
        coupon.id === couponToEdit.id ? newCoupon : coupon
      )

      setData(updatedCoupons)
    } else {
      setData([newCoupon, ...(couponData ?? [])])
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
        <Typography variant='h5'>{couponToEdit ? 'Edit Restaurant' : 'Add New Restaurant'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-6 p-6'>
          <Controller
            name='code'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Coupon Code'
                placeholder='COUPON CODE'
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
                id='select-billing'
                label='Select Coupon Type'
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
                label='Discount'
                placeholder='10%'
                {...(errors.discount && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='usageCount'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Usage Count'
                placeholder='0'
                {...(errors.usageCount && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='maxUsage'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Max Usage'
                placeholder='0'
                {...(errors.maxUsage && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />

          <Controller
            name='isActive'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                id='select-status'
                label='Select Status'
                {...field}
                {...(errors.isActive && { error: true, helperText: 'This field is required.' })}
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

export default AddCouponDrawer
