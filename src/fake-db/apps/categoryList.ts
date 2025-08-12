import type { CategoryTypes } from '@/types/apps/categoryTypes'

export const db: CategoryTypes = {
  categories: [
    {
      id: 1,
      name: 'South Indian',
      description: 'Delicious traditional dishes from South India',
      status: 'active'
    },
    {
      id: 2,
      name: 'North Indian',
      description: 'Hearty and spicy dishes from North India',
      status: 'active'
    },
    {
      id: 3,
      name: 'Chinese',
      description: 'Flavorsome Chinese cuisine with diverse options',
      status: 'active'
    },
    {
      id: 4,
      name: 'Continental',
      description: 'Western-style dishes and continental delicacies',
      status: 'active'
    },
    {
      id: 5,
      name: 'Desserts',
      description: 'Sweet treats and delightful desserts',
      status: 'active'
    },
    {
      id: 6,
      name: 'Beverages',
      description: 'Refreshing drinks and beverages',
      status: 'active'
    }
  ]
}
