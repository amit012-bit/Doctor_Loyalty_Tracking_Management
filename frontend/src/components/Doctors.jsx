import { useState, useEffect } from 'react'
import './LoyaltyRewardOverview.css'
import { getUsers } from '../services/User'
import { getLocations } from '../services/Location'
import UserModal from './UserModal'
import { Plus, Edit2 } from 'lucide-react'

function Doctors() {
  const [user, setUser] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const itemsPerPage = 5

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

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      const [usersRes, locationsRes] = await Promise.all([
        getUsers(),
        getLocations()
      ])

      if (usersRes.data.success) {
        const users = usersRes.data.data.users || []
        setDoctors(users.filter(u => u.role === 'doctor'))
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

  useEffect(() => {
    fetchData()
  }, [])

  const handleUserCreated = () => {
    fetchData()
  }

  const handleEdit = (userId) => {
    setEditingUserId(userId)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingUserId(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingUserId(null)
  }

  const filteredDoctors = doctors.filter(doctor => {
    if (!searchQuery) return true
    
    const name = doctor.name || ''
    const email = doctor.email || ''
    const phoneNumber = doctor.phoneNumber || ''
    const locationName = doctor.locationId?.name || ''
    const searchLower = searchQuery.toLowerCase()
    
    return name.toLowerCase().includes(searchLower) || 
           email.toLowerCase().includes(searchLower) ||
           phoneNumber.toLowerCase().includes(searchLower) ||
           locationName.toLowerCase().includes(searchLower)
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

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

      {/* Doctors Card */}
      <div className="appointment-card-full">
        <div className="card-header">
          <h2 className="card-title">Doctors Management</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isAdmin && (
              <button 
                className="create-transaction-btn"
                onClick={handleAddNew}
              >
                <Plus size={16} />
                Add Doctor
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
                placeholder="Search by name, email, or location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  width: '300px'
                }}
              />
            </div>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="loyalty-reward-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Location</th>
                <th>Created At</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '2rem' }}>
                    {loading ? 'Loading...' : 'No doctors found'}
                  </td>
                </tr>
              ) : (
                paginatedDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>{doctor.name || 'N/A'}</td>
                    <td>{doctor.email || 'N/A'}</td>
                    <td>{doctor.phoneNumber || 'N/A'}</td>
                    <td>{doctor.locationId?.name || doctor.locationId?.address || 'N/A'}</td>
                    <td>
                      {doctor.createdAt 
                        ? new Date(doctor.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          className="view-details-btn"
                          onClick={() => handleEdit(doctor._id)}
                          style={{ width: 'auto', minWidth: '100px' }}
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredDoctors.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredDoctors.length)} of {filteredDoctors.length} doctors
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

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleUserCreated}
        userId={editingUserId}
        userRole="doctor"
      />
    </div>
  )
}

export default Doctors

