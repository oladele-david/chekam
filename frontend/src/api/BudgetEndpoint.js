import ApiClient from  "./ApiClient";

class BudgetEndpoint {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  getBudgets() {
    const endpoint = '/budgets/';
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  getBudget(budgetId) {
    const endpoint = `/budgets/${budgetId}`;
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  getBudgetsByUser(userId) {
    const endpoint = `/budgets/user/${userId}`;
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  createBudget(data) {
    const endpoint = '/budgets/create';
    return this.apiClient.postData(endpoint, data);
  }

  updateBudget(budgetId, data) {
    const endpoint = `/budgets/update/${budgetId}`;
    return this.apiClient.updateData(endpoint, data);
  }

  deleteBudget(budgetId) {
    const endpoint = `/budgets/delete/${budgetId}`;
    return this.apiClient.deleteData(endpoint);
  }
}

export default BudgetEndpoint;