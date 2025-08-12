
import { getCategoryData } from '@/app/server/actions'
import CategoryTable from './UserListTable'

const CategoryListApp = async () => {
  const data = await getCategoryData()

  return <CategoryTable tableData={data.categories} />
}

export default CategoryListApp
