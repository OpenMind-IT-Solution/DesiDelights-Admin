'use client'

import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Tab } from '@mui/material'

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

const salesTabs = [
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
  const [value, setValue] = useState('1')

  const handleChange = (_: SyntheticEvent, newValue: string) => setValue(newValue)

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange} variant='scrollable' scrollButtons='auto'>
        {salesTabs.map(t => <Tab key={t.value} value={t.value} label={t.label} />)}
      </TabList>
      {salesTabs.map(t => (
        <TabPanel key={t.value} value={t.value}>
          <t.component />
        </TabPanel>
      ))}
    </TabContext>
  )
}

export default SalesReportsSection
