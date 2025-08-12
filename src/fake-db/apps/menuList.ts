import { Menu } from '@/types/apps/menuTypes'

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
      offer: '15' 
    },
    {
      id: 2,
      name: 'Paneer Butter Masala',
      description: 'Creamy tomato-based curry with soft paneer cubes and a blend of aromatic spices.',
      price: 250,
       menuImages: ['/images/cards/2.png'],
      status: true,
      tag: "Chef's Special",
      offer: '0'
    },
    {
      id: 3,
      name: 'Veg Biryani',
      description: 'Fragrant basmati rice cooked with mixed vegetables and rich spices, served with raita.',
      price: 180,
       menuImages: ['/images/cards/3.png'],
      status: true,
      tag: 'New',
      offer: '10'
    },
    {
      id: 4,
      name: 'Sweet Lassi',
      description: 'Refreshing yogurt-based drink flavored with cardamom and rose water.',
      price: 60,
       menuImages: ['/images/cards/2.png',],
      status: true,
      tag: 'Beverage',
      offer: '5'
    }
  ]
}
