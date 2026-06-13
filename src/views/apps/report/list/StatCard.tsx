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
      cursor: 'pointer',
      borderRadius: 2.5,
      border: 2,
      borderColor: isSelected ? `${color}.main` : 'divider',
      bgcolor: isSelected ? t => `${t.palette[color].main}0D` : 'background.paper',
      transition: 'all 0.2s ease',
      boxShadow: isSelected ? t => `0 0 0 1px ${t.palette[color].main}` : 'none',
      '&:hover': {
        borderColor: t => t.palette[color].main,
        boxShadow: t => `0 4px 20px ${t.palette[color].main}20`
      }
    }}
  >
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant='h5' sx={{ fontWeight: 700 }}>{value}</Typography>
          <Typography variant='body2' color='text.secondary'>{title}</Typography>
        </Box>
        <Box sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          background: t => `linear-gradient(135deg, ${t.palette[color].main}, ${t.palette[color].dark})`,
          boxShadow: t => `0 4px 12px ${t.palette[color].main}40`,
          minWidth: 40,
          minHeight: 40
        }}>
          <i className={`${icon} text-xl`} style={{ color: '#fff' }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export default StatCard
