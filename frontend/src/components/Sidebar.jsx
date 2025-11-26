import './Sidebar.css'

function Sidebar({ activeItem, onItemClick }) {
  const menuItems = [
    {
      id: 'doctor',
      label: 'Doctor Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="6" r="2.5" fill="currentColor" opacity="0.8"/>
          <circle cx="13" cy="6" r="2.5" fill="currentColor"/>
          <path d="M4 14C4 11.24 6.24 9 9 9H11C13.76 9 16 11.24 16 14V16H4V14Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'loyalty',
      label: 'Loyalty Reward Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5C4 4.45 4.45 4 5 4H15C15.55 4 16 4.45 16 5V15C16 15.55 15.55 16 15 16H5C4.45 16 4 15.55 4 15V5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M4 8H16M8 4V8M12 4V8" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 12H13M7 14H13" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      id: 'executive',
      label: 'Executive Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <circle cx="10" cy="7" r="2.5" fill="currentColor"/>
          <path d="M5 15C5 12.24 7.24 10 10 10C12.76 10 15 12.24 15 15" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      )
    },
    {
      id: 'location',
      label: 'Location Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2C7.24 2 5 4.24 5 7C5 11.25 10 18 10 18C10 18 15 11.25 15 7C15 4.24 12.76 2 10 2Z" fill="currentColor"/>
          <circle cx="10" cy="7" r="2" fill="white"/>
        </svg>
      )
    },
    {
      id: 'user',
      label: 'User Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="12" height="9" rx="1" fill="currentColor"/>
          <path d="M7 8V6C7 4.34 8.34 3 10 3C11.66 3 13 4.34 13 6V8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <circle cx="10" cy="5" r="1" fill="currentColor"/>
        </svg>
      )
    }
  ]

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>
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
    </aside>
  )
}

export default Sidebar

