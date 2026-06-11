const prefix = 'orders'

export const orderEndpoints = {
  getOrders: `${prefix}/list`,
  saveOrder: `${prefix}/save`,
  updateOrder: (orderId: number) => `${prefix}/${orderId}`,
  getOrderById: (orderId: number) => `${prefix}/${orderId}`,
  deleteOrder: (orderId: number) => `${prefix}/delete/${orderId}`
}
