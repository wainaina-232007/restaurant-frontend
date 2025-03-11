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
    // If user is already authenticated, perform logout instead
    if (isAuthenticated.value) {
      logout()
      return
    }
    
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

  initialize()

  return {
    isAuthenticated: readonly(isAuthenticated),
    currentUser: readonly(currentUser),
    userAbilities: readonly(userAbilities),
    isAdmin: readonly(isAdmin),
    setAuth,
    logout
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