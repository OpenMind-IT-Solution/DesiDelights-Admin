// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import TotalReviews from '@/views/apps/manage-reviews/TotalReviews'
import ReviewsStatistics from '@/views/apps/manage-reviews/ReviewsStatistics'
import ManageReviewsTable from '@/views/apps/manage-reviews/ManageReviewsTable'

// Data Imports
import { getEcommerceData } from '@/app/server/actions'

const eCommerceManageReviews = async () => {
  // Vars
  const data = await getEcommerceData()

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TotalReviews />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ReviewsStatistics />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ManageReviewsTable reviewsData={data?.reviews} />
      </Grid>
    </Grid>
  )
}

export default eCommerceManageReviews
