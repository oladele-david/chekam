/**
 * Analytics API Endpoint
 * Handles financial analytics and insights operations
 */
class AnalyticsEndpoint {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get income vs expenses analysis
   * @param {number} userId - User ID
   * @param {string} startDate - Start date (ISO format YYYY-MM-DD)
   * @param {string} endDate - End date (ISO format YYYY-MM-DD)
   * @returns {Promise} Income vs expenses data
   */
  getIncomeVsExpenses(userId, startDate = null, endDate = null) {
    let endpoint = `/api/v1/analytics/income-expenses/${userId}`;
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length > 0) endpoint += `?${params.join('&')}`;

    return this.apiClient.fetchData(endpoint, 'GET');
  }

  /**
   * Get spending breakdown by category
   * @param {number} userId - User ID
   * @param {string} period - Period (week, month, quarter, year)
   * @returns {Promise} Spending by category data
   */
  getSpendingByCategory(userId, period = 'month') {
    return this.apiClient.fetchData(
      `/api/v1/analytics/spending-by-category/${userId}?period=${period}`,
      'GET'
    );
  }

  /**
   * Get budget utilization analysis
   * @param {number} userId - User ID
   * @returns {Promise} Budget utilization data
   */
  getBudgetUtilization(userId) {
    return this.apiClient.fetchData(
      `/api/v1/analytics/budget-utilization/${userId}`,
      'GET'
    );
  }

  /**
   * Get financial health score
   * @param {number} userId - User ID
   * @returns {Promise} Financial health score and breakdown
   */
  getFinancialHealth(userId) {
    return this.apiClient.fetchData(
      `/api/v1/analytics/financial-health/${userId}`,
      'GET'
    );
  }

  /**
   * Get monthly trends
   * @param {number} userId - User ID
   * @param {number} months - Number of months (1-24)
   * @returns {Promise} Monthly trends data
   */
  getMonthlyTrends(userId, months = 6) {
    return this.apiClient.fetchData(
      `/api/v1/analytics/monthly-trends/${userId}?months=${months}`,
      'GET'
    );
  }

  /**
   * Get spending trends
   * @param {number} userId - User ID
   * @param {number} categoryId - Optional category ID filter
   * @param {number} months - Number of months (1-24)
   * @returns {Promise} Spending trends data
   */
  getSpendingTrends(userId, categoryId = null, months = 6) {
    let endpoint = `/api/v1/analytics/spending-trends/${userId}?months=${months}`;
    if (categoryId) endpoint += `&category_id=${categoryId}`;

    return this.apiClient.fetchData(endpoint, 'GET');
  }
}

export default AnalyticsEndpoint;
