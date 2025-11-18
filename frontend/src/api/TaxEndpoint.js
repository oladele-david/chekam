/**
 * Tax API Endpoint
 * Handles Nigerian PAYE tax calculations and operations
 */
class TaxEndpoint {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Calculate tax for given income and reliefs
   * @param {Object} data - Tax calculation request { gross_income, year, reliefs }
   * @returns {Promise} Tax calculation result
   */
  calculateTax(data) {
    return this.apiClient.postData('/api/v1/tax/calculate', data);
  }

  /**
   * Estimate annual tax from monthly income
   * @param {number} monthlyIncome - Monthly income amount
   * @param {number} year - Tax year
   * @returns {Promise} Annual tax estimate
   */
  estimateAnnualTax(monthlyIncome, year = 2026) {
    return this.apiClient.fetchData(
      `/api/v1/tax/estimate?monthly_income=${monthlyIncome}&year=${year}`,
      'GET'
    );
  }

  /**
   * Get tax calculation history for a user
   * @param {number} userId - User ID
   * @param {number} year - Optional year filter
   * @param {number} limit - Limit number of results
   * @returns {Promise} Tax history
   */
  getTaxHistory(userId, year = null, limit = 10) {
    let endpoint = `/api/v1/tax/history/${userId}?limit=${limit}`;
    if (year) endpoint += `&year=${year}`;

    return this.apiClient.fetchData(endpoint, 'GET');
  }

  /**
   * Create a tax relief claim
   * @param {Object} data - Relief data { user_id, relief_type, amount, year, description }
   * @returns {Promise} Created relief
   */
  createTaxRelief(data) {
    return this.apiClient.postData('/api/v1/tax/reliefs', data);
  }

  /**
   * Get tax brackets for a specific year
   * @param {number} year - Tax year
   * @returns {Promise} Tax brackets
   */
  getTaxBrackets(year = 2026) {
    return this.apiClient.fetchData(
      `/api/v1/tax/brackets/${year}`,
      'GET'
    );
  }

  /**
   * Get available tax years
   * @returns {Promise} List of available years
   */
  getAvailableYears() {
    return this.apiClient.fetchData('/api/v1/tax/years', 'GET');
  }

  /**
   * Calculate tax from income transactions
   * @param {number} userId - User ID
   * @param {number} year - Tax year
   * @returns {Promise} Tax calculation based on transactions
   */
  calculateTaxFromTransactions(userId, year) {
    return this.apiClient.fetchData(
      `/api/v1/tax/from-transactions/${userId}?year=${year}`,
      'GET'
    );
  }
}

export default TaxEndpoint;
