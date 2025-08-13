// Type Imports
import { OrderType } from '@/types/apps/orderTypes'

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
  },
  {
    id: 6,
    status: 'pending',
    totalAmount: 210.0,
    paymentStatus: 'unpaid',
    orderType: 'delivery',
    deliveryAddress: '12 King Street, Toronto',
    items: [
      { name: 'Caesar Salad', quantity: 2, price: 70 },
      { name: 'Orange Juice', quantity: 2, price: 35 }
    ]
  },
  {
    id: 7,
    status: 'completed',
    totalAmount: 95.5,
    paymentStatus: 'paid',
    orderType: 'pickup',
    deliveryAddress: '5 Oxford Road, Manchester',
    items: [
      { name: 'Grilled Cheese Sandwich', quantity: 2, price: 40 },
      { name: 'Lemonade', quantity: 1, price: 15.5 }
    ]
  },
  {
    id: 8,
    status: 'pending',
    totalAmount: 420.0,
    paymentStatus: 'unpaid',
    orderType: 'delivery',
    deliveryAddress: '88 Market Street, San Francisco',
    items: [
      { name: 'BBQ Ribs', quantity: 2, price: 180 },
      { name: 'Coleslaw', quantity: 2, price: 30 }
    ]
  },
  {
    id: 9,
    status: 'cancelled',
    totalAmount: 0,
    paymentStatus: 'refunded',
    orderType: 'pickup',
    deliveryAddress: '14 Queen Street, Sydney',
    items: []
  },
  {
    id: 10,
    status: 'completed',
    totalAmount: 280.75,
    paymentStatus: 'paid',
    orderType: 'delivery',
    deliveryAddress: '100 Palm Avenue, Los Angeles',
    items: [
      { name: 'Fish Tacos', quantity: 3, price: 85 },
      { name: 'Churros', quantity: 2, price: 37.75 }
    ]
  },
  {
    id: 11,
    status: 'pending',
    totalAmount: 360.0,
    paymentStatus: 'unpaid',
    orderType: 'pickup',
    deliveryAddress: '9 Broadway, New York',
    items: [
      { name: 'Cheeseburger', quantity: 4, price: 90 }
    ]
  },
  {
    id: 12,
    status: 'completed',
    totalAmount: 410.0,
    paymentStatus: 'paid',
    orderType: 'delivery',
    deliveryAddress: '76 Harbor Lane, Boston',
    items: [
      { name: 'Lobster Roll', quantity: 2, price: 180 },
      { name: 'Iced Coffee', quantity: 2, price: 25 }
    ]
  },
  {
    id: 13,
    status: 'pending',
    totalAmount: 255.5,
    paymentStatus: 'unpaid',
    orderType: 'pickup',
    deliveryAddress: '21 Sunset Blvd, Los Angeles',
    items: [
      { name: 'Club Sandwich', quantity: 3, price: 75 },
      { name: 'Smoothie', quantity: 1, price: 30.5 }
    ]
  },
  {
    id: 14,
    status: 'completed',
    totalAmount: 190.0,
    paymentStatus: 'paid',
    orderType: 'delivery',
    deliveryAddress: '11 Orchard Road, Singapore',
    items: [
      { name: 'Pad Thai', quantity: 2, price: 95 }
    ]
  },
  {
    id: 15,
    status: 'cancelled',
    totalAmount: 0,
    paymentStatus: 'refunded',
    orderType: 'delivery',
    deliveryAddress: '500 Fifth Avenue, New York',
    items: []
  },
  {
    id: 16,
    status: 'pending',
    totalAmount: 310.25,
    paymentStatus: 'unpaid',
    orderType: 'pickup',
    deliveryAddress: '200 Lakeview Dr, Chicago',
    items: [
      { name: 'Pepperoni Pizza', quantity: 2, price: 140 },
      { name: 'Garlic Bread', quantity: 1, price: 30.25 }
    ]
  },
  {
    id: 17,
    status: 'completed',
    totalAmount: 150.5,
    paymentStatus: 'paid',
    orderType: 'delivery',
    deliveryAddress: '66 Elm Street, Boston',
    items: [
      { name: 'Pancakes', quantity: 3, price: 40 },
      { name: 'Maple Syrup', quantity: 1, price: 30.5 }
    ]
  },
  {
    id: 18,
    status: 'pending',
    totalAmount: 220.0,
    paymentStatus: 'unpaid',
    orderType: 'pickup',
    deliveryAddress: '12 Park Lane, London',
    items: [
      { name: 'Butter Chicken', quantity: 2, price: 110 }
    ]
  },
  {
    id: 19,
    status: 'completed',
    totalAmount: 400.0,
    paymentStatus: 'paid',
    orderType: 'delivery',
    deliveryAddress: '34 Beach Road, Miami',
    items: [
      { name: 'Grilled Salmon', quantity: 2, price: 200 }
    ]
  },
  {
    id: 20,
    status: 'cancelled',
    totalAmount: 0,
    paymentStatus: 'refunded',
    orderType: 'pickup',
    deliveryAddress: '8 Hill Street, Dublin',
    items: []
  },
  {
    id: 21,
    status: 'pending',
    totalAmount: 330.75,
    paymentStatus: 'unpaid',
    orderType: 'delivery',
    deliveryAddress: '18 Rose Street, Edinburgh',
    items: [
      { name: 'Lasagna', quantity: 2, price: 150 },
      { name: 'Garlic Knots', quantity: 1, price: 30.75 }
    ]
  },
  {
    id: 22,
    status: 'completed',
    totalAmount: 270.0,
    paymentStatus: 'paid',
    orderType: 'pickup',
    deliveryAddress: '7 Pine Avenue, Cape Town',
    items: [
      { name: 'Steak', quantity: 2, price: 135 }
    ]
  },
  {
    id: 23,
    status: 'pending',
    totalAmount: 145.0,
    paymentStatus: 'unpaid',
    orderType: 'delivery',
    deliveryAddress: '3 Sunset Street, San Diego',
    items: [
      { name: 'Sushi Roll', quantity: 5, price: 29 }
    ]
  },
  {
    id: 24,
    status: 'completed',
    totalAmount: 198.0,
    paymentStatus: 'paid',
    orderType: 'pickup',
    deliveryAddress: '44 High Street, Auckland',
    items: [
      { name: 'Ramen', quantity: 3, price: 66 }
    ]
  },
  {
    id: 25,
    status: 'cancelled',
    totalAmount: 0,
    paymentStatus: 'refunded',
    orderType: 'delivery',
    deliveryAddress: '19 Central Park West, New York',
    items: []
  }
]
