'use client'

import { TableBody, TableCell, TableHead, TableRow } from '@mui/material'

import { flexRender, type Table as TanstackTable } from '@tanstack/react-table'
import classnames from 'classnames'

import type { GroceryItem } from '@/types/apps/groceryTypes'

import tableStyles from '@core/styles/table.module.css'

type Props = {
  table: TanstackTable<GroceryItem>
}

const GroceryTable = ({ table }: Props) => {
  return (
    <>
      <TableHead>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableCell key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : (
                  <div
                    className={classnames({
                      'flex items-center': header.column.getIsSorted(),
                      'cursor-pointer select-none': header.column.getCanSort()
                    })}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <i className='tabler-chevron-up text-xl' />,
                      desc: <i className='tabler-chevron-down text-xl' />
                    }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                  </div>
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHead>
      {table.getFilteredRowModel().rows.length === 0 ? (
        <TableBody>
          <TableRow>
            <TableCell colSpan={table.getVisibleFlatColumns().length} className='text-center'>
              No data available
            </TableCell>
          </TableRow>
        </TableBody>
      ) : (
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id} className={classnames({ [tableStyles.selected]: row.getIsSelected() })}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      )}
    </>
  )
}

export default GroceryTable
