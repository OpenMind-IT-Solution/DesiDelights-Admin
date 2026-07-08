const prefix = 'coupons'

export const couponEndpoints = {
  getCoupons: `${prefix}/list`,
  getCouponById: (couponId: number) => `${prefix}/${couponId}`,
  saveCoupon: `${prefix}/save`,
  deleteCoupon: (couponId: number) => `${prefix}/delete/${couponId}`,
  validateCoupon: `website/${prefix}/validate`,
  bulkDeleteCoupon: `${prefix}/bulk-delete`
}
