
import React from 'react'

import Image from 'next/image'

import { Card, CardContent, Typography, Grid, Switch, Button, Box } from '@mui/material'

import { CashMultiple } from 'mdi-material-ui'

const PaymentSettings: React.FC = () => {
  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Typography variant='h5'>Payment Method Settings</Typography>
          <Typography variant='body2'>
            Select which payment gateways you want to activate for your customers.
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Image src='/images/logos/stripe.png' alt='Stripe Logo' width={24} height={24} />
                  <Typography variant='h6' sx={{ ml: 3 }}>
                    Stripe
                  </Typography>
                </Box>
                <Switch defaultChecked={true} />
              </Box>
              <Typography variant='body2' sx={{ mt: 2, ml: '48px' }}>
                Accept all major credit and debit cards globally.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Image src='/images/logos/paypal.png' alt='PayPal Logo' width={24} height={24} />
                  <Typography variant='h6' sx={{ ml: 3 }}>
                    PayPal
                  </Typography>
                </Box>
                <Switch defaultChecked={true} />
              </Box>
              <Typography variant='body2' sx={{ mt: 2, ml: '48px' }}>
                Enable fast and secure payments with PayPal.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Image src='/images/logos/razorpay.png' alt='Razorpay Logo' width={24} height={24} />
                  <Typography variant='h6' sx={{ ml: 3 }}>
                    Razorpay
                  </Typography>
                </Box>
                <Switch defaultChecked={false} />
              </Box>
              <Typography variant='body2' sx={{ mt: 2, ml: '48px' }}>
                Ideal for processing payments within India.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CashMultiple sx={{ color: 'text.secondary' }} />
                  <Typography variant='h6' sx={{ ml: 3 }}>
                    Cash on Delivery
                  </Typography>
                </Box>
                <Switch defaultChecked={true} />
              </Box>
              <Typography variant='body2' sx={{ mt: 2, ml: '48px' }}>
                Allow customers to pay in cash upon delivery.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ mt: 6 }}>
        <Button variant='contained' sx={{ mr: 3 }}>
          Save Changes
        </Button>
        <Button variant='outlined' color='secondary'>
          Reset
        </Button>
      </Grid>
    </>
  )
}

export default PaymentSettings
