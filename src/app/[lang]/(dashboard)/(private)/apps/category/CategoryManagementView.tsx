'use client'

import { useEffect, useMemo, useState } from 'react'

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

import type { Category } from '@/types/apps/categoryTypes'

import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import CategoryDetails from './CategoryDetails'
import CategoryForm from './CategoryForm'
import CustomTextField from '@/@core/components/mui/TextField'

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

const CategoryManagementView = ({ tableData }: { tableData?: Category[] }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [data, setData] = useState(tableData ?? [])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formMode, setFormMode] = useState<'hidden' | 'add' | 'edit'>('hidden')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<Category['status'] | ''>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const filteredCategories = useMemo(() => {
    return data.filter(cat => {
      const searchMatch = cat.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const statusMatch = !statusFilter || cat.status === statusFilter
      return searchMatch && statusMatch
    })
  }, [data, debouncedSearchTerm, statusFilter])

  useEffect(() => {
    const isSelectedVisible = selectedCategory && filteredCategories.some(cat => cat.id === selectedCategory.id)

    if (!isSelectedVisible) {
      if (filteredCategories.length > 0) {
        setSelectedCategory(filteredCategories[0])
      } else {
        setSelectedCategory(null)
      }
    }
  }, [filteredCategories, selectedCategory]) 
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category)
    setFormMode('hidden')
    if (isMobile) setMobileDrawerOpen(false)
  }

  const handleFormSave = (formData: Category | Omit<Category, 'id'>) => {
    if ('id' in formData) {
      const updatedCategory = formData as Category
      setData(prev => prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat)))
      setSelectedCategory(updatedCategory)
    } else {
      const newId = data.length > 0 ? Math.max(...data.map(c => c.id)) + 1 : 1
      const newCategory: Category = { id: newId, ...(formData as Omit<Category, 'id'>) }
      setData(prev => [newCategory, ...prev])
      setSelectedCategory(newCategory)
    }
    setFormMode('hidden')
  }

  const handleFormCancel = () => {
    setFormMode('hidden')
    if (!selectedCategory && filteredCategories.length > 0) {
      setSelectedCategory(filteredCategories[0])
    }
  }

  const handleDeleteCategory = () => {
    if (!selectedCategory) return
    const deletedIndex = data.findIndex(cat => cat.id === selectedCategory.id)
    const newData = data.filter(cat => cat.id !== selectedCategory.id)
    const nextSelected = newData.length > 0 ? newData[Math.max(0, deletedIndex - 1)] : null
    setData(newData)
    setSelectedCategory(nextSelected)
    setDeleteDialogOpen(false)
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
              <MenuItem value='pending'>Pending</MenuItem>
            </CustomTextField>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {filteredCategories.length > 0 ? (
            filteredCategories.map(cat => (
              <ListItem key={cat.id} disablePadding>
                <ListItemButton selected={selectedCategory?.id === cat.id} onClick={() => handleSelectCategory(cat)}>
                  <ListItemIcon>
                    <i className='tabler-category-2 text-xl' />
                  </ListItemIcon>
                  <ListItemText primary={cat.name} />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
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
        <CategoryDetails
          category={selectedCategory}
          onEdit={() => setFormMode('edit')}
          onDelete={() => setDeleteDialogOpen(true)}
        />
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
