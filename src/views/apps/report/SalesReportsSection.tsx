'use client'

import { useState } from 'react'

import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material'

import SalesReports from './SalesReports'
import DailySales from './DailySales'
import ItemSales from './ItemSales'
import CategorySales from './CategorySales'
import PaymentMethods from './PaymentMethods'
import CustomerReports from './CustomerReports'
import HourlySales from './HourlySales'
import PromotionReports from './PromotionReports'
import AccountingReports from './AccountingReports'
import RefundReports from './RefundReports'
import RestaurantReports from './RestaurantReports'
import ProfitReports from './ProfitReports'
import StaffSalesReports from './StaffSalesReports'

const subReports = [
  { value: '1', label: 'Overview', component: SalesReports },
  { value: '2', label: 'Daily Sales', component: DailySales },
  { value: '3', label: 'Item Sales', component: ItemSales },
  { value: '4', label: 'Category Sales', component: CategorySales },
  { value: '5', label: 'Payment Methods', component: PaymentMethods },
  { value: '6', label: 'Customer Sales', component: CustomerReports },
  { value: '7', label: 'Hourly Sales', component: HourlySales },
  { value: '8', label: 'Discounts', component: PromotionReports },
  { value: '9', label: 'Taxes', component: AccountingReports },
  { value: '10', label: 'Refunds', component: RefundReports },
  { value: '11', label: 'Branch Wise', component: RestaurantReports },
  { value: '12', label: 'Profit', component: ProfitReports },
  { value: '13', label: 'Staff Sales', component: StaffSalesReports }
]

const SalesReportsSection = () => {
  const [active, setActive] = useState('1')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const current = subReports.find(r => r.value === active)

  const ActiveComponent = current?.component ?? SalesReports

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, minHeight: 40 }}>
        <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '1rem' }}>
          {current?.label ?? 'Overview'}
        </Typography>
        <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
          <i className='tabler-dots-vertical' />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          slotProps={{ paper: { sx: { maxHeight: 360, minWidth: 180 } } }}
        >
          {subReports.map(r => (
            <MenuItem
              key={r.value}
              selected={active === r.value}
              onClick={() => { setActive(r.value); setAnchorEl(null) }}
              sx={{ fontSize: '0.875rem' }}
            >
              {r.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <ActiveComponent />
    </>
  )
}

export default SalesReportsSection
