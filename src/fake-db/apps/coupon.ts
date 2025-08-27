import { CouponTypes } from "@/types/apps/couponTypes";

export const db: CouponTypes = {
  coupons: [
    {
      id: 1,
      code: 'BLACKFRIDAY',
      discount: 20,
      type: 'percentage',
      startDate: new Date('2025-08-24'),
      endDate: new Date('2025-09-30'),
      isActive: true,
      usageCount: 5,
      maxUsage: 100
    },
    {
      id: 2,
      code: 'XMAS2023',
      discount: 15,
      type: 'fixed',
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-25'),
      isActive: true,
      usageCount: 3,
      maxUsage: 50
    }
  ]
}
