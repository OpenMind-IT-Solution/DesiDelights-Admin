const prefix = 'stores'

export const storeEndpoints = {
  getStores: `${prefix}/list`,
  storeDropdown: `${prefix}/dropdown`,
  saveStore: `${prefix}/save`,
  deleteStore: (storeId: number) => `${prefix}/delete/${storeId}`
}
