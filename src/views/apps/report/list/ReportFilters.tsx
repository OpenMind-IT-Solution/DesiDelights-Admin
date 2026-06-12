'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import CustomTextField from '@core/components/mui/TextField'
import type { DateRange } from '@/types/apps/reportTypes'

type ReportFiltersProps = {
  onApply: (range: DateRange) => void
  onExportCSV?: () => void
  onExportPDF?: () => void
  onPrint?: () => void
  loading?: boolean
}

const ReportFilters = ({ onApply, onExportCSV, onExportPDF, onPrint, loading }: ReportFiltersProps) => {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(thirtyDaysAgo)
  const [endDate, setEndDate] = useState(today)

  const handleApply = () => {
    onApply({ startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString() })
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3, mb: 4 }}>
      <Grid container spacing={2} sx={{ flex: 1 }} size={{ xs: 12 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <CustomTextField
            fullWidth
            label='Start Date'
            type='date'
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <CustomTextField
            fullWidth
            label='End Date'
            type='date'
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Button variant='contained' onClick={handleApply} disabled={loading} sx={{ height: '100%', minWidth: 100 }}>
            {loading ? 'Loading...' : 'Apply'}
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {onExportCSV && (
          <Button variant='tonal' startIcon={<i className='tabler-file-spreadsheet' />} onClick={onExportCSV} size='small'>
            CSV
          </Button>
        )}
        {onExportPDF && (
          <Button variant='tonal' startIcon={<i className='tabler-file-type-pdf' />} onClick={onExportPDF} size='small'>
            PDF
          </Button>
        )}
        {onPrint && (
          <Button variant='tonal' startIcon={<i className='tabler-printer' />} onClick={onPrint} size='small'>
            Print
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default ReportFilters
