export type DateRange = {
  startDate: string
  endDate: string
}

export type SalesSummary = {
  totalOrders: number
  totalRevenue: number
  totalDiscounts: number
  totalTax: number
  totalSubTotal: number
  averageOrderValue: number
  todayRevenue: number
  refundedCount: number
  refundedTotal: number
  statusBreakdown: Record<string, number>
  paymentMethodBreakdown: Record<string, { count: number; total: number }>
}

export type DailySale = {
  date: string
  orderCount: number
  revenue: number
  discounts: number
  tax: number
  avgOrderValue: number
}

export type DailySalesData = {
  dailySales: DailySale[]
  total: number
  page: number
  limit: number
}

export type ItemSale = {
  menuItemId: number
  name: string
  category: string
  unitPrice: number
  totalQuantity: number
  totalRevenue: number
}

export type ItemSalesData = {
  itemSales: ItemSale[]
  total: number
  page: number
  limit: number
}

export type CategorySale = {
  categoryId: number
  categoryName: string
  totalQuantity: number
  totalRevenue: number
}

export type CategorySalesData = {
  categorySales: CategorySale[]
}

export type PaymentMethodSale = {
  method: string
  count: number
  total: number
}

export type PaymentMethodData = {
  paymentMethods: PaymentMethodSale[]
}

export type CustomerSale = {
  customerId: number
  name: string
  email: string
  phone: string
  orderCount: number
  totalSpent: number
}

export type CustomerSalesData = {
  customerSales: CustomerSale[]
  total: number
  page: number
  limit: number
}

export type HourlySale = {
  hour: number
  orderCount: number
  revenue: number
}

export type HourlySalesData = {
  hourlySales: HourlySale[]
}

export type DiscountReportData = {
  totalOrdersWithDiscount: number
  totalDiscountAmount: number
  totalRevenueAfterDiscount: number
  avgDiscountPerOrder: number
  discountBreakdown: { date: string; orderCount: number; discountAmount: number }[]
}

export type TaxReportData = {
  totalOrders: number
  totalTaxCollected: number
  totalRevenue: number
  avgTaxPerOrder: number
  taxBreakdown: { date: string; orderCount: number; taxAmount: number }[]
}

export type RefundReportData = {
  totalRefunds: number
  totalRefundAmount: number
  statusBreakdown: Record<string, { count: number; amount: number }>
  dailyBreakdown: { date: string; status: string; count: number; amount: number }[]
}

export type BranchSale = {
  restaurantId: string
  restaurantName: string
  orderCount: number
  revenue: number
  discounts: number
  tax: number
}

export type BranchWiseData = {
  branchSales: BranchSale[]
}

export type ProfitReportData = {
  totalRevenue: number
  totalDiscounts: number
  totalTax: number
  totalCostOfGoods: number
  estimatedCOGS: number
  grossProfit: number
  netProfit: number
  profitMargin: number
}

export type RevenueTrendData = {
  dailyTrend: { date: string; revenue: number; orders: number }[]
}

export type OrderTypeBreakdownData = {
  orderTypes: { orderType: string; label: string; count: number; revenue: number }[]
}

export type CategoryAnalyticsData = {
  categories: { categoryId: number; categoryName: string; totalQuantity: number; totalRevenue: number; estimatedProfit: number }[]
}

export type TopProductsData = {
  products: { menuItemId: number; name: string; category: string; unitPrice: number; totalQuantity: number; totalRevenue: number }[]
}

export type CustomerAnalyticsData = {
  totalCustomers: number
  repeatCustomers: number
  newCustomers: number
  topCustomers: { customerId: number; name: string; email: string; phone: string; orderCount: number; totalSpent: number }[]
}

export type RecentOrder = {
  id: number
  customerName: string
  waiterName: string | null
  totalAmount: number
  status: string
  paymentStatus: string
  orderType: string
  paymentMethod: string
  createdAt: string
}

export type RecentOrdersData = {
  orders: RecentOrder[]
  total?: number
  page?: number
  limit?: number
}

export type InventoryInsightsData = {
  lowStockItems: { id: number; itemName: string; quantity: number; itemLowerValue: number; status: string; storeName: string }[]
  totalItems: number
  lowStockCount: number
  stockHealthPercent: number
}

export type StaffSale = {
  waiterId: number
  name: string
  email: string
  phone: string
  orderCount: number
  totalRevenue: number
  avgOrderValue: number
}

export type StaffSalesData = {
  staffSales: StaffSale[]
  total: number
  page: number
  limit: number
}

export type OrderTypeReportData = {
  summary: Record<string, { count: number; revenue: number; label: string }>
  dailyBreakdown: { date: string; orderType: string; label: string; count: number; revenue: number }[]
  total: number
  page: number
  limit: number
}

export type InventoryConsumptionItem = {
  menuItemId: number
  name: string
  category: string
  totalQuantity: number
  totalValue: number
}

export type InventoryConsumptionData = {
  consumption: InventoryConsumptionItem[]
  total: number
  page: number
  limit: number
}

export type GroceryStockItem = {
  id: number
  itemName: string
  quantity: number
  itemLowerValue: number
  status: string
  storeName: string
  storeLocation: string | null
  type: string
  priority: number
  updatedAt: string
}

export type GroceryStockSummary = {
  totalItems: number
  totalQuantity: number
  inStockCount: number
  lowStockCount: number
  outOfStockCount: number
  stockHealthPercent: number
  typeBreakdown: { type: string; count: number; totalQuantity: number }[]
  storeBreakdown: { storeId: number; storeName: string; itemCount: number; totalQuantity: number }[]
  expiringSoon: { id: number; itemName: string; quantity: number; status: string; createdAt: string; daysInStock: number }[]
}

export type GroceryDashboardSummary = {
  totalItems: number
  totalQuantity: number
  lowStockItems: number
  outOfStockItems: number
  expiringSoonCount: number
  monthlyPurchaseItems: number
  monthlyPurchaseQuantity: number
  monthlyRevenue: number
  estimatedFoodCost: number
  foodCostPercent: number
}

export type GroceryPurchase = {
  id: number
  itemName: string
  quantity: number
  type: string
  storeName: string
  storeLocation: string | null
  priority: number
  createdAt: string
}

export type GroceryPurchaseReport = {
  purchases: GroceryPurchase[]
  total: number
  page: number
  limit: number
  summary: { totalItems: number; totalQuantity: number }
}

export type GroceryMovement = {
  id: number
  itemName: string
  quantity: number
  status: string
  itemLowerValue: number
  storeName: string
  storeLocation: string | null
  type: string
  priority: number
  updatedAt: string
}

export type GroceryMovementReport = {
  movements: GroceryMovement[]
  total: number
  page: number
  limit: number
}

export type GroceryStockReport = {
  items: GroceryStockItem[]
  total: number
  page: number
  limit: number
}

export type GroceryExpiryItem = {
  id: number
  itemName: string
  quantity: number
  status: string
  storeName: string
  storeLocation: string | null
  type: string
  priority: number
  createdAt: string
  daysInStock: number
}

export type GroceryExpiryReport = {
  items: GroceryExpiryItem[]
  total: number
  page: number
  limit: number
}

export type GrocerySupplier = {
  storeId: number
  storeName: string
  location: string
  itemCount: number
  totalQuantity: number
  lowStockCount: number
  outOfStockCount: number
  inStockCount: number
}

export type GrocerySupplierReport = {
  suppliers: GrocerySupplier[]
}

export type GroceryWastageReport = {
  items: GroceryStockItem[]
  total: number
  page: number
  limit: number
  summary: { totalWastedItems: number; totalWastedQuantity: number }
}

export type GroceryFoodCostReport = {
  totalRevenue: number
  totalOrders: number
  totalItemsSold: number
  estimatedFoodCost: number
  foodCostPercent: number
  dailyBreakdown: { date: string; revenue: number; orders: number; foodCost: number }[]
}

export type GroceryInventoryValue = {
  totalItems: number
  totalQuantity: number
  valueByType: { type: string; count: number; totalQuantity: number }[]
  valueByStore: { storeId: number; storeName: string; count: number; totalQuantity: number }[]
  monthlyTrend: { date: string; count: number; quantity: number }[]
}

export type TrendDataPoint = {
  date: string
  count: number
  quantity: number
}

export type TrendReport = {
  trend: TrendDataPoint[]
}

export type TopConsumedItem = {
  menuItemId: number
  name: string
  category: string
  totalQuantity: number
  totalValue: number
}

export type TopConsumedReport = {
  items: TopConsumedItem[]
}

export type GroceryReportFilterOptions = {
  statuses: string[]
  types: string[]
}

export type ApiResponse<T> = {
  status: string
  message: string
  data: T
}
