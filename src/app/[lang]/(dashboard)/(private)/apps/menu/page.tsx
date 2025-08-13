import { getMenuData } from '@/app/server/actions' 
import MenuTable from './MenuTable' 

const MenuListApp = async () => {
  const data = await getMenuData()

  return <MenuTable tableData={data.menuItems} />
}

export default MenuListApp
