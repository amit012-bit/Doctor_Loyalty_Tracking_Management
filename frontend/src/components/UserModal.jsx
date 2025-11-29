import { useState, useEffect } from 'react'
import './CreateTransactionModal.css'
import { X } from 'lucide-react'
import { createUser, updateUserById, getUserById } from '../services/User'
import { getLocations } from '../services/Location'

function UserModal({ isOpen, onClose, onSuccess, userId, userRole: defaultRole }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [locations, setLocations] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: defaultRole || 'doctor',
    locationId: ''
  })
  const [isEditMode, setIsEditMode] = useState(false)

  // Fetch locations
  useEffect(() => {
    if (isOpen) {
      const fetchLocations = async () => {
        try {
          const locationsRes = await getLocations()
          if (locationsRes.data.success) {
            setLocations(locationsRes.data.data.locations || [])
            if (locationsRes.data.data.locations.length > 0 && !formData.locationId) {
              setFormData(prev => ({ ...prev, locationId: locationsRes.data.data.locations[0]._id }))
            }
          }
        } catch (err) {
          console.error('Error fetching locations:', err)
        }
      }

      fetchLocations()
    }
  }, [isOpen])

  // Fetch user data if editing
  useEffect(() => {
    if (isOpen && userId) {
      setIsEditMode(true)
      const fetchUser = async () => {
        try {
          const response = await getUserById(userId)
          if (response.data.success) {
            const user = response.data.data.user
            setFormData({
              name: user.name || '',
              email: user.email || '',
              password: '', // Don't pre-fill password
              role: user.role || defaultRole || 'doctor',
              locationId: user.locationId?._id || user.locationId || ''
            })
          }
        } catch (err) {
          console.error('Error fetching user:', err)
          setError('Failed to load user data')
        }
      }
      fetchUser()
    } else if (isOpen && !userId) {
      setIsEditMode(false)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: defaultRole || 'doctor',
        locationId: ''
      })
    }
  }, [isOpen, userId, defaultRole])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: defaultRole || 'doctor',
        locationId: ''
      })
      setError('')
      setIsEditMode(false)
    }
  }, [isOpen, defaultRole])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.locationId) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Password is required only for new users
      if (!isEditMode && !formData.password) {
        setError('Password is required for new users')
        setLoading(false)
        return
      }

      // Password validation: min 6 chars for new users, or if provided in edit mode
      if (formData.password && formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }

      let response
      if (isEditMode) {
        // Update existing user (don't send password if empty)
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          locationId: formData.locationId
        }
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password
        }
        response = await updateUserById(userId, updateData)
      } else {
        // Create new user
        response = await createUser(formData)
      }

      if (response.data.success) {
        onSuccess()
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-error" style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem', 
              backgroundColor: '#FEE2E2', 
              color: '#991B1B', 
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password {!isEditMode && '*'}
              {isEditMode && <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'normal' }}>(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEditMode}
              minLength={isEditMode ? 0 : 6}
              placeholder={isEditMode ? "Enter new password (optional)" : "Enter password (min 6 characters)"}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="doctor">Doctor</option>
              <option value="executive">Executive</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="locationId">Location *</label>
            <select
              id="locationId"
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              required
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name} - {location.address}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal

