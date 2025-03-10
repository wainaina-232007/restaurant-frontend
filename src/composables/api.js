// src/composables/api.js
import { ref } from 'vue';

export function useApi() {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);

  // Laravel API base URL - adjust this to match your setup
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  /**
   * Make an API request with support for JSON and multipart form data
   * 
   * @param {string} endpoint - The API endpoint (without base URL)
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {Object|FormData} payload - Request data (object for JSON, FormData for multipart)
   * @param {boolean} isMultipart - Whether this is a multipart/form-data request (for file uploads)
   * @param {Object} customHeaders - Additional headers to include
   * @returns {Promise} - Promise containing the response data
   */
  const makeRequest = async (endpoint, method = 'GET', payload = null, isMultipart = false, customHeaders = {}) => {
    loading.value = true;
    error.value = null;
    data.value = null;

    // Make sure endpoint starts with a slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${apiBaseUrl}${formattedEndpoint}`;

    try {
      // Prepare headers based on content type
      const headers = {
        'Accept': 'application/json',
        ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
        ...customHeaders
      };

      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Configure request options
      const options = {
        method,
        headers,
        credentials: 'include', // Include cookies for sessions if needed
      };

      // Add body data if not a GET request
      if (method !== 'GET' && payload) {
        if (isMultipart) {
          // For multipart/form-data, use FormData directly
          options.body = payload; // payload should be FormData
        } else {
          // For JSON, stringify the payload
          options.body = JSON.stringify(payload);
        }
      }

      const response = await fetch(url, options);
      
      // Check if the response has content before parsing as JSON
      const text = await response.text();
      const responseData = text ? JSON.parse(text) : {};
      
      if (!response.ok) {
        throw {
          status: response.status,
          data: responseData,
          message: responseData.message || 'Request failed'
        };
      }
      
      data.value = responseData;
      return responseData;
    } catch (err) {
      console.error('API request error:', err);
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Helper for JSON requests
   */
  const jsonRequest = (endpoint, method, data, customHeaders = {}) => {
    return makeRequest(endpoint, method, data, false, customHeaders);
  };

  /**
   * Helper for multipart requests (file uploads)
   */
  const multipartRequest = (endpoint, method, formData, customHeaders = {}) => {
    return makeRequest(endpoint, method, formData, true, customHeaders);
  };

  return {
    loading,
    error,
    data,
    makeRequest,
    jsonRequest,
    multipartRequest
  };
}