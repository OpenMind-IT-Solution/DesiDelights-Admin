'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

// Dialog Import
import PermissionDialog from '@components/dialogs/permission-dialog'

type PermissionsProps = {
  permissionsData: any[]
}

const Permissions = ({ permissionsData }: PermissionsProps) => {
  const [open, setOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<string | undefined>(undefined)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title='Permissions List'
            action={
              <Button
                variant='contained'
                onClick={() => {
                  setSelectedPermission(undefined)
                  setOpen(true)
                }}
              >
                Add Permission
              </Button>
            }
          />
          <CardContent>
            {permissionsData && permissionsData.length > 0 ? (
              permissionsData.map((item: any, index: number) => (
                <div key={index} className='flex items-center justify-between pbe-4 mbe-4 border-b last:border-0 last:pbe-0 last:mbe-0'>
                  <div>
                    <Typography variant='body1' className='font-medium'>
                      {item.name ?? `Permission ${item.id ?? index + 1}`}
                    </Typography>
                    {item.status && (
                      <Chip
                        label={item.status}
                        size='small'
                        color={item.status === 'completed' ? 'success' : item.status === 'cancelled' ? 'error' : 'warning'}
                        className='mbs-1'
                      />
                    )}
                  </div>
                  <Button
                    size='small'
                    variant='tonal'
                    onClick={() => {
                      setSelectedPermission(item.name ?? String(item.id))
                      setOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                </div>
              ))
            ) : (
              <Typography color='text.secondary'>No permissions found.</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <PermissionDialog open={open} setOpen={setOpen} data={selectedPermission} />
    </Grid>
  )
}

export default Permissions
