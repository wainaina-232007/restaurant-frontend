<template>
  <v-main>
    <v-container fluid fill-height class="login-background">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card elevation="10" class="pa-6 rounded-lg">
            <v-form @submit.prevent="login" ref="form">
              <div class="text-center mb-6">
                <h1 class="text-h4 font-weight-bold teal--text text--darken-2">Welcome Back</h1>
                <p class="text-subtitle-1 mt-2">Log in to your Restaurant Island account</p>
              </div>

              <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>

              <v-text-field
                v-model="email"
                label="Email"
                prepend-inner-icon="mdi-email"
                :rules="[
                  (v) => !!v || 'Email is required',
                  (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
                ]"
                required
                outlined
                dense
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                prepend-inner-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                @click:append="showPassword = !showPassword"
                :rules="[(v) => !!v || 'Password is required']"
                required
                outlined
                dense
              ></v-text-field>

              <div class="d-flex justify-space-between align-center mb-2">
                <v-checkbox
                  v-model="rememberMe"
                  label="Remember me"
                  color="teal darken-2"
                  hide-details
                  dense
                ></v-checkbox>
                <a href="#" class="teal--text text--darken-2 text-body-2">Forgot password?</a>
              </div>

              <v-btn
                block
                color="teal darken-2"
                dark
                class="mt-4"
                large
                type="submit"
                :loading="loading"
              >
                Log In
              </v-btn>

              <div class="text-center mt-6">
                <p>
                  Don't have an account?
                  <router-link to="/signup" class="teal--text text--darken-2 font-weight-medium"
                    >Sign Up</router-link
                  >
                </p>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuth } from '../services/token.service'

const router = useRouter()
const { setAuth } = useAuth()

const form = ref(null)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')

// Define the API base URL - adjust this as needed
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const login = async () => {
  const isValid = form.value.validate()

  if (!isValid) return

  loading.value = true
  errorMessage.value = ''

  try {
    // Updated endpoint path - adjust based on your actual Laravel routes
    const response = await axios.post(`${API_URL}/login`, {
      email: email.value,
      password: password.value,
    })

    // Store token in localStorage
    localStorage.setItem('auth-token', response.data.token)

    // Store user info in localStorage or state management
    localStorage.setItem('user', JSON.stringify(response.data.user))

    // Update auth state
    setAuth(true, response.data.user, response.data.abilities)

    // Navigate to welcome page
    router.push('/welcome')
  } catch (error) {
    console.error('Login error:', error)

    if (error.response) {
      if (error.response.data.errors) {
        const errors = error.response.data.errors
        errorMessage.value = errors.email?.[0] || 'Invalid login credentials'
      } else {
        errorMessage.value = error.response.data.message || 'Login failed. Please try again.'
      }
    } else if (error.request) {
      errorMessage.value = 'No response from server. Please check your connection or server status.'
    } else {
      errorMessage.value = 'Network error. Please check your connection.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-background {
  background: linear-gradient(to right, #e0f2f1, #b2dfdb);
  min-height: 100vh;
}
</style>
