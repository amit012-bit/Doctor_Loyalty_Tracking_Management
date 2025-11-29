import { useState } from 'react'
import './Login.css'
import { loginUser } from '../services/User'
import { Mail, Lock, LogIn, Shield, CheckCircle2, Package } from 'lucide-react'

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      const response = await loginUser(formData.email, formData.password)

      if (response.status === 200 && response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
        localStorage.setItem('token', response.data.data.token)
        
        if (onLogin) {
          onLogin(response.data.data)
        }
      } else {
        setError(response.data?.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Network error. Please check your connection and try again.')
      }
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Side - Illustration */}
        <div className="login-illustration">
          <div className="illustration-content">
            <div className="logo-section">
              <div className="logo-icon-large">LRM</div>
              <h1 className="logo-text-large">Loyalty Reward Management</h1>
            </div>
            <h2 className="welcome-title">Welcome Back!</h2>
            <p className="welcome-subtitle">
              Secure delivery management for doctor loyalty rewards. Building trust and compliance between doctors and hospital executives.
            </p>
            <div className="illustration-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <span>Trust & Compliance</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Package size={24} />
                </div>
                <span>Secure Delivery</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <CheckCircle2 size={24} />
                </div>
                <span>Executive Management</span>
              </div>
            </div>
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">Sign In</h1>
              <p className="login-subtitle">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error">
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <Mail size={18} />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <Lock size={18} />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

