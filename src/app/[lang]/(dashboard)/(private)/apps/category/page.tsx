
import { getCategoryData } from '@/app/server/actions'
import CategoryTable from './CategoryListTable'

const CategoryListApp = async () => {
  const data = await getCategoryData()

  return <CategoryTable tableData={data.categories} />
}

export default CategoryListApp
