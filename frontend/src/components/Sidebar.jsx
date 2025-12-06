import './Sidebar.css'
import { Stethoscope, Activity, Shield } from 'lucide-react'

function Sidebar({ activeItem, onItemClick, userRole, onLogout, isOpen, onClose }) {
  // All possible menu items
  const allMenuItems = [
    {
      id: 'loyalty',
      label: 'Dashboard',
      icon: <Activity size={20} />,
      roles: ['admin', 'superadmin', 'accountant', 'executive', 'doctor'] // All roles can see dashboard
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: (
        <Stethoscope size={20} />
      ),
      roles: ['admin', 'superadmin', 'accountant'] // Executives cannot see doctors/executives tabs
    },
    {
      id: 'executives',
      label: 'Executives',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 17C5 13.6863 7.68629 11 11 11H9C12.3137 11 15 13.6863 15 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      roles: ['admin', 'superadmin', 'accountant'] // Executives cannot see doctors/executives tabs
    },
    {
      id: 'admins',
      label: 'Admins',
      icon: <Shield size={20} />,
      roles: ['superadmin'] // Only superadmin can access admins tab
    }
  ]
  
  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  )

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <h2 className="sidebar-title">
        <span className="sidebar-title-icon">LRM</span>
        Loyalty Reward
      </h2>
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
      <div className="sidebar-footer">
        {onItemClick && (
          <div 
            className={`sidebar-item profile-item ${activeItem === 'profile' ? 'active' : ''}`}
            onClick={() => onItemClick('profile')}
          >
            <span className="sidebar-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 17C5 13.6863 7.68629 11 11 11H9C12.3137 11 15 13.6863 15 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="sidebar-label">My Profile</span>
          </div>
        )}
        {onLogout && (
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
        )}
      </div>
    </aside>
  )
}

export default Sidebar

