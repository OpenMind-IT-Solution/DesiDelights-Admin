export type CouponProps = {
  id: number
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  startDate: string
  endDate: string
  status: boolean
  usageCount: number
  maxUsage: number
  isCustomerEligible?: boolean
}

export type CouponTypes = {
  coupons: CouponProps[]
}
