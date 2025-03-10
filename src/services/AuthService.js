// auth.service.js
import { ref, computed } from 'vue'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_data'

// Reactive state
const isAuthenticated = ref(false)
const currentUser = ref(null)
const userRole = ref(null)

// Initialize the authentication state from localStorage on service creation
function initAuth() {
  const token = localStorage.getItem(TOKEN_KEY)
  const userData = localStorage.getItem(USER_KEY)
  
  if (token && userData) {
    isAuthenticated.value = true
    try {
      const user = JSON.parse(userData)
      currentUser.value = user
      userRole.value = user.role || 'customer'
    } catch (e) {
      console.error('Failed to parse user data:', e)
      logout() // Clear invalid data
    }
  }
}

// Login function
function login(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  isAuthenticated.value = true
  currentUser.value = user
  userRole.value = user.role || 'customer'
}

// Logout function
function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  isAuthenticated.value = false
  currentUser.value = null
  userRole.value = null
}

// Get the current token
function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// Check if the user has a specific role
function hasRole(role) {
  return userRole.value === role
}

// Check if the user has admin access
const isAdmin = computed(() => {
  return userRole.value === 'admin' || userRole.value === 'manager'
})

// Initialize auth state
initAuth()

export const useAuth = () => {
  return {
    isAuthenticated,
    currentUser,
    userRole,
    isAdmin,
    login,
    logout,
    getToken,
    hasRole
  }
}