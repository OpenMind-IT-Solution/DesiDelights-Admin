'use client'

import Grid from '@mui/material/Grid2'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import DashboardHeader from '@views/dashboards/desi-delights/DashboardHeader'
import KPICardGrid from '@views/dashboards/desi-delights/KPICardGrid'
import SalesAnalyticsChart from '@views/dashboards/desi-delights/SalesAnalyticsChart'
import RecentOrdersTable from '@views/dashboards/desi-delights/RecentOrdersTable'
import BestSellingItems from '@views/dashboards/desi-delights/BestSellingItems'
import PaymentMethodsChart from '@views/dashboards/desi-delights/PaymentMethodsChart'
import PeakHoursChart from '@views/dashboards/desi-delights/PeakHoursChart'
import CategoryPerformanceChart from '@views/dashboards/desi-delights/CategoryPerformanceChart'
import LowStockWidget from '@views/dashboards/desi-delights/LowStockWidget'
import RecentActivitiesTimeline from '@views/dashboards/desi-delights/RecentActivitiesTimeline'
import TopCustomersTable from '@views/dashboards/desi-delights/TopCustomersTable'
import QuickActions from '@views/dashboards/desi-delights/QuickActions'
import { KPIGridSkeleton, ChartSkeleton, TableSkeleton } from '@views/dashboards/desi-delights/LoadingSkeleton'
import { useDashboardFetch } from '@views/dashboards/desi-delights/useDashboardFetch'
import { DashboardProvider } from '@views/dashboards/desi-delights/DashboardContext'

function DashboardContent() {
  const { loading, error, data } = useDashboardFetch()

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity='error' sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 6 }}>
      <DashboardHeader />

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <KPIGridSkeleton />
          <ChartSkeleton height={380} />
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <ChartSkeleton height={320} />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <ChartSkeleton height={320} />
            </Grid>
          </Grid>
          <TableSkeleton rows={8} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <KPICardGrid
            salesSummary={data.salesSummary}
            prevSalesSummary={data.prevSalesSummary}
            customerAnalytics={data.customerAnalytics}
          />

          <QuickActions />

          <SalesAnalyticsChart
            dailySales={data.dailySales}
            hourlySales={data.hourlySales}
            revenueTrend={data.revenueTrend}
          />

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PeakHoursChart hourlySales={data.hourlySales} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PaymentMethodsChart paymentMethods={data.paymentMethods} />
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <BestSellingItems items={data.topProducts} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CategoryPerformanceChart
                categoryPerformance={data.categoryPerformance}
                categorySales={data.categorySales}
              />
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <LowStockWidget inventoryInsights={data.inventoryInsights} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TopCustomersTable customerAnalytics={data.customerAnalytics} />
            </Grid>
          </Grid>

          <RecentOrdersTable orders={data.recentOrders} />

          <RecentActivitiesTimeline
            recentOrders={data.recentOrders}
            customerAnalytics={data.customerAnalytics}
          />
        </Box>
      )}
    </Box>
  )
}

const DashboardPage = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}

export default DashboardPage
