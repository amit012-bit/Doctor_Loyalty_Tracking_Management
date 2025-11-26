import { useState, useEffect } from 'react'
import './TopNav.css'
import { Search, Bell, MessageCircle, Sun, Moon, Globe, User } from 'lucide-react'

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
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="top-nav-right">
        <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="nav-icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <button className="nav-icon-btn" title="Messages">
          <MessageCircle size={20} />
        </button>
        <button className="nav-icon-btn" title="Language">
          <Globe size={20} />
        </button>
        <div className="user-avatar" title={userName}>
          {user?.name ? (
            <div className="avatar-initials">{userInitials}</div>
          ) : (
            <User size={20} />
          )}
        </div>
      </div>
    </nav>
  )
}

export default TopNav

