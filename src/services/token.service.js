// services/token.service.js
import { ref, readonly, provide, inject } from 'vue'

const authKey = Symbol('auth')

export function createAuth() {
  const isAuthenticated = ref(false)
  const currentUser = ref(null)
  const userAbilities = ref({})
  const isAdmin = ref(false)

  // Check localStorage on initialization
  const initialize = () => {
    const token = localStorage.getItem('auth-token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      const user = JSON.parse(userData)
      setAuth(true, user)
    }
  }

  const setAuth = (status, user, abilities = null) => {
    isAuthenticated.value = status
    currentUser.value = user
    
    if (abilities) {
      userAbilities.value = abilities
    }
    
    // Check if user has admin role
    if (user && user.role) {
      isAdmin.value = user.role.slug === 'admin'
    }
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user')
    isAuthenticated.value = false
    currentUser.value = null
    userAbilities.value = {}
    isAdmin.value = false
  }

  // Toggle function to handle login/logout
  const toggleAuth = () => {
    if (isAuthenticated.value) {
      logout()
    } else {
      // Redirect to login page or open login modal
      // This part would depend on your app's routing/structure
    }
  }

  initialize()

  return {
    isAuthenticated: readonly(isAuthenticated),
    currentUser: readonly(currentUser),
    userAbilities: readonly(userAbilities),
    isAdmin: readonly(isAdmin),
    setAuth,
    logout,
    toggleAuth
  }
}

export function provideAuth() {
  const auth = createAuth()
  provide(authKey, auth)
  return auth
}

export function useAuth() {
  const auth = inject(authKey)
  if (!auth) {
    throw new Error('Auth was not provided')
  }
  return auth
}