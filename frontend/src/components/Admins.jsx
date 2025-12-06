import { useState, useEffect } from 'react'
import './LoyaltyRewardOverview.css'
import './CreateTransactionModal.css'
import { getUsers, createUser, updateUserById, deleteUser } from '../services/User'
import { getLocations } from '../services/Location'
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react'

function Admins() {
  const [user, setUser] = useState(null)
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingAdminId, setEditingAdminId] = useState(null)
  const [deletingAdmin, setDeletingAdmin] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [locations, setLocations] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phoneNumber: '',
    locationId: '',
    role: 'admin'
  })
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
      setSuccess('')

      const [usersRes, locationsRes] = await Promise.all([
        getUsers(),
        getLocations()
      ])

      if (usersRes.data.success) {
        // Filter only admin and accountant roles
        const allUsers = usersRes.data.data.users || []
        const filteredUsers = allUsers.filter(u => 
          u.role === 'admin' || u.role === 'accountant'
        )
        setAdmins(filteredUsers)
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

  const handleAdminCreated = () => {
    fetchData()
  }

  const handleEdit = (adminId) => {
    const admin = admins.find(a => a._id === adminId)
    if (admin) {
      const phoneDisplay = admin.phoneNumber ? admin.phoneNumber.replace(/^\+91-?/, '').substring(0, 10) : ''
      setFormData({
        name: admin.name || '',
        username: admin.username || '',
        phoneNumber: phoneDisplay,
        locationId: admin.locationId?._id || admin.locationId || '',
        role: admin.role || 'admin'
      })
      setEditingAdminId(adminId)
      setIsModalOpen(true)
    }
  }

  const handleAddNew = () => {
    setFormData({
      name: '',
      username: '',
      phoneNumber: '',
      locationId: '',
      role: 'admin'
    })
    setEditingAdminId(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingAdminId(null)
    setFormData({
      name: '',
      username: '',
      phoneNumber: '',
      locationId: '',
      role: 'admin'
    })
    setError('')
  }

  const handleDeleteClick = (admin) => {
    setDeletingAdmin(admin)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingAdmin) return
    
    try {
      setDeleting(true)
      setError('')
      await deleteUser(deletingAdmin._id)
      setIsDeleteModalOpen(false)
      setDeletingAdmin(null)
      fetchData()
      setSuccess('Admin deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admin. Please try again.')
      console.error('Delete admin error:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setDeletingAdmin(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '').substring(0, 10)
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!formData.name || !formData.username || !formData.phoneNumber || !formData.locationId) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        setError('Please enter exactly 10 digits for the phone number')
        setLoading(false)
        return
      }

      if (!/^[6-9]/.test(phoneDigits)) {
        setError('Phone number must start with 6, 7, 8, or 9')
        setLoading(false)
        return
      }

      const phoneNumber = `+91${phoneDigits}`

      const userData = {
        name: formData.name,
        username: formData.username,
        phoneNumber: phoneNumber,
        locationId: formData.locationId,
        role: formData.role
      }

      let response
      if (editingAdminId) {
        response = await updateUserById(editingAdminId, userData)
        if (response.data.success) {
          setSuccess('Admin updated successfully')
          handleModalClose()
          fetchData()
        }
      } else {
        response = await createUser(userData)
        if (response.data.success) {
          setSuccess('Admin created successfully')
          setIsModalOpen(false)
          fetchData()
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingAdminId ? 'update' : 'create'} admin. Please try again.`)
      console.error('Admin operation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAdmins = admins.filter(admin => {
    if (!searchQuery) return true
    
    const name = admin.name || ''
    const username = admin.username || ''
    const phoneNumber = admin.phoneNumber || ''
    const role = admin.role || ''
    const locationName = admin.locationId?.name || ''
    const searchLower = searchQuery.toLowerCase()
    
    return name.toLowerCase().includes(searchLower) || 
           username.toLowerCase().includes(searchLower) ||
           phoneNumber.toLowerCase().includes(searchLower) ||
           role.toLowerCase().includes(searchLower) ||
           locationName.toLowerCase().includes(searchLower)
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAdmins = filteredAdmins.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (loading && admins.length === 0) {
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

      {success && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#F0FDF4', 
          color: '#16A34A', 
          borderRadius: '8px' 
        }}>
          {success}
        </div>
      )}

      {/* Admins Card */}
      <div className="appointment-card-full">
        <div className="card-header">
          <h2 className="card-title">Admins Management</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              className="create-transaction-btn"
              onClick={handleAddNew}
            >
              <Plus size={16} />
              Add Admin
            </button>
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
                placeholder="Search by name, username, phone, role, or location..."
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
                <th>Username</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Location</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    {loading ? 'Loading...' : 'No admins found'}
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((admin) => (
                  <tr key={admin._id}>
                    <td>{admin.name || 'N/A'}</td>
                    <td>{admin.username || 'N/A'}</td>
                    <td>{admin.phoneNumber || 'N/A'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: admin.role === 'admin' ? '#DBEAFE' : '#FEF3C7',
                        color: admin.role === 'admin' ? '#1E40AF' : '#92400E'
                      }}>
                        {admin.role || 'N/A'}
                      </span>
                    </td>
                    <td>{admin.locationId?.name || admin.locationId?.address || 'N/A'}</td>
                    <td>
                      {admin.createdAt 
                        ? new Date(admin.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleEdit(admin._id)}
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
                          onClick={() => handleDeleteClick(admin)}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-cards-container">
          {filteredAdmins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              {loading ? 'Loading...' : 'No admins found'}
            </div>
          ) : (
            paginatedAdmins.map((admin) => (
              <div key={admin._id} className="transaction-card">
                <div className="card-row">
                  <span className="card-label">Name</span>
                  <span className="card-value">{admin.name || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Username</span>
                  <span className="card-value">{admin.username || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Phone Number</span>
                  <span className="card-value">{admin.phoneNumber || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Role</span>
                  <span className="card-value">
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: admin.role === 'admin' ? '#DBEAFE' : '#FEF3C7',
                      color: admin.role === 'admin' ? '#1E40AF' : '#92400E'
                    }}>
                      {admin.role || 'N/A'}
                    </span>
                  </span>
                </div>
                <div className="card-row">
                  <span className="card-label">Location</span>
                  <span className="card-value">{admin.locationId?.name || admin.locationId?.address || 'N/A'}</span>
                </div>
                <div className="card-row">
                  <span className="card-label">Created At</span>
                  <span className="card-value">
                    {admin.createdAt 
                      ? new Date(admin.createdAt).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="card-actions">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleEdit(admin._id)}
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
                      onClick={() => handleDeleteClick(admin)}
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
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {filteredAdmins.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAdmins.length)} of {filteredAdmins.length} admins
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

      {/* Create/Edit Admin Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingAdminId ? 'Edit Admin' : 'Add New Admin'}
              </h2>
              <button className="modal-close-btn" onClick={handleModalClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="transaction-form">
              {error && (
                <div className="form-error-message">
                  {error}
                </div>
              )}

              {/* {generatedCredentials && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#16A34A', fontSize: '16px' }}>Credentials Generated</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                    <div><strong>Username:</strong> {generatedCredentials.username}</div>
                    <div><strong>Password:</strong> {generatedCredentials.password}</div>
                  </div>
                  <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#059669' }}>
                    Please save these credentials. They will not be shown again.
                  </p>
                </div>
              )} */}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Enter name"
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
                    required
                    placeholder="Enter username"
                    maxLength={30}
                    disabled={!!editingAdminId}
                  />
                  {editingAdminId && (
                    <small className="form-hint" style={{ marginTop: '4px', display: 'block', color: '#6B7280', fontSize: '12px' }}>
                      Username cannot be changed
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      color: '#6B7280',
                      fontWeight: '500',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleChange}
                      className="form-input"
                      required
                      placeholder="9876543210"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      style={{ paddingLeft: '48px' }}
                    />
                  </div>
                  <small className="form-hint" style={{ marginTop: '4px', display: 'block', color: '#6B7280', fontSize: '12px' }}>
                    Format: +91 followed by 10 digits (e.g., +91 9876543210)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="accountant">Accountant</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="locationId" className="form-label">
                    Location *
                  </label>
                  <select
                    id="locationId"
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={handleModalClose}
                  style={{
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: '2px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%)',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Saving...' : editingAdminId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                Are you sure you want to delete <strong>{deletingAdmin?.name}</strong>? This action cannot be undone.
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

export default Admins

