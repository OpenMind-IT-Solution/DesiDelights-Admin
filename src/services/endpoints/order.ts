const prefix = 'orders'

export const orderEndpoints = {
  getOrders: `${prefix}/list`,
  saveOrder: `${prefix}/save`,
  walkInCustomer: `${prefix}/walk-in-customer`,
  adminCreateOrder: `${prefix}/admin-create`,
  newOrders: `${prefix}/new`,
  updateOrder: (orderId: number) => `${prefix}/${orderId}`,
  getOrderById: (orderId: number) => `${prefix}/${orderId}`,
  deleteOrder: (orderId: number) => `${prefix}/delete/${orderId}`
}
