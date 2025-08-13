// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { OrderType } from '@/types/apps/orderTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const TableFilters = ({ setData, tableData }: { setData: (data: OrderType[]) => void; tableData?: OrderType[] }) => {
  // States
  const [orderType, setOrderType] = useState<OrderType['orderType'] | ''>('')
  const [status, setStatus] = useState<OrderType['status'] | ''>('')

  useEffect(() => {
    const filteredData = tableData?.filter(order => {
      if (orderType && order.orderType !== orderType) return false
      if (status && order.status !== status) return false
      return true
    })

    setData(filteredData || [])
  }, [orderType, status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={4} direction='column'>
        {/* Order Type Filter */}
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            select
            fullWidth
            id='select-order-type'
            value={orderType}
            onChange={e => setOrderType(e.target.value as OrderType['orderType'])}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>Select Order Type</MenuItem>
            <MenuItem value='delivery'>Delivery</MenuItem>
            <MenuItem value='pickup'>Pickup</MenuItem>
          </CustomTextField>
        </Grid>

        {/* Order Status Filter */}
        <Grid size={{ xs: 12 }}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => setStatus(e.target.value as OrderType['status'])}
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value=''>Select Status</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='completed'>Completed</MenuItem>
            <MenuItem value='cancelled'>Cancelled</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
