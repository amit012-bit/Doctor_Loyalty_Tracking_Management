import { useState, useEffect } from 'react'
import './Settings.css'
import { Plus, X, CheckCircle2 } from 'lucide-react'
import { registerUser, getLocations } from '../services/User'

function Settings({ currentUser }) {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    locationId: ''
  })

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getLocations()
        if (response.data.success) {
          setLocations(response.data.data.locations)
          if (response.data.data.locations.length > 0 && !formData.locationId) {
            setFormData(prev => ({ ...prev, locationId: response.data.data.locations[0].id }))
          }
        }
      } catch (err) {
        console.error('Error fetching locations:', err)
      }
    }
    fetchLocations()
  }, [])

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
      const response = await registerUser(formData)
      
      if (response.status === 201 && response.data.success) {
        setSuccess('User created successfully!')
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'doctor',
          locationId: locations.length > 0 ? locations[0].id : ''
        })
      } else {
        setError(response.data?.message || 'Failed to create user')
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Network error. Please check your connection and try again.')
      }
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-page">
      <h1 className="settings-page-title">Settings</h1>

      <div className="settings-card">
        <div className="settings-card-header">
          <h2 className="settings-card-title">Add New User</h2>
        </div>

        <form onSubmit={handleSubmit} className="add-user-form">
          {error && (
            <div className="form-message form-error">
              <X size={18} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="form-message form-success">
              <CheckCircle2 size={18} />
              <span>{success}</span>
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
                placeholder="Enter full name"
                required
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
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter password (min 6 characters)"
                required
                minLength={6}
              />
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
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              'Creating User...'
            ) : (
              <>
                <Plus size={18} />
                Create User
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Settings

