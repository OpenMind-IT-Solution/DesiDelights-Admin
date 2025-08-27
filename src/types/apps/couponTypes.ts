export type CouponProps = {
  id: number;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageCount: number;
  maxUsage: number;
}

export type CouponTypes = {
  coupons: CouponProps[]
}
