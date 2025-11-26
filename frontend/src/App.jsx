import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import LoyaltyRewardOverview from './components/LoyaltyRewardOverview'
import Settings from './components/Settings'
import './App.css'
import Login from './components/Login'

function App() {
  const [activeItem, setActiveItem] = useState('loyalty')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData.user)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const handleItemClick = (itemId) => {
    setActiveItem(itemId)
  }

  const renderContent = () => {
    switch (activeItem) {
      case 'loyalty':
        return <LoyaltyRewardOverview />
      case 'settings':
        return <Settings currentUser={user} />
      default:
        return (
          <div className="content-placeholder">
            <h2>{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)} Management</h2>
            <p>Content coming soon...</p>
          </div>
        )
    }
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // Show main app content after successful login
  return (
    <div className="app-container">
      <Sidebar 
        activeItem={activeItem} 
        onItemClick={handleItemClick}
        userRole={user?.role}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
