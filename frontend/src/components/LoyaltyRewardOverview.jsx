import { useState } from 'react'
import './LoyaltyRewardOverview.css'

function LoyaltyRewardOverview() {
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const cards = [
    {
      id: 'delivered',
      title: 'Delivered',
      value: '29',
      description: 'Successfully completed',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      valueColor: '#22c55e'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: '25',
      description: 'Currently being delivered',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2"/>
          <path d="M12 8V12L15 15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      valueColor: '#3b82f6'
    },
    {
      id: 'pending',
      title: 'Pending',
      value: '30',
      description: 'Awaiting assignment',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2"/>
          <path d="M12 6V12L16 14" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      valueColor: '#1f2937'
    },
    {
      id: 'cash-in-hand',
      title: 'Cash in Hand',
      value: '₹170,464',
      description: 'Total cash with executives',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      valueColor: '#1f2937'
    }
  ]

  const tableData = [
    {
      id: 1,
      doctor: 'Dr. Anjali Hegde',
      executive: 'Ganesh Rao',
      amount: '₹8,000',
      paymentMode: 'Online Transfer',
      monthYear: 'December 2025',
      status: 'In Progress',
      deliveryDate: '-'
    },
    {
      id: 2,
      doctor: 'Dr. Deepa Singh',
      executive: 'Vikram Singh',
      amount: '₹5,000',
      paymentMode: 'Online Transfer',
      monthYear: 'December 2025',
      status: 'Pending',
      deliveryDate: '-'
    },
    {
      id: 3,
      doctor: 'Dr. Mahesh Patil',
      executive: 'Anjali Patel',
      amount: '₹6,000',
      paymentMode: 'Cash',
      monthYear: 'January 2026',
      status: 'In Progress',
      deliveryDate: '-'
    },
    {
      id: 4,
      doctor: 'Dr. Sanjay Patel',
      executive: 'Suresh Gowda',
      amount: '₹5,000',
      paymentMode: 'Cash',
      monthYear: 'January 2026',
      status: 'Completed',
      deliveryDate: '-'
    }
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      'In Progress': { color: '#3b82f6', bgColor: '#dbeafe', icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )},
      'Pending': { color: '#3b82f6', bgColor: '#dbeafe', icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 3.5V7L9.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )},
      'Completed': { color: '#22c55e', bgColor: '#dcfce7', icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 3.5L5.5 9.5L2.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    }

    const config = statusConfig[status] || statusConfig['Pending']
    return (
      <span className="status-badge" style={{ color: config.color, backgroundColor: config.bgColor }}>
        <span className="status-icon">{config.icon}</span>
        {status}
      </span>
    )
  }

  return (
    <div className="loyalty-overview">
      <h1 className="loyalty-overview-title">Loyalty Reward Overview</h1>
      <div className="loyalty-cards">
        {cards.map((card) => (
          <div key={card.id} className="loyalty-card">
            <div className="loyalty-card-icon">{card.icon}</div>
            <div className="loyalty-card-content">
              <h3 className="loyalty-card-title">{card.title}</h3>
              <p className="loyalty-card-value" style={{ color: card.valueColor }}>
                {card.value}
              </p>
              <p className="loyalty-card-description">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="loyalty-management-section">
        <div className="loyalty-management-header">
          <h2 className="loyalty-management-title">Loyalty Reward Management</h2>
          <button className="create-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create Loyalty Reward
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-container">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="search-icon">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by doctor or executive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              className="filter-select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
            <button className="export-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V11M8 11L5 8M8 11L11 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="loyalty-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Executive</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Month/Year</th>
                <th>Status</th>
                <th>Delivery Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id}>
                  <td>{row.doctor}</td>
                  <td>{row.executive}</td>
                  <td>{row.amount}</td>
                  <td>{row.paymentMode}</td>
                  <td>{row.monthYear}</td>
                  <td>{getStatusBadge(row.status)}</td>
                  <td>{row.deliveryDate}</td>
                  <td>
                    <button className="action-button">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.5 2.5L13.5 4.5M12.5 1.5L14.5 3.5L9 9H7V7L12.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </td>
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

