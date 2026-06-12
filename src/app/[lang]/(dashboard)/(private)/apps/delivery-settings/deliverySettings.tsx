'use client'

import React, { useEffect, useState } from 'react'

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  Button,
  Box,
  CircularProgress,
  FormControlLabel,
  Alert
} from '@mui/material'
import { toast } from 'react-toastify'

import { get, post } from '@/services/apiService'
import { restaurantEndpoints } from '@/services/endpoints/restaurant'

const RESTAURANT_ID = 1

const DeliverySettings: React.FC = () => {
  const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await get(restaurantEndpoints.getDeliverySetting(RESTAURANT_ID))
      if (res?.data && typeof res.data.isDeliveryEnabled === 'boolean') {
        setIsDeliveryEnabled(res.data.isDeliveryEnabled)
      }
    } catch {
      toast.error('Failed to load delivery settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await post(restaurantEndpoints.saveDeliverySetting(RESTAURANT_ID), { isDeliveryEnabled })
      toast.success('Delivery setting saved successfully')
    } catch {
      // toast already shown by apiService
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5' mb={1}>
          Delivery Settings
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Control whether customers can choose delivery at checkout. When disabled, only takeout orders are accepted.
        </Typography>
      </Grid>

      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Box display='flex' alignItems='center' justifyContent='space-between' mb={3}>
              <Box>
                <Typography variant='h6'>Delivery Orders</Typography>
                <Typography variant='body2' color='text.secondary' mt={0.5}>
                  Allow customers to place delivery orders on the website
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDeliveryEnabled}
                    onChange={e => setIsDeliveryEnabled(e.target.checked)}
                    color='primary'
                  />
                }
                label={isDeliveryEnabled ? 'Enabled' : 'Disabled'}
              />
            </Box>

            {!isDeliveryEnabled && (
              <Alert severity='warning'>
                Delivery is currently <strong>disabled</strong>. Customers can only place takeout orders at checkout.
                New delivery orders will be rejected.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card sx={{ bgcolor: 'action.hover' }}>
          <CardContent>
            <Typography variant='subtitle1' fontWeight={600} mb={1}>
              How it works
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              When delivery is disabled, the delivery option is hidden at checkout and customers can only select
              takeout. Any attempt to place a delivery order via the API is also rejected.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Button variant='contained' onClick={handleSave} disabled={saving} sx={{ mr: 3 }}>
          {saving ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}
          Save Changes
        </Button>
        <Button variant='outlined' color='secondary' onClick={fetchSettings} disabled={saving}>
          Reset
        </Button>
      </Grid>
    </Grid>
  )
}

export default DeliverySettings
