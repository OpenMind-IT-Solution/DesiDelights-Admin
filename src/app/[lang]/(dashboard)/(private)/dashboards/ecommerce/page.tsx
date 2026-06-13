// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import Congratulations from '@views/apps/ecommerce/dashboard/Congratulations'
import StatisticsCard from '@views/apps/ecommerce/dashboard/StatisticsCard'
import RevenueReport from '@views/apps/ecommerce/dashboard/RevenueReport'
import Orders from '@views/apps/ecommerce/dashboard/Orders'
import Transactions from '@views/apps/ecommerce/dashboard/Transactions'
import EarningReports from '@views/apps/ecommerce/dashboard/EarningReports'
import PopularProducts from '@views/apps/ecommerce/dashboard/PopularProducts'

const DashboardECommerce = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Congratulations />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <StatisticsCard />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <RevenueReport />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Orders />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <EarningReports />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Transactions />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <PopularProducts />
      </Grid>
    </Grid>
  )
}

export default DashboardECommerce
