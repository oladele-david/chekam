/**
 * Dashboard API Endpoint
 * Handles unified dashboard data operations
 */
class DashboardEndpoint {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get comprehensive dashboard summary
   * @param {number} userId - User ID
   * @returns {Promise} Complete dashboard data
   */
  getDashboardSummary(userId) {
    return this.apiClient.fetchData(
      `/api/v1/dashboard/summary/${userId}`,
      'GET'
    );
  }

  /**
   * Get financial overview for a specific period
   * @param {number} userId - User ID
   * @param {string} period - Period (week, month, quarter, year)
   * @returns {Promise} Financial overview data
   */
  getFinancialOverview(userId, period = 'month') {
    return this.apiClient.fetchData(
      `/api/v1/dashboard/overview/${userId}?period=${period}`,
      'GET'
    );
  }
}

export default DashboardEndpoint;
