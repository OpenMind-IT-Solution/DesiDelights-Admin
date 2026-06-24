export type Category = {
  id: number
  description: string
  name: string
  status: string
  vatRate?: number
}

export type CategoryTypes = {
  categories: Category[]
}