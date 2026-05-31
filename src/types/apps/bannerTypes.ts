export type BannerItem = {
  id: number
  restaurantId: number
  imageUrl: string
  imageUrlFull: string | null
  sortOrder: number
  status: boolean
  createdAt?: string
  updatedAt?: string
}
