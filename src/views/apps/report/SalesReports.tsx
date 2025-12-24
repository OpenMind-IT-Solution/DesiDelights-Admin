import ReportList from './list/ReportList';
import StatCard from './list/StatCard';

const StatCardData = [
  {
    title: 'Total Sales',
    stats: 25000,
    icon: 'tabler-shopping-cart',
    color: 'primary'
  },
  {
    title: 'This Month Sales',
    stats: 1200,
    icon: 'tabler-receipt',
    color: 'success'
  },
  {
    title: 'Average Sales / Day',
    stats: 20.83,
    icon: 'tabler-currency-dollar',
    color: 'warning'
  },
  {
    title: 'Returning Sales',
    stats: 300,
    icon: 'tabler-users',
    color: 'error'
  }
]

const SalesReports = () => {
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
      <ReportList />
    </>
  )
}

export default SalesReports
