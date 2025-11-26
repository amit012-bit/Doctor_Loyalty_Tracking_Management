import './Sidebar.css'

function Sidebar({ activeItem, onItemClick, userRole, onLogout }) {
  // Menu items - only Loyalty and Settings
  const menuItems = [
    {
      id: 'loyalty',
      label: 'Loyalty Reward Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2L12.5 7.5L18.5 8.5L14.5 12.5L15.5 18.5L10 15.5L4.5 18.5L5.5 12.5L1.5 8.5L7.5 7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16.25 10C16.25 10.0916 16.2417 10.1833 16.225 10.275L17.1917 11.325C17.3 11.4333 17.3417 11.5917 17.3083 11.7333L16.7167 14.1083C16.6667 14.325 16.4917 14.5 16.275 14.5C16.2417 14.5 16.2083 14.5 16.175 14.4917L13.6583 13.8333C13.5417 13.8 13.4167 13.8083 13.3 13.8667L12.1167 14.475C11.95 14.5583 11.7583 14.5833 11.575 14.55L10.9667 14.4333C10.8583 14.4083 10.7417 14.4083 10.6333 14.4333L10.025 14.55C9.84167 14.5833 9.65 14.5583 9.48333 14.475L8.3 13.8667C8.18333 13.8083 8.05833 13.8 7.94167 13.8333L5.425 14.4917C5.39167 14.5 5.35833 14.5 5.325 14.5C5.10833 14.5 4.93333 14.325 4.88333 14.1083L4.29167 11.7333C4.25833 11.5917 4.3 11.4333 4.40833 11.325L5.375 10.275C5.35833 10.1833 5.35 10.0916 5.35 10C5.35 9.90833 5.35833 9.81667 5.375 9.725L4.40833 8.675C4.3 8.56667 4.25833 8.40833 4.29167 8.26667L4.88333 5.89167C4.93333 5.675 5.10833 5.5 5.325 5.5C5.35833 5.5 5.39167 5.5 5.425 5.50833L7.94167 6.16667C8.05833 6.2 8.18333 6.19167 8.3 6.13333L9.48333 5.525C9.65 5.44167 9.84167 5.41667 10.025 5.45L10.6333 5.56667C10.7417 5.59167 10.8583 5.59167 10.9667 5.56667L11.575 5.45C11.7583 5.41667 11.95 5.44167 12.1167 5.525L13.3 6.13333C13.4167 6.19167 13.5417 6.2 13.6583 6.16667L16.175 5.50833C16.2083 5.5 16.2417 5.5 16.275 5.5C16.4917 5.5 16.6667 5.675 16.7167 5.89167L17.3083 8.26667C17.3417 8.40833 17.3 8.56667 17.1917 8.675L16.225 9.725C16.2417 9.81667 16.25 9.90833 16.25 10Z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    }
  ]

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">RewardTrust</h2>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onItemClick && onItemClick(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </div>
        ))}
      </nav>
      {onLogout && (
        <div className="sidebar-footer">
          <div 
            className="sidebar-item logout-item"
            onClick={onLogout}
          >
            <span className="sidebar-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="sidebar-label">Logout</span>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

