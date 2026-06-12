const prefix = 'grocery'

export const groceryEndpoints = {
  getGroceries: `${prefix}/list`,
  saveGrocery: `${prefix}/save`,
  getGroceryById: (groceryId: number) => `${prefix}/${groceryId}`,
  deleteGrocery: (groceryId: number) => `${prefix}/delete/${groceryId}`
}
