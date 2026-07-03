export type MenuItems = {
  id: number
  name: string
  description: string
  price: number
  menuImages: string[]
  status: boolean
  tag?: string
  offer?: string
  vatRate?: number
  categories?: {
    id: number
    name: string
  }[]
  categoryId?: number[]
}

export type Menu = {
  menuItems: MenuItems[]
}
