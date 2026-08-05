'use client'

// React Imports
import type { ReactNode } from 'react'

// MUI X Date Picker Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const MuiDatePickerProvider = ({ children }: { children: ReactNode }) => {
  return <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
}

export default MuiDatePickerProvider
