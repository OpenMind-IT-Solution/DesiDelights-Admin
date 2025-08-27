// MUI Imports
import Grid from '@mui/material/Grid2'

import type { CouponProps } from '@/types/apps/couponTypes'
import CouponListTable from './CouponListTable'

const CouponList = ({ couponData }: { couponData: CouponProps[] }) => {
  return (
    <Grid size={{ xs: 12 }}>
      <CouponListTable tableData={couponData} />
    </Grid>
  )
}

export default CouponList
