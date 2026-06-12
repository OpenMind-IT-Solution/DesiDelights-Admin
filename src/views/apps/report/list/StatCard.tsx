import { Box, Card, CardContent, Typography } from "@mui/material"

const StatCard = ({
  title,
  value,
  icon,
  color = 'primary',
  isSelected,
  onClick,
  className
}: {
  title: string
  value: number
  icon: string
  color?: 'primary' | 'success' | 'warning' | 'error'
  isSelected: boolean
  onClick: () => void
  className?: string
}) => (
  <Card
    className={className}
    onClick={onClick}
    sx={{
      border: 2,
      borderColor: isSelected ? `${color}.main` : 'transparent',
      cursor: 'pointer',
      transition: 'border-color 0.3s'
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant='h5'>{value}</Typography>
          <Typography color='text.secondary'>{title}</Typography>
        </Box>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: `rgba(var(--mui-palette-${color}-mainChannel) / 0.1)` }}>
          <i className={`${icon} text-3xl text-${color}`} />
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export default StatCard;
