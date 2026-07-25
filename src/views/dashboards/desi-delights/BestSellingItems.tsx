'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha } from '@mui/material/styles'

import EmptyState from './EmptyState'

interface BestSellingItemsProps {
  items: any[]
}

const BestSellingItems = ({ items }: BestSellingItemsProps) => {
  if (!items || items.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title='Top 10 Selling Items' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-star text-xl' />} />
        <CardContent>
          <EmptyState icon='tabler-shopping-bag' title='No Sales Data' description='Best selling items will appear here once sales are recorded' />
        </CardContent>
      </Card>
    )
  }

  const maxRevenue = Math.max(...items.map((i: any) => i.totalRevenue || 0))

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title='Best Selling Items' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-star text-xl' />} />
      <CardContent sx={{ p: '0 !important' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {items.slice(0, 10).map((item: any, index: number) => {
            const popularity = maxRevenue > 0 ? ((item.totalRevenue || 0) / maxRevenue) * 100 : 0

            return (
              <Box
                key={item.menuItemId || index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  transition: 'background-color 150ms ease',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child': { borderBottom: 0 }
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha('#7367F0', 0.12),
                    color: '#7367F0',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant='body2' fontWeight={600} noWrap>
                    {item.name || 'Unknown Item'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                    {item.category && (
                      <Chip
                        size='small'
                        label={item.category}
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          bgcolor: alpha('#00CFE8', 0.12),
                          color: '#00CFE8',
                          fontWeight: 600
                        }}
                      />
                    )}
                    <Typography variant='caption' color='text.disabled'>
                      {item.totalQuantity || 0} sold
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                  <Typography variant='body2' fontWeight={700}>
                    €{(item.totalRevenue || 0).toFixed(2)}
                  </Typography>
                  <Box sx={{ mt: 0.5, width: 80 }}>
                    <LinearProgress
                      variant='determinate'
                      value={popularity}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: alpha('#7367F0', 0.12),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          bgcolor: '#7367F0'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default BestSellingItems
