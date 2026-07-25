'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import Button from '@mui/material/Button'
import { useSession } from 'next-auth/react'

import { post } from '@/services/apiService'
import { restaurantEndpoints } from '@/services/endpoints/restaurant'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import { useDashboardContext, type DateRangePreset } from './DashboardContext'

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' }
]

const DashboardHeader = () => {
  const { data: session } = useSession()

  const {
    dateRangePreset,
    setDateRangePreset,
    customStartDate,
    customEndDate,
    setCustomStartDate,
    setCustomEndDate,
    refresh,
    selectedRestaurantId,
    setSelectedRestaurantId,
    restaurants,
    setRestaurants
  } = useDashboardContext()

  const [belgiumTime, setBelgiumTime] = useState('')

  useEffect(() => {
    const update = () => {
      setBelgiumTime(
        new Date().toLocaleString('en-GB', {
          timeZone: 'Europe/Brussels',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      )
    }

    update()
    const interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const result = await post(restaurantEndpoints.getRestaurant, { page: 1, limit: 100 })

        if (result?.data?.restaurants) {
          const list = result.data.restaurants.map((r: any) => ({ id: r.id, name: r.name }))

          setRestaurants(list)

          const userRestIds = (session?.user as any)?.restaurantId

          if (Array.isArray(userRestIds) && userRestIds.length === 1) {
            setSelectedRestaurantId(userRestIds[0])
          } else if (list.length === 1) {
            setSelectedRestaurantId(list[0].id)
          }
        }
      } catch {
        // silent
      }
    }

    fetchRestaurants()
  }, [session, setRestaurants, setSelectedRestaurantId])

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent sx={{ p: '20px !important' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 3
          }}
        >
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 700, mb: 0.5 }}>
              Dashboard
            </Typography>
            <Typography variant='body2' color='text.disabled'>
              {`Welcome back, ${session?.user?.name || 'Admin'}! Here\u2019s what\u2019s happening today.`}
            </Typography>
            <Typography variant='caption' color='primary' sx={{ mt: 0.5, display: 'block' }}>
              {belgiumTime} (Brussels Time)
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              width: { xs: '100%', md: 'auto' }
            }}
          >
            {restaurants.length > 1 && (
              <FormControl size='small' sx={{ minWidth: 180 }}>
                <Select
                  value={selectedRestaurantId ?? ''}
                  onChange={e => setSelectedRestaurantId(Number(e.target.value) || null)}
                  displayEmpty
                >
                  <MenuItem value=''>
                    <em>All Restaurants</em>
                  </MenuItem>
                  {restaurants.map(r => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {DATE_PRESETS.map(p => (
                <Button
                  key={p.value}
                  size='small'
                  variant={dateRangePreset === p.value ? 'contained' : 'outlined'}
                  onClick={() => setDateRangePreset(p.value)}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    px: 1.5
                  }}
                >
                  {p.label}
                </Button>
              ))}
            </Box>

            {dateRangePreset === 'custom' && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <AppReactDatepicker
                  selected={customStartDate ? new Date(customStartDate) : null}
                  onChange={(date: Date | null) => setCustomStartDate(date ? date.toISOString().split('T')[0] : '')}
                  dateFormat='dd MMM yyyy'
                  placeholderText='Start date'
                  customInput={
                    <input
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--mui-palette-divider)',
                        background: 'var(--mui-palette-background-paper)',
                        color: 'var(--mui-palette-text-primary)',
                        fontSize: '0.8rem',
                        width: 130,
                        outline: 'none'
                      }}
                    />
                  }
                />
                <Typography variant='caption' color='text.disabled'>to</Typography>
                <AppReactDatepicker
                  selected={customEndDate ? new Date(customEndDate) : null}
                  onChange={(date: Date | null) => setCustomEndDate(date ? date.toISOString().split('T')[0] : '')}
                  dateFormat='dd MMM yyyy'
                  placeholderText='End date'
                  customInput={
                    <input
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--mui-palette-divider)',
                        background: 'var(--mui-palette-background-paper)',
                        color: 'var(--mui-palette-text-primary)',
                        fontSize: '0.8rem',
                        width: 130,
                        outline: 'none'
                      }}
                    />
                  }
                />
              </Box>
            )}

            <Button
              size='small'
              variant='outlined'
              onClick={refresh}
              startIcon={<i className='tabler-refresh' />}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default DashboardHeader
