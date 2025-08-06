// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import UserListTable from './UserListTable'

// <Grid container spacing={6}>
//   <Grid size={{ xs: 12 }}>
//     <UserListCards />
//   </Grid>
const UserList = ({ userData }: { userData?: UsersType[] }) => {
  return (
      <Grid size={{ xs: 12 }}>
        <UserListTable tableData={userData} />
      </Grid>

    // </Grid>
  )
}

// </Grid>
export default UserList
