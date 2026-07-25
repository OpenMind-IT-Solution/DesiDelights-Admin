'use client'

import { Component, type ReactNode } from 'react'

import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'

import type { Props } from 'react-apexcharts'

import ReactApexcharts from '@/libs/ApexCharts'

type ApexChartWrapperProps = Props & {
  boxProps?: BoxProps
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ChartErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <Box sx={{ textAlign: 'center' }}>
              <i className='tabler-alert-triangle text-[2rem]' style={{ color: 'var(--mui-palette-warning-main)' }} />
              <p style={{ color: 'var(--mui-palette-text-secondary)', marginTop: 8, fontSize: '0.85rem' }}>Chart could not be rendered</p>
            </Box>
          </Box>
        )
      )
    }

    return this.props.children
  }
}

const ApexChartWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  '& .apexcharts-canvas': {
    "& line[stroke='transparent']": {
      display: 'none'
    },
    '& .apexcharts-tooltip': {
      boxShadow: 'var(--mui-customShadows-xs)',
      borderColor: 'var(--mui-palette-divider)',
      background: 'var(--mui-palette-background-paper)',
      ...(theme.direction === 'rtl' && {
        '.apexcharts-tooltip-marker': {
          marginInlineEnd: 10,
          marginInlineStart: 0
        },
        '.apexcharts-tooltip-text-y-value': {
          marginInlineStart: 5,
          marginInlineEnd: 0
        }
      }),
      '& .apexcharts-tooltip-title': {
        fontWeight: 600,
        borderColor: 'var(--mui-palette-divider)',
        background: 'var(--mui-palette-background-paper)'
      },
      '&.apexcharts-theme-light': {
        color: 'var(--mui-palette-text-primary)'
      },
      '&.apexcharts-theme-dark': {
        color: 'var(--mui-palette-common-white)'
      },
      '& .apexcharts-tooltip-series-group:first-of-type': {
        paddingBottom: 0
      },
      '& .bar-chart': {
        padding: theme.spacing(2, 2.5)
      }
    },
    '& .apexcharts-xaxistooltip': {
      borderColor: 'var(--mui-palette-divider)',
      background: 'var(--mui-palette-grey-50)',
      ...theme.applyStyles('dark', {
        background: 'var(--mui-palette-customColors-bodyBg)'
      }),
      '&:after': {
        borderBottomColor: 'var(--mui-palette-grey-50)',
        ...theme.applyStyles('dark', {
          borderBottomColor: 'var(--mui-palette-customColors-bodyBg)'
        })
      },
      '&:before': {
        borderBottomColor: 'var(--mui-palette-divider)'
      }
    },
    '& .apexcharts-yaxistooltip': {
      borderColor: 'var(--mui-palette-divider)',
      background: 'var(--mui-palette-grey-50)',
      ...theme.applyStyles('dark', {
        background: 'var(--mui-palette-customColors-bodyBg)'
      }),
      '&:after': {
        borderLeftColor: 'var(--mui-palette-grey-50)',
        ...theme.applyStyles('dark', {
          borderLeftColor: 'var(--mui-palette-customColors-bodyBg)'
        })
      },
      '&:before': {
        borderLeftColor: 'var(--mui-palette-divider)'
      }
    },
    '& .apexcharts-xaxistooltip-text, & .apexcharts-yaxistooltip-text': {
      color: 'var(--mui-palette-text-primary)'
    },
    '& .apexcharts-yaxis .apexcharts-yaxis-texts-g .apexcharts-yaxis-label': {
      textAnchor: theme.direction === 'rtl' ? 'start' : undefined
    },
    '& .apexcharts-text, & .apexcharts-tooltip-text, & .apexcharts-datalabel-label, & .apexcharts-datalabel, & .apexcharts-xaxistooltip-text, & .apexcharts-yaxistooltip-text, & .apexcharts-legend-text':
      {
        fontFamily: `${theme.typography.fontFamily} !important`
      },
    '& .apexcharts-pie-label': {
      filter: 'none'
    },
    '& .apexcharts-marker': {
      boxShadow: 'none'
    }
  }
})) as typeof Box

const AppReactApexCharts = (props: ApexChartWrapperProps) => {
  const { boxProps, ...rest } = props

  return (
    <ChartErrorBoundary>
      <ApexChartWrapper {...boxProps}>
        <ReactApexcharts {...rest} />
      </ApexChartWrapper>
    </ChartErrorBoundary>
  )
}

export default AppReactApexCharts
