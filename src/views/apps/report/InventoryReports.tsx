import StatCard from './list/StatCard'

const StatCardData = [
  {
    title: 'Inventory Items',
    stats: 2500,
    icon: 'tabler-shopping-cart',
    color: 'primary'
  },
  {
    title: 'Low Stock items',
    stats: 20,
    icon: 'tabler-box',
    color: 'error'
  },
  {
    title: 'Average Purchase Items',
    stats: 50,
    icon: 'tabler-clipboard-list',
    color: 'warning'
  },
  {
    title: 'Amount for Inventory',
    stats: 336,
    icon: 'tabler-currency-euro',
    color: 'info'
  }
]

const InventoryReports = () => {
  return (
    <>
      <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
        {StatCardData.map((card, index) => (
          <StatCard
            className='w-full md:w-1/4'
            key={index}
            title={card.title}
            value={card.stats}
            color={card.color as 'primary' | 'success' | 'warning' | 'error'}
            icon={card.icon}
            isSelected={false}
            onClick={() => { }}
          />
        ))}
      </div>
    </>
  )
}

export default InventoryReports
