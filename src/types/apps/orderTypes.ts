export type OrderItemType = {
  id: number
  name: string
  quantity: number
  price: number
}

export type OrderType = {
  id: number
  status: 'pending' | 'placed' | 'confirmed' | 'out_for_delivery' | 'completed' | 'cancelled'
  totalAmount: number
  paymentStatus: 'paid' | 'unpaid' | 'refunded'
  orderType: 'delivery' | 'pickup'
  deliveryAddress: string
  orderItems?: OrderItemType[]
  items?: OrderItemType[]
}
