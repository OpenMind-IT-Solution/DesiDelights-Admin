'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  sx?: SxProps<Theme>
}

const EmptyState = ({ icon = 'tabler-chart-bar', title, description, sx }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        minHeight: 200,
        ...sx
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          mb: 3
        }}
      >
        <i className={`${icon} text-[2rem]`} style={{ color: 'var(--mui-palette-text-disabled)' }} />
      </Box>
      <Typography variant='h6' color='text.primary' gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant='body2' color='text.disabled' textAlign='center' maxWidth={300}>
          {description}
        </Typography>
      )}
    </Box>
  )
}

export default EmptyState
