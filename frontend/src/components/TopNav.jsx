import './TopNav.css'

function TopNav({ user }) {
  const userName = user?.name || 'User'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <nav className="top-nav">
      <div className="top-nav-left">
        <div className="logo-section">
          <div className="logo-icon">LRM</div>
          <span className="logo-text">Loyalty Reward Management</span>
        </div>
      </div>

      <div className="top-nav-right">
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
