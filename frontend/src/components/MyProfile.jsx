import { useState, useEffect } from 'react'
import './MyProfile.css'
import { updateCurrentUser } from '../services/User'
import { getLocations } from '../services/Location'
import { User, Camera, Trash2 } from 'lucide-react'

function MyProfile({ currentUser }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [locations, setLocations] = useState([])
  const [profileImage, setProfileImage] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    profession: '',
    bio: ''
  })

  useEffect(() => {
    // Initialize form with user data
    if (currentUser) {
      const nameParts = (currentUser.name || '').split(' ')
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: currentUser.email || '',
        profession: currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : '',
      })
    }

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteImage = () => {
    setProfileImage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Combine firstName and lastName
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      
      const updateData = {
        name: fullName,
        email: formData.email
      }

      const response = await updateCurrentUser(updateData)
      
      if (response.status === 200 && response.data.success) {
        setSuccess('Profile updated successfully!')
        // Update localStorage with new user data
        const updatedUser = { ...currentUser, ...response.data.data.user }
        localStorage.setItem('user', JSON.stringify(updatedUser))
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
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-placeholder">
                <span className="profile-initials">{getUserInitials()}</span>
              </div>
            )}
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
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter email"
              />
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

