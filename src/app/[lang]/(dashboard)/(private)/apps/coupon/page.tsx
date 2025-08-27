import { getCouponData } from "@/app/server/actions"
import CouponList from "@/views/apps/coupon"

const CouponListApp = async () => {
  const data = await getCouponData()

  return (
    <>
      <CouponList couponData={data.coupons} />
    </>
  )
}

export default CouponListApp
