// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem
          href={`/${locale}/dashboards/crm`}
          icon={<i className='tabler-smart-home' />}
          exactMatch={false}
          activeUrl='/dashboards/crm'
        >
          {dictionary['navigation'].dashboards}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/restaurant/list`} icon={<i className="tabler-building-store"></i>}>
          {dictionary['navigation'].restaurantManagement}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/user`} icon={<i className='tabler-user' />}>
          {dictionary['navigation'].userManagement}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/category`} icon={<i className='tabler-category-2' />}>
          {dictionary['navigation'].categoryManagement}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/menu`} icon={<i className='tabler-menu-deep' />}>
          {dictionary['navigation'].menuManagement}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/grocery`} icon={<i className='tabler-shopping-cart' />}>
          {dictionary['navigation'].groceryManagement}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/order`} icon={<i className='tabler-truck' />}>
          {dictionary['navigation'].ordersManagement}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/ecommerce/orders/list`} icon={<i className='tabler-file-analytics' />}>
          {dictionary['navigation'].report} {dictionary['navigation'].module}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/coupon`} icon={<i className='tabler-file-analytics' />}>
          {dictionary['navigation'].couponManagement}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/manage-reviews`} icon={<i className='tabler-message-star' />}>
          {dictionary['navigation'].manageReviews}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/support-tickets`} icon={<i className='tabler-ticket' />}>
          {dictionary['navigation'].supportTickets}
        </MenuItem>
        <MenuItem href={`/${locale}/apps/tv-management`} icon={<i className='tabler-device-tv-old' />}>
          {dictionary['navigation'].tvManagement}
        </MenuItem>
        <SubMenu label={dictionary['navigation'].settings} icon={<i className='tabler-settings' />}>
          <MenuItem href={`/${locale}/apps/academy/dashboard`}>{dictionary['navigation'].paymentGetway}</MenuItem>
          <MenuItem href={`/${locale}/apps/academy/my-courses`}>{dictionary['navigation'].locationManagement}</MenuItem>
          <MenuItem href={`/${locale}/apps/academy/my-courses`}>{dictionary['navigation'].restaurantProfile}</MenuItem>
          <MenuItem href={`/${locale}/apps/academy/my-courses`}>{dictionary['navigation'].rolesPermissions}</MenuItem>
        </SubMenu>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
