import { useState, useEffect } from 'react'
import './LoyaltyRewardOverview.css'
import './CreateTransactionModal.css'
import { getDoctors, deleteDoctor } from '../services/Doctor'
import UserModal from './UserModal'
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react'

function Doctors() {
  const [user, setUser] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingDoctorId, setEditingDoctorId] = useState(null)
  const [deletingDoctor, setDeletingDoctor] = useState(null)
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

      const [doctorsRes] = await Promise.all([
        getDoctors()
      ])

      if (doctorsRes.data.success) {
        const doctors = doctorsRes.data.data.doctors || []
        setDoctors(doctors)
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

  const handleDoctorCreated = () => {
    fetchData()
  }

  const handleEdit = (doctorId) => {
    setEditingDoctorId(doctorId)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingDoctorId(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingDoctorId(null)
  }

  const handleDeleteClick = (doctor) => {
    setDeletingDoctor(doctor)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingDoctor) return
    
    try {
      setDeleting(true)
      setError('')
      await deleteDoctor(deletingDoctor._id)
      setIsDeleteModalOpen(false)
      setDeletingDoctor(null)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete doctor. Please try again.')
      console.error('Delete doctor error:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setDeletingDoctor(null)
  }

  const filteredDoctors = doctors.filter(doctor => {
    if (!searchQuery) return true
    
    const name = doctor.name || ''
    const mobileNumber = doctor.mobileNumber || ''
    const clinicName = doctor.clinicName || ''
    // Handle single locationId - could be object with name or direct ObjectId
    const locationName = doctor.locationId?.name || ''
    const searchLower = searchQuery.toLowerCase()
    
    return name.toLowerCase().includes(searchLower) || 
           mobileNumber.toLowerCase().includes(searchLower) ||
           clinicName.toLowerCase().includes(searchLower) ||
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
                placeholder="Search by name, phone, clinic, or location..."
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
                <th>Mobile Number</th>
                <th>Clinic Name</th>
                <th>Locations</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '2rem' }}>
                    {loading ? 'Loading...' : 'No doctors found'}
                  </td>
                </tr>
              ) : (
                paginatedDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>{doctor.name || 'N/A'}</td>
                    <td>{doctor.mobileNumber || 'N/A'}</td>
                    <td>{doctor.clinicName || 'N/A'}</td>
                    <td>{doctor.locationId?.name || doctor.locationId?.address || 'N/A'}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: doctor.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                          color: doctor.status === 'active' ? '#065F46' : '#991B1B'
                        }}>
                          {doctor.status || 'N/A'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleEdit(doctor._id)}
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
                              onClick={() => handleDeleteClick(doctor)}
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
          {filteredDoctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              {loading ? 'Loading...' : 'No doctors found'}
            </div>
          ) : (
            paginatedDoctors.map((doctor) => (
              <div key={doctor._id} className="transaction-card">
                <div className="card-row">
                  <span className="card-label">Name</span>
                  <span className="card-value">{doctor.name || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Mobile Number</span>
                  <span className="card-value">{doctor.mobileNumber || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Clinic Name</span>
                  <span className="card-value">{doctor.clinicName || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Location</span>
                  <span className="card-value">{doctor.locationId?.name || doctor.locationId?.address || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Status</span>
                  <span className="card-value">
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: doctor.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                      color: doctor.status === 'active' ? '#065F46' : '#991B1B'
                    }}>
                      {doctor.status || 'N/A'}
                    </span>
                  </span>
                </div>
                {isAdmin && (
                  <div className="card-actions">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(doctor._id)}
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
                        onClick={() => handleDeleteClick(doctor)}
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
        onSuccess={handleDoctorCreated}
        personId={editingDoctorId}
        userRole="doctor"
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
                Are you sure you want to delete <strong>{deletingDoctor?.name}</strong>? This action cannot be undone.
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

export default Doctors

