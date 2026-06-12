import { useState, useEffect } from 'react'

import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'
import type { Category } from '@/types/apps/categoryTypes' 

const TableFilters = ({ setData, tableData }: { setData: (data: Category[]) => void; tableData?: Category[] }) => {
  const [status, setStatus] = useState<Category['status']>('')

  useEffect(() => {
    const filteredData = tableData?.filter(category => {
      if (status && category.status !== status) return false

      return true
    })

    setData(filteredData || [])
  }, [status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={4} direction='column'>
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
