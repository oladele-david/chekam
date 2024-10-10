import ApiClient from './ApiClient';

class AuthEndpoint {
  /**
   * Creates an instance of AuthEndpoint.
   *
   * @param {ApiClient} apiClient - An instance of ApiClient to make HTTP requests.
   */
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Authenticates a user with the provided credentials.
   *
   * @param {Object} credentials - The user's login credentials.
   * @param {string} credentials.username - The user's username.
   * @param {string} credentials.password - The user's password.
   * @returns {Promise<Object|null>} - The response data or null if the request fails.
   */
  authenticate(credentials) {
    const endpoint = '/auth/authenticate';
    return this.apiClient.postData(endpoint, credentials);
  }

   /**
   * Registers a new user with the provided user data.
   *
   * @param {Object} userData - The new user's registration data.
   * @param {string} userData.email - The new user's email address.
   * @param {string} userData.first_name - The new user's first name.
   * @param {string} userData.last_name - The new user's last name.
   * @param {string} userData.phone_number - The new user's phone number.
   * @param {boolean} userData.is_active - The new user's active status.
   * @param {string} userData.password - The new user's password.
   * @returns {Promise<Object|null>} - The response data or null if the request fails.
   */
  register(userData) {
    const endpoint = '/auth/register';
    return this.apiClient.postData(endpoint, userData);
  }
}

export default AuthEndpoint;