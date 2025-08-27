export type GroceryItem = {
  id: number
  name: string
  description: string | null
  unit: string 
  type: 'Disposable' | 'Dairy' | 'Other'
  store_name: string | null
  priority: number | null
  stock_quantity: number
  location: string | null 
  stock_status: 'In Stock' | 'Low Stock' | 'Out of Stock'
  created_at: string
  updated_at: string | null
}
