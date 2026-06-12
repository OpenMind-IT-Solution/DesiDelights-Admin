'use client'

// React Imports
import { useRef, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import type { Theme } from '@mui/material/styles'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { CustomAvatarProps } from '@core/components/mui/Avatar'
import type { Locale } from '@configs/i18n'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Service Imports
import { get } from '@/services/apiService'
import { orderEndpoints } from '@/services/endpoints/order'

const SEEN_KEY = 'notif_seen_order_ids'
const POLL_INTERVAL = 30000

export type NotificationsType = {
  title: string
  subtitle: string
  time: string
  read: boolean
  orderId?: number
} & (
  | {
      avatarImage?: string
      avatarIcon?: never
      avatarText?: never
      avatarColor?: never
      avatarSkin?: never
    }
  | {
      avatarIcon?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarText?: never
    }
  | {
      avatarText?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarIcon?: never
    }
)

const getRelativeTime = (dateStr: string): string => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString()
}

const getSeenIds = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
  } catch {
    return []
  }
}

const addSeenId = (id: number) => {
  const ids = getSeenIds()
  if (!ids.includes(id)) {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids, id]))
  }
}

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = (
  params: Pick<NotificationsType, 'avatarImage' | 'avatarIcon' | 'title' | 'avatarText' | 'avatarColor' | 'avatarSkin'>
) => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false)
  const [notificationsState, setNotificationsState] = useState<NotificationsType[]>([])
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')

  const notificationCount = notificationsState.filter(n => !n.read).length
  const readAll = notificationsState.length > 0 && notificationsState.every(n => n.read)

  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const knownOrderIds = useRef<Set<number>>(new Set())
  const isFirstFetch = useRef(true)
  const permissionAsked = useRef(false)

  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const router = useRouter()
  const { lang: locale } = useParams()

  // Sync permission state on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission)
    }
  }, [])

  // Called on the first bell click — a real user gesture
  const requestPermissionAndUnlockAudio = async () => {
    if (!permissionAsked.current && 'Notification' in window && Notification.permission === 'default') {
      permissionAsked.current = true
      const result = await Notification.requestPermission()
      setNotifPermission(result)
    }

    // Unlock AudioContext using this same gesture
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (AudioCtx) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx()
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume()
      }
    }
  }

  const playAlertSound = useCallback(() => {
    const ctx = audioCtxRef.current
    if (!ctx || ctx.state !== 'running') return

    const pulses = [
      { freq: 520, start: 0,    duration: 0.14 },
      { freq: 520, start: 0.18, duration: 0.14 },
      { freq: 700, start: 0.36, duration: 0.22 }
    ]

    pulses.forEach(({ freq, start, duration }) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      const t    = ctx.currentTime + start

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.55, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + duration)
    })
  }, [])

  const showBrowserNotification = useCallback((order: any) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification(`New Order #${order.id}`, {
      body: `₹${parseFloat(order.totalAmount).toFixed(2)} • ${order.orderType}`,
      icon: '/logo.png',
      tag: `order-${order.id}`,
      requireInteraction: true
    })
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const result = await get(orderEndpoints.newOrders) as any
      if (result?.status === 'success') {
        const seenIds = getSeenIds()
        const orders: any[] = result.data?.orders || []

        const incomingIds = orders.map((o: any) => o.id as number)
        const newOrders = !isFirstFetch.current
          ? orders.filter((o: any) => !knownOrderIds.current.has(o.id))
          : []

        if (newOrders.length > 0) {
          playAlertSound()
          newOrders.forEach(showBrowserNotification)
        }

        incomingIds.forEach(id => knownOrderIds.current.add(id))
        isFirstFetch.current = false

        const mapped: NotificationsType[] = orders.map((order: any) => ({
          avatarIcon: 'tabler-shopping-bag',
          avatarColor: 'warning' as ThemeColor,
          title: `New Order #${order.id}`,
          subtitle: `₹${parseFloat(order.totalAmount).toFixed(2)} • ${order.orderType} • ${order.status}`,
          time: getRelativeTime(order.createdAt),
          read: seenIds.includes(order.id),
          orderId: order.id
        }))
        setNotificationsState(mapped)
      }
    } catch {
      // silently ignore polling errors
    }
  }, [playAlertSound, showBrowserNotification])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchOrders])

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        const availableHeight = window.innerHeight - 100
        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }
    window.addEventListener('resize', adjustPopoverHeight)
    return () => window.removeEventListener('resize', adjustPopoverHeight)
  }, [])

  const handleClose = () => setOpen(false)

  const handleToggle = () => {
    setOpen(prev => !prev)
    requestPermissionAndUnlockAudio()
  }

  const handleNotificationClick = (notification: NotificationsType, index: number) => {
    // mark as read
    if (!notification.read) {
      const updated = [...notificationsState]
      updated[index] = { ...updated[index], read: true }
      setNotificationsState(updated)
      if (notification.orderId) addSeenId(notification.orderId)
    }

    // navigate to order management
    setOpen(false)
    router.push(getLocalizedUrl('/apps/order', locale as Locale))
  }

  const handleRemoveNotification = (e: React.MouseEvent<HTMLElement>, index: number) => {
    e.stopPropagation()
    const updated = [...notificationsState]
    const removed = updated.splice(index, 1)[0]
    if (removed.orderId) addSeenId(removed.orderId)
    setNotificationsState(updated)
  }

  const readAllNotifications = () => {
    const updated = notificationsState.map(n => {
      if (n.orderId) addSeenId(n.orderId)
      return { ...n, read: !readAll }
    })
    setNotificationsState(updated)
  }

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          badgeContent={notificationCount}
          max={99}
          overlap='circular'
          invisible={notificationCount === 0}
          sx={{
            '& .MuiBadge-badge': {
              top: 4,
              right: 4,
              minWidth: 18,
              height: 18,
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0 4px',
              boxShadow: 'var(--mui-palette-background-paper) 0px 0px 0px 2px',
              animation: notificationCount > 0 ? 'notif-pulse 1.4s ease-in-out infinite' : 'none',
              '@keyframes notif-pulse': {
                '0%':   { boxShadow: '0 0 0 0 rgba(var(--mui-palette-error-mainChannel) / 0.7)' },
                '70%':  { boxShadow: '0 0 0 7px rgba(var(--mui-palette-error-mainChannel) / 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(var(--mui-palette-error-mainChannel) / 0)' }
              }
            }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='tabler-bell' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full !mbs-3 z-[1] max-bs-[550px] bs-[550px]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: { padding: themeConfig.layoutPadding }
                }
              ]
            }
          : { className: 'is-96 !mbs-3 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3.5 pli-4 is-full gap-2'>
                    <Typography variant='h6' className='flex-auto'>
                      Notifications
                    </Typography>
                    {notificationCount > 0 && (
                      <Chip
                        size='small'
                        color='error'
                        label={`${notificationCount} New`}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          letterSpacing: '0.04em',
                          animation: 'notif-chip-pulse 1.4s ease-in-out infinite',
                          '@keyframes notif-chip-pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%':      { opacity: 0.6 }
                          }
                        }}
                      />
                    )}
                    <Tooltip
                      title={readAll ? 'Mark all as unread' : 'Mark all as read'}
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              transformOrigin: 'right center !important'
                            }
                          }
                        }
                      }}
                    >
                      {notificationsState.length > 0 ? (
                        <IconButton size='small' onClick={readAllNotifications} className='text-textPrimary'>
                          <i className={readAll ? 'tabler-mail' : 'tabler-mail-opened'} />
                        </IconButton>
                      ) : (
                        <span />
                      )}
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    {notificationsState.length === 0 ? (
                      <div className='flex items-center justify-center p-6'>
                        <Typography variant='body2' color='text.secondary'>
                          No new orders in the last 24 hours
                        </Typography>
                      </div>
                    ) : (
                      notificationsState.map((notification, index) => {
                        const { title, subtitle, time, read, avatarImage, avatarIcon, avatarText, avatarColor, avatarSkin } =
                          notification

                        return (
                          <div
                            key={index}
                            className={classnames('flex plb-3 pli-4 gap-3 cursor-pointer hover:bg-actionHover group', {
                              'border-be': index !== notificationsState.length - 1
                            })}
                            onClick={() => handleNotificationClick(notification, index)}
                          >
                            {getAvatar({ avatarImage, avatarIcon, title, avatarText, avatarColor, avatarSkin })}
                            <div className='flex flex-col flex-auto'>
                              <Typography variant='body2' className='font-medium mbe-1' color='text.primary'>
                                {title}
                              </Typography>
                              <Typography variant='caption' color='text.secondary' className='mbe-2'>
                                {subtitle}
                              </Typography>
                              <Typography variant='caption' color='text.disabled'>
                                {time}
                              </Typography>
                            </div>
                            <div className='flex flex-col items-end gap-2'>
                              <Badge
                                variant='dot'
                                color={read ? 'secondary' : 'primary'}
                                onClick={e => {
                                  e.stopPropagation()
                                  const updated = [...notificationsState]
                                  updated[index] = { ...updated[index], read: !read }
                                  if (notification.orderId) {
                                    if (!read) addSeenId(notification.orderId)
                                  }
                                  setNotificationsState(updated)
                                }}
                                className={classnames('mbs-1 mie-1', { 'invisible group-hover:visible': read })}
                              />
                              <i
                                className='tabler-x text-xl invisible group-hover:visible'
                                onClick={e => handleRemoveNotification(e, index)}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </ScrollWrapper>
                  <Divider />
                  <div className='p-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      size='small'
                      onClick={() => {
                        setOpen(false)
                        router.push(getLocalizedUrl('/apps/order', locale as Locale))
                      }}
                    >
                      View All Orders
                    </Button>
                  </div>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
