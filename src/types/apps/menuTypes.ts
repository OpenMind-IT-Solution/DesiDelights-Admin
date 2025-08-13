export type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  menuImages: string[] 
  status: boolean
  tag?: string
  offer?: string
}

export type Menu = {
  menuItems: MenuItem[]
}
