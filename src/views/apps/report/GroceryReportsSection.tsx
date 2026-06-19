'use client'

import { useState } from 'react'

import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material'

import StockSummaryDashboard from './StockSummaryDashboard'
import PurchaseReport from './PurchaseReport'
import ConsumptionReport from './ConsumptionReport'
import StockMovementReport from './StockMovementReport'
import LowStockReport from './LowStockReport'
import OutOfStockReport from './OutOfStockReport'
import ExpiryReport from './ExpiryReport'
import SupplierReport from './SupplierReport'
import WastageReport from './WastageReport'
import FoodCostReport from './FoodCostReport'
import InventoryValueReport from './InventoryValueReport'

const subReports = [
  { value: '1', label: 'Overview', component: StockSummaryDashboard },
  { value: '2', label: 'Purchase Report', component: PurchaseReport },
  { value: '3', label: 'Consumption Report', component: ConsumptionReport },
  { value: '4', label: 'Stock Movement', component: StockMovementReport },
  { value: '5', label: 'Low Stock', component: LowStockReport },
  { value: '6', label: 'Out of Stock', component: OutOfStockReport },
  { value: '7', label: 'Expiry', component: ExpiryReport },
  { value: '8', label: 'Supplier', component: SupplierReport },
  { value: '9', label: 'Wastage', component: WastageReport },
  { value: '10', label: 'Food Cost', component: FoodCostReport },
  { value: '11', label: 'Inventory Value', component: InventoryValueReport }
]

const GroceryReportsSection = () => {
  const [active, setActive] = useState('1')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const current = subReports.find(r => r.value === active)

  const ActiveComponent = current?.component ?? StockSummaryDashboard

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

export default GroceryReportsSection
