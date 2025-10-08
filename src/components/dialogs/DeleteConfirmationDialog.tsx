// src/components/dialogs/DeleteConfirmationDialog.tsx

import type { FC } from 'react'

import {
  Dialog,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Typography,
  Divider,
  IconButton
} from '@mui/material'

interface DeleteConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  itemName?: string
  itemType?: string
}

const DeleteConfirmationDialog: FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item'
}) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby='delete-dialog-title'>
      <Card>
        <CardHeader
          id='delete-dialog-title'
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant='h5' component='span'>
                Confirm Deletion
              </Typography>
              <IconButton size='small' onClick={onClose} aria-label='close'>
                <i className='tabler-x' />
              </IconButton>
            </div>
          }
        />
        <Divider />
        <CardContent>
          <Typography>
            Are you sure you want to delete the {itemType} &quot;{itemName || `this ${itemType}`}&quot;?
          </Typography>
          <Typography color='text.secondary' sx={{ mt: 2 }}>
            This action is permanent and cannot be undone.
          </Typography>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button variant='outlined' color='secondary' onClick={onClose}>
            No, Cancel
          </Button>
          <Button variant='contained' color='error' onClick={onConfirm}>
            Yes, Delete
          </Button>
        </CardActions>
      </Card>
    </Dialog>
  )
}

export default DeleteConfirmationDialog
