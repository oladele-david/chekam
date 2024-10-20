import ApiClient from './ApiClient';

/**
 * Class representing the CategoryEndpoint.
 */
class CategoryEndpoint {
  /**
   * Create a CategoryEndpoint.
   * @param {ApiClient} apiClient - The API client instance.
   */
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get all categories.
   * @returns {Promise} - A promise that resolves to the list of categories.
   */
  getCategories() {
    const endpoint = '/categories/';
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  /**
   * Get a specific category by ID.
   * @param {string} categoryId - The ID of the category.
   * @returns {Promise} - A promise that resolves to the category data.
   */
  getCategory(categoryId) {
    const endpoint = `/categories/${categoryId}`;
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  /**
   * Get categories by user ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise} - A promise that resolves to the list of categories.
   */
  getCategoriesByUser(userId) {
    const endpoint = `/categories/user/${userId}`;
    return this.apiClient.fetchData(endpoint, 'GET');
  }

  /**
   * Create a new category.
   * @param {Object} data - The data for the new category.
   * @returns {Promise} - A promise that resolves to the created category.
   */
  createCategory(data) {
    const endpoint = '/categories/create';
    return this.apiClient.postData(endpoint, data);
  }

  /**
   * Update an existing category.
   * @param {string} categoryId - The ID of the category to update.
   * @param {Object} data - The updated data for the category.
   * @returns {Promise} - A promise that resolves to the updated category.
   */
  updateCategory(categoryId, data) {
    const endpoint = `/categories/update/${categoryId}`;
    return this.apiClient.updateData(endpoint, data);
  }

  /**
   * Delete a category.
   * @param {string} categoryId - The ID of the category to delete.
   * @returns {Promise} - A promise that resolves to the deletion result.
   */
  deleteCategory(categoryId) {
    const endpoint = `/categories/delete/${categoryId}`;
    return this.apiClient.deleteData(endpoint);
  }
}

export default CategoryEndpoint;