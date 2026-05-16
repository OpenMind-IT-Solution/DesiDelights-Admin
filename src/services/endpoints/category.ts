const prefix = 'categories'

export const categoriesEndpoints = {
  getCategories: `${prefix}/list`,
  saveCategories: `${prefix}/save`,
  categoryDropdown: `${prefix}/dropdown`,
  getCategoriesById: (categoryId: number) => `${prefix}/${categoryId}`,
  deleteCategories: (categoryId: number) => `${prefix}/delete/${categoryId}`
}
  