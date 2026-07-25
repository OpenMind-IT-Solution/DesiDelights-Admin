'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { alpha } from '@mui/material/styles'

interface LowStockWidgetProps {
  inventoryInsights: any
}

const LowStockWidget = ({ inventoryInsights }: LowStockWidgetProps) => {
  const lowStockItems = inventoryInsights?.lowStockItems || []
  const totalItems = inventoryInsights?.totalItems || 0
  const lowStockCount = inventoryInsights?.lowStockCount || lowStockItems.length

  if (lowStockItems.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title='Inventory Status' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-alert-triangle text-xl' />} />
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              px: 4,
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha('#56CAFB', 0.12),
                mb: 2
              }}
            >
              <i className='tabler-circle-check text-[2.5rem]' style={{ color: '#56CAFB' }} />
            </Box>
            <Typography variant='h6' fontWeight={600} gutterBottom>
              Everything is in Stock
            </Typography>
            <Typography variant='body2' color='text.disabled'>
              All inventory items are above their threshold levels
            </Typography>
            {totalItems > 0 && (
              <Chip
                size='small'
                label={`${totalItems} items tracked`}
                sx={{ mt: 2, bgcolor: alpha('#56CAFB', 0.12), color: '#56CAFB' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title='Inventory Warnings'
        titleTypographyProps={{ variant: 'h5' }}
        avatar={<i className='tabler-alert-triangle text-xl' />}
        action={
          <Chip
            size='small'
            label={`${lowStockCount} low`}
            color='warning'
            variant='tonal'
          />
        }
      />
      <CardContent sx={{ p: '0 !important' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {lowStockItems.slice(0, 8).map((item: any, index: number) => {
            const remaining = item.quantity || item.currentStock || 0
            const threshold = item.itemLowerValue || item.threshold || 10
            const isOut = remaining === 0 || item.status === 'Out of Stock'

            return (
              <Box
                key={item.id || index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 150ms ease'
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant='body2' fontWeight={600} noWrap>
                    {item.itemName || item.name || 'Unknown'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      size='small'
                      label={item.status || (isOut ? 'Out of Stock' : 'Low Stock')}
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: alpha(isOut ? '#FF4C51' : '#FFB547', 0.12),
                        color: isOut ? '#FF4C51' : '#FFB547'
                      }}
                    />
                    {item.storeName && (
                      <Typography variant='caption' color='text.disabled'>
                        {item.storeName}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                  <Typography variant='body2' fontWeight={700} color={isOut ? 'error.main' : 'warning.main'}>
                    {remaining}
                  </Typography>
                  <Typography variant='caption' color='text.disabled'>
                    / {threshold}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default LowStockWidget
