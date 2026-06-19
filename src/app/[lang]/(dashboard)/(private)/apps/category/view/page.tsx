// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import UserLeftOverview from '../../user/view/user-left-overview'
import UserRight from '../../user/view/user-right'

const OverViewTab = dynamic(() => import('../../user/view/user-right/overview'))
const SecurityTab = dynamic(() => import('../../user/view/user-right/security'))
const BillingPlans = dynamic(() => import('../../user/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('../../user/view/user-right/notifications'))
const ConnectionsTab = dynamic(() => import('../../user/view/user-right/connections'))

// Vars
const tabContentList = (): { [key: string]: ReactElement } => ({
  overview: <OverViewTab />,
  security: <SecurityTab />,
  'billing-plans': <BillingPlans />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

const UserViewTab = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <UserLeftOverview />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRight tabContentList={tabContentList()} />
      </Grid>
    </Grid>
  )
}

export default UserViewTab
