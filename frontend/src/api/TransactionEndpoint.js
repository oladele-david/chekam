import ApiClient from  "./ApiClient";

class BudgetEndpoint {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  getBudgets() {
    const endpoint = '/transactions/';
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  getBudget(budgetId) {
    const endpoint = `/transactions/${budgetId}`;
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  getBudgetsByUser(userId) {
    const endpoint = `/transactions/user/${userId}`;
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  createBudget(data) {
    const endpoint = '/transactions/create';
    return this.apiClient.postData(endpoint, data);
  }

  updateBudget(budgetId, data) {
    const endpoint = `/transactions/update/${budgetId}`;
    return this.apiClient.updateData(endpoint, data);
  }

  deleteBudget(budgetId) {
    const endpoint = `/transactions/delete/${budgetId}`;
    return this.apiClient.deleteData(endpoint);
  }
}

export default BudgetEndpoint;