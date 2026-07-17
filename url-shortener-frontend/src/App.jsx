import { useState } from 'react'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'

const STORAGE_KEY = 'shortnr_token'

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY))

  function handleAuthenticated(newToken) {
    localStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }

  return token ? (
    <Dashboard token={token} onLogout={handleLogout} />
  ) : (
    <AuthScreen onAuthenticated={handleAuthenticated} />
  )
}
