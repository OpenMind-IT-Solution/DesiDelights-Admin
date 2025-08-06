// MUI Imports
import Grid from '@mui/material/Grid2'

import type { RestaurantTypes } from '@/types/apps/restaurantTypes'
import RestaurantListTable from './RestaurantListTable'

// Component Imports

// <Grid container spacing={6}>
//   <Grid size={{ xs: 12 }}>
//     <UserListCards />
//   </Grid>
const RestaurantList = ({ restaurantData }: { restaurantData: RestaurantTypes[] }) => {
  return (
    <Grid size={{ xs: 12 }}>
      <RestaurantListTable tableData={restaurantData} />
    </Grid>
  )
}

// </Grid>
export default RestaurantList
