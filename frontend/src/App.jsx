import { useState } from 'react'
import Sidebar from './components/Sidebar'
import LoyaltyRewardOverview from './components/LoyaltyRewardOverview'
import './App.css'
import Login from './components/Login'

function App() {
  const [activeItem, setActiveItem] = useState('loyalty')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (userData) => {
    // Set authenticated state after successful login
    setIsAuthenticated(true)
  }

  const handleItemClick = (itemId) => {
    setActiveItem(itemId)
  }

  const renderContent = () => {
    switch (activeItem) {
      case 'loyalty':
        return <LoyaltyRewardOverview />
      case 'doctor':
      case 'executive':
      case 'location':
      case 'user':
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
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
