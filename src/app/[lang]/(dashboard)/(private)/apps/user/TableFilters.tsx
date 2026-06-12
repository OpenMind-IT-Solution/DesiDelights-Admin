import { useState, useEffect, type Dispatch, type FC, type SetStateAction } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

import CustomTextField from '@core/components/mui/TextField'

import type { FilterType } from './UserListTable'

type TableFiltersProps = {
  filters: FilterType
  setFilters: Dispatch<SetStateAction<FilterType>>
  onClose: () => void 
}

const TableFilters: FC<TableFiltersProps> = ({ filters, setFilters, onClose }) => {
  const [localFilters, setLocalFilters] = useState<FilterType>({ ...filters })

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (field: keyof FilterType, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value as FilterType[keyof FilterType] 
    }))
  }

  const handleApply = () => {
    const filtersToApply: FilterType = {
      status: localFilters.status === 'All' ? 'All' : localFilters.status,
      roleId: localFilters.roleId === 'All' || localFilters.roleId === '' ? null : localFilters.roleId
    }

    setFilters(filtersToApply)
    onClose()
  }

  const handleReset = () => {
    const defaultFilters: FilterType = {
      status: 'All',
      roleId: null
    }

    setLocalFilters(defaultFilters)
  }

  return (
    <CardContent>
      <Grid container spacing={4} direction='column'>
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            select
            fullWidth
            label='Select Role'
            value={localFilters.roleId || 'All Roles'}
            onChange={e => handleFilterChange('roleId', e.target.value)}
          >
            <MenuItem value='All Roles'>All Roles</MenuItem>
            <MenuItem value='admin'>Admin</MenuItem>
            <MenuItem value='author'>Author</MenuItem>
            <MenuItem value='editor'>Editor</MenuItem>
            <MenuItem value='maintainer'>Maintainer</MenuItem>
            <MenuItem value='user'>User</MenuItem>
          </CustomTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CustomTextField
            select
            fullWidth
            label='Select Status'
            value={localFilters.status || 'All Status'} 
            onChange={e => handleFilterChange('status', e.target.value)}
          >
            <MenuItem value='All Status'>All</MenuItem>
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
