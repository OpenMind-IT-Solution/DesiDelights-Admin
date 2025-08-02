'use client'

import type { ReactElement, SyntheticEvent } from 'react' 
import { useState } from 'react'

// MUI Imports
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList' 
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab' 

// Type Imports
import type { Data } from '@/types/pages/profileTypes'

// Component Imports
import UserProfileHeader from './UserProfileHeader'

const UserProfile = ({ tabContentList, data }: { tabContentList: { [key: string]: ReactElement }; data?: Data }) => {
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserProfileHeader data={data?.profileHeader} />
      </Grid>
      {activeTab === undefined ? null : (
        <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <TabList variant='scrollable' scrollButtons='auto' onChange={handleChange} aria-label='user profile tabs'>
              {Object.keys(tabContentList).map(tab => (
                <Tab
                  key={tab}
                  label={
                    <span className='flex items-center gap-1.5 capitalize'>
                      {tab}
                    </span>
                  }
                  value={tab}
                />
              ))}
            </TabList>

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default UserProfile
