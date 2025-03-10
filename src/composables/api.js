// api.service.js
import axios from 'axios';
import router from '../router/index';
import TokenService from '../services/AuthService';

// Create axios instance with default config
const ApiService = {
  // The base axios instance
  _api: axios.create({
    baseURL: process.env.VUE_APP_API_URL || "http://localhost:8000/api/",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
    timeout: 15000 // 15 second timeout
  }),

  // Initialize the service
  init() {
    // Request interceptor for auth token
    this._api.interceptors.request.use(
      (config) => {
        const token = TokenService.getToken();
        if (token) {
          config.headers["Authorization"] = 'Bearer ' + token;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this._api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle authentication errors
        if (error.response) {
          const { status } = error.response;
          
          if (status === 401) {
            // Unauthorized - clear token and redirect to login
            TokenService.removeToken();
            router.push({ name: 'Login' });
          } else if (status === 403) {
            // Forbidden - user doesn't have permission
            router.push({ name: 'Forbidden' });
          } else if (status === 404) {
            // Not found
            router.push({ name: 'NotFound' });
          } else if (status >= 500) {
            // Server error - could show a toast notification here
            console.error('Server error:', error.response.data);
          }
        } else if (error.request) {
          // Request was made but no response (network error)
          console.error('Network error:', error.request);
        } else {
          // Something else happened while setting up the request
          console.error('Error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  },

  // Standard REST methods
  get(resource, params) {
    return this._api.get(resource, { params });
  },

  post(resource, data) {
    return this._api.post(resource, data);
  },

  put(resource, data) {
    return this._api.put(resource, data);
  },

  delete(resource) {
    return this._api.delete(resource);
  },

  patch(resource, data) {
    return this._api.patch(resource, data);
  },

  // Custom methods
  upload(resource, file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return this._api.post(resource, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // Method for custom requests
  customRequest(config) {
    return this._api(config);
  }
};

// Initialize the service
ApiService.init();

export default ApiService;