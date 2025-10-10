const prefix = 'restaurants'

export const restaurantEndpoints = {
  getRestaurant: `${prefix}/list`,
  saveRestaurant: `${prefix}/save`,
  getRestaurantById: (restaurantId: number) => `${prefix}/${restaurantId}`,
  deleteRestaurant: (restaurantId: number) => `${prefix}/delete/${restaurantId}`
}
