import './Sidebar.css'
import { Award, Settings, LogOut } from 'lucide-react'

function Sidebar({ activeItem, onItemClick, userRole, onLogout }) {
  // Menu items - only Loyalty and Settings
  const menuItems = [
    {
      id: 'loyalty',
      label: 'Loyalty Reward Management',
      icon: <Award size={20} />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />
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
      {onLogout && (
        <div className="sidebar-footer">
          <div 
            className="sidebar-item logout-item"
            onClick={onLogout}
          >
            <span className="sidebar-icon"><LogOut size={20} /></span>
            <span className="sidebar-label">Logout</span>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

