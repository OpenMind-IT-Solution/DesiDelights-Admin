'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { OrderType } from '@/types/apps/ecommerceTypes'

// Component Imports
import OrderCard from './OrderCard'
import CustomOrderListTable from './CustomOrderListTable'

const OrderList = ({ orderData }: { orderData?: OrderType[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CustomOrderListTable orderData={orderData} />
      </Grid>
    </Grid>
  )
}

export default OrderList
