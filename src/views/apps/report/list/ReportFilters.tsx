'use client'

import { useState } from 'react'

import { Box, Button, Chip, Typography } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import type { DateRange } from '@/types/apps/reportTypes'

type ReportFiltersProps = {
  onApply: (range: DateRange) => void
  onExportCSV?: () => void
  onExportPDF?: () => void
  onPrint?: () => void
  loading?: boolean
}

const presets = [
  { label: 'Today', days: 0 },
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 }
]

const ReportFilters = ({ onApply, onExportCSV, onExportPDF, onPrint, loading }: ReportFiltersProps) => {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(thirtyDaysAgo)
  const [endDate, setEndDate] = useState(today)

  const handleApply = () => {
    onApply({ startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString() })
  }

  const handlePreset = (days: number) => {
    const end = new Date().toISOString().split('T')[0]

    const start = days > 0
      ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : end

    setStartDate(start)
    setEndDate(end)
    onApply({ startDate: new Date(start).toISOString(), endDate: new Date(end).toISOString() })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
        <Typography
          variant='caption'
          sx={{ fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary', mr: 0.5 }}
        >
          Quick:
        </Typography>
        {presets.map(p => (
          <Chip
            key={p.label}
            label={p.label}
            size='small'
            variant='outlined'
            onClick={() => handlePreset(p.days)}
            sx={{ fontWeight: 500, borderRadius: 2 }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 2 }}>
        <CustomTextField
          label='Start Date'
          type='date'
          size='small'
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
        <CustomTextField
          label='End Date'
          type='date'
          size='small'
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
        <Button
          variant='contained'
          onClick={handleApply}
          disabled={loading}
          startIcon={<i className='tabler-filter' />}
          sx={{ height: 40 }}
        >
          {loading ? 'Loading...' : 'Apply'}
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
    </Box>
  )
}

export default ReportFilters
