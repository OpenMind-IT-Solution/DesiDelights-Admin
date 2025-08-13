import { getCategoryData } from '@/app/server/actions' 
import CategoryManagementView from './CategoryManagementView'


const CategoryManagementPage = async () => {
  const data = await getCategoryData()

  return <CategoryManagementView tableData={data.categories} />
}

export default CategoryManagementPage
