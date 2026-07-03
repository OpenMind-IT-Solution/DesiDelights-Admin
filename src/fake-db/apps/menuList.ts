import type { Menu } from '@/types/apps/menuTypes'

export const db: Menu = {
  menuItems: [
    {
      id: 1,
      name: 'Masala Dosa',
      description: 'Crispy rice crepe filled with spiced mashed potatoes, served with coconut chutney and sambar.',
      price: 120,
      menuImages: ['/images/cards/1.png'],
      status: true,
      tag: 'Popular',
      offer: '15',
      categories: [
        {
          id: 1,
          name: 'South Indian'
        }
      ]
    },
    {
      id: 2,
      name: 'Paneer Butter Masala',
      description: 'Creamy tomato-based curry with soft paneer cubes and a blend of aromatic spices.',
      price: 250,
      menuImages: ['/images/cards/2.png'],
      status: true,
      tag: "Chef's Special",
      offer: '0',
      categories: [
        {
          id: 2,
          name: 'North Indian'
        }
      ]
    },
    {
      id: 3,
      name: 'Veg Biryani',
      description: 'Fragrant basmati rice cooked with mixed vegetables and rich spices, served with raita.',
      price: 180,
      menuImages: ['/images/cards/3.png'],
      status: true,
      tag: 'New',
      offer: '10',
      categories: [
        {
          id: 2,
          name: 'North Indian'
        }
      ]
    },
    {
      id: 4,
      name: 'Sweet Lassi',
      description: 'Refreshing yogurt-based drink flavored with cardamom and rose water.',
      price: 60,
      menuImages: ['/images/cards/2.png'],
      status: true,
      tag: 'Beverage',
      offer: '5',
      categories: [
        {
          id: 6,
          name: 'Beverages'
        }
      ]
    },
    {
      id: 5,
      name: 'Chicken Biryani',
      description: 'Aromatic basmati rice cooked with tender chicken and special spices.',
      price: 220,
      menuImages: ['/images/cards/1.png'],
      status: true,
      tag: 'Popular',
      offer: '0',
      categories: [
        {
          id: 2,
          name: 'North Indian'
        }
      ]
    },
    {
      id: 6,
      name: 'Gulab Jamun',
      description: 'Soft and syrupy dumplings made from milk solids, served warm.',
      price: 80,
      menuImages: ['/images/cards/3.png'],
      status: true,
      tag: 'Sweet',
      offer: '10',
      categories: [
        {
          id: 5,
          name: 'Desserts'
        }
      ]
    },
    {
      id: 7,
      name: 'Manchurian',
      description: 'Crispy vegetable balls in spicy, tangy sauce with Indo-Chinese flavors.',
      price: 160,
      menuImages: ['/images/cards/2.png'],
      status: true,
      tag: 'Spicy',
      offer: '0',
      categories: [
        {
          id: 3,
          name: 'Chinese'
        }
      ]
    },
    {
      id: 8,
      name: 'Pasta Alfredo',
      description: 'Creamy fettuccine pasta with parmesan cheese and herbs.',
      price: 190,
      menuImages: ['/images/cards/1.png'],
      status: true,
      tag: 'Creamy',
      offer: '5',
      categories: [
        {
          id: 4,
          name: 'Continental'
        }
      ]
    }
  ]
}
