/**
 * Notifications API Endpoint
 * Handles alerts and notifications operations
 */
class NotificationsEndpoint {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get all notifications for a user
   * @param {number} userId - User ID
   * @param {boolean} includeLowPriority - Include low priority notifications
   * @returns {Promise} All notifications
   */
  getAllNotifications(userId, includeLowPriority = true) {
    return this.apiClient.fetchData(
      `/api/v1/notifications/${userId}?include_low_priority=${includeLowPriority}`,
      'GET'
    );
  }

  /**
   * Get budget alerts only
   * @param {number} userId - User ID
   * @returns {Promise} Budget alerts
   */
  getBudgetAlerts(userId) {
    return this.apiClient.fetchData(
      `/api/v1/notifications/${userId}/budget-alerts`,
      'GET'
    );
  }

  /**
   * Get spending alerts only
   * @param {number} userId - User ID
   * @returns {Promise} Spending alerts
   */
  getSpendingAlerts(userId) {
    return this.apiClient.fetchData(
      `/api/v1/notifications/${userId}/spending-alerts`,
      'GET'
    );
  }

  /**
   * Get notification summary counts
   * @param {number} userId - User ID
   * @returns {Promise} Notification summary
   */
  getNotificationSummary(userId) {
    return this.apiClient.fetchData(
      `/api/v1/notifications/${userId}/summary`,
      'GET'
    );
  }
}

export default NotificationsEndpoint;
