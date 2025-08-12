// Component Imports

import type { ThemeColor } from "@/@core/types";
import type { RestaurantTypes } from "@/types/apps/restaurantTypes";
import RestaurantList from "@/views/apps/restaurant";

// Data Imports
// import { getUserData } from '@/app/server/actions'

/* const getUserData = async () => {
  const res = await fetch(`${process.env.API_URL}/apps/user-list`)
  if (!res.ok) {
    throw new Error('Failed to fetch userData')
  }
  return res.json()
} */
const data: RestaurantTypes[] = [
  {
    id: 1,
    name: 'Desi Delights',
    email: 'info@desidelights.com',
    status: 'active',
    avatar: '/images/avatars/1.png',
    country: 'India',
    contact: '+91 12345 67890',
    registrationName: 'Desi Delights Pvt Ltd',
    adminUsername: 'admin',
    currentPlan: 'premium',
    avatarColor: 'primary' as ThemeColor, // Use a valid ThemeColor value
    billing: 'monthly'
  }
]

const UserListApp = async () => {
  // const data = await getUserData()

  return <RestaurantList restaurantData={data} />
}

export default UserListApp
