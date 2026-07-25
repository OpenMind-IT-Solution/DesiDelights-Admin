'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

export const KPISkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Skeleton variant='rounded' width={44} height={44} />
        <Skeleton variant='text' width='60%' />
      </Box>
      <Skeleton variant='text' width='40%' height={40} />
      <Skeleton variant='text' width='50%' />
      <Skeleton variant='rounded' width='100%' height={40} sx={{ mt: 1 }} />
    </CardContent>
  </Card>
)

export const ChartSkeleton = ({ height = 350 }: { height?: number }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton variant='text' width={200} height={32} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant='rounded' width={80} height={32} />
          <Skeleton variant='rounded' width={80} height={32} />
        </Box>
      </Box>
      <Skeleton variant='rounded' width='100%' height={height} />
    </CardContent>
  </Card>
)

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Card>
    <CardContent>
      <Skeleton variant='text' width={200} height={32} sx={{ mb: 2 }} />
      <Skeleton variant='rounded' width='100%' height={40} sx={{ mb: 1 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant='rounded' width='100%' height={48} sx={{ mb: 0.5 }} />
      ))}
    </CardContent>
  </Card>
)

export const CardListSkeleton = ({ count = 4 }: { count?: number }) => (
  <Grid container spacing={4}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Skeleton variant='rounded' width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant='text' width='60%' />
                <Skeleton variant='text' width='40%' height={24} />
              </Box>
            </Box>
            <Skeleton variant='rounded' width='100%' height={8} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
)

export const KPIGridSkeleton = () => (
  <Grid container spacing={4}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
        <KPISkeleton />
      </Grid>
    ))}
  </Grid>
)
