export type MenuItems = {
  id: number
  name: string
  description: string
  price: number
  menuImages: string[] 
  status: boolean
  tag?: string
  offer?: string
  category?: {
    id: number
    name: string
  }
}

export type Menu = {
  menuItems: MenuItems[]
}
