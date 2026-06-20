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
  tax?: number // ⬅ TAX FIELD IN OrderSummary TYPE
  total: number
}