// Data Imports
import { getOrderData } from '@/app/server/actions'
import OrderListTable from './OrderListTable'

const OrderListApp = async () => {
  // Vars
  const orderData = await getOrderData()

  return <OrderListTable tableData={orderData} />
}

export default OrderListApp
