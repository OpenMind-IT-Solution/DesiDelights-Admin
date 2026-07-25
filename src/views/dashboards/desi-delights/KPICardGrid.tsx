'use client'

import { useMemo } from 'react'

import Grid from '@mui/material/Grid2'

import KPICard from './KPICard'

interface KPICardGridProps {
  salesSummary: any
  prevSalesSummary: any
  customerAnalytics: any
}

const KPICardGrid = ({ salesSummary, prevSalesSummary, customerAnalytics }: KPICardGridProps) => {
  const kpis = useMemo(() => {
    const totalSales = salesSummary?.totalRevenue ?? 0
    const totalOrders = salesSummary?.totalOrders ?? 0
    const totalTax = salesSummary?.totalTax ?? 0
    const totalCustomers = customerAnalytics?.totalCustomers ?? 0
    const netCollection = totalSales - totalTax

    const prevTotalSales = prevSalesSummary?.totalRevenue ?? 0
    const prevTotalOrders = prevSalesSummary?.totalOrders ?? 0
    const prevTotalTax = prevSalesSummary?.totalTax ?? 0
    const prevTotalCustomers = prevSalesSummary?.totalCustomers ?? 0
    const prevNetCollection = prevTotalSales - prevTotalTax

    const calcChange = (current: number, previous: number) =>
      previous > 0 ? ((current - previous) / previous) * 100 : undefined

    return [
      {
        title: 'Total Sales',
        value: totalSales,
        prefix: '€',
        icon: 'tabler-cash',
        color: 'primary',
        change: calcChange(totalSales, prevTotalSales)
      },
      {
        title: 'Net Collection',
        value: netCollection,
        prefix: '€',
        icon: 'tabler-wallet',
        color: 'success',
        change: calcChange(netCollection, prevNetCollection)
      },
      {
        title: 'VAT Collection',
        value: totalTax,
        prefix: '€',
        icon: 'tabler-receipt',
        color: 'warning',
        change: calcChange(totalTax, prevTotalTax)
      },
      {
        title: 'Total Orders',
        value: totalOrders,
        icon: 'tabler-shopping-cart',
        color: 'info',
        change: calcChange(totalOrders, prevTotalOrders)
      },
      {
        title: 'Total Customers',
        value: totalCustomers,
        icon: 'tabler-users',
        color: 'secondary',
        change: calcChange(totalCustomers, prevTotalCustomers)
      }
    ]
  }, [salesSummary, prevSalesSummary, customerAnalytics])

  return (
    <Grid container spacing={4}>
      {kpis.map((kpi) => (
        <Grid key={kpi.title} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <KPICard
            title={kpi.title}
            value={kpi.value}
            prefix={kpi.prefix}
            icon={kpi.icon}
            color={kpi.color}
            change={kpi.change}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default KPICardGrid
