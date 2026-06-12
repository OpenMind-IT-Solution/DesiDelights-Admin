// Type Imports
import type { OrderType } from '@/types/apps/orderTypes'

export const db: OrderType[] = [
{
    id: 1,
    status: 'pending',
    totalAmount: 250.0,
    paymentStatus: 'unpaid',
    orderType: 'delivery',
    deliveryAddress: '123 Main Street, Springfield',
    items: [
      { name: 'Pizza Margherita', quantity: 2, price: 120 },
      { name: 'Coke 500ml', quantity: 1, price: 30 }
    ]
  },
  {
    id: 2,
    status: 'completed',
    totalAmount: 480.5,
    paymentStatus: 'paid',
    orderType: 'pickup',
    deliveryAddress: '45 Park Avenue, New York',
    items: [
      { name: 'Veg Burger', quantity: 3, price: 90 },
      { name: 'French Fries', quantity: 2, price: 60 },
      { name: 'Iced Tea', quantity: 1, price: 50.5 }
    ]
  },
  {
    id: 3,
    status: 'cancelled',
    totalAmount: 0,
    paymentStatus: 'refunded',
    orderType: 'delivery',
    deliveryAddress: '77 Ocean Drive, Miami',
    items: []
  },
  {
    id: 4,
    status: 'pending',
    totalAmount: 325.75,
    paymentStatus: 'unpaid',
    orderType: 'delivery',
    deliveryAddress: '221B Baker Street, London',
    items: [
      { name: 'Chicken Wrap', quantity: 2, price: 150 },
      { name: 'Mineral Water', quantity: 1, price: 25.75 }
    ]
  },
  {
    id: 5,
    status: 'completed',
    totalAmount: 150.0,
    paymentStatus: 'paid',
    orderType: 'pickup',
    deliveryAddress: '1600 Pennsylvania Ave NW, Washington, DC',
    items: [
      { name: 'Pasta Alfredo', quantity: 1, price: 150 }
    ]
  }
]
