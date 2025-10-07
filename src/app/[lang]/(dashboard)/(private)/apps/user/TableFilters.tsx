// src/app/[lang]/(dashboard)/(private)/apps/user/TableFilters.tsx

// React Imports
import type { Dispatch, FC, SetStateAction } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Type Imports
import type { FilterType } from './UserListTable' // Import the type from the parent

// Define the new props interface
type TableFiltersProps = {
  filters: FilterType
  setFilters: Dispatch<SetStateAction<FilterType>>
}

const TableFilters: FC<TableFiltersProps> = ({ filters, setFilters }) => {
  // This component is now "controlled" by the parent.
  // It receives the current filter values and a function to update them.

  const handleFilterChange = (field: keyof FilterType, value: string) => {
    // When a filter changes, call the setFilters function from the parent
    setFilters(prev => ({
      ...prev,
      // Use null for 'All' or empty values to simplify the API call logic
      [field]: value === 'All' || value === '' ? null : value
    }))
  }

  return (
    <CardContent>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            id='select-role'
            label='Select Role'
            value={filters.roleId || ''} // Control the value from props
            onChange={e => handleFilterChange('roleId', e.target.value)}
          >
            <MenuItem value=''>All Roles</MenuItem>
            <MenuItem value='admin'>Admin</MenuItem>
            <MenuItem value='author'>Author</MenuItem>
            <MenuItem value='editor'>Editor</MenuItem>
            <MenuItem value='maintainer'>Maintainer</MenuItem>
            <MenuItem value='user'>User</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            label='Select Status'
            value={filters.status} // Control the value from props
            onChange={e => handleFilterChange('status', e.target.value)}
          >
            <MenuItem value='All'>All Statuses</MenuItem>
            {/* <MenuItem value='pending'>Pending</MenuItem> */}
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
