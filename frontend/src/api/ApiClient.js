import axios from 'axios';
import store  from '../store/store';
import { logout } from '../store/authSlice';

class ApiClient {
  constructor(serverURL, token = "") {
    this.serverURL = serverURL;
    this.token = token;
    this.apiClient = axios.create({
      baseURL: serverURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = store.getState().auth.token;
        if (token) {
          config.headers.Authorization = `${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          store.dispatch(logout());
          sessionStorage.clear();
          // Optionally show a message or redirect to login
        }
        return Promise.reject(error);
      }
    );
  }

  async fetchData(endpoint, method = 'GET', data = {}) {
    try {
      const response = await this.apiClient.request({
        url: endpoint,
        method,
        data,
      });
      return response.data;
    } catch (error) {
      console.error("API request failed:", error);
      if (error.response) {
        // Return the error response so it can be processed in the component
        return Promise.reject(error.response);
      }
      return null;
    }
  }

  postData(endpoint, data) {
    return this.fetchData(endpoint, 'POST', data);
  }

  deleteData(endpoint) {
    return this.fetchData(endpoint, 'DELETE');
  }

  updateData(endpoint, data) {
    return this.fetchData(endpoint, 'PUT', data);
  }
}

export default ApiClient;
