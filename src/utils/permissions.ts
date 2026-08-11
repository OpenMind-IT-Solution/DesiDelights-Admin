export type Permission = {
  moduleId: number
  moduleName: string
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

export const moduleRouteMap: Record<string, string | string[]> = {
  dashboard: '/dashboards/crm',
  'restaurant management': ['/apps/restaurant', '/apps/banner'],
  'user management': '/apps/user',
  'category management': '/apps/category',
  'menu management': '/apps/menu',
  'pos management': '/apps/pos',
  'inventory management': '/apps/grocery',
  'order management': '/apps/order',
  'report management': '/apps/report',
  'coupon management': '/apps/coupon',
  'payment gateway': '/apps/payment',
  setting: '/apps/delivery-settings',
  'location management': '/apps/locations',
  'roles & permission': '/apps/roles',
  'customer review and rating': '/apps/manage-reviews'
}

export function canView(permissions: Permission[] | undefined, moduleName: string): boolean {
  if (!permissions || permissions.length === 0) return true

  const perm = permissions.find(p => p.moduleName.toLowerCase() === moduleName.toLowerCase())

  return perm ? !!perm.view : false
}

export function getAccessibleRoutes(permissions: Permission[] | undefined): string[] {
  if (!permissions || permissions.length === 0) return Object.values(moduleRouteMap).flat()

  return Object.entries(moduleRouteMap)
    .filter(([moduleName]) => canView(permissions, moduleName))
    .flatMap(([, route]) => route)
}

export function isRouteAllowed(pathname: string, permissions: Permission[] | undefined): boolean {
  if (!permissions || permissions.length === 0) return true

  const accessibleRoutes = getAccessibleRoutes(permissions)

  return accessibleRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
}
