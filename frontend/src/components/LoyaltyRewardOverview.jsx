import { useState } from 'react'
import './LoyaltyRewardOverview.css'
import { CheckCircle2, Clock, DollarSign, Plus, Search, Download, Edit } from 'lucide-react'

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
      icon: <CheckCircle2 size={24} color="#22c55e" />,
      valueColor: '#22c55e'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: '25',
      description: 'Currently being delivered',
      icon: <Clock size={24} color="#3b82f6" />,
      valueColor: '#3b82f6'
    },
    {
      id: 'pending',
      title: 'Pending',
      value: '30',
      description: 'Awaiting assignment',
      icon: <Clock size={24} color="#6b7280" />,
      valueColor: '#1f2937'
    },
    {
      id: 'cash-in-hand',
      title: 'Cash in Hand',
      value: '₹170,464',
      description: 'Total cash with executives',
      icon: <DollarSign size={24} color="#3b82f6" />,
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
      'In Progress': { color: '#3b82f6', bgColor: '#dbeafe', icon: <Clock size={14} /> },
      'Pending': { color: '#3b82f6', bgColor: '#dbeafe', icon: <Clock size={14} /> },
      'Completed': { color: '#22c55e', bgColor: '#dcfce7', icon: <CheckCircle2 size={14} /> }
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
            <Plus size={16} />
            Create Loyalty Reward
          </button>
        </div>

        <div className="filter-bar">
          <div className="search-container">
            <Search size={16} className="search-icon" />
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
              <Download size={16} />
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
                      <Edit size={16} />
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

