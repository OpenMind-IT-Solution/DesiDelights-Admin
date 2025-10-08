import type { GroceryItem } from '@/types/apps/groceryTypes'

const getStockStatus = (quantity: number): GroceryItem['stock_status'] => {
  if (quantity <= 0) return 'Out of Stock'
  if (quantity < 10) return 'Low Stock'
  
return 'In Stock'
}

const now = new Date()

export const db: { groceryItems: GroceryItem[] } = {
  groceryItems: [
    {
      id: 1,
      name: 'Whole Milk',
      description: 'Full-fat dairy milk for coffee and cooking.',
      unit: 'L',
      type: 'Dairy',
      store_name: 'Delhaize',
      location: 'Brussels, Belgium',
      priority: 1,
      stock_quantity: 20,
      stock_status: getStockStatus(20),
      created_at: new Date(now.setDate(now.getDate() - 5)).toISOString(),
      updated_at: null
    },
    {
      id: 2,
      name: 'Paper Towels',
      description: '2-ply disposable paper towels for kitchen cleanup.',
      unit: 'Roll',
      type: 'Disposable',
      store_name: 'Carrefour Market',
      location: 'Antwerp, Belgium',
      priority: 3,
      stock_quantity: 8,
      stock_status: getStockStatus(8),
      created_at: new Date(now.setDate(now.getDate() - 10)).toISOString(),
      updated_at: new Date(now.setDate(now.getDate() - 1)).toISOString()
    },
    {
      id: 3,
      name: 'Onions',
      description: 'Standard yellow onions for all-purpose cooking.',
      unit: 'Kg',
      type: 'Other',
      store_name: 'Colruyt',
      location: 'Ghent, Belgium',
      priority: 2,
      stock_quantity: 0,
      stock_status: getStockStatus(0),
      created_at: new Date(now.setDate(now.getDate() - 2)).toISOString(),
      updated_at: null
    },
    {
      id: 4,
      name: 'Olive Oil',
      description: 'Extra virgin olive oil for dressings and finishing.',
      unit: 'ml',
      type: 'Other',
      store_name: 'Carrefour Market',
      location: 'Antwerp, Belgium',
      priority: 4,
      stock_quantity: 15,
      stock_status: getStockStatus(15),
      created_at: new Date(now.setDate(now.getDate() - 15)).toISOString(),
      updated_at: null
    },
    {
      id: 5,
      name: 'Cheddar Cheese',
      description: 'Block of sharp cheddar cheese.',
      unit: 'Packet',
      type: 'Dairy',
      store_name: 'Delhaize',
      location: 'Brussels, Belgium',
      priority: 2,
      stock_quantity: 5,
      stock_status: getStockStatus(5),
      created_at: new Date(now.setDate(now.getDate() - 3)).toISOString(),
      updated_at: null
    },
    {
      id: 6,
      name: 'Frozen Pizza',
      description: 'Quick meal for busy nights.',
      unit: 'Piece',
      type: 'Other',
      store_name: 'Colruyt',
      location: 'Liège, Belgium',
      priority: 5,
      stock_quantity: 3,
      stock_status: getStockStatus(3),
      created_at: new Date(now.setDate(now.getDate() - 20)).toISOString(),
      updated_at: null
    }
  ]
}
