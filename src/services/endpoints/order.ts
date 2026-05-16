const prefix = 'orders'

export const orderEndpoints = {
  getOrders: `${prefix}/list`,
  saveOrder: `${prefix}/save`,
  getOrderById: (orderId: number) => `${prefix}/${orderId}`,
  deleteOrder: (orderId: number) => `${prefix}/delete/${orderId}`
}
