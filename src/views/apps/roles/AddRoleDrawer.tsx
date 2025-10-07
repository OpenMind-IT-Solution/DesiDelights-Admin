// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'


// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Types
type Permissions = {
  all: boolean
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

type ModulePermissions = {
  [key: string]: Permissions
}

export type RoleType = {
  id: number
  roleName: string
  permissions: ModulePermissions
  status: 'active' | 'inactive' | 'pending'
}

type Props = {
  open: boolean
  handleClose: () => void
  roleData?: RoleType[]
  setData: (data: RoleType[]) => void
  roleToEdit?: RoleType | null
}

const initialPermissions: ModulePermissions = {
  dashboard: { all: false, view: false, create: false, edit: false, delete: false },
  users: { all: false, view: false, create: false, edit: false, delete: false },
  roles: { all: false, view: false, create: false, edit: false, delete: false },
  // Add other modules here
}

const RoleDrawer = (props: Props) => {
  // Props
  const { open, handleClose, roleData, setData, roleToEdit } = props

  // Hooks
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RoleType>({
    defaultValues: {
      roleName: '',
      status: 'active',
      permissions: initialPermissions
    }
  })

  const permissions = watch('permissions')

  useEffect(() => {
    if (roleToEdit) {
      reset({
        roleName: roleToEdit.roleName,
        status: roleToEdit.status,
        permissions: roleToEdit.permissions
      })
    } else {
      reset({
        roleName: '',
        status: 'active',
        permissions: initialPermissions
      })
    }
  }, [roleToEdit, reset, open])

  const handleModulePermissionChange = (
    module: string,
    permission: keyof Permissions,
    checked: boolean
  ) => {
    // Create a deep copy to avoid direct state mutation
    const newPermissions = JSON.parse(JSON.stringify(permissions))

    if (permission === 'all') {
      newPermissions[module] = {
        all: checked,
        view: checked,
        create: checked,
        edit: checked,
        delete: checked
      }
    } else {
      newPermissions[module][permission] = checked

      // If create, edit, or delete is checked, view should be checked automatically
      if (checked && ['create', 'edit', 'delete'].includes(permission)) {
        newPermissions[module].view = true
      }

      // Check if all permissions (excluding 'all') are checked
      const allChecked =
        newPermissions[module].view &&
        newPermissions[module].create &&
        newPermissions[module].edit &&
        newPermissions[module].delete

      newPermissions[module].all = allChecked
    }

    setValue('permissions', newPermissions, { shouldDirty: true })
  }

  const onSubmit = (data: RoleType) => {
    const newRole: RoleType = {
      id: roleToEdit?.id ?? (roleData && roleData.length > 0 ? Math.max(...roleData.map(role => role.id)) + 1 : 1),
      roleName: data.roleName,
      status: data.status,
      permissions: data.permissions
    }

    if (roleToEdit) {
      const updatedRoles = (roleData ?? []).map(role => (role.id === roleToEdit.id ? newRole : role))
      setData(updatedRoles)
    } else {
      setData([newRole, ...(roleData ?? [])])
    }

    handleClose()
    reset()
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
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 500 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>{roleToEdit ? 'Edit Role' : 'Add New Role'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
          <Controller
            name='roleName'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Role Name'
                placeholder='Enter Role Name'
                {...(errors.roleName && { error: true, helperText: 'This field is required.' })}
              />
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
                label='Select Status'
                {...field}
                {...(errors.status && { error: true, helperText: 'This field is required.' })}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
              </CustomTextField>
            )}
           />

          <Typography variant='h6'>Role Permissions</Typography>

          <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Module</TableCell>
                            <TableCell align="center">All</TableCell>
                            <TableCell align="center">View</TableCell>
                            <TableCell align="center">Create</TableCell>
                            <TableCell align="center">Edit</TableCell>
                            <TableCell align="center">Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.keys(permissions).map((module) => (
                            <TableRow key={module} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row" className='capitalize'>{module}</TableCell>
                                <TableCell align="center" padding="checkbox">
                                    <Checkbox checked={permissions[module].all} onChange={(e) => handleModulePermissionChange(module, 'all', e.target.checked)} />
                                </TableCell>
                                <TableCell align="center" padding="checkbox">
                                    <Checkbox checked={permissions[module].view} onChange={(e) => handleModulePermissionChange(module, 'view', e.target.checked)} />
                                </TableCell>
                                <TableCell align="center" padding="checkbox">
                                    <Checkbox checked={permissions[module].create} onChange={(e) => handleModulePermissionChange(module, 'create', e.target.checked)} />
                                </TableCell>
                                <TableCell align="center" padding="checkbox">
                                    <Checkbox checked={permissions[module].edit} onChange={(e) => handleModulePermissionChange(module, 'edit', e.target.checked)} />
                                </TableCell>
                                <TableCell align="center" padding="checkbox">
                                    <Checkbox checked={permissions[module].delete} onChange={(e) => handleModulePermissionChange(module, 'delete', e.target.checked)} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>


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

export default RoleDrawer
