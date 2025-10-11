'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import { CircularProgress } from '@mui/material'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'

import CustomTextField from '@core/components/mui/TextField'

import { post } from '@/services/apiService'
import { categoriesEndpoints } from '@/services/endpoints/category'
import type { Category } from '@/types/apps/categoryTypes'

type FilterType = {
  status: 'All' | 'active' | 'inactive'
  categoryId: string | null
}

type Props = {
  filters: FilterType
  setFilters: (filters: FilterType) => void
  onClose: () => void
}

const TableFilters = ({ filters, setFilters, onClose }: Props) => {
  const [localFilters, setLocalFilters] = useState<FilterType>({ ...filters })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const result: any = await post(categoriesEndpoints.getCategories, {
          status: [true],
          page: 1,
          limit: 100
        })

        if (result.status === 'success' && result.data.categories) {
          setCategories(result.data.categories)
        }
      } catch (error) {
        console.error('Failed to fetch categories', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleLocalFilterChange = (field: keyof FilterType, value: any) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApply = () => {
    setFilters(localFilters)
    onClose() 
  }

  const handleReset = () => {
    const defaultFilters: FilterType = {
      status: 'All',
      categoryId: null
    }

    setLocalFilters(defaultFilters)
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      <CardContent>
        <Grid container spacing={4} direction='column'>
          <Grid size={{ xs: 12 }}>
            <CustomTextField
              select
              fullWidth
              label='Select Status'
              id='select-status'
              value={localFilters.status}
              onChange={e => handleLocalFilterChange('status', e.target.value)}
            >
              <MenuItem value='All'>All</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='inactive'>Inactive</MenuItem>
            </CustomTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomTextField
              select
              fullWidth
              label='Select Category'
              id='select-category'
              value={localFilters.categoryId || ''}
              onChange={e => handleLocalFilterChange('categoryId', e.target.value || null)}
            >
              <MenuItem value=''>All Categories</MenuItem>
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </CustomTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'space-between', gap: 5, mt: 2 }}>
              <Button variant='contained' onClick={handleApply} fullWidth>
                Apply
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleReset} fullWidth>
                Reset
              </Button>
              <Button variant='outlined' color='secondary' onClick={onClose} fullWidth>
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </div>
  )
}

export default TableFilters
