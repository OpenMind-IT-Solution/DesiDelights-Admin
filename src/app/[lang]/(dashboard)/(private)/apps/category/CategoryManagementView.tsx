'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

import type { Category } from '@/types/apps/categoryTypes'

import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import CategoryDetails from './CategoryDetails'
import CategoryForm from './CategoryForm'
import CustomTextField from '@/@core/components/mui/TextField'
import { post, get, del } from '@/services/apiService' // Import the 'del' method
import { categoriesEndpoints } from '@/services/endpoints/category'
import { toast } from 'react-toastify'

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

const EmptyStatePlaceholder = ({ icon, title, message }: { icon: string; title: string; message: string }) => (
  <Box className='flex flex-col items-center justify-center h-full text-center p-4'>
    <i className={`${icon} text-7xl text-textSecondary mbe-4`} />
    <Typography variant='h5' sx={{ mb: 2 }}>
      {title}
    </Typography>
    <Typography color='text.secondary'>{message}</Typography>
  </Box>
)

const CategoryManagementView = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // State for data, selection, and UI modes
  const [data, setData] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formMode, setFormMode] = useState<'hidden' | 'add' | 'edit'>('hidden')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // State for API and filtering
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalRows, setTotalRows] = useState(0)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 })
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [statusFilter, setStatusFilter] = useState<Category['status'] | ''>('')

  const getCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const body = {
        search: debouncedSearchTerm,
        status: statusFilter ? [statusFilter === 'active'] : [],
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      }

      const res: any = await post(categoriesEndpoints.getCategories, body)

      const categoryData =
        res?.data?.categories?.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          status: cat.status ? 'active' : 'inactive'
        })) || []

      setData(categoryData)
      setTotalRows(res?.data?.total || categoryData.length || 0)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to fetch categories')
      setData([])
      setTotalRows(0)
    } finally {
      setLoading(false)
    }
  }, [pagination, debouncedSearchTerm, statusFilter])

  useEffect(() => {
    getCategories()
  }, [getCategories])

  const filteredCategories = useMemo(() => {
    return data
  }, [data])

  useEffect(() => {
    const isSelectedVisible = selectedCategory && filteredCategories.some(cat => cat.id === selectedCategory.id)

    if (!isSelectedVisible) {
      setSelectedCategory(filteredCategories.length > 0 ? filteredCategories[0] : null)
    }
  }, [filteredCategories, selectedCategory])

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category)
    setFormMode('hidden')
    if (isMobile) setMobileDrawerOpen(false)
  }

  const handleEdit = async () => {
    if (!selectedCategory) return

    setLoading(true)
    setError(null)

    try {
      const endpoint = categoriesEndpoints.getCategoriesById(selectedCategory.id)
      const result: any = await get(endpoint)

      if (result.status === 'success' && result.data) {
        const categoryDetails: Category = {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description,
          status: result.data.status ? 'active' : 'inactive'
        }

        setSelectedCategory(categoryDetails)
        setFormMode('edit')
      } else {
        toast.error(result?.message || 'Failed to fetch category details.')
      }
    } catch (err: any) {
      console.error(err)
      const errorMessage = err?.message || 'An unexpected error occurred.'

      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSave = async (formData: Category | Omit<Category, 'id'>) => {
    setLoading(true)
    const isEditMode = 'id' in formData
    const body = {
      categoryId: isEditMode ? formData.id : 0,
      restaurantId: [1],
      name: formData.name,
      description: formData.description,
      status: formData.status === 'active'
    }

    try {
      const result: any = await post(categoriesEndpoints.saveCategories, body)

      if (result.status === 'success') {
        toast.success(result.message || `Category ${isEditMode ? 'updated' : 'created'} successfully!`)
        if (isEditMode) {
          setSelectedCategory(formData as Category)
        }
        setFormMode('hidden')
        await getCategories()
      } else {
        toast.error(result.message || 'Failed to save category.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  const handleFormCancel = () => {
    setFormMode('hidden')

    if (!selectedCategory && filteredCategories.length > 0) {
      setSelectedCategory(filteredCategories[0])
    }
  }

  // UPDATED: handleDeleteCategory now performs the API call
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    setLoading(true)

    try {
      const endpoint = categoriesEndpoints.deleteCategories(selectedCategory.id)
      const result: any = await del(endpoint)

      if (result.status === 'success') {
        toast.success(result?.message || 'Category deleted successfully!')
        await getCategories() // Refetch data to show the changes
      } else {
        toast.error(result?.message || 'Failed to delete category.')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'An unexpected error occurred while deleting.')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'Description', 'Status']

    const csvRows = [
      headers.join(','),
      ...filteredCategories.map(cat =>
        [cat.id, `"${cat.name.replace(/"/g, '""')}"`, `"${cat.description.replace(/"/g, '""')}"`, cat.status].join(',')
      )
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    link.href = URL.createObjectURL(blob)
    link.download = 'categories.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const MasterList = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Categories
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              placeholder='Search...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='tabler-search' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              select
              fullWidth
              label='Status'
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as Category['status'] | '')}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
            </CustomTextField>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', position: 'relative' }}>
        {loading && data.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover'
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <List disablePadding>
          {!loading && error && (
            <ListItem>
              <ListItemText
                primary='Error'
                secondary={error}
                primaryTypographyProps={{ color: 'error' }}
                sx={{ p: 4, fontStyle: 'italic' }}
              />
            </ListItem>
          )}
          {!loading && !error && filteredCategories.length > 0
            ? filteredCategories.map(cat => (
                <ListItem key={cat.id} disablePadding>
                  <ListItemButton selected={selectedCategory?.id === cat.id} onClick={() => handleSelectCategory(cat)}>
                    <ListItemIcon>
                      <i className='tabler-category-2 text-xl' />
                    </ListItemIcon>
                    <ListItemText primary={cat.name} />
                  </ListItemButton>
                </ListItem>
              ))
            : !loading &&
              !error && (
                <ListItem>
                  <ListItemText primary='No categories found.' sx={{ p: 4, fontStyle: 'italic' }} />
                </ListItem>
              )}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setFormMode('add')}
            >
              Add Category
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant='tonal'
              color='secondary'
              startIcon={<i className='tabler-upload' />}
              onClick={handleExportCsv}
              disabled={filteredCategories.length === 0}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      )
    }

    if (formMode !== 'hidden') {
      return (
        <CategoryForm
          mode={formMode}
          category={formMode === 'edit' ? selectedCategory! : undefined}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )
    }

    if (selectedCategory) {
      return (
        <CategoryDetails category={selectedCategory} onEdit={handleEdit} onDelete={() => setDeleteDialogOpen(true)} />
      )
    }

    return (
      <EmptyStatePlaceholder
        icon='tabler-category'
        title='Select a Category'
        message='Choose a category from the list to see its details, or apply a different filter.'
      />
    )
  }

  const getContentTitle = () => {
    if (formMode === 'add') return 'Add New Category'
    if (formMode === 'edit') return 'Edit Category'
    if (selectedCategory) return 'Category Details'

    return 'Manage Categories'
  }

  return (
    <>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 8rem)', gap: 4 }}>
        {!isMobile && <Box sx={{ minWidth: 320, width: '100%', maxWidth: 350 }}>{MasterList}</Box>}

        <Drawer
          variant='temporary'
          open={isMobile && mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: 300 } }}
        >
          {MasterList}
        </Drawer>

        <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <CardHeader
            title={getContentTitle()}
            action={
              isMobile && (
                <IconButton onClick={() => setMobileDrawerOpen(true)}>
                  <i className='tabler-menu-2' />
                </IconButton>
              )
            }
          />
          <Divider />
          <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 4, sm: 6 } }}>{renderContent()}</CardContent>
        </Card>
      </Box>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteCategory}
        itemName={selectedCategory?.name}
        itemType='Category'
      />
    </>
  )
}

export default CategoryManagementView
