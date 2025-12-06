import { useState, useEffect } from 'react'
import './LoyaltyRewardOverview.css'
import './CreateTransactionModal.css'
import { getExecutives, deleteExecutive } from '../services/Executive'
import UserModal from './UserModal'
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react'

function Executives() {
  const [user, setUser] = useState(null)
  const [executives, setExecutives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingExecutiveId, setEditingExecutiveId] = useState(null)
  const [deletingExecutive, setDeletingExecutive] = useState(null)
  const [deleting, setDeleting] = useState(false)
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

      const executivesRes = await getExecutives()

      if (executivesRes.data.success) {
        const executives = executivesRes.data.data.executives || []
        setExecutives(executives)
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

  const handleExecutiveCreated = () => {
    fetchData()
  }

  const handleEdit = (executiveId) => {
    setEditingExecutiveId(executiveId)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingExecutiveId(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingExecutiveId(null)
  }

  const handleDeleteClick = (executive) => {
    setDeletingExecutive(executive)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingExecutive) return
    
    try {
      setDeleting(true)
      setError('')
      await deleteExecutive(deletingExecutive._id)
      setIsDeleteModalOpen(false)
      setDeletingExecutive(null)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete executive. Please try again.')
      console.error('Delete executive error:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setDeletingExecutive(null)
  }

  const filteredExecutives = executives.filter(executive => {
    if (!searchQuery) return true
    
    const name = executive.name || ''
    const phoneNumber = executive.phoneNumber || ''
    const locationName = executive.locationId?.name || ''
    const searchLower = searchQuery.toLowerCase()
    
    return name.toLowerCase().includes(searchLower) || 
           phoneNumber.toLowerCase().includes(searchLower) ||
           locationName.toLowerCase().includes(searchLower)
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredExecutives.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedExecutives = filteredExecutives.slice(startIndex, endIndex)

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

      {/* Executives Card */}
      <div className="appointment-card-full">
        <div className="card-header">
          <h2 className="card-title">Executives Management</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isAdmin && (
              <button 
                className="create-transaction-btn"
                onClick={handleAddNew}
              >
                <Plus size={16} />
                Add Executive
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
                placeholder="Search by name, phone, or location..."
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
                <th>Phone Number</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created At</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredExecutives.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '2rem' }}>
                    {loading ? 'Loading...' : 'No executives found'}
                  </td>
                </tr>
              ) : (
                paginatedExecutives.map((executive) => (
                  <tr key={executive._id}>
                    <td>{executive.name || 'N/A'}</td>
                    <td>{executive.phoneNumber || 'N/A'}</td>
                    <td>{executive.locationId?.name || executive.locationId?.address || 'N/A'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: executive.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                        color: executive.status === 'active' ? '#065F46' : '#991B1B'
                      }}>
                        {executive.status || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {executive.createdAt 
                        ? new Date(executive.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleEdit(executive._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#3B82F6',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#2563EB'}
                            onMouseLeave={(e) => e.target.style.color = '#3B82F6'}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(executive)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#EF4444',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#DC2626'}
                            onMouseLeave={(e) => e.target.style.color = '#EF4444'}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-cards-container">
          {filteredExecutives.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              {loading ? 'Loading...' : 'No executives found'}
            </div>
          ) : (
            paginatedExecutives.map((executive) => (
              <div key={executive._id} className="transaction-card">
                <div className="card-row">
                  <span className="card-label">Name</span>
                  <span className="card-value">{executive.name || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Phone Number</span>
                  <span className="card-value">{executive.phoneNumber || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Location</span>
                  <span className="card-value">{executive.locationId?.name || executive.locationId?.address || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Status</span>
                  <span className="card-value">
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: executive.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                      color: executive.status === 'active' ? '#065F46' : '#991B1B'
                    }}>
                      {executive.status || 'N/A'}
                    </span>
                  </span>
                </div>
                <div className="card-row">
                  <span className="card-label">Created At</span>
                  <span className="card-value">
                    {executive.createdAt 
                      ? new Date(executive.createdAt).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'N/A'}
                  </span>
                </div>
                {isAdmin && (
                  <div className="card-actions">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(executive._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#3B82F6',
                          transition: 'color 0.2s'
                        }}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(executive)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#EF4444',
                          transition: 'color 0.2s'
                        }}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {filteredExecutives.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredExecutives.length)} of {filteredExecutives.length} executives
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
        onSuccess={handleExecutiveCreated}
        personId={editingExecutiveId}
        userRole="executive"
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={24} color="#EF4444" />
                Confirm Delete
              </h2>
              <button className="modal-close-btn" onClick={handleDeleteCancel}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              <p style={{ 
                fontSize: '16px', 
                color: 'var(--text-primary)', 
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                Are you sure you want to delete <strong>{deletingExecutive?.name}</strong>? This action cannot be undone.
              </p>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end' 
              }}>
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  style={{
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: '2px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: deleting ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!deleting) {
                      e.target.style.background = 'var(--bg-primary)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!deleting) {
                      e.target.style.background = 'var(--card-bg)'
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  style={{
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#EF4444',
                    color: 'white',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: deleting ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!deleting) {
                      e.target.style.background = '#DC2626'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!deleting) {
                      e.target.style.background = '#EF4444'
                    }
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Executives
