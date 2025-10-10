
import Box from '@mui/material/Box'

export const RequiredLabel = ({ label, isRequired }: { label: string; isRequired: boolean }) => (
  <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center' }}>
    {label}
    {isRequired && (
      <Box component='span' sx={{ color: 'var(--mui-palette-error-main)', ml: 0.5 }}>
        *
      </Box>
    )}
  </Box>
)
