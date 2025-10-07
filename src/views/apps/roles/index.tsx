// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

import RolesTable from './RolesTable'

const Roles = ({ userData }: { userData?: UsersType[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <RolesTable tableData={userData} />
      </Grid>
    </Grid>
  )
}

export default Roles
