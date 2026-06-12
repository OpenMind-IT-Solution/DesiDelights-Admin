'use client'

import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Card, Tab } from '@mui/material'
import Grid from '@mui/material/Grid2'

import SalesReportsSection from './SalesReportsSection'
import OrderTypeReport from './OrderTypeReport'
import InventoryConsumptionReport from './InventoryConsumptionReport'
import GroceryReportsSection from './GroceryReportsSection'
import InventoryReports from './InventoryReports'

const ReportTab = () => {
  const [value, setValue] = useState('1')

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <Grid size={{ xs: 12 }}>
      <Card className='p-4'>
        <TabContext value={value}>
          <TabList onChange={handleChange} variant='scrollable' scrollButtons='auto' aria-label='report tabs'>
            <Tab value='1' label='Sales Reports' />
            <Tab value='2' label='Order Type' />
            <Tab value='3' label='Inventory Consumption' />
            <Tab value='4' label='Grocery' />
            <Tab value='5' label='Inventory' />
          </TabList>
          <TabPanel value='1'><SalesReportsSection /></TabPanel>
          <TabPanel value='2'><OrderTypeReport /></TabPanel>
          <TabPanel value='3'><InventoryConsumptionReport /></TabPanel>
          <TabPanel value='4'><GroceryReportsSection /></TabPanel>
          <TabPanel value='5'><InventoryReports /></TabPanel>
        </TabContext>
      </Card>
    </Grid>
  )
}

export default ReportTab
