// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

// Type Imports

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import type { RestaurantTypes } from '@/types/apps/restaurantTypes'

const TableFilters = ({ setData, tableData }: { setData: (data: RestaurantTypes[]) => void; tableData?: RestaurantTypes[] }) => {
  // States
  const [status, setStatus] = useState<RestaurantTypes['status']>('')

  useEffect(() => {
    const filteredData = tableData?.filter(res => {
      if (status && res.status !== status) return false

      return true
    })

    setData(filteredData || [])
  }, [status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={4} direction='column'>
        {/* <Grid size={{ xs: 12 }}>
          <CustomTextField
            select
            fullWidth
            id='select-role'
            value={role}
            onChange={e => setRole(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>Select Role</MenuItem>
            <MenuItem value='admin'>Admin</MenuItem>
            <MenuItem value='author'>Author</MenuItem>
            <MenuItem value='editor'>Editor</MenuItem>
            <MenuItem value='maintainer'>Maintainer</MenuItem>
            <MenuItem value='user'>User</MenuItem>
          </CustomTextField>
        </Grid> */}
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => setStatus(e.target.value)}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>Select Status</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
