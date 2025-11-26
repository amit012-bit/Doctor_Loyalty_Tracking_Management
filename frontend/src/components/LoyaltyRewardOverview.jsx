import { useState, useEffect } from 'react'
import './LoyaltyRewardOverview.css'
import { CheckCircle2, Clock, DollarSign, Users, TrendingUp, Award } from 'lucide-react'

function LoyaltyRewardOverview() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing user:', error)
      }
    }
  }, [])

  const statsCards = [
    {
      id: 'delivered',
      title: 'Delivered',
      value: '29',
      description: 'Successfully completed',
      icon: <CheckCircle2 size={28} />,
      color: '#14B8A6',
      bgGradient: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: '25',
      description: 'Currently being delivered',
      icon: <Clock size={28} />,
      color: '#3B82F6',
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    },
    {
      id: 'pending',
      title: 'Pending',
      value: '30',
      description: 'Awaiting assignment',
      icon: <TrendingUp size={28} />,
      color: '#FB923C',
      bgGradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)'
    },
    {
      id: 'cash-in-hand',
      title: 'Cash in Hand',
      value: '₹170,464',
      description: 'Total cash with executives',
      icon: <DollarSign size={28} />,
      color: '#06B6D4',
      bgGradient: 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)'
    }
  ]

  const loyaltyRewards = [
    {
      id: 1,
      doctor: 'Dr. Venkatesh Rao',
      executive: 'Rajesh Kumar',
      amount: '₹5,000',
      paymentMode: 'Cash',
      monthYear: 'December 2025',
      status: 'Pending',
      deliveryDate: '-'
    },
    {
      id: 2,
      doctor: 'Dr. Venkatesh Rao',
      executive: 'Rajesh Kumar',
      amount: '₹3,000',
      paymentMode: 'Cash',
      monthYear: '2025-11',
      status: 'Pending',
      deliveryDate: '-'
    },
    {
      id: 3,
      doctor: 'Dr. Anjali Hegde',
      executive: 'Ganesh Rao',
      amount: '₹8,000',
      paymentMode: 'Online Transfer',
      monthYear: 'December 2025',
      status: 'In Progress',
      deliveryDate: '-'
    },
    {
      id: 4,
      doctor: 'Dr. Deepa Singh',
      executive: 'Vikram Singh',
      amount: '₹5,000',
      paymentMode: 'Online Transfer',
      monthYear: 'December 2025',
      status: 'Pending',
      deliveryDate: '-'
    },
    {
      id: 5,
      doctor: 'Dr. Mahesh Patil',
      executive: 'Anjali Patel',
      amount: '₹6,000',
      paymentMode: 'Cash',
      monthYear: 'January 2026',
      status: 'In Progress',
      deliveryDate: '-'
    },
    {
      id: 6,
      doctor: 'Dr. Sanjay Patel',
      executive: 'Suresh Gowda',
      amount: '₹5,000',
      paymentMode: 'Cash',
      monthYear: 'January 2026',
      status: 'Completed',
      deliveryDate: '2026-01-15'
    }
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      'In Progress': { color: '#3B82F6', bgColor: '#DBEAFE', icon: <Clock size={14} /> },
      'Pending': { color: '#3B82F6', bgColor: '#DBEAFE', icon: <Clock size={14} /> },
      'Completed': { color: '#14B8A6', bgColor: '#DCFCE7', icon: <CheckCircle2 size={14} /> }
    }

    const config = statusConfig[status] || statusConfig['Pending']
    return (
      <span className="status-badge" style={{ color: config.color, backgroundColor: config.bgColor }}>
        <span className="status-icon">{config.icon}</span>
        {status}
      </span>
    )
  }

  const userName = user?.name || 'User'
  const firstName = userName.split(' ')[0]

  return (
    <div className="dashboard-container">
      {/* Header Greeting Banner */}
      <div className="greeting-banner">
        <div className="greeting-content">
          <h1 className="greeting-title">Hello {firstName}!</h1>
          <p className="greeting-subtitle">Welcome back to your loyalty reward management dashboard</p>
        </div>
        <div className="greeting-illustration">
          <Users size={80} opacity={0.3} />
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-cards-row">
        {statsCards.map((card) => (
          <div key={card.id} className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: card.bgGradient }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-title">{card.title}</h3>
              <p className="stat-value" style={{ color: card.color }}>{card.value}</p>
              <p className="stat-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Online Appointment Card */}
      <div className="appointment-card-full">
        <div className="card-header">
          <h2 className="card-title">Loyalty Reward Management</h2>
        </div>
        <div className="table-wrapper">
          <table className="loyalty-reward-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Executive</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Month/Year</th>
                <th>Status</th>
                <th>Delivery Date</th>
              </tr>
            </thead>
            <tbody>
              {loyaltyRewards.map((reward) => (
                <tr key={reward.id}>
                  <td>{reward.doctor}</td>
                  <td>{reward.executive}</td>
                  <td>{reward.amount}</td>
                  <td>{reward.paymentMode}</td>
                  <td>{reward.monthYear}</td>
                  <td>{getStatusBadge(reward.status)}</td>
                  <td>{reward.deliveryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LoyaltyRewardOverview
