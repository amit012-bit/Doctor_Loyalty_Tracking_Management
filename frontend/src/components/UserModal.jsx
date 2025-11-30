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
    phoneNumber: '', // This will store only the 10 digits (without +91)
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
            // Extract 10 digits from phone number (remove +91- prefix for display)
            const phoneDisplay = user.phoneNumber ? user.phoneNumber.replace(/^\+91-?/, '').substring(0, 10) : ''
            setFormData({
              name: user.name || '',
              email: user.email || '',
              phoneNumber: phoneDisplay,
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
        phoneNumber: '',
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
        phoneNumber: '',
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
    
    // Special handling for phone number - only allow 10 digits
    if (name === 'phoneNumber') {
      // Remove all non-digit characters and limit to 10 digits
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
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phoneNumber || !formData.locationId) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }
      
      // Validate phone number: ensure we have 10 digits (with or without +91 prefix)
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
      if (phoneDigits.length !== 10) {
        setError('Please enter exactly 10 digits for the phone number')
        setLoading(false)
        return
      }
      
      // Check if first digit is 6-9 (valid Indian mobile number)
      if (!/^[6-9]/.test(phoneDigits)) {
        setError('Phone number must start with 6, 7, 8, or 9')
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

      // Format phone number as +91XXXXXXXXXX (backend will normalize to +91-XXXXXXXXXX)
      const phoneNumber = `+91${formData.phoneNumber}`

      let response
      if (isEditMode) {
        // Update existing user (don't send password if empty)
        const updateData = {
          name: formData.name,
          email: formData.email,
          phoneNumber: phoneNumber,
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
        const createData = {
          ...formData,
          phoneNumber: phoneNumber
        }
        response = await createUser(createData)
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

        <form onSubmit={handleSubmit} className="transaction-form">
          {error && (
            <div className="form-error-message">
              {error}
            </div>
          )}

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
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter email address"
              />
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
                  value={formData.phoneNumber}
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
              <label htmlFor="password" className="form-label">
                Password {!isEditMode && '*'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required={!isEditMode}
                minLength={isEditMode ? 0 : 6}
                placeholder={isEditMode ? "Enter new password (optional)" : "Enter password (min 6 characters)"}
              />
              {isEditMode && (
                <small className="form-hint">(leave blank to keep current)</small>
              )}
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
                <option value="doctor">Doctor</option>
                <option value="executive">Executive</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
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
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name} - {location.address}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal

