// api.config.js

import axios from 'axios'

// Get the API base URL from environment variables or use a default
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create an axios instance with default configuration
const api = axios.create({
  baseURL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add response interceptor for global error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors (expired or invalid token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api