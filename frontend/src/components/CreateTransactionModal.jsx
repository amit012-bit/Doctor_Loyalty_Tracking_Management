import { useState, useEffect } from 'react'
import './CreateTransactionModal.css'
import { X, Plus } from 'lucide-react'
import { createTransaction } from '../services/Transaction'
import { getUsers } from '../services/User'
import { getLocations } from '../services/Location'

function CreateTransactionModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [doctors, setDoctors] = useState([])
  const [executives, setExecutives] = useState([])
  const [locations, setLocations] = useState([])
  const [formData, setFormData] = useState({
    doctorId: '',
    executiveId: '',
    locationId: '',
    amount: '',
    paymentMode: 'Cash',
    monthYear: '',
    date: ''
  })

  // Fetch doctors, executives, and locations
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [usersRes, locationsRes] = await Promise.all([
            getUsers(),
            getLocations()
          ])

          if (usersRes.data.success) {
            const users = usersRes.data.data.users || []
            setDoctors(users.filter(u => u.role === 'doctor'))
            setExecutives(users.filter(u => u.role === 'executive'))
          }

          console.log(doctors)

          if (locationsRes.data.success) {
            setLocations(locationsRes.data.data.locations || [])
          }
        } catch (err) {
          console.error('Error fetching data:', err)
        }
      }

      fetchData()
    }
  }, [isOpen])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        doctorId: '',
        executiveId: '',
        locationId: '',
        amount: '',
        paymentMode: 'Cash',
        monthYear: '',
        date: ''
      })
      setError('')
    } else {
      // Set current month/year as default
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()
      setFormData(prev => ({
        ...prev,
        monthYear: `${month}/${year}`,
        date: now.toISOString().split('T')[0]
      }))
    }
  }, [isOpen])

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
      // Format monthYear to MM/YYYY if needed
      let monthYear = formData.monthYear
      if (!monthYear.match(/^\d{2}\/\d{4}$/)) {
        // If user entered YYYY-MM format, convert to MM/YYYY
        if (monthYear.match(/^\d{4}-\d{2}$/)) {
          const [year, month] = monthYear.split('-')
          monthYear = `${month}/${year}`
        }
      }

      // Set status based on whether executive is assigned
      // If executive is assigned -> in_progress, if not -> pending
      const finalStatus = formData.executiveId ? 'in_progress' : 'pending'

      const transactionData = {
        doctorId: formData.doctorId,
        executiveId: formData.executiveId || null,
        locationId: formData.locationId,
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        monthYear: monthYear,
        status: finalStatus,
        deliveryDate: formData.date || null
      }

      const response = await createTransaction(transactionData)

      if (response.status === 201 && response.data.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.data?.message || 'Failed to create transaction')
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        const errors = err.response.data.errors
        setError(errors.map(e => e.msg).join(', '))
      } else {
        setError('Network error. Please check your connection and try again.')
      }
      console.error('Create transaction error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Transaction</h2>
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
              <label htmlFor="doctorId" className="form-label">
                Doctor *
              </label>
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="executiveId" className="form-label">
                Executive (Optional)
              </label>
              <select
                id="executiveId"
                name="executiveId"
                value={formData.executiveId}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select Executive (Optional)</option>
                {executives.map((executive) => (
                  <option key={executive._id} value={executive._id}>
                    {executive.name}
                  </option>
                ))}
              </select>
              <small className="form-hint">
                {formData.executiveId 
                  ? 'Transaction will be created with "In Progress" status' 
                  : 'Leave empty to create with "Pending" status'}
              </small>
            </div>

            <div className="form-group">
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
                  <option key={location._id || location.id} value={location._id || location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount" className="form-label">
                Amount (₹) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMode" className="form-label">
                Payment Mode *
              </label>
              <select
                id="paymentMode"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="monthYear" className="form-label">
                Month/Year (MM/YYYY) *
              </label>
              <input
                type="text"
                id="monthYear"
                name="monthYear"
                value={formData.monthYear}
                onChange={handleChange}
                className="form-input"
                placeholder="MM/YYYY (e.g., 12/2025)"
                pattern="^(0[1-9]|1[0-2])\/\d{4}$"
                required
              />
              <small className="form-hint">Format: MM/YYYY (e.g., 12/2025)</small>
            </div>

            <div className="form-group">
              <label htmlFor="date" className="form-label">
                Delivery Date (Optional)
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <Plus size={18} />
                  Create Transaction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTransactionModal

