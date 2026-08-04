'use client'

import { useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import { getAccessibleRoutes, isRouteAllowed } from '@/utils/permissions'

export default function RoleBasedRedirect({
  children,
  lang
}: {
  children: React.ReactNode
  lang: string
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return

    const permissions = session.user.permissions

    // No restrictions -> default behavior
    if (!permissions || permissions.length === 0) return

    const path = pathname.replace(/^\/(?:en|fr|ar)(?=\/|$)/, '') || '/'

    if (path === '/') {
      const firstRoute = getAccessibleRoutes(permissions)[0]

      if (firstRoute) {
        router.replace(`/${lang}${firstRoute}`)
      }

      return
    }

    if (!isRouteAllowed(path, permissions)) {
      const firstRoute = getAccessibleRoutes(permissions)[0]

      if (firstRoute) {
        router.replace(`/${lang}${firstRoute}`)
      }
    }
  }, [session, status, pathname, lang, router])

  return <>{children}</>
}
