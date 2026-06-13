export type PermissionRowType = {
  id: number
  name: string
  assignedTo: string[]
  createdDate: string
}

export const db: PermissionRowType[] = [
  {
    id: 1,
    name: 'User Management',
    assignedTo: ['Admin', 'Manager'],
    createdDate: '2024-01-01'
  },
  {
    id: 2,
    name: 'Order Management',
    assignedTo: ['Admin', 'Manager', 'Staff'],
    createdDate: '2024-01-01'
  },
  {
    id: 3,
    name: 'Menu Management',
    assignedTo: ['Admin', 'Manager'],
    createdDate: '2024-01-01'
  },
  {
    id: 4,
    name: 'Report Access',
    assignedTo: ['Admin'],
    createdDate: '2024-01-01'
  },
  {
    id: 5,
    name: 'Settings',
    assignedTo: ['Admin'],
    createdDate: '2024-01-01'
  }
]
