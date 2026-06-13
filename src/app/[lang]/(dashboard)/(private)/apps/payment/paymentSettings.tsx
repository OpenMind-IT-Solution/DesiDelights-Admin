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
  TextField,
  CircularProgress,
  Divider,
  Chip,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Alert
} from '@mui/material'
import { toast } from 'react-toastify'

import { get, post } from '@/services/apiService'
import { paymentSettingEndpoints } from '@/services/endpoints/paymentSetting'

interface PaymentConfig {
  provider: string
  publishableKey: string | null
  hasSecretKey: boolean
  secretKeyMasked: string | null
  hasWebhookSecret: boolean
  webhookSecretMasked: string | null
  currency: string
  isEnabled: boolean
  isLiveMode: boolean
}

const defaultConfig: PaymentConfig = {
  provider: 'stripe',
  publishableKey: '',
  hasSecretKey: false,
  secretKeyMasked: null,
  hasWebhookSecret: false,
  webhookSecretMasked: null,
  currency: 'eur',
  isEnabled: false,
  isLiveMode: false
}

const PaymentSettings: React.FC = () => {
  const [config, setConfig] = useState<PaymentConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // New (cleartext) values — only set when admin types into the field
  const [newSecretKey, setNewSecretKey] = useState('')
  const [newWebhookSecret, setNewWebhookSecret] = useState('')
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await get(paymentSettingEndpoints.get)

      if (res?.data) setConfig(res.data)
    } catch {
      toast.error('Failed to load payment settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (config.publishableKey && !config.publishableKey.startsWith('pk_')) {
      toast.error('Publishable key must start with pk_')
      
return
    }

    if (newSecretKey && !newSecretKey.startsWith('sk_')) {
      toast.error('Secret key must start with sk_')
      
return
    }

    if (newWebhookSecret && !newWebhookSecret.startsWith('whsec_')) {
      toast.error('Webhook secret must start with whsec_')
      
return
    }

    try {
      setSaving(true)

      const payload: Record<string, any> = {
        restaurantId: [1],
        provider: 'stripe',
        publishableKey: config.publishableKey || '',
        currency: config.currency,
        isEnabled: config.isEnabled,
        isLiveMode: config.isLiveMode
      }

      // Only send secrets if admin typed new ones
      if (newSecretKey) payload.secretKey = newSecretKey
      if (newWebhookSecret) payload.webhookSecret = newWebhookSecret

      await post(paymentSettingEndpoints.save, payload)
      toast.success('Payment settings saved successfully')

      // Clear plaintext fields and refresh
      setNewSecretKey('')
      setNewWebhookSecret('')
      await fetchSettings()
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
        <Box display='flex' alignItems='center' gap={2} mb={1}>
          <Typography variant='h5'>Payment Gateway Settings</Typography>
          {config.isLiveMode ? (
            <Chip label='LIVE' color='error' size='small' />
          ) : (
            <Chip label='TEST MODE' color='warning' size='small' />
          )}
        </Box>
        <Typography variant='body2' color='text.secondary'>
          Configure your Stripe account credentials. The secret key is encrypted before storage and never exposed to
          customers.
        </Typography>
      </Grid>

      {/* Stripe Configuration Card */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Box display='flex' alignItems='center' justifyContent='space-between' mb={3}>
              <Box display='flex' alignItems='center' gap={2}>
                {/* Stripe wordmark */}
                <Box
                  sx={{
                    bgcolor: '#635BFF',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 14,
                    letterSpacing: 1
                  }}
                >
                  stripe
                </Box>
                <Typography variant='h6'>Stripe</Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.isEnabled}
                    onChange={e => setConfig(prev => ({ ...prev, isEnabled: e.target.checked }))}
                    color='primary'
                  />
                }
                label={config.isEnabled ? 'Enabled' : 'Disabled'}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Publishable Key */}
              <Grid item xs={12}>
                <TextField
                  label='Publishable Key'
                  fullWidth
                  placeholder='pk_test_... or pk_live_...'
                  value={config.publishableKey || ''}
                  onChange={e => setConfig(prev => ({ ...prev, publishableKey: e.target.value }))}
                  helperText='Safe to expose — used in the customer browser (starts with pk_)'
                  size='small'
                />
              </Grid>

              {/* Secret Key */}
              <Grid item xs={12}>
                <TextField
                  label='Secret Key'
                  fullWidth
                  type={showSecretKey ? 'text' : 'password'}
                  placeholder={config.hasSecretKey ? config.secretKeyMasked || 'sk_••••' : 'sk_test_... or sk_live_...'}
                  value={newSecretKey}
                  onChange={e => setNewSecretKey(e.target.value)}
                  helperText={
                    config.hasSecretKey
                      ? 'A secret key is already saved. Leave blank to keep the existing key.'
                      : 'Never shared with customers — encrypted before storage (starts with sk_)'
                  }
                  size='small'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowSecretKey(p => !p)} edge='end' size='small'>
                          <i className={showSecretKey ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Webhook Secret */}
              <Grid item xs={12}>
                <TextField
                  label='Webhook Secret'
                  fullWidth
                  type={showWebhookSecret ? 'text' : 'password'}
                  placeholder={
                    config.hasWebhookSecret ? config.webhookSecretMasked || 'whsec_••••' : 'whsec_...'
                  }
                  value={newWebhookSecret}
                  onChange={e => setNewWebhookSecret(e.target.value)}
                  helperText={
                    config.hasWebhookSecret
                      ? 'A webhook secret is already saved. Leave blank to keep the existing one.'
                      : 'Found in Stripe Dashboard → Webhooks → Your endpoint → Signing secret'
                  }
                  size='small'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowWebhookSecret(p => !p)} edge='end' size='small'>
                          <i className={showWebhookSecret ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Currency */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Currency'
                  fullWidth
                  value={config.currency}
                  onChange={e => setConfig(prev => ({ ...prev, currency: e.target.value.toLowerCase() }))}
                  helperText='3-letter ISO code (e.g. eur, usd, gbp)'
                  inputProps={{ maxLength: 3 }}
                  size='small'
                />
              </Grid>

              {/* Live/Test toggle */}
              <Grid item xs={12} sm={6} display='flex' alignItems='center'>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.isLiveMode}
                      onChange={e => setConfig(prev => ({ ...prev, isLiveMode: e.target.checked }))}
                      color='error'
                    />
                  }
                  label={
                    <Box>
                      <Typography variant='body2' fontWeight={600}>
                        Live Mode
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {config.isLiveMode ? 'Using live keys — real charges' : 'Using test keys — no real charges'}
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            </Grid>

            {config.isLiveMode && (
              <Alert severity='warning' sx={{ mt: 3 }}>
                Live mode is active. Real charges will be processed. Make sure you are using live Stripe keys.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Help Card */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ bgcolor: 'action.hover' }}>
          <CardContent>
            <Typography variant='subtitle1' fontWeight={600} mb={2}>
              Webhook Setup
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={1}>
              In your Stripe Dashboard, create a webhook endpoint pointing to:
            </Typography>
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                p: 1.5,
                fontFamily: 'monospace',
                fontSize: 12,
                wordBreak: 'break-all',
                mb: 2
              }}
            >
              {process.env.NEXT_PUBLIC_API_URL}/website/payment/webhook
            </Box>
            <Typography variant='body2' color='text.secondary' mb={1}>
              Subscribe to these events:
            </Typography>
            <Box component='ul' sx={{ pl: 2, mb: 0 }}>
              <Typography component='li' variant='caption' color='text.secondary'>
                payment_intent.succeeded
              </Typography>
              <Typography component='li' variant='caption' color='text.secondary'>
                payment_intent.payment_failed
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Action Buttons */}
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

export default PaymentSettings
