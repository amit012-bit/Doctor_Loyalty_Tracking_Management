import { useState, useEffect } from 'react'
import './CreateTransactionModal.css'
import { X, Plus, Upload, FileSpreadsheet } from 'lucide-react'
import { createTransaction, createBulkTransactions } from '../services/Transaction'
import { getUsers } from '../services/User'
import { getLocations } from '../services/Location'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

function CreateTransactionModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('individual') // 'individual' or 'bulk'
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
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadPreview, setUploadPreview] = useState(null)
  const [bulkError, setBulkError] = useState('')

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
      setActiveTab('individual')
      setUploadedFile(null)
      setUploadPreview(null)
      setBulkError('')
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setBulkError('')
    setUploadedFile(file)

    // Parse file based on extension
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setBulkError(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`)
            return
          }
          setUploadPreview(results.data.slice(0, 5)) // Preview first 5 rows
        },
        error: (error) => {
          setBulkError(`Error parsing CSV: ${error.message}`)
        }
      })
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)
          setUploadPreview(jsonData.slice(0, 5)) // Preview first 5 rows
        } catch (error) {
          setBulkError(`Error parsing Excel file: ${error.message}`)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      setBulkError('Unsupported file format. Please upload CSV or Excel files.')
      setUploadedFile(null)
    }
  }

  const mapRowToTransaction = (row) => {
    // Expected columns: Doctor Name, Executive Name (optional), Location Name, Amount, Payment Mode, Month/Year, Delivery Date (optional)
    const doctorName = row['Doctor Name'] || row['Doctor'] || row['doctor'] || row['doctorName']
    const executiveName = row['Executive Name'] || row['Executive'] || row['executive'] || row['executiveName'] || ''
    const locationName = row['Location Name'] || row['Location'] || row['location'] || row['locationName']
    const amount = row['Amount'] || row['amount']
    const paymentMode = row['Payment Mode'] || row['PaymentMode'] || row['paymentMode'] || row['Payment Mode'] || 'Cash'
    const monthYear = row['Month/Year'] || row['MonthYear'] || row['monthYear'] || row['Month/Year']
    const deliveryDate = row['Delivery Date'] || row['DeliveryDate'] || row['deliveryDate'] || row['Delivery Date'] || ''

    // Find doctor by name
    const doctor = doctors.find(d => 
      d.name.toLowerCase() === doctorName?.toLowerCase()?.trim()
    )
    if (!doctor) {
      throw new Error(`Doctor "${doctorName}" not found`)
    }

    // Find executive by name (optional)
    let executive = null
    if (executiveName && executiveName.trim()) {
      executive = executives.find(e => 
        e.name.toLowerCase() === executiveName.toLowerCase().trim()
      )
      if (!executive) {
        throw new Error(`Executive "${executiveName}" not found`)
      }
    }

    // Find location by name
    const location = locations.find(l => 
      l.name.toLowerCase() === locationName?.toLowerCase()?.trim()
    )
    if (!location) {
      throw new Error(`Location "${locationName}" not found`)
    }

    // Format monthYear to MM/YYYY if needed
    let formattedMonthYear = monthYear
    if (monthYear && !monthYear.match(/^\d{2}\/\d{4}$/)) {
      // Try to parse different formats
      if (monthYear.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = monthYear.split('-')
        formattedMonthYear = `${month}/${year}`
      } else if (monthYear.match(/^\d{1,2}\/\d{4}$/)) {
        const [month, year] = monthYear.split('/')
        formattedMonthYear = `${month.padStart(2, '0')}/${year}`
      }
    }

    return {
      doctorId: doctor._id,
      executiveId: executive?._id || null,
      locationId: location._id || location.id,
      amount: parseFloat(amount),
      paymentMode: paymentMode === 'Online Transfer' ? 'Online Transfer' : 'Cash',
      monthYear: formattedMonthYear,
      deliveryDate: deliveryDate || null
    }
  }

  const handleBulkSubmit = async () => {
    if (!uploadedFile) {
      setBulkError('Please upload a file first')
      return
    }

    setBulkError('')
    setLoading(true)

    try {
      const fileExtension = uploadedFile.name.split('.').pop().toLowerCase()
      let parsedData = []

      if (fileExtension === 'csv') {
        Papa.parse(uploadedFile, {
          header: true,
          complete: async (results) => {
            if (results.errors.length > 0) {
              setBulkError(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`)
              setLoading(false)
              return
            }
            parsedData = results.data.filter(row => {
              // Filter out empty rows
              return row['Doctor Name'] || row['Doctor'] || row['doctor'] || row['doctorName']
            })
            await processBulkTransactions(parsedData)
          },
          error: (error) => {
            setBulkError(`Error parsing CSV: ${error.message}`)
            setLoading(false)
          }
        })
      } else if (['xlsx', 'xls'].includes(fileExtension)) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            parsedData = XLSX.utils.sheet_to_json(firstSheet).filter(row => {
              // Filter out empty rows
              return row['Doctor Name'] || row['Doctor'] || row['doctor'] || row['doctorName']
            })
            await processBulkTransactions(parsedData)
          } catch (error) {
            setBulkError(`Error parsing Excel file: ${error.message}`)
            setLoading(false)
          }
        }
        reader.readAsArrayBuffer(uploadedFile)
      }
    } catch (err) {
      setBulkError(`Error processing file: ${err.message}`)
      setLoading(false)
    }
  }

  const processBulkTransactions = async (parsedData) => {
    try {
      const transactions = []
      const errors = []

      for (let i = 0; i < parsedData.length; i++) {
        try {
          const transaction = mapRowToTransaction(parsedData[i])
          transactions.push(transaction)
        } catch (error) {
          errors.push({
            row: i + 2, // +2 because row 1 is header, and arrays are 0-indexed
            error: error.message
          })
        }
      }

      if (transactions.length === 0) {
        setBulkError('No valid transactions found in the file')
        setLoading(false)
        return
      }

      const response = await createBulkTransactions(transactions)

      if (response.status === 201 && response.data.success) {
        const successMsg = response.data.message
        if (errors.length > 0) {
          const errorDetails = errors.map(e => `Row ${e.row}: ${e.error}`).join('\n')
          setBulkError(`${successMsg}\n\nErrors:\n${errorDetails}`)
        } else {
          onSuccess()
          onClose()
        }
      } else {
        setBulkError(response.data?.message || 'Failed to create bulk transactions')
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setBulkError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors
        setBulkError(errors.map(e => e.msg || e.message).join(', '))
      } else {
        setBulkError('Network error. Please check your connection and try again.')
      }
      console.error('Bulk create transaction error:', err)
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

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'individual' ? 'active' : ''}`}
            onClick={() => setActiveTab('individual')}
          >
            Individual
          </button>
          <button
            className={`modal-tab ${activeTab === 'bulk' ? 'active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            Bulk Upload
          </button>
        </div>

        {activeTab === 'individual' ? (
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
        ) : (
          <div className="transaction-form">
            <div className="bulk-upload-section">
              <div className="file-upload-area">
                <input
                  type="file"
                  id="file-upload"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <Upload size={24} />
                  <span>Click to upload or drag and drop</span>
                  <small>CSV or Excel files only</small>
                </label>
              </div>

              {uploadedFile && (
                <div className="file-info">
                  <FileSpreadsheet size={20} />
                  <span>{uploadedFile.name}</span>
                </div>
              )}

              {uploadPreview && uploadPreview.length > 0 && (
                <div className="upload-preview">
                  <h4>Preview (first 5 rows):</h4>
                  <div className="preview-table-container">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {Object.keys(uploadPreview[0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadPreview.map((row, idx) => (
                          <tr key={idx}>
                            {Object.keys(uploadPreview[0]).map((key) => (
                              <td key={key}>{row[key] || ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bulk-upload-info">
                <h4>Expected CSV/Excel Format:</h4>
                <p>Your file should have the following columns(as it is mentioned below):</p>
                <ul>
                  <li><strong>Doctor Name</strong> (required) - Must match an existing doctor name</li>
                  <li><strong>Executive Name</strong> (optional) - Must match an existing executive name if provided</li>
                  <li><strong>Location Name</strong> (required) - Must match an existing location name</li>
                  <li><strong>Amount</strong> (required) - Numeric value</li>
                  <li><strong>Payment Mode</strong> (optional) - "Cash" or "Online Transfer" (defaults to "Cash")</li>
                  <li><strong>Month/Year</strong> (required) - Format: MM/YYYY (e.g., 12/2025)</li>
                  <li><strong>Delivery Date</strong> (optional) - Format: YYYY-MM-DD</li>
                </ul>
              </div>

              {bulkError && (
                <div className={`form-error-message ${bulkError.includes('Successfully') ? 'form-success-message' : ''}`}>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{bulkError}</pre>
                </div>
              )}

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
                  type="button"
                  className="btn-submit"
                  onClick={handleBulkSubmit}
                  disabled={loading || !uploadedFile}
                >
                  {loading ? (
                    'Processing...'
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload & Create Transactions
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateTransactionModal
