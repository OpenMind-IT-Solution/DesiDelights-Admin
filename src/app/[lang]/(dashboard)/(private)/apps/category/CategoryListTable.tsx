'use client'

import { useEffect, useMemo, useState } from 'react'

import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
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
import { MenuItem } from '@mui/material'

import type { Category } from '@/types/apps/categoryTypes'
import type { ThemeColor } from '@core/types'
import CustomTextField from '@core/components/mui/TextField'
import AddCategoryDrawer from './AddCategoryDrawer'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    
return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
return debouncedValue
}

const CategoryManagementView = ({ tableData }: { tableData?: Category[] }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [data, setData] = useState(tableData ?? [])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  useEffect(() => {
    if (data.length > 0 && !selectedCategory) {
      setSelectedCategory(data[0])
    }
  }, [data, selectedCategory])

  const filteredCategories = useMemo(() => {
    if (!debouncedSearchTerm) return data
    
return data.filter(cat => cat.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  }, [data, debouncedSearchTerm])

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsEditing(false)
    if (isMobile) setMobileDrawerOpen(false)
  }

  const handleUpdateCategory = (updatedCategory: Category) => {
    setData(prevData => prevData.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat)))
    setSelectedCategory(updatedCategory)
    setIsEditing(false)
  }

  const handleDeleteCategory = () => {
    if (!selectedCategory) return

    const deletedIndex = data.findIndex(cat => cat.id === selectedCategory.id)

    const newData = data.filter(cat => cat.id !== selectedCategory.id)

    let nextSelectedCategory: Category | null = null

    if (newData.length > 0) {
      const newIndexToSelect = deletedIndex >= newData.length ? newData.length - 1 : deletedIndex

      nextSelectedCategory = newData[newIndexToSelect]
    }

    setData(newData)
    setSelectedCategory(nextSelectedCategory)
    setDeleteDialogOpen(false)
  }

  const MasterList = (
    <Box className='flex flex-col h-full'>
      <Box className='p-4'>
        <CustomTextField
          fullWidth
          placeholder='Search Category...'
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
      </Box>
      <Divider />
      <List className='flex-grow overflow-y-auto'>
        {filteredCategories.map(cat => (
          <ListItem key={cat.id} disablePadding>
            <ListItemButton selected={selectedCategory?.id === cat.id} onClick={() => handleSelectCategory(cat)}>
              <ListItemIcon>
                <i className='tabler-category-2 text-xl' />
              </ListItemIcon>
              <ListItemText primary={cat.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box className='p-4'>
        <Button
          fullWidth
          variant='contained'
          startIcon={<i className='tabler-plus' />}
          onClick={() => setAddDrawerOpen(true)}
        >
          Add New Category
        </Button>
      </Box>
    </Box>
  )

  return (
    <>
      <Card className='flex' sx={{ height: 'calc(100vh - 12rem)' }}>
        {isMobile ? (
          <Drawer
            variant='temporary'
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: 300 } }}
          >
            {MasterList}
          </Drawer>
        ) : (
          <Box className='min-w-[300px] border-e'>{MasterList}</Box>
        )}

        <Box className='flex-grow p-6 flex flex-col'>
          {isMobile && (
            <Button
              variant='outlined'
              startIcon={<i className='tabler-menu-2' />}
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mb: 4 }}
            >
              Browse Categories
            </Button>
          )}

          {data.length === 0 ? (
            <EmptyStatePlaceholder
              icon='tabler-folder-off'
              title="You're All Set Up!"
              message="You haven't created any categories yet. Click 'Add New Category' to begin."
            />
          ) : selectedCategory ? (
            isEditing ? (
              <EditCategoryForm
                category={selectedCategory}
                onSave={handleUpdateCategory}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <CategoryDetails
                category={selectedCategory}
                onEdit={() => setIsEditing(true)}
                onDelete={() => setDeleteDialogOpen(true)}
              />
            )
          ) : (
            <EmptyStatePlaceholder
              icon='tabler-category'
              title='Select a Category'
              message='Choose a category from the list to see its details and manage it.'
            />
          )}
        </Box>
      </Card>

      <AddCategoryDrawer
        open={addDrawerOpen}
        handleClose={() => setAddDrawerOpen(false)}
        categoryData={data}
        setData={setData}
      />
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

const EmptyStatePlaceholder = ({ icon, title, message }: { icon: string; title: string; message: string }) => (
  <Box className='flex flex-col items-center justify-center h-full text-center'>
    <i className={`${icon} text-6xl text-textSecondary mbe-4`} />
    <Typography variant='h5'>{title}</Typography>
    <Typography color='text.secondary'>{message}</Typography>
  </Box>
)

const CategoryDetails = ({
  category,
  onEdit,
  onDelete
}: {
  category: Category
  onEdit: () => void
  onDelete: () => void
}) => {
  const categoryStatusObj: Record<string, ThemeColor> = { active: 'success', pending: 'warning', inactive: 'secondary' }

  
return (
    <div>
      <Box className='flex justify-between items-start gap-4 mb-6'>
        <div>
          <Typography variant='h4' className='mb-2'>
            {category.name}
          </Typography>
          <Chip
            label={category.status}
            color={categoryStatusObj[category.status]}
            size='small'
            className='capitalize'
          />
        </div>
        <Box>
          <IconButton onClick={onEdit}>
            <i className='tabler-edit' />
          </IconButton>
          <IconButton onClick={onDelete} color='error'>
            <i className='tabler-trash' />
          </IconButton>
        </Box>
      </Box>
      <Divider sx={{ mb: 4 }} />
      <Typography variant='body1'>{category.description}</Typography>
    </div>
  )
}

const EditCategoryForm = ({
  category,
  onSave,
  onCancel
}: {
  category: Category
  onSave: (data: Category) => void
  onCancel: () => void
}) => {
  const [name, setName] = useState(category.name)
  const [description, setDescription] = useState(category.description)
  const [status, setStatus] = useState(category.status)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...category, name, description, status })
  }

  
return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <Typography variant='h5'>Editing: {category.name}</Typography>
      <CustomTextField fullWidth label='Category Name' value={name} onChange={e => setName(e.target.value)} />
      <CustomTextField
        fullWidth
        label='Description'
        multiline
        rows={4}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <CustomTextField select fullWidth label='Status' value={status} onChange={e => setStatus(e.target.value)}>
        <MenuItem value='active'>Active</MenuItem>
        <MenuItem value='inactive'>Inactive</MenuItem>
        <MenuItem value='pending'>Pending</MenuItem>
      </CustomTextField>
      <Box className='flex gap-4'>
        <Button type='submit' variant='contained'>
          Save Changes
        </Button>
        <Button type='button' variant='tonal' color='secondary' onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </form>
  )
}

export default CategoryManagementView
