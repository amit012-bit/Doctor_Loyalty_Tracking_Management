import { useState, useEffect } from 'react'
import './CreateTransactionModal.css'
import { X } from 'lucide-react'
import { getDoctorById, createDoctor, updateDoctor } from '../services/Doctor'
import { getExecutiveById, createExecutive, updateExecutive } from '../services/Executive'
import { getLocations } from '../services/Location'

function UserModal({ isOpen, onClose, onSuccess, personId, userRole: defaultRole }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [locations, setLocations] = useState([])
  const isDoctor = defaultRole === 'doctor'
  const isExecutive = defaultRole === 'executive'
  
  // Initialize form data based on role
  const getInitialFormData = () => {
    if (isDoctor) {
      return {
        name: '',
        mobileNumber: '',
        clinicName: '',
        locationId: '',
        status: 'active'
      }
    } else if (isExecutive) {
      return {
        name: '',
        phoneNumber: '',
        locationId: '',
        status: 'active'
      }
    }
    return {}
  }

  const [formData, setFormData] = useState(getInitialFormData())

  // Fetch locations on mount
  useEffect(() => {
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
    if (isOpen) {
      fetchLocations()
    }
  }, [isOpen])

  // Fetch data if editing
  useEffect(() => {
    if (isOpen && personId) {
      setIsEditMode(true)
      const fetchData = async () => {
        try {
          let response
          if (isDoctor) {
            response = await getDoctorById(personId)
            if (response.data.success) {
              const doctor = response.data.data.doctor
              const phoneDisplay = doctor.mobileNumber ? doctor.mobileNumber.replace(/^\+91-?/, '').substring(0, 10) : ''
              const locationId = doctor.locationId?._id || doctor.locationId || ''
              
              setFormData({
                name: doctor.name || '',
                mobileNumber: phoneDisplay,
                clinicName: doctor.clinicName || '',
                locationId: locationId,
                status: doctor.status || 'active'
              })
            }
          } else if (isExecutive) {
            response = await getExecutiveById(personId)
            if (response.data.success) {
              const executive = response.data.data.executive
              const phoneDisplay = executive.phoneNumber ? executive.phoneNumber.replace(/^\+91-?/, '').substring(0, 10) : ''
              
              setFormData({
                name: executive.name || '',
                phoneNumber: phoneDisplay,
                locationId: executive.locationId?._id || executive.locationId || '',
                status: executive.status || 'active'
              })
            }
          }
        } catch (err) {
          console.error('Error fetching data:', err)
          setError(`Failed to load ${isDoctor ? 'doctor' : 'executive'} data`)
        }
      }
      fetchData()
    } else if (isOpen && !personId) {
      setIsEditMode(false)
      setFormData(getInitialFormData())
    }
  }, [isOpen, personId, isDoctor, isExecutive])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(getInitialFormData())
      setError('')
      setIsEditMode(false)
    }
  }, [isOpen, isDoctor, isExecutive])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Special handling for phone numbers - only allow 10 digits
    if (name === 'mobileNumber' || name === 'phoneNumber') {
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

  const handleLocationChange = (e) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      locationId: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (isDoctor) {
        if (!formData.name || !formData.mobileNumber || !formData.clinicName || !formData.locationId) {
          setError('Please fill in all required fields')
          setLoading(false)
          return
        }
      } else if (isExecutive) {
        if (!formData.name || !formData.phoneNumber || !formData.locationId) {
          setError('Please fill in all required fields')
          setLoading(false)
          return
        }
      }
      
      // Validate phone number: ensure we have 10 digits
      const phoneField = isDoctor ? 'mobileNumber' : 'phoneNumber'
      const phoneDigits = formData[phoneField].replace(/\D/g, '')
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

      // Format phone number as +91XXXXXXXXXX (backend will normalize to +91-XXXXXXXXXX)
      const phoneNumber = `+91${phoneDigits}`

      let response
      if (isDoctor) {
        const doctorData = {
          name: formData.name,
          mobileNumber: phoneNumber,
          clinicName: formData.clinicName,
          locationId: formData.locationId,
          status: formData.status
        }
        if (isEditMode) {
          response = await updateDoctor(personId, doctorData)
        } else {
          response = await createDoctor(doctorData)
        }
      } else if (isExecutive) {
        const executiveData = {
          name: formData.name,
          phoneNumber: phoneNumber,
          locationId: formData.locationId,
          status: formData.status
        }
        if (isEditMode) {
          response = await updateExecutive(personId, executiveData)
        } else {
          response = await createExecutive(executiveData)
        }
      }

      if (response?.data.success) {
        onSuccess()
        onClose()
      }
    } catch (err) {
      const entityName = isDoctor ? 'doctor' : 'executive'
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} ${entityName}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const title = isDoctor 
    ? (isEditMode ? 'Edit Doctor' : 'Add New Doctor')
    : (isEditMode ? 'Edit Executive' : 'Add New Executive')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
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
                placeholder={`Enter ${isDoctor ? 'doctor' : 'executive'} name`}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor={isDoctor ? 'mobileNumber' : 'phoneNumber'} className="form-label">
                {isDoctor ? 'Mobile' : 'Phone'} Number *
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
                  id={isDoctor ? 'mobileNumber' : 'phoneNumber'}
                  name={isDoctor ? 'mobileNumber' : 'phoneNumber'}
                  value={formData[isDoctor ? 'mobileNumber' : 'phoneNumber'] || ''}
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

            {isDoctor && (
              <div className="form-group full-width">
                <label htmlFor="clinicName" className="form-label">
                  Clinic Name *
                </label>
                <input
                  type="text"
                  id="clinicName"
                  name="clinicName"
                  value={formData.clinicName || ''}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter clinic name"
                  maxLength={200}
                />
              </div>
            )}

            <div className="form-group full-width">
              <label htmlFor="locationId" className="form-label">
                Location *
              </label>
              <select
                id="locationId"
                name="locationId"
                value={formData.locationId || ''}
                onChange={handleLocationChange}
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

            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'active'}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? `Update ${isDoctor ? 'Doctor' : 'Executive'}` : `Create ${isDoctor ? 'Doctor' : 'Executive'}`)}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserModal
