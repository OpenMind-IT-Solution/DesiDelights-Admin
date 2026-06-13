// MUI Imports
import Grid from '@mui/material/Grid2'

// Type Imports
import RolesTable from './RolesTable'

const Roles = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <RolesTable />
      </Grid>
    </Grid>
  )
}

export default Roles
