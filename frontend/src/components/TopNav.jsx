import { useState } from 'react'
import './TopNav.css'

function TopNav({ user }) {
  const [theme, setTheme] = useState('light')

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const userName = user?.name || 'User'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <nav className="top-nav">
      <div className="top-nav-left">
        <div className="logo-section">
          <div className="logo-icon">RT</div>
          <span className="logo-text">RewardTrust</span>
        </div>
      </div>

      <div className="top-nav-center">
        <div className="search-container">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="search-icon">
            <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="top-nav-right">
        <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 2V4M10 16V18M18 10H16M4 10H2M16.364 3.636L14.95 5.05M5.05 14.95L3.636 16.364M16.364 16.364L14.95 14.95M5.05 5.05L3.636 3.636" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3C10 4.10457 9.10457 5 8 5C6.89543 5 6 4.10457 6 3C6 1.89543 6.89543 1 8 1C9.10457 1 10 1.89543 10 3Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16 10C16 11.1046 15.1046 12 14 12C12.8954 12 12 11.1046 12 10C12 8.89543 12.8954 8 14 8C15.1046 8 16 8.89543 16 10Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 17C10 18.1046 9.10457 19 8 19C6.89543 19 6 18.1046 6 17C6 15.8954 6.89543 15 8 15C9.10457 15 10 15.8954 10 17Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 10C4 11.1046 3.10457 12 2 12C0.895431 12 0 11.1046 0 10C0 8.89543 0.895431 8 2 8C3.10457 8 4 8.89543 4 10Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10C10 11.1046 9.10457 12 8 12C6.89543 12 6 11.1046 6 10C6 8.89543 6.89543 8 8 8C9.10457 8 10 8.89543 10 10Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8C13.1046 8 14 8.89543 14 10Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          )}
        </button>
        <button className="nav-icon-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2C8.89543 2 8 2.89543 8 4V5C5.79086 5 4 6.79086 4 9V13L2 15H18L16 13V9C16 6.79086 14.2091 5 12 5V4C12 2.89543 11.1046 2 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="notification-badge">3</span>
        </button>
        <button className="nav-icon-btn" title="Messages">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 9C18 13.4183 14.4183 17 10 17C8.70235 17 7.49636 16.6264 6.47634 16L2 18L3.5 13.5C2.50397 12.3044 2 10.7064 2 9C2 4.58172 5.58172 1 10 1C14.4183 1 18 4.58172 18 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="nav-icon-btn" title="Language">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 10H18M10 2C11.9861 4.45484 13.0297 7.71014 13 11C12.9703 14.2899 11.9861 17.5452 10 20M10 2C8.01392 4.45484 6.97027 7.71014 7 11C7.02973 14.2899 8.01392 17.5452 10 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
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
