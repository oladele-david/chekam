/**
 * Reports API Endpoint
 * Handles financial report generation
 */
class ReportsEndpoint {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get monthly financial report
   * @param {number} userId - User ID
   * @param {number} year - Year (2020-2100)
   * @param {number} month - Month (1-12)
   * @returns {Promise} Monthly report data
   */
  getMonthlyReport(userId, year, month) {
    return this.apiClient.fetchData(
      `/api/v1/reports/monthly/${userId}?year=${year}&month=${month}`,
      'GET'
    );
  }

  /**
   * Get category spending report
   * @param {number} userId - User ID
   * @param {number} categoryId - Category ID
   * @param {number} months - Number of months to analyze (1-24)
   * @returns {Promise} Category report data
   */
  getCategoryReport(userId, categoryId, months = 6) {
    return this.apiClient.fetchData(
      `/api/v1/reports/category/${userId}/${categoryId}?months=${months}`,
      'GET'
    );
  }

  /**
   * Get budget performance report
   * @param {number} userId - User ID
   * @param {number} budgetId - Optional specific budget ID
   * @returns {Promise} Budget performance data
   */
  getBudgetPerformanceReport(userId, budgetId = null) {
    let endpoint = `/api/v1/reports/budget-performance/${userId}`;
    if (budgetId) endpoint += `?budget_id=${budgetId}`;

    return this.apiClient.fetchData(endpoint, 'GET');
  }

  /**
   * Get annual financial report
   * @param {number} userId - User ID
   * @param {number} year - Year (2020-2100)
   * @returns {Promise} Annual report data
   */
  getAnnualReport(userId, year) {
    return this.apiClient.fetchData(
      `/api/v1/reports/annual/${userId}?year=${year}`,
      'GET'
    );
  }
}

export default ReportsEndpoint;
