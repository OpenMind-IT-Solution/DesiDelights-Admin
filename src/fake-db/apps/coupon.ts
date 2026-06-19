import type { CouponTypes } from "@/types/apps/couponTypes";

export const db: CouponTypes = {
  coupons: [
    {
      id: 1,
      code: 'BLACKFRIDAY',
      discount: 20,
      type: 'percentage',
      startDate: '2025-08-24',
      endDate: '2025-09-30',
      status: true,
      usageCount: 5,
      maxUsage: 100
    },
    {
      id: 2,
      code: 'XMAS2023',
      discount: 15,
      type: 'fixed',
      startDate: '2023-12-01',
      endDate: '2023-12-25',
      status: true,
      usageCount: 3,
      maxUsage: 50
    }
  ]
}
