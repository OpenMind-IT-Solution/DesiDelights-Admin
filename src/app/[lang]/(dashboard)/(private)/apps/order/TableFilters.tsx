'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

type Props = {
  showDeleted: boolean
  setShowDeleted: (v: boolean) => void
  onClose: () => void
}

const TableFilters = ({ showDeleted, setShowDeleted, onClose }: Props) => {
  const [localShowDeleted, setLocalShowDeleted] = useState(showDeleted)

  useEffect(() => {
    setLocalShowDeleted(showDeleted)
  }, [showDeleted])

  return (
    <div onClick={e => e.stopPropagation()}>
      <CardContent>
        <FormControlLabel
          control={<Switch checked={localShowDeleted} onChange={e => setLocalShowDeleted(e.target.checked)} />}
          label='Show deleted orders'
        />
        <Box sx={{ display: 'flex', gap: 5, mt: 2 }}>
          <Button variant='contained' onClick={() => { setShowDeleted(localShowDeleted); onClose() }} fullWidth>
            Apply
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => { setLocalShowDeleted(false); setShowDeleted(false); onClose() }} fullWidth>
            Reset
          </Button>
          <Button variant='outlined' color='secondary' onClick={onClose} fullWidth>
            Cancel
          </Button>
        </Box>
      </CardContent>
    </div>
  )
}

export default TableFilters
