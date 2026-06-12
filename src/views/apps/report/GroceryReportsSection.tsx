'use client'

import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Tab } from '@mui/material'
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

const groceryTabs = [
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
  const [value, setValue] = useState('1')

  const handleChange = (_: SyntheticEvent, newValue: string) => setValue(newValue)

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange} variant='scrollable' scrollButtons='auto'>
        {groceryTabs.map(t => <Tab key={t.value} value={t.value} label={t.label} />)}
      </TabList>
      {groceryTabs.map(t => (
        <TabPanel key={t.value} value={t.value}>
          <t.component />
        </TabPanel>
      ))}
    </TabContext>
  )
}

export default GroceryReportsSection
