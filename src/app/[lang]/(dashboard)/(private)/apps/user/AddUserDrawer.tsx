'use client'

// React Imports
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

// MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// Third-party Imports
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as yup from 'yup';

// Component Imports
import CustomTextField from '@core/components/mui/TextField';

// Service & Endpoint Imports
import { post, postFormData } from '@/services/apiService';
import { roleEndpoints } from '@/services/endpoints/role';
import { userEndpoints } from '@/services/endpoints/user';

// Styled components for the image uploader
const ImgStyled = styled('img')(({ theme }) => ({
  width: 100,
  height: 100,
  marginRight: theme.spacing(4),
  borderRadius: theme.shape.borderRadius
}))

const ResetButtonStyled = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center'
  }
}))

// Define component props
interface Props {
  open: boolean
  handleClose: () => void
  userToEdit?: UserToEditType | null
  onSuccess: () => void
}

// Define the shape of user data for editing
interface UserToEditType {
  userId?: number
  fullName?: string
  username?: string
  email?: string
  roleId?: number
  status?: boolean
  phoneNumber?: string
  profileImage?: string // URL of existing image
}

// Define the shape of our form values
interface FormValidateType {
  fullName: string
  username: string
  email: string
  roleId: number | ''
  status: boolean
  phoneNumber: string
  profileImage: File | null
}

const AddUserDrawer = ({ open, handleClose, userToEdit, onSuccess }: Props) => {
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([])
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validationSchema = yup.object({
    fullName: yup.string().required('Full Name is required'),
    username: yup.string().required('Username is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    roleId: yup.number().required('Role is required'),
    status: yup.boolean().required('Status is required'),
    phoneNumber: yup.string().required('Phone Number is required'),
    profileImage: yup.mixed().nullable()
  })

  const initialValues = useMemo<FormValidateType>(
    () => ({
      fullName: userToEdit?.fullName || '',
      username: userToEdit?.username || '',
      email: userToEdit?.email || '',
      roleId: userToEdit?.roleId || '',
      status: userToEdit?.status ?? true,
      phoneNumber: userToEdit?.phoneNumber || '',
      profileImage: null
    }),
    [userToEdit]
  )

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      const formData = new FormData()

      formData.append('id', String(userToEdit?.userId || 0))
      formData.append('fullName', values.fullName)
      formData.append('username', values.username)
      formData.append('email', values.email)
      formData.append('restaurantId', '1')
      formData.append('roleId', String(values.roleId))
      formData.append('status', String(values.status))
      formData.append('phoneNumber', values.phoneNumber)

      if (values.profileImage) {
        formData.append('profileImage', values.profileImage)
      }

      try {
        const result = await postFormData(userEndpoints.saveUser, formData)

        if (result.status === 'success') {
          toast.success(result?.message || 'User saved successfully.')
          onSuccess()
          handleReset()
        } else {
          toast.error(result?.message || 'Failed to save user.')
        }
      } catch (error) {
        console.error('Error saving user:', error)
        toast.error('An unexpected error occurred.')
      }
    }
  })

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const payload = { search: '', page: 1, limit: 1000 }
        const response = await post(roleEndpoints.getRole, payload)
        const allRoles = response?.data?.roles || []
        const activeRoles = allRoles.filter((r: any) => r.status)

        setRoles(activeRoles)
      } catch (err) {
        console.error('Error fetching roles:', err)
      }
    }

    if (open) fetchRoles()
  }, [open])

  useEffect(() => {
    if (userToEdit && userToEdit.profileImage) {
      setImgSrc(userToEdit.profileImage)
    } else {
      setImgSrc('/images/avatars/1.png')
    }
  }, [userToEdit])

  const handleInputImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files && files.length > 0) {
      const file = files[0]

      formik.setFieldValue('profileImage', file) 

      const reader = new FileReader()

      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleReset = () => {
    handleClose()
    formik.resetForm()
    setImgSrc('/images/avatars/1.png')
  }

  return (
    <Drawer
      open={open}
      anchor='right'
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

      <form onSubmit={formik.handleSubmit} className='flex flex-col gap-6 p-6'>
        {/* Profile Image Uploader */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ImgStyled src={imgSrc} alt='Profile Pic' />
          <div>
            <Button variant='contained' size='small' onClick={() => fileInputRef.current?.click()}>
              Upload Photo
            </Button>
            <input
              ref={fileInputRef}
              type='file'
              hidden
              accept='image/png, image/jpeg'
              onChange={handleInputImageChange}
            />
            <ResetButtonStyled
              color='secondary'
              variant='tonal'
              size='small'
              onClick={() => {
                setImgSrc('/images/avatars/1.png')
                formik.setFieldValue('profileImage', null)
              }}
            >
              Reset
            </ResetButtonStyled>
            <Typography variant='body2' sx={{ mt: 2 }}>
              Allowed PNG or JPEG. Max size of 800K.
            </Typography>
          </div>
        </Box>

        <CustomTextField
          fullWidth
          name='fullName'
          label='Full Name'
          placeholder='John Doe'
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fullName && Boolean(formik.errors.fullName)}
          helperText={formik.touched.fullName && formik.errors.fullName}
        />

        <CustomTextField
          fullWidth
          name='username'
          label='Username'
          placeholder='john_doe'
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
        />

        <CustomTextField
          fullWidth
          name='email'
          type='email'
          label='Email'
          placeholder='johndoe@gmail.com'
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />

        <CustomTextField
          select
          fullWidth
          name='roleId'
          label='Select Role'
          value={formik.values.roleId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.roleId && Boolean(formik.errors.roleId)}
          helperText={formik.touched.roleId && formik.errors.roleId}
        >
          {roles.map(role => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField
          select
          fullWidth
          name='status'
          label='Select Status'
          value={formik.values.status ? 'true' : 'false'}
          onChange={e => formik.setFieldValue('status', e.target.value === 'true')}
          onBlur={formik.handleBlur}
          error={formik.touched.status && Boolean(formik.errors.status)}
          helperText={formik.touched.status && formik.errors.status}
        >
          <MenuItem value='true'>Active</MenuItem>
          <MenuItem value='false'>Inactive</MenuItem>
        </CustomTextField>

        <CustomTextField
          fullWidth
          name='phoneNumber'
          type='tel'
          label='Phone Number'
          placeholder='(397) 294-5153'
          value={formik.values.phoneNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
          helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
        />

        <div className='flex items-center gap-4'>
          <Button variant='contained' type='submit'>
            Submit
          </Button>
          <Button variant='tonal' color='error' onClick={handleReset}>
            Cancel
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default AddUserDrawer
