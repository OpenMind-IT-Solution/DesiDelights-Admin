export type OrderItemType = {
  name: string
  quantity: number
  price: number
}

export type OrderType = {
  id: number
  status: 'pending' | 'completed' | 'cancelled'
  totalAmount: number
  paymentStatus: 'paid' | 'unpaid' | 'refunded'
  orderType: 'delivery' | 'pickup'
  deliveryAddress: string
  items: OrderItemType[]
}
