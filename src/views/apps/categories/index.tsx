import { Grid } from "@mui/material"
import CategoryListTable from "./CategoryListTable"
import { CategoriesTypes } from "@/types/apps/categoriesTypes"

const Categories = ({ categoryData }: { categoryData: CategoriesTypes[] }) => {
  return (
    <Grid container spacing={2}>
        <CategoryListTable categoryData={categoryData} />
    </Grid>
  )
}

export default Categories
