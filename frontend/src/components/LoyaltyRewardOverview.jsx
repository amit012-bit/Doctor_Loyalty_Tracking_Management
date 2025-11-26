import { useState, useEffect } from 'react'
import './LoyaltyRewardOverview.css'
import { getTransactions, getTransactionStatistics } from '../services/Transaction'
import { getLocations } from '../services/Location'

function LoyaltyRewardOverview() {
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [transactionsRes, statsRes, locationsRes] = await Promise.all([
          getTransactions({ status: statusFilter || undefined }),
          getTransactionStatistics(),
          getLocations()
        ])

        if (transactionsRes.data.success) {
          setTransactions(transactionsRes.data.data.transactions || [])
        }

        if (statsRes.data.success) {
          setStatistics(statsRes.data.data.statistics)
        }

        if (locationsRes.data.success) {
          setLocations(locationsRes.data.data.locations || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.response?.data?.message || 'Failed to fetch data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [statusFilter])

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'IN progress': { color: '#3B82F6', bgColor: '#DBEAFE' },
      'pending': { color: '#FB923C', bgColor: '#FED7AA' },
      'completed': { color: '#14B8A6', bgColor: '#DCFCE7' },
      'started': { color: '#8B5CF6', bgColor: '#E9D5FF' }
    }

    const config = statusConfig[status?.toLowerCase()] || statusConfig['pending']
    return (
      <span className="status-badge" style={{ color: config.color, backgroundColor: config.bgColor }}>
        <span className="status-icon">
          {status?.toLowerCase() === 'completed' ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6667 3.5L5.25 9.91667L2.33334 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 3.5V7L9.33334 9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </span>
        {status || 'Pending'}
      </span>
    )
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery) return true
    
    const doctorName = transaction.doctorId?.name || ''
    const executiveName = transaction.executiveId?.name || ''
    const searchLower = searchQuery.toLowerCase()
    
    return doctorName.toLowerCase().includes(searchLower) || 
           executiveName.toLowerCase().includes(searchLower)
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const statsCards = statistics ? [
    {
      id: 'delivered',
      title: 'Delivered',
      value: statistics.delivered?.count?.toString() || '0',
      description: 'Successfully completed',
      color: '#14B8A6',
      bgGradient: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: statistics.inProgress?.count?.toString() || '0',
      description: 'Currently being delivered',
      color: '#3B82F6',
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    },
    {
      id: 'pending',
      title: 'Pending',
      value: statistics.pending?.count?.toString() || '0',
      description: 'Awaiting assignment',
      color: '#FB923C',
      bgGradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)'
    },
    {
      id: 'cash-in-hand',
      title: 'Cash in Hand',
      value: formatCurrency(statistics.cashInHand || 0),
      description: 'Total cash with executives',
      color: '#06B6D4',
      bgGradient: 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)'
    }
  ] : []

  const userName = user?.name || 'User'
  const firstName = userName.split(' ')[0]

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header Greeting Banner */}
      <div className="greeting-banner">
        <div className="greeting-content">
          <h1 className="greeting-title">Hello {firstName}!</h1>
          <p className="greeting-subtitle">Welcome back to your loyalty reward management dashboard</p>
        </div>
        <div className="greeting-illustration">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
            <circle cx="40" cy="28" r="12" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 68C16 56.9543 24.9543 48 36 48H44C55.0457 48 64 56.9543 64 68" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#FEE2E2', 
          color: '#991B1B', 
          borderRadius: '8px' 
        }}>
          {error}
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="stats-cards-row">
        {statsCards.map((card) => (
          <div key={card.id} className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: card.bgGradient }}>
              {card.id === 'delivered' && (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 14L11 18L21 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="14" cy="14" r="10" stroke="white" strokeWidth="2"/>
                </svg>
              )}
              {card.id === 'in-progress' && (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="10" stroke="white" strokeWidth="2"/>
                  <path d="M14 7V14L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              {card.id === 'pending' && (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 7V14L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="14" cy="14" r="10" stroke="white" strokeWidth="2"/>
                </svg>
              )}
              {card.id === 'cash-in-hand' && (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 7C17.866 7 21 10.134 21 14C21 17.866 17.866 21 14 21M7 14C7 10.134 10.134 7 14 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M14 7L18 11L14 14L10 11L14 7Z" fill="white"/>
                  <path d="M14 21L18 17L14 14L10 17L14 21Z" fill="white"/>
                </svg>
              )}
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
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-container" style={{ position: 'relative' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }}>
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search by doctor or executive..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to page 1 on search
                }}
                style={{
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '250px'
                }}
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1) // Reset to page 1 on filter change
              }}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="IN progress">In Progress</option>
              <option value="started">Started</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    {loading ? 'Loading...' : 'No transactions found'}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.doctorId?.name || 'N/A'}</td>
                    <td>{transaction.executiveId?.name || 'N/A'}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>{transaction.paymentMode}</td>
                    <td>{transaction.monthYear}</td>
                    <td>{getStatusBadge(transaction.status)}</td>
                    <td>{formatDate(transaction.deliveryDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredTransactions.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Previous
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="pagination-ellipsis">...</span>
                  }
                  return null
                })}
              </div>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoyaltyRewardOverview

