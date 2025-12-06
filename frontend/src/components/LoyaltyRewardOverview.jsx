import React, { useState, useEffect } from 'react'
import './LoyaltyRewardOverview.css'
import { getTransactions, getTransactionStatistics, assignExecutive, verifyOTP, resendOTP } from '../services/Transaction'
import { getLocations } from '../services/Location'
import { getUsers } from '../services/User'
import { getExecutives } from '../services/Executive'
import CreateTransactionModal from './CreateTransactionModal'
import { Plus, UserPlus, Eye, ChevronDown, ChevronUp, Shield, Clock, X } from 'lucide-react'

function LoyaltyRewardOverview() {
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [allTransactions, setAllTransactions] = useState([]) // All transactions for location stats
  const [statistics, setStatistics] = useState(null)
  const [locations, setLocations] = useState([])
  const [executives, setExecutives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedLocationId, setSelectedLocationId] = useState(null) // null = "All", locationId = specific location
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExecutiveTATModalOpen, setIsExecutiveTATModalOpen] = useState(false)
  const [selectedLocationForTAT, setSelectedLocationForTAT] = useState(null)
  const [assigningExecutive, setAssigningExecutive] = useState(null)
  const [selectedExecutive, setSelectedExecutive] = useState({})
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [otpValues, setOtpValues] = useState({})
  const [verifyingOtp, setVerifyingOtp] = useState(null)
  const [resendingOtp, setResendingOtp] = useState(null)
  const [otpErrors, setOtpErrors] = useState({})
  const [otpSuccess, setOtpSuccess] = useState({})
  const [canViewLocationStats, setCanViewLocationStats] = useState(false)
  const itemsPerPage = 5

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setCanViewLocationStats(['admin', 'superadmin', 'accountant'].includes(JSON.parse(storedUser).role))
      } catch (error) {
        console.error('Error parsing user:', error)
      }
    }
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      // Only fetch users if user has permission to assign executives
      const transactionFilters = {}
      if (statusFilter) transactionFilters.status = statusFilter
      if (selectedLocationId) transactionFilters.locationId = selectedLocationId
      
      const requests = [
        getTransactions(Object.keys(transactionFilters).length > 0 ? transactionFilters : {}),
        getTransactionStatistics()
      ]
        
      // Only fetch location stats data if user has permission
      if (canViewLocationStats) {
        requests.push(
          getTransactions({}), // Fetch all transactions for location stats
          getLocations(),
          getExecutives() // Fetch executives for location stats
        )
      }
      
    // // Only fetch users if role allows assigning executives
    // if (canViewLocationStats) {
    //   requests.push(getUsers())
    // }
        
      const results = await Promise.all(requests)
      const transactionsRes = results[0]
      const statsRes = results[1]
      let allTransactionsRes = null
      let locationsRes = null
      let executivesRes = null
     // let usersRes = null
      
      if (canViewLocationStats) {
        allTransactionsRes = results[2]
        locationsRes = results[3]
        executivesRes = results[4]
      //  usersRes = results[5]
      }

      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.data.transactions || [])
      }

      if (canViewLocationStats && allTransactionsRes?.data?.success) {
        setAllTransactions(allTransactionsRes.data.data.transactions || [])
      } else if (!canViewLocationStats) {
        setAllTransactions([])
      }

      if (statsRes.data.success) {
        setStatistics(statsRes.data.data.statistics)
      }

      if (canViewLocationStats && locationsRes?.data?.success) {
        setLocations(locationsRes.data.data.locations || [])
      } else if (!canViewLocationStats) {
        setLocations([])
      }

      if (canViewLocationStats && executivesRes?.data?.success) {
        const executives = executivesRes.data.data.executives || []
        setExecutives(executives)
      } else if (!canViewLocationStats) {
        setExecutives([])
      }

      // if (usersRes?.data?.success) {
      //   const users = usersRes.data.data.users || []
      //   // Keep this for backward compatibility if needed
      // }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.response?.data?.message || 'Failed to fetch data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
      setCurrentPage(1) // Reset to page 1 when filters change
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, selectedLocationId, user])

  const handleTransactionCreated = () => {
    fetchData()
  }

  const handleAssignExecutive = async (transactionId) => {
    const execId = selectedExecutive[transactionId]
    if (!execId) {
      setError('Please select an executive')
      return
    }

    try {
      setAssigningExecutive(transactionId)
      const response = await assignExecutive(transactionId, execId)
      if (response.data.success) {
        fetchData()
        setSelectedExecutive(prev => {
          const newState = { ...prev }
          delete newState[transactionId]
          return newState
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign executive')
    } finally {
      setAssigningExecutive(null)
    }
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDateTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleRowExpansion = (transactionId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId)
      } else {
        newSet.add(transactionId)
      }
      return newSet
    })
  }

  const handleVerifyOtp = async (transactionId) => {
    const otp = otpValues[transactionId]
    if (!otp || otp.length !== 6) {
      setOtpErrors(prev => ({
        ...prev,
        [transactionId]: 'Please enter a valid 6-digit OTP'
      }))
      return
    }

    try {
      setVerifyingOtp(transactionId)
      setOtpErrors(prev => {
        const newState = { ...prev }
        delete newState[transactionId]
        return newState
      })
      setOtpSuccess(prev => {
        const newState = { ...prev }
        delete newState[transactionId]
        return newState
      })
      
      const response = await verifyOTP(transactionId, otp)
      
      if (response.data.success) {
        // OTP verified successfully, refresh data to get updated status
        await fetchData()
        setOtpValues(prev => {
          const newState = { ...prev }
          delete newState[transactionId]
          return newState
        })
        setExpandedRows(prev => {
          const newSet = new Set(prev)
          newSet.delete(transactionId)
          return newSet
        })
      }
    } catch (err) {
      // Show error message from API
      const errorMessage = err.response?.data?.message || 'Failed to verify OTP. Please try again.'
      setOtpErrors(prev => ({
        ...prev,
        [transactionId]: errorMessage
      }))
      // Keep the row expanded so user can try again
    } finally {
      setVerifyingOtp(null)
    }
  }

  const handleResendOtp = async (transactionId) => {
    try {
      setResendingOtp(transactionId)
      setOtpErrors(prev => {
        const newState = { ...prev }
        delete newState[transactionId]
        return newState
      })
      
      const response = await resendOTP(transactionId)
      
      if (response.data.success) {
        setOtpSuccess(prev => ({
          ...prev,
          [transactionId]: 'OTP resent successfully to doctor'
        }))
        // Clear success message after 3 seconds
        setTimeout(() => {
          setOtpSuccess(prev => {
            const newState = { ...prev }
            delete newState[transactionId]
            return newState
          })
        }, 3000)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again.'
      setOtpErrors(prev => ({
        ...prev,
        [transactionId]: errorMessage
      }))
    } finally {
      setResendingOtp(null)
    }
  }

  const isInProgress = (status) => {
    return status?.toLowerCase() === 'in_progress'
  }

  const getStatusNotification = (status) => {
    const statusLower = status?.toLowerCase()
    // Don't show notification for in_progress - show OTP input instead
    if (statusLower === 'completed') {
      return {
        message: 'Cash delivered and OTP verified',
        type: 'success',
        icon: '✅'
      }
    }
    if (statusLower === 'pending') {
      return {
        message: 'Waiting for executive assignment',
        type: 'warning',
        icon: '⏳'
      }
    }
    return null
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: '#FB923C', bgColor: '#FED7AA' },
      'in_progress': { color: '#3B82F6', bgColor: '#DBEAFE' },
      'completed': { color: '#14B8A6', bgColor: '#DCFCE7' },
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

  // Calculate statistics from transactions array
  // Note: transactions array is already filtered by selectedLocationId when fetched from backend
  const calculateStatisticsFromTransactions = () => {
    if (!transactions || transactions.length === 0) {
      return {
        delivered: { count: 0, amount: 0 },
        inProgress: { count: 0, amount: 0 },
        pending: { count: 0, amount: 0 },
        cashInHand: 0
      }
    }

    // Calculate statistics from the transactions array
    // The transactions array is already filtered by location from backend when selectedLocationId is set
    const stats = {
      delivered: { count: 0, amount: 0 },
      inProgress: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      cashInHand: 0
    }

    transactions.forEach(transaction => {
      const status = transaction.status
      const amount = transaction.amount || 0

      if (status === 'completed') {
        stats.delivered.count++
        stats.delivered.amount += amount
      } else if (status === 'in_progress') {
        stats.inProgress.count++
        stats.inProgress.amount += amount
        // Cash in hand includes in_progress cash transactions
        if (transaction.paymentMode === 'Cash') {
          stats.cashInHand += amount
        }
      } else if (status === 'pending') {
        stats.pending.count++
        stats.pending.amount += amount
      }
    })

    return stats
  }

  const locationFilteredStatistics = calculateStatisticsFromTransactions()


  // Calculate location statistics (only if user has permission)
  const calculateLocationStatistics = () => {
    if (!canViewLocationStats) {
      return []
    }
    
    const locationStats = {}
    
    // Initialize stats for each location
    locations.forEach(location => {
      const locationId = location._id || location.id
      locationStats[locationId] = {
        name: location.name,
        completed: 0,
        inProgress: 0,
        executives: []
      }
    })

    // Calculate stats from all transactions
    allTransactions.forEach(transaction => {
      const locationId = transaction.locationId?._id || transaction.locationId
      if (!locationId) return
      
      const locationIdStr = locationId.toString()
      if (locationStats[locationIdStr]) {
        if (transaction.status === 'completed') {
          locationStats[locationIdStr].completed++
        } else if (transaction.status === 'in_progress') {
          locationStats[locationIdStr].inProgress++
        }
      }
    })

    // Calculate executive average TAT for each location
    executives.forEach(executive => {
      const executiveLocationId = executive.locationId?._id || executive.locationId
      if (!executiveLocationId) return
      
      const locationIdStr = executiveLocationId.toString()
      if (locationStats[locationIdStr]) {
        // Get all completed transactions for this executive
        const executiveTransactions = allTransactions.filter(t => {
          const tExecutiveId = t.executiveId?._id || t.executiveId
          const tLocationId = t.locationId?._id || t.locationId
          return tExecutiveId?.toString() === executive._id?.toString() &&
                 tLocationId?.toString() === locationIdStr &&
                 t.status === 'completed' &&
                 t.tat !== null &&
                 t.tat !== undefined
        })

        if (executiveTransactions.length > 0) {
          // Calculate average TAT
          const totalTAT = executiveTransactions.reduce((sum, t) => sum + (t.tat || 0), 0)
          const avgTAT = totalTAT / executiveTransactions.length
          
          locationStats[locationIdStr].executives.push({
            name: executive.name,
            avgTAT: avgTAT,
            completedCount: executiveTransactions.length
          })
        } else {
          // Executive with no completed transactions yet
          locationStats[locationIdStr].executives.push({
            name: executive.name,
            avgTAT: null,
            completedCount: 0
          })
        }
      }
    })

    // Sort executives by average TAT (lowest first, nulls last)
    Object.keys(locationStats).forEach(locationId => {
      locationStats[locationId].executives.sort((a, b) => {
        if (a.avgTAT === null && b.avgTAT === null) return 0
        if (a.avgTAT === null) return 1
        if (b.avgTAT === null) return -1
        return a.avgTAT - b.avgTAT
      })
    })

    return Object.values(locationStats)
  }

  const locationStats = calculateLocationStatistics()

  const statsCards = [
    {
      id: 'delivered',
      title: 'Delivered',
      value: locationFilteredStatistics.delivered.count.toString(),
      description: 'Successfully completed',
      color: '#14B8A6',
      bgGradient: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: locationFilteredStatistics.inProgress.count.toString(),
      description: 'Currently being delivered',
      color: '#3B82F6',
      bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    },
    // {
    //   id: 'pending',
    //   title: 'Pending',
    //   value: locationFilteredStatistics.pending.count.toString(),
    //   description: 'Awaiting assignment',
    //   color: '#FB923C',
    //   bgGradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)'
    // },
    {
      id: 'cash-in-hand',
      title: 'Cash in Hand',
      value: formatCurrency(locationFilteredStatistics.cashInHand),
      description: 'Total cash with executives',
      color: '#06B6D4',
      bgGradient: 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)'
    }
  ]

  const userName = user?.name || 'User'
  const firstName = userName.split(' ')[0]
  
  // Role-based permissions (canViewLocationStats already defined above)
  const canCreateTransaction = ['admin', 'superadmin', 'accountant'].includes(user?.role)
  const canAssignExecutive = ['admin', 'superadmin', 'accountant'].includes(user?.role)
  const isExecutive = user?.role === 'executive'

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

        {/* Stats Cards Row */}
        <div className="stats-cards-row">
        {statsCards.map((card) => (
          <div key={card.id} className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: card.bgGradient }}>
              {card.id === 'delivered' && (
                <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 14L11 18L21 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="14" cy="14" r="10" stroke="white" strokeWidth="2"/>
                </svg>
              )}
              {card.id === 'in-progress' && (
                <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="10" stroke="white" strokeWidth="2"/>
                  <path d="M14 7V14L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              {/* {card.id === 'pending' && (
                <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 7V14L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="14" cy="14" r="10" stroke="white" strokeWidth="2"/>
                </svg>
              )} */}
              {card.id === 'cash-in-hand' && (
                <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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


      {/* Location Overview - Only for admin, superadmin, and accountant */}
      {canViewLocationStats && locationStats.length > 0 && (
        <>
          <h2 className="card-title" style={{ marginTop: '2rem', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Location Overview</h2>
          <div className="location-cards-row">
            {locationStats.map((locationStat) => (
              <div key={locationStat.name} className="location-card">
                <div className="location-card-header">
                  <h3 className="location-card-name">{locationStat.name}</h3>
                </div>
                <div className="location-card-stats">
                <div className="location-stat-item">
                    <span className="location-stat-label">Total Assigned</span>
                    <span className="location-stat-value completed">{locationStat.completed + locationStat.inProgress}</span>
                  </div>
                  <div className="location-stat-item">
                    <span className="location-stat-label">Completed</span>
                    <span className="location-stat-value completed">{locationStat.completed}</span>
                  </div>
                  <div className="location-stat-item">
                    <span className="location-stat-label">In Progress</span>
                    <span className="location-stat-value in-progress">{locationStat.inProgress}</span>
                  </div>
                </div>
                {locationStat.executives && locationStat.executives.length > 0 && (
                  <a
                    className="view-executive-tat-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedLocationForTAT(locationStat)
                      setIsExecutiveTATModalOpen(true)
                    }}
                  >
                    <Clock size={14} />
                    <span>View Executive TAT</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Location Tabs */}
      {canViewLocationStats && (
        <div className="location-tabs-container">
        <button
          className={`location-tab ${selectedLocationId === null ? 'active' : ''}`}
          onClick={() => setSelectedLocationId(null)}
        >
          All
        </button>
        {locations.map((location) => {
          const locationId = location._id || location.id
          const isActive = selectedLocationId && locationId && String(selectedLocationId) === String(locationId)
          return (
            <button
              key={locationId}
              className={`location-tab ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedLocationId(locationId)}
            >
              {location.name}
            </button>
          )
        })}
      </div>
      )}

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

      {/* Online Appointment Card */}
      <div className="appointment-card-full">
        <div className="card-header">
          <h2 className="card-title">Loyalty Reward Management</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {canCreateTransaction && (
              <button 
                className="create-transaction-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={16} />
                Create Transaction
              </button>
            )}
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
            {!isExecutive && (
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
                {/* <option value="pending">Pending</option> */}
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            )}
            {isExecutive && (
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
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            )}
          </div>
        </div>
        <div className="table-wrapper">
          <table className="loyalty-reward-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Executive</th>
                <th>Location</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Month/Year</th>
                <th>Status</th>
                <th>Delivery Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className={expandedRows.size > 0 ? 'has-expanded-row' : ''}>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                    {loading ? 'Loading...' : 'No transactions found'}
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction) => {
                  const isExpanded = expandedRows.has(transaction._id)
                  return (
                    <React.Fragment key={transaction._id}>
                      <tr 
                        className={isExpanded ? 'active-row' : ''}
                      >
                      <td>{transaction.doctorId?.name || 'N/A'}</td>
                      <td>
                        {canAssignExecutive && transaction.status === 'pending' && !transaction.executiveId ? (
                          <select
                            className="assign-executive-select"
                            value={selectedExecutive[transaction._id] || ''}
                            onChange={(e) => setSelectedExecutive(prev => ({
                              ...prev,
                              [transaction._id]: e.target.value
                            }))}
                            disabled={assigningExecutive === transaction._id}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '14px' }}
                          >
                            <option value="">Select Executive</option>
                            {executives.map((exec) => (
                              <option key={exec._id} value={exec._id}>
                                {exec.name}
                              </option>
                            ))}
                          </select>
                        ) : transaction.executiveId?.name || (
                          transaction.status === 'pending' ? (
                            <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Not assigned</span>
                          ) : 'N/A'
                        )}
                      </td>
                      <td>{transaction.locationId?.name || transaction.locationId?.address || 'N/A'}</td>
                      <td>{formatCurrency(transaction.amount)}</td>
                      <td>{transaction.paymentMode}</td>
                      <td>{transaction.monthYear}</td>
                      <td>{getStatusBadge(transaction.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))}</td>
                      <td>{formatDate(transaction.deliveryDate)}</td>
                      <td>
                        {canAssignExecutive && transaction.status === 'pending' && !transaction.executiveId ? (
                          <button
                            className="assign-executive-btn"
                            onClick={() => handleAssignExecutive(transaction._id)}
                            disabled={!selectedExecutive[transaction._id] || assigningExecutive === transaction._id}
                          >
                            <UserPlus size={14} />
                            {assigningExecutive === transaction._id ? 'Assigning...' : 'Assign'}
                          </button>
                        ) : transaction.status !== 'pending' ? (
                          <button
                            className={isInProgress(transaction.status) ? "verify-otp-btn" : "view-details-btn"}
                            onClick={() => toggleRowExpansion(transaction._id)}
                          >
                            {isInProgress(transaction.status) ? (
                              <>
                                <Shield size={14} />
                                <span>{expandedRows.has(transaction._id) ? 'Hide' : 'Verify OTP'}</span>
                                {expandedRows.has(transaction._id) && <ChevronUp size={14} />}
                              </>
                            ) : (
                              <>
                                <Eye size={14} />
                                {expandedRows.has(transaction._id) ? (
                                  <>
                                    <span>Hide Details</span>
                                    <ChevronUp size={14} />
                                  </>
                                ) : (
                                  <>
                                    <span>View Details</span>
                                    <ChevronDown size={14} />
                                  </>
                                )}
                              </>
                            )}
                          </button>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>-</span>
                        )}
                      </td>
                    </tr>
                    {expandedRows.has(transaction._id) && transaction.status !== 'pending' && (
                      <tr className="expanded-row" key={`${transaction._id}-expanded`}>
                        <td colSpan="9" className="expanded-cell">
                          <div className="transaction-details">
                            {isInProgress(transaction.status) ? (
                              <div className="otp-verification-section">
                                <div className="otp-header">
                                  <Shield size={20} />
                                  <h3>Verify OTP</h3>
                                  <p className="otp-hint">Enter the 6-digit OTP sent to the doctor</p>
                                </div>
                                {otpErrors[transaction._id] && (
                                  <div className="otp-error-message">
                                    {otpErrors[transaction._id]}
                                  </div>
                                )}
                                {otpSuccess[transaction._id] && (
                                  <div className="otp-success-message" style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#F0FDF4',
                                    border: '1px solid #BBF7D0',
                                    borderRadius: '8px',
                                    color: '#16A34A',
                                    fontSize: '14px',
                                    marginBottom: '16px'
                                  }}>
                                    {otpSuccess[transaction._id]}
                                  </div>
                                )}
                                <div className="otp-input-container">
                                  <input
                                    type="text"
                                    className={`otp-input ${otpErrors[transaction._id] ? 'otp-input-error' : ''}`}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    value={otpValues[transaction._id] || ''}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '') // Only numbers
                                      setOtpValues(prev => ({
                                        ...prev,
                                        [transaction._id]: value
                                      }))
                                      // Clear error when user starts typing
                                      if (otpErrors[transaction._id]) {
                                        setOtpErrors(prev => {
                                          const newState = { ...prev }
                                          delete newState[transaction._id]
                                          return newState
                                        })
                                      }
                                    }}
                                    disabled={verifyingOtp === transaction._id}
                                  />
                                  <button
                                    className="verify-otp-submit-btn"
                                    onClick={() => handleVerifyOtp(transaction._id)}
                                    disabled={!otpValues[transaction._id] || otpValues[transaction._id].length !== 6 || verifyingOtp === transaction._id}
                                  >
                                    {verifyingOtp === transaction._id ? 'Verifying...' : 'Verify OTP'}
                                  </button>
                                </div>
                                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleResendOtp(transaction._id)
                                    }}
                                    style={{
                                      fontSize: '14px',
                                      color: '#3B82F6',
                                      textDecoration: 'none',
                                      cursor: resendingOtp === transaction._id ? 'not-allowed' : 'pointer',
                                      opacity: resendingOtp === transaction._id ? 0.6 : 1,
                                      pointerEvents: resendingOtp === transaction._id ? 'none' : 'auto'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (resendingOtp !== transaction._id) {
                                        e.target.style.textDecoration = 'underline'
                                        e.target.style.color = '#2563EB'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (resendingOtp !== transaction._id) {
                                        e.target.style.textDecoration = 'none'
                                        e.target.style.color = '#3B82F6'
                                      }
                                    }}
                                  >
                                    {resendingOtp === transaction._id ? 'Resending...' : 'Resend OTP'}
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="details-grid">
                                <div className="detail-item">
                                  <span className="detail-label">Transaction Initiated On:</span>
                                  <span className="detail-value">
                                    {formatDateTime(transaction.createdAt)}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Cash Delivered On:</span>
                                  <span className="detail-value">
                                    {formatDateTime(transaction.deliveryDate)}
                                  </span>
                                </div>
                                
                                {getStatusNotification(transaction.status) && (
                                  <div className={`status-notification ${getStatusNotification(transaction.status).type}`}>
                                    <span className="notification-icon">
                                      {getStatusNotification(transaction.status).icon}
                                    </span>
                                    <span className="notification-message">
                                      {getStatusNotification(transaction.status).message}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-cards-container">
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              {loading ? 'Loading...' : 'No transactions found'}
            </div>
          ) : (
            paginatedTransactions.map((transaction) => {
              const isExpanded = expandedRows.has(transaction._id)
              return (
                <div key={transaction._id} className={`transaction-card ${isExpanded ? 'active' : ''}`}>
                  <div className="card-row">
                    <span className="card-label">Doctor</span>
                    <span className="card-value">{transaction.doctorId?.name || 'N/A'}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Executive</span>
                    <span className="card-value">
                      {canAssignExecutive && transaction.status === 'pending' && !transaction.executiveId ? (
                        <select
                          className="assign-executive-select"
                          value={selectedExecutive[transaction._id] || ''}
                          onChange={(e) => setSelectedExecutive(prev => ({
                            ...prev,
                            [transaction._id]: e.target.value
                          }))}
                          disabled={assigningExecutive === transaction._id}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '14px' }}
                        >
                          <option value="">Select Executive</option>
                          {executives.map((exec) => (
                            <option key={exec._id} value={exec._id}>
                              {exec.name}
                            </option>
                          ))}
                        </select>
                      ) : transaction.executiveId?.name || (
                        transaction.status === 'pending' ? (
                          <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Not assigned</span>
                        ) : 'N/A'
                      )}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Location</span>
                    <span className="card-value">{transaction.locationId?.name || transaction.locationId?.address || 'N/A'}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Amount</span>
                    <span className="card-value">{formatCurrency(transaction.amount)}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Payment Mode</span>
                    <span className="card-value">{transaction.paymentMode}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Month/Year</span>
                    <span className="card-value">{transaction.monthYear}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Status</span>
                    <span className="card-value">{getStatusBadge(transaction.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))}</span>
                  </div>
                  <div className="card-row">
                    <span className="card-label">Delivery Date</span>
                    <span className="card-value">{formatDate(transaction.deliveryDate)}</span>
                  </div>
                  <div className="card-actions">
                    {canAssignExecutive && transaction.status === 'pending' && !transaction.executiveId ? (
                      <button
                        className="assign-executive-btn"
                        onClick={() => handleAssignExecutive(transaction._id)}
                        disabled={!selectedExecutive[transaction._id] || assigningExecutive === transaction._id}
                      >
                        <UserPlus size={14} />
                        {assigningExecutive === transaction._id ? 'Assigning...' : 'Assign'}
                      </button>
                    ) : transaction.status !== 'pending' ? (
                      <button
                        className={isInProgress(transaction.status) ? "verify-otp-btn" : "view-details-btn"}
                        onClick={() => toggleRowExpansion(transaction._id)}
                      >
                        {isInProgress(transaction.status) ? (
                          <>
                            <Shield size={14} />
                            <span>{expandedRows.has(transaction._id) ? 'Hide' : 'Verify OTP'}</span>
                            {expandedRows.has(transaction._id) && <ChevronUp size={14} />}
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            {expandedRows.has(transaction._id) ? (
                              <>
                                <span>Hide Details</span>
                                <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                <span>View Details</span>
                                <ChevronDown size={14} />
                              </>
                            )}
                          </>
                        )}
                      </button>
                    ) : (
                      <span style={{ color: '#9CA3AF', textAlign: 'center', display: 'block' }}>-</span>
                    )}
                  </div>
                  {expandedRows.has(transaction._id) && transaction.status !== 'pending' && (
                    <div className="transaction-details">
                      {isInProgress(transaction.status) ? (
                        <div className="otp-verification-section">
                          <div className="otp-header">
                            <Shield size={20} />
                            <h3>Verify OTP</h3>
                            <p className="otp-hint">Enter the 6-digit OTP sent to the doctor</p>
                          </div>
                          {otpErrors[transaction._id] && (
                            <div className="otp-error-message">
                              {otpErrors[transaction._id]}
                            </div>
                          )}
                          {otpSuccess[transaction._id] && (
                            <div className="otp-success-message" style={{
                              padding: '12px 16px',
                              backgroundColor: '#F0FDF4',
                              border: '1px solid #BBF7D0',
                              borderRadius: '8px',
                              color: '#16A34A',
                              fontSize: '14px',
                              marginBottom: '16px'
                            }}>
                              {otpSuccess[transaction._id]}
                            </div>
                          )}
                          <div className="otp-input-container">
                            <input
                              type="text"
                              className={`otp-input ${otpErrors[transaction._id] ? 'otp-input-error' : ''}`}
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                              value={otpValues[transaction._id] || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '') // Only numbers
                                setOtpValues(prev => ({
                                  ...prev,
                                  [transaction._id]: value
                                }))
                                // Clear error when user starts typing
                                if (otpErrors[transaction._id]) {
                                  setOtpErrors(prev => {
                                    const newState = { ...prev }
                                    delete newState[transaction._id]
                                    return newState
                                  })
                                }
                              }}
                              disabled={verifyingOtp === transaction._id}
                            />
                            <button
                              className="verify-otp-submit-btn"
                              onClick={() => handleVerifyOtp(transaction._id)}
                              disabled={!otpValues[transaction._id] || otpValues[transaction._id].length !== 6 || verifyingOtp === transaction._id}
                            >
                              {verifyingOtp === transaction._id ? 'Verifying...' : 'Verify OTP'}
                            </button>
                          </div>
                          <div style={{ marginTop: '12px', textAlign: 'center' }}>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                handleResendOtp(transaction._id)
                              }}
                              style={{
                                fontSize: '14px',
                                color: '#3B82F6',
                                textDecoration: 'none',
                                cursor: resendingOtp === transaction._id ? 'not-allowed' : 'pointer',
                                opacity: resendingOtp === transaction._id ? 0.6 : 1,
                                pointerEvents: resendingOtp === transaction._id ? 'none' : 'auto'
                              }}
                              onMouseEnter={(e) => {
                                if (resendingOtp !== transaction._id) {
                                  e.target.style.textDecoration = 'underline'
                                  e.target.style.color = '#2563EB'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (resendingOtp !== transaction._id) {
                                  e.target.style.textDecoration = 'none'
                                  e.target.style.color = '#3B82F6'
                                }
                              }}
                            >
                              {resendingOtp === transaction._id ? 'Resending...' : 'Resend OTP'}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-label">Transaction Initiated On:</span>
                            <span className="detail-value">
                              {formatDateTime(transaction.createdAt)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Cash Delivered On:</span>
                            <span className="detail-value">
                              {formatDateTime(transaction.deliveryDate)}
                            </span>
                          </div>
                          
                          {getStatusNotification(transaction.status) && (
                            <div className={`status-notification ${getStatusNotification(transaction.status).type}`}>
                              <span className="notification-icon">
                                {getStatusNotification(transaction.status).icon}
                              </span>
                              <span className="notification-message">
                                {getStatusNotification(transaction.status).message}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
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

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTransactionCreated}
      />

      {/* Executive TAT Modal */}
      {isExecutiveTATModalOpen && selectedLocationForTAT && (
        <div className="executive-tat-modal-overlay" onClick={() => setIsExecutiveTATModalOpen(false)}>
          <div className="executive-tat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="executive-tat-modal-header">
              <div>
                <h2 className="executive-tat-modal-title">Executive TAT - {selectedLocationForTAT.name}</h2>
                <p className="executive-tat-modal-subtitle">Average Turn Around Time by Executive</p>
              </div>
              <button
                className="executive-tat-modal-close"
                onClick={() => setIsExecutiveTATModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="executive-tat-modal-content">
              {selectedLocationForTAT.executives && selectedLocationForTAT.executives.length > 0 ? (
                <table className="executive-tat-table">
                  <thead>
                    <tr>
                      <th>Executive</th>
                      <th>Completed</th>
                      <th>Average TAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLocationForTAT.executives.map((executive, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="executive-tat-table-cell">
                            <div className="executive-tat-avatar">
                              {executive.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="executive-tat-name">{executive.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="executive-tat-completed">{executive.completedCount}</span>
                        </td>
                        <td>
                          {executive.avgTAT !== null ? (
                            <span className="executive-tat-value">{executive.avgTAT.toFixed(1)} <span className="executive-tat-unit">hrs</span></span>
                          ) : (
                            <span className="executive-tat-na">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="executive-tat-empty">
                  <p>No executives found for this location</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoyaltyRewardOverview

