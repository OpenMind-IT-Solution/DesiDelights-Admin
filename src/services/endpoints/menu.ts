const prefix = 'menu-items'

export const menuEndpoints = {
  getMenu: `${prefix}/list`,
  saveMenu: `${prefix}/save`,
  getMenuById: (menuId: number) => `${prefix}/${menuId}`,
  deleteMenu: (menuId: number) => `${prefix}/delete/${menuId}`
}
