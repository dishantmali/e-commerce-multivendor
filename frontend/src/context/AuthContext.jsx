import React, { createContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, check if we have tokens and fetch user profile
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('access_token')
      const savedUser = localStorage.getItem('user')

      if (accessToken && savedUser) {
        try {
          // Verify token is still valid by calling /me
          const res = await api.get('/auth/me/')
          const userData = res.data
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
        } catch {
          // Token expired and refresh also failed — clear everything
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)

    // Fetch user profile from /me endpoint
    try {
      const res = await api.get('/auth/me/')
      const userData = res.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (err) {
      // If /me fails, clear tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
