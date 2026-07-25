'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Avatar from '@mui/material/Avatar'
import { alpha } from '@mui/material/styles'

import EmptyState from './EmptyState'

interface TopCustomersTableProps {
  customerAnalytics: any
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const COLORS = ['#7367F0', '#00CFE8', '#56CAFB', '#FFB547', '#FF4C51', '#56CAFB']

const TopCustomersTable = ({ customerAnalytics }: TopCustomersTableProps) => {
  const topCustomers = customerAnalytics?.topCustomers || []

  if (topCustomers.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title='Top Customers' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-users text-xl' />} />
        <CardContent>
          <EmptyState icon='tabler-users' title='No Customers Yet' description='Top customers will appear here once they start ordering' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title='Top Customers' titleTypographyProps={{ variant: 'h5' }} avatar={<i className='tabler-users text-xl' />} />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {['Customer', 'Orders', 'Total Spent'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, color: 'text.disabled', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {topCustomers.slice(0, 8).map((customer: any, index: number) => (
              <TableRow
                key={customer.customerId || customer.id || index}
                hover
                sx={{ '&:last-child td': { border: 0 } }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        bgcolor: alpha(COLORS[index % COLORS.length], 0.15),
                        color: COLORS[index % COLORS.length]
                      }}
                    >
                      {getInitials(customer.name || 'U')}
                    </Avatar>
                    <Box>
                      <Typography variant='body2' fontWeight={600}>
                        {customer.name || 'Unknown'}
                      </Typography>
                      {customer.email && (
                        <Typography variant='caption' color='text.disabled'>
                          {customer.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' fontWeight={600}>
                    {customer.orderCount || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' fontWeight={700}>
                    €{Number(customer.totalSpent || 0).toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default TopCustomersTable
