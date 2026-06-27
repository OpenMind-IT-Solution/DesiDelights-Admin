import { useState, useEffect, type Dispatch, type FC, type SetStateAction } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import CustomTextField from '@core/components/mui/TextField'

import type { FilterType } from './UserListTable'
import { post } from '@/services/apiService'
import { roleEndpoints } from '@/services/endpoints/role'

type TableFiltersProps = {
  filters: FilterType
  setFilters: Dispatch<SetStateAction<FilterType>>
  onClose: () => void
}

const TableFilters: FC<TableFiltersProps> = ({ filters, setFilters, onClose }) => {
  const [localFilters, setLocalFilters] = useState<FilterType>({ ...filters })
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true)

      try {
        const res: any = await post(roleEndpoints.getRole, {})
        const list = res?.data?.roles || res?.data || []

        setRoles(list.map((r: any) => ({ id: r.id, name: r.name })))
      } catch {
        setRoles([])
      } finally {
        setRolesLoading(false)
      }
    }

    fetchRoles()
  }, [])

  const handleFilterChange = (field: keyof FilterType, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApply = () => {
    setFilters({
      status: localFilters.status === 'All' ? 'All' : localFilters.status,
      roleId: localFilters.roleId === null || localFilters.roleId === 'all' ? null : localFilters.roleId
    })
    onClose()
  }

  const handleReset = () => {
    setLocalFilters({ status: 'All', roleId: 'all' })
  }

  return (
    <CardContent>
      <Grid container spacing={4} direction='column'>
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            select
            fullWidth
            label='Select Role'
            value={localFilters.roleId ?? 'all'}
            onChange={e => handleFilterChange('roleId', e.target.value)}
          >
            <MenuItem value='all'>All Roles</MenuItem>
            {rolesLoading ? (
              <MenuItem disabled>
                <CircularProgress size={16} sx={{ mr: 1 }} /> Loading...
              </MenuItem>
            ) : (
              roles.map(role => (
                <MenuItem key={role.id} value={String(role.id)}>
                  {role.name}
                </MenuItem>
              ))
            )}
          </CustomTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomTextField
            select
            fullWidth
            label='Select Status'
            value={localFilters.status || 'All'}
            onChange={e => handleFilterChange('status', e.target.value)}
          >
            <MenuItem value='All'>All</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
          </CustomTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 5, mt: 2 }}>
            <Button variant='contained' onClick={handleApply} fullWidth>
              Apply
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleReset} fullWidth>
              Reset
            </Button>
            <Button variant='outlined' color='error' onClick={onClose} fullWidth sx={{ mt: 1 }}>
              Cancel
            </Button>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
