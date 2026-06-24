export type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  total: number
  image?: string
}

export type OrderSummary = {
  items: CartItem[]
  subtotal: number
  foodSubtotal: number
  drinksSubtotal: number
  foodVat: number
  drinksVat: number
  vatTotal: number
  total: number
}