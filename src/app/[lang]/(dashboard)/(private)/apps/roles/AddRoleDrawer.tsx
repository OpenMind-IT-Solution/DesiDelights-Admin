// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormHelperText,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

// Third-party Imports
import { useFormik } from 'formik'
import * as Yup from 'yup'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import { post } from '@/services/apiService'
import { roleEndpoints } from '@/services/endpoints/role'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

// Types
// FIX 1: Create a separate type for the permission flags that are actually booleans
type PermissionFlag = 'all' | 'view' | 'create' | 'edit' | 'delete'

type Permissions = {
  moduleId: number
  all: boolean
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

export type ModulePermissions = {
  [key: string]: Permissions
}

export type RoleType = {
  id: number
  roleName: string
  permissions: ModulePermissions
  status: 'active' | 'inactive'
}

type Props = {
  open: boolean
  handleClose: () => void
  roleData?: RoleType[]
  setData: (data: RoleType[]) => void
  roleToEdit?: RoleType | null
}

// Default permissions
const initialPermissions: ModulePermissions = {
  'Category Management': { moduleId: 5, all: false, view: false, create: false, edit: false, delete: false },
  'Coupon Management': { moduleId: 10, all: false, view: false, create: false, edit: false, delete: false },
  'Customer Management': { moduleId: 4, all: false, view: false, create: false, edit: false, delete: false },
  'Customer Review and Rating': { moduleId: 11, all: false, view: false, create: false, edit: false, delete: false },
  Dashboard: { moduleId: 1, all: false, view: false, create: false, edit: false, delete: false },
  'Inventory Management': { moduleId: 8, all: false, view: false, create: false, edit: false, delete: false },
  'Location Management': { moduleId: 16, all: false, view: false, create: false, edit: false, delete: false },
  'Menu Management': { moduleId: 6, all: false, view: false, create: false, edit: false, delete: false },
  'Order Management': { moduleId: 7, all: false, view: false, create: false, edit: false, delete: false },
  'Payment Gateway': { moduleId: 15, all: false, view: false, create: false, edit: false, delete: false },
  'Report Management': { moduleId: 9, all: false, view: false, create: false, edit: false, delete: false },
  'Restaurant Management': { moduleId: 2, all: false, view: false, create: false, edit: false, delete: false },
  'Restaurant Profile': { moduleId: 17, all: false, view: false, create: false, edit: false, delete: false },
  'Roles & Permission': { moduleId: 18, all: false, view: false, create: false, edit: false, delete: false },
  Setting: { moduleId: 14, all: false, view: false, create: false, edit: false, delete: false },
  'Support Tickets': { moduleId: 12, all: false, view: false, create: false, edit: false, delete: false },
  'TV Management': { moduleId: 13, all: false, view: false, create: false, edit: false, delete: false },
  'User Management': { moduleId: 3, all: false, view: false, create: false, edit: false, delete: false }
}

// Validation schema
const validationSchema = Yup.object({
  roleName: Yup.string().required('Role name is required'),
  status: Yup.string().oneOf(['active', 'inactive', 'pending']).required('Status is required'),
  permissions: Yup.object().test('at-least-one', 'At least one permission must be selected', value => {
    if (!value) return false

    // Check if any of the boolean permission flags are true
    return Object.values(value as ModulePermissions).some(module =>
      Object.entries(module as Permissions).some(([key, val]) => key !== 'moduleId' && val === true)
    )
  })
})

const RoleDrawer = (props: Props) => {
  const { data: session } = useSession()
  const { open, handleClose, roleData, setData, roleToEdit } = props
  const [loading, setLoading] = useState(false)

  const formik = useFormik<RoleType>({
    initialValues: {
      id: roleToEdit?.id ?? 0,
      roleName: roleToEdit?.roleName ?? '',
      status: roleToEdit?.status ?? 'active',
      permissions: roleToEdit?.permissions ?? initialPermissions
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        setLoading(true)

        // FIX 2: Refactor the mapping to be more robust.
        // This explicitly separates moduleId and the other permission flags,
        // ensuring moduleId is always included in the final object.
        // It also correctly omits the 'all' flag which is not part of the API payload.
        const permissionArray = Object.entries(values.permissions).map(([moduleName, perms]) => {
          const { moduleId, view, create, edit, delete: del } = perms // 'delete' is a reserved keyword, so we alias it.

          return {
            moduleId,
            moduleName,
            view,
            create,
            edit,
            delete: del
          }
        })

        const body = {
          restaurantId:
            typeof session?.user?.restaurantId === 'string'
              ? JSON.parse(session.user.restaurantId)
              : session?.user?.restaurantId || [],
          roleId: values.id,
          name: values.roleName,
          status: values.status === 'active',
          permissions: permissionArray
        }

        const res: any = await post(roleEndpoints.saveRole, body)

        if (res?.status === 'success') {
          const newRole: RoleType = {
            id:
              values.id !== 0
                ? values.id
                : roleData && roleData.length > 0
                  ? Math.max(...roleData.map(role => role.id)) + 1
                  : 1,
            roleName: values.roleName,
            status: values.status,
            permissions: values.permissions
          }

          const updatedRoles =
            values.id !== 0
              ? (roleData ?? []).map(role => (role.id === values.id ? newRole : role))
              : [newRole, ...(roleData ?? [])]

          setData(updatedRoles)
          toast.success(res?.message || (values.id !== 0 ? 'Role updated successfully' : 'Role created successfully'))
          handleClose()
          formik.resetForm()
        } else {
          toast.error(res?.message || 'Something went wrong')
        }
      } catch (err: any) {
        console.error(err)
        toast.error('Error while saving role')
      } finally {
        setLoading(false)
      }
    }
  })

  const { values, errors, touched, handleChange, setFieldValue, handleSubmit, resetForm } = formik

  // FIX 1 (continued): Use the new PermissionFlag type here.
  const handleModulePermissionChange = (module: string, permission: PermissionFlag, checked: boolean) => {
    // Create a deep copy to avoid mutation issues with nested objects
    const newPermissions = JSON.parse(JSON.stringify(values.permissions)) as ModulePermissions

    const modulePermissions = newPermissions[module]

    if (!modulePermissions) return

    if (permission === 'all') {
      modulePermissions.all = checked
      modulePermissions.view = checked
      modulePermissions.create = checked
      modulePermissions.edit = checked
      modulePermissions.delete = checked
    } else {
      modulePermissions[permission] = checked

      // If a user gets create, edit, or delete, they must also get view
      if (checked && ['create', 'edit', 'delete'].includes(permission)) {
        modulePermissions.view = true
      }

      // Check if all individual permissions are true to set the 'all' checkbox
      modulePermissions.all =
        modulePermissions.view && modulePermissions.create && modulePermissions.edit && modulePermissions.delete
    }

    setFieldValue('permissions', newPermissions)
  }

  const handleReset = () => {
    handleClose()
    setLoading(false)
    resetForm()
  }

  // FIX 1 (continued): Use the specific PermissionFlag[] type for the keys array
  const permissionKeys: PermissionFlag[] = ['all', 'view', 'create', 'edit', 'delete']

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 500 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>{values.id !== 0 ? 'Edit Role' : 'Add New Role'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>

      <Divider />

      <form onSubmit={handleSubmit} className='flex flex-col gap-6 p-6'>
        {/* Role Name */}
        <CustomTextField
          fullWidth
          name='roleName'
          label='Role Name'
          placeholder='Enter Role Name'
          value={values.roleName}
          onChange={handleChange}
          error={touched.roleName && Boolean(errors.roleName)}
          helperText={touched.roleName && errors.roleName}
        />

        {/* Status */}
        <CustomTextField
          select
          fullWidth
          name='status'
          label='Select Status'
          value={values.status}
          onChange={handleChange}
          error={touched.status && Boolean(errors.status)}
          helperText={touched.status && errors.status}
        >
          <MenuItem value='active'>Active</MenuItem>
          <MenuItem value='inactive'>Inactive</MenuItem>
          <MenuItem value='pending'>Pending</MenuItem>
        </CustomTextField>

        {/* Permissions */}
        <Typography variant='h6'>Role Permissions</Typography>

        <TableContainer component={Paper}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Module</TableCell>
                {permissionKeys.map(key => (
                  <TableCell key={key} align='center'>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(values.permissions).map(module => (
                <TableRow key={module}>
                  <TableCell className='capitalize'>{module}</TableCell>
                  {permissionKeys.map(key => (
                    <TableCell key={key} align='center' padding='checkbox'>
                      <Checkbox
                        checked={values.permissions[module]?.[key] ?? false} // Accessing [key] is now type-safe
                        onChange={e => handleModulePermissionChange(module, key, e.target.checked)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {touched.permissions && errors.permissions && (
          <FormHelperText error>{errors.permissions as unknown as string}</FormHelperText>
        )}

        <div className='flex items-center gap-4'>
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? 'Saving...' : 'Submit'}
          </Button>
          <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
            Cancel
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default RoleDrawer
