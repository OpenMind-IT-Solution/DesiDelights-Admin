"use client"
import type { MouseEvent, SyntheticEvent } from 'react';
import { useState } from 'react';

import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Card, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';

import AccountingReports from './AccountingReports';
import InventoryReports from './InventoryReports';
import OrderReports from './OrderReports';
import PromotionReports from './PromotionReports';
import RestaurantReports from './RestaurantReports';
import SalesReports from './SalesReports';

const ReportTab = () => {
  const [value, setValue] = useState<string>('1')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  
return (
    <Grid size={{ xs: 12 }}>
      <Card className='p-4'>
        <TabContext value={value}>
          <TabList onChange={handleChange} aria-label='nav tabs example'>
            <Tab
              value='1'
              label='Sales Reports'
              onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
            />
            <Tab
              value='2'
              label='Inventory Reports'
              onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
            />
            <Tab
              value='3'
              label='Order Reports'
              onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
            />
            <Tab
              value='4'
              label='Accounting Reports'
              onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
            />
            {/* <Tab
              value='5'
              label='Customer Reports'
              onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
            /> */}
            <Tab
              value='6'
              label='Restaurant Reports'
              onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
            />
            <Tab
              value='7'
              label='Promotion Reports'
              onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
            />
          </TabList>
          <TabPanel value='1'>
            <SalesReports />
          </TabPanel>
          <TabPanel value='2'>
            <InventoryReports />
          </TabPanel>
          <TabPanel value='3'>
            <OrderReports />
          </TabPanel>
          <TabPanel value='4'>
            <AccountingReports />
          </TabPanel>
          {/* <TabPanel value='5'>
            <CustomerReports />
          </TabPanel> */}
          <TabPanel value='6'>
            <RestaurantReports />
          </TabPanel>
          <TabPanel value='7'>
            <PromotionReports />
          </TabPanel>
        </TabContext>
      </Card>
    </Grid>
  )
}

export default ReportTab
