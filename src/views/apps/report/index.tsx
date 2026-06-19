'use client'

import type { SyntheticEvent } from 'react'
import { useState } from 'react'

import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Box, Tab } from '@mui/material'
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
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <TabList onChange={handleChange} variant='scrollable' scrollButtons='auto' aria-label='report tabs'
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                py: 2,
                minHeight: 48
              },
              '& .Mui-selected': {
                fontWeight: 600
              }
            }}
          >
            <Tab value='1' label='Sales Reports' />
            <Tab value='2' label='Order Type' />
            <Tab value='3' label='Inventory Consumption' />
            <Tab value='4' label='Grocery' />
            <Tab value='5' label='Inventory' />
          </TabList>
        </Box>
        <TabPanel value='1' sx={{ px: 0 }}><SalesReportsSection /></TabPanel>
        <TabPanel value='2' sx={{ px: 0 }}><OrderTypeReport /></TabPanel>
        <TabPanel value='3' sx={{ px: 0 }}><InventoryConsumptionReport /></TabPanel>
        <TabPanel value='4' sx={{ px: 0 }}><GroceryReportsSection /></TabPanel>
        <TabPanel value='5' sx={{ px: 0 }}><InventoryReports /></TabPanel>
      </TabContext>
    </Grid>
  )
}

export default ReportTab
