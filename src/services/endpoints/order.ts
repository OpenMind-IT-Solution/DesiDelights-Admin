const prefix = 'orders'

export const orderEndpoints = {
  getOrders: `${prefix}/list`,
  saveOrder: `${prefix}/save`,
  newOrders: `${prefix}/new`,
  updateOrder: (orderId: number) => `${prefix}/${orderId}`,
  getOrderById: (orderId: number) => `${prefix}/${orderId}`,
  deleteOrder: (orderId: number) => `${prefix}/delete/${orderId}`
}
