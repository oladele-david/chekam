import ApiClient from './ApiClient';

class UserEndpoint {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  getUsers() {
    const endpoint = '/users/';
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  getUser(userId) {
    const endpoint = `/users/${userId}`;
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  createUser(data) {
    const endpoint = '/users/create';
    return this.apiClient.postData(endpoint, data);
  }

  updateUser(userId, data) {
    const endpoint = `/users/update/${userId}`;
    return this.apiClient.updateData(endpoint, data);
  }

  deleteUser(userId) {
    const endpoint = `/users/delete/${userId}`;
    return this.apiClient.deleteData(endpoint);
  }

  updateUserPassword(userId, data) {
    const endpoint = `/users/update/password/${userId}`;
    return this.apiClient.updateData(endpoint, data);
  }
}

export default UserEndpoint;