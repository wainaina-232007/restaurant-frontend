// auth.service.js
import { ref, computed, watch } from 'vue'
import router from '../router/router'
import ApiService from './api.service'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_data'
const TOKEN_EXPIRY_KEY = 'token_expiry'

// Reactive state
const isAuthenticated = ref(false)
const currentUser = ref(null)
const userRole = ref(null)
const isLoading = ref(false)
const authError = ref(null)

/**
 * Initialize the authentication state from localStorage on service creation
 */
function initAuth() {
  const token = localStorage.getItem(TOKEN_KEY)
  const userData = localStorage.getItem(USER_KEY)
  const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  
  if (token && userData) {
    // Check if token is expired
    if (tokenExpiry && new Date().getTime() > parseInt(tokenExpiry)) {
      console.warn('Token has expired')
      logout()
      return
    }
    
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

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise with login result
 */
async function loginWithCredentials(email, password) {
  isLoading.value = true
  authError.value = null
  
  try {
    const response = await ApiService.post('/auth/login', { email, password })
    const { token, user, expiresIn } = response.data
    
    // Calculate token expiry time if provided
    let expiryTime = null
    if (expiresIn) {
      expiryTime = new Date().getTime() + expiresIn * 1000
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    }
    
    login(token, user)
    return user
  } catch (error) {
    authError.value = error.response?.data?.message || 'Authentication failed'
    throw error
  } finally {
    isLoading.value = false
  }
}

/**
 * Set authentication state after successful login
 * @param {string} token - JWT token
 * @param {object} user - User data object
 */
function login(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  isAuthenticated.value = true
  currentUser.value = user
  userRole.value = user.role || 'customer'
}

/**
 * Logout user and clear authentication state
 * @param {boolean} redirectToLogin - Whether to redirect to login page
 */
async function logout(redirectToLogin = true) {
  // Call logout endpoint if user is authenticated
  if (isAuthenticated.value) {
    try {
      await ApiService.post('/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    }
  }
  
  // Clear local storage and state
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
  isAuthenticated.value = false
  currentUser.value = null
  userRole.value = null
  
  // Redirect to login page if requested
  if (redirectToLogin) {
    router.push({ name: 'Login' })
  }
}

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise} - Promise with registration result
 */
async function register(userData) {
  isLoading.value = true
  authError.value = null
  
  try {
    const response = await ApiService.post('/auth/register', userData)
    return response.data
  } catch (error) {
    authError.value = error.response?.data?.message || 'Registration failed'
    throw error
  } finally {
    isLoading.value = false
  }
}

/**
 * Update the current user's profile
 * @param {object} profileData - Updated profile data
 * @returns {Promise} - Promise with updated user data
 */
async function updateProfile(profileData) {
  isLoading.value = true
  
  try {
    const response = await ApiService.put('/user/profile', profileData)
    const updatedUser = response.data
    
    // Update stored user data
    currentUser.value = updatedUser
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
    
    return updatedUser
  } catch (error) {
    console.error('Profile update error:', error)
    throw error
  } finally {
    isLoading.value = false
  }
}

/**
 * Get the current authentication token
 * @returns {string|null} - JWT token or null if not authenticated
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Check if the user has a specific role
 * @param {string|array} roles - Role or array of roles to check
 * @returns {boolean} - Whether user has any of the specified roles
 */
function hasRole(roles) {
  if (!userRole.value) return false
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole.value)
  }
  
  return userRole.value === roles
}

/**
 * Check if token needs refreshing
 * @returns {boolean} - Whether token should be refreshed
 */
function shouldRefreshToken() {
  const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!tokenExpiry) return false
  
  const expiryTime = parseInt(tokenExpiry)
  const currentTime = new Date().getTime()
  
  // Return true if token expires in less than 5 minutes
  return (expiryTime - currentTime) < 5 * 60 * 1000
}

/**
 * Refresh the authentication token
 * @returns {Promise} - Promise with refresh result
 */
async function refreshToken() {
  try {
    const response = await ApiService.post('/auth/refresh')
    const { token, expiresIn } = response.data
    
    // Update token and expiry
    localStorage.setItem(TOKEN_KEY, token)
    
    if (expiresIn) {
      const expiryTime = new Date().getTime() + expiresIn * 1000
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    }
    
    return token
  } catch (error) {
    console.error('Token refresh failed:', error)
    logout()
    throw error
  }
}

// Computed properties
const isAdmin = computed(() => {
  return hasRole(['admin', 'manager'])
})

const isCustomer = computed(() => {
  return hasRole('customer')
})

// Initialize auth state
initAuth()

// Export auth composable
export const useAuth = () => {
  return {
    // State
    isAuthenticated,
    currentUser,
    userRole,
    isLoading,
    authError,
    
    // Computed
    isAdmin,
    isCustomer,
    
    // Methods
    login,
    loginWithCredentials,
    logout,
    register,
    updateProfile,
    getToken,
    hasRole,
    refreshToken,
    shouldRefreshToken
  }
}