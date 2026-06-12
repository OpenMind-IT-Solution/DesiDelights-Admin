export type GroceryStockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export type GroceryItem = {
  id: number
  name: string
  description: string | null
  type: string
  store_id: number
  store_name: string | null
  location: string | null
  priority: number | null
  stock_quantity: number
  item_lower_value: number
  stock_status: GroceryStockStatus
  unit?: string
  created_at?: string
  updated_at?: string | null
}
