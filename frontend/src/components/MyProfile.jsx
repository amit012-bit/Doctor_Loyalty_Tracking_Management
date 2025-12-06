import { useState, useEffect } from 'react'
import './MyProfile.css'
import { updateCurrentUser, getCurrentUser } from '../services/User'
import { updateExecutive, getExecutiveById } from '../services/Executive'
import { getLocations } from '../services/Location'
import { Eye, EyeOff } from 'lucide-react'

function MyProfile({ currentUser }) {
  const isExecutive = currentUser?.role === 'executive'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [locations, setLocations] = useState([])
  const [currentPassword, setCurrentPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    locationId: '',
    profession: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    // Fetch current user data with password
    const fetchUserData = async () => {
      try {
        let response
        if (isExecutive) {
          response = await getExecutiveById(currentUser._id)
        } else {
          response = await getCurrentUser()
        }
        if (response.data.success) {
          const userData = response.data.data.user || response.data.data.executive
          const nameParts = (userData.name || '').split(' ')
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            username: userData.username || '',
            phoneNumber: userData.phoneNumber || '',
            locationId: userData.locationId?._id || userData.locationId || '',
            profession: userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : '',
            newPassword: '',
            confirmPassword: ''
          })
          setCurrentPassword(userData.password || '')
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        // Fallback to currentUser from props
        if (currentUser) {
          const nameParts = (currentUser.name || '').split(' ')
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            username: currentUser.username || '',
            phoneNumber: currentUser.phoneNumber || '',
            locationId: currentUser.locationId?._id || currentUser.locationId || '',
            profession: currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : '',
            newPassword: '',
            confirmPassword: ''
          })
        }
      }
    }

    fetchUserData()

    // Fetch locations
    const fetchLocations = async () => {
      try {
        const response = await getLocations()
        if (response.data.success) {
          setLocations(response.data.data.locations || [])
        }
      } catch (err) {
        console.error('Error fetching locations:', err)
      }
    }
    fetchLocations()
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate password if new password is provided
      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters long')
          setLoading(false)
          return
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New password and confirm password do not match')
          setLoading(false)
          return
        }
      } else if (formData.confirmPassword) {
        // If only confirm password is filled, show error
        setError('Please enter a new password')
        setLoading(false)
        return
      }

      // Combine firstName and lastName
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      
      const updateData = {
        name: fullName,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        locationId: formData.locationId
      }

      // Only include password if new password is provided
      if (formData.newPassword) {
        updateData.password = formData.newPassword
      }

      let response
      if (isExecutive) {
        response = await updateExecutive(currentUser._id, updateData)
      } else {
        response = await updateCurrentUser(updateData)
      }
      
      if (response.status === 200 && response.data.success) {
        setSuccess('Profile updated successfully!')
        // Update localStorage with new user data
        const updatedUser = { ...currentUser, ...response.data.data.user || response.data.data.executive }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: ''
        }))
        // Reload to reflect changes
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setError(response.data?.message || 'Failed to update profile')
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Network error. Please check your connection and try again.')
      }
      console.error('Update profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser?.name) {
      const parts = currentUser.name.split(' ')
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return parts[0].substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  return (
    <div className="profile-page">
      <h1 className="profile-page-title">Personal Information</h1>

      <div className="profile-card">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-picture-wrapper">
              <div className="profile-picture-placeholder">
                <span className="profile-initials">{getUserInitials()}</span>
              </div>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="profile-form">
          {error && (
            <div className="form-message form-error">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="form-message form-success">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{success}</span>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter first name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter last name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter phone number (e.g., +91 9876543210)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="locationId" className="form-label">
                Location
              </label>
              <select
                id="locationId"
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                className="form-input"
                disabled={isExecutive}
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="profession" className="form-label">
                Role
              </label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter profession"
                readOnly
              />
            </div>

            {/* <div className="form-group full-width">
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={currentPassword}
                  className="form-input"
                  placeholder="Current password"
                  readOnly
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div> */}

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter new password (optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default MyProfile

