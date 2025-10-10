'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import type { Category } from '@/types/apps/categoryTypes'
import type { ThemeColor } from '@core/types'

type CategoryDetailsProps = {
  category: Category
  onEdit: () => void
  onDelete: () => void
}

const CategoryDetails = ({ category, onEdit, onDelete }: CategoryDetailsProps) => {
  const categoryStatusObj: Record<string, ThemeColor> = { active: 'success', pending: 'warning', inactive: 'secondary' }

  return (
    <div>
      <Box className='flex justify-between items-start gap-4 mb-6'>
        <div>
          <Typography variant='h4' className='mb-2'>
            {category.name}
          </Typography>
          <Chip
            label={category.status}
            color={categoryStatusObj[category.status]}
            size='small'
            className='capitalize'
          />
        </div>
        <Box>
          <IconButton onClick={onEdit}>
            <i className='tabler-edit' />
          </IconButton>
          <IconButton onClick={onDelete} color='error'>
            <i className='tabler-trash' />
          </IconButton>
        </Box>
      </Box>
      <Divider sx={{ mb: 4 }} />
      <Typography variant='body1'>{category.description}</Typography>
    </div>
  )
}

export default CategoryDetails
