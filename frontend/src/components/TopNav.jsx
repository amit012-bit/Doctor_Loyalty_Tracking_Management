import { useState, useEffect } from 'react'
import './TopNav.css'
import { Menu, X, Power } from 'lucide-react'
import { getPlatformSettings, updatePlatformSettings } from '../services/PlatformSettings'

function TopNav({ user, onMenuClick, isSidebarOpen }) {
  const userName = user?.name || 'User'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const [platformEnabled, setPlatformEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const canTogglePlatform = user?.role === 'admin' || user?.role === 'superadmin'

  useEffect(() => {
    if (canTogglePlatform) {
      fetchPlatformSettings()
    }
  }, [canTogglePlatform])

  const fetchPlatformSettings = async () => {
    try {
      const response = await getPlatformSettings()
      if (response.data.success) {
        setPlatformEnabled(response.data.data.settings.isEnabled)
      }
    } catch (err) {
      console.error('Error fetching platform settings:', err)
    }
  }

  const handleTogglePlatform = async () => {
    if (!canTogglePlatform) return
    
    setLoading(true)
    try {
      const newStatus = !platformEnabled
      const response = await updatePlatformSettings(newStatus)
      if (response.data.success) {
        setPlatformEnabled(newStatus)
      }
    } catch (err) {
      console.error('Error updating platform settings:', err)
      alert(err.response?.data?.message || 'Failed to update platform status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="top-nav">
      <div className="top-nav-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="logo-section">
          <div className="logo-icon">LRM</div>
          <span className="logo-text">Loyalty Reward Management</span>
        </div>
      </div>

      <div className="top-nav-right">
        {canTogglePlatform && (
          <div className="platform-toggle-container">
            <span className="platform-toggle-label">Platform available</span>
            <label className="platform-toggle-switch" title={platformEnabled ? 'Platform is enabled - Click to disable' : 'Platform is disabled - Click to enable'}>
              <input
                type="checkbox"
                checked={platformEnabled}
                onChange={handleTogglePlatform}
                disabled={loading}
              />
              <span className="platform-toggle-slider"></span>
            </label>
          </div>
        )}
        <div className="user-avatar" title={userName}>
          {user?.name ? (
            <div className="avatar-initials">{userInitials}</div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 17C5 13.6863 7.68629 11 11 11H9C12.3137 11 15 13.6863 15 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </div>
      </div>
    </nav>
  )
}

export default TopNav
