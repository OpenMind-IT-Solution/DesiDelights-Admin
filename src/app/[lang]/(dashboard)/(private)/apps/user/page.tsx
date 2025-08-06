// Data Imports
import { getUserData } from '@/app/server/actions'
import UserListTable from './UserListTable'

const UserListApp = async () => {
  // Vars
  const userData = await getUserData()

  return <UserListTable tableData={userData} />
}

export default UserListApp
