'use client'

import { useMemo } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

interface QuickAction {
  title: string
  icon: string
  color: string
  path: string
  roles?: string[]
}

const ALL_ACTIONS: QuickAction[] = [
  { title: 'Open POS', icon: 'tabler-point-of-sale', color: '#7367F0', path: '/apps/pos', roles: ['POS', 'Super Admin', 'Admin'] },
  { title: 'Create Order', icon: 'tabler-shopping-cart-plus', color: '#00CFE8', path: '/apps/order', roles: ['Super Admin', 'Admin', 'Manager'] },
  { title: 'Add Menu Item', icon: 'tabler-plus', color: '#56CAFB', path: '/apps/menu', roles: ['Super Admin', 'Admin', 'Manager'] },
  { title: 'Add Customer', icon: 'tabler-user-plus', color: '#FFB547', path: '/apps/user', roles: ['Super Admin', 'Admin', 'Manager'] },
  { title: 'Manage Inventory', icon: 'tabler-package', color: '#FF4C51', path: '/apps/grocery', roles: ['Super Admin', 'Admin', 'Manager'] },
  { title: 'Create Coupon', icon: 'tabler-discount', color: '#56CAFB', path: '/apps/coupon', roles: ['Super Admin', 'Admin'] },
  { title: 'View Reports', icon: 'tabler-file-analytics', color: '#00CFE8', path: '/apps/report', roles: ['Super Admin', 'Admin', 'Manager'] },
  { title: 'Manage Banners', icon: 'tabler-photo', color: '#FFB547', path: '/apps/banner', roles: ['Super Admin', 'Admin'] }
]

const QuickActions = () => {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const locale = params?.lang || 'en'
  const userRole = (session?.user as any)?.role as string | undefined

  const actions = useMemo(() => {
    if (!userRole) return ALL_ACTIONS

    return ALL_ACTIONS.filter(a => !a.roles || a.roles.includes(userRole))
  }, [userRole])

  if (actions.length === 0) return null

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title='Quick Actions' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-bolt text-xl' />} />
      <CardContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(4, 1fr)', md: `repeat(${Math.min(actions.length, 8)}, 1fr)` }, gap: 2 }}>
          {actions.map(action => (
            <Box
              key={action.title}
              onClick={() => router.push(`/${locale}${action.path}`)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                p: 2,
                borderRadius: 2.5,
                cursor: 'pointer',
                bgcolor: 'action.hover',
                transition: 'all 180ms ease',
                '&:hover': {
                  bgcolor: alpha(action.color, 0.12),
                  transform: 'translateY(-3px)',
                  boxShadow: `0 4px 15px -3px ${alpha(action.color, 0.3)}`
                }
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(action.color, 0.15),
                  color: action.color
                }}
              >
                <i className={`${action.icon} text-[1.3rem]`} />
              </Box>
              <Typography variant='caption' fontWeight={600} textAlign='center' sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                {action.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuickActions
