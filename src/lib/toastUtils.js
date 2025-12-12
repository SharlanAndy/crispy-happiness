/**
 * Toast Utilities for API Response Handling
 * 
 * This utility provides helper functions to automatically handle API responses
 * and show appropriate toast messages based on success/failure.
 */

/**
 * Handle API response and show toast notification
 * 
 * @param {Object} response - API response object
 * @param {Object} options - Configuration options
 * @param {string} [options.successMessage] - Custom success message (overrides response.message)
 * @param {string} [options.errorMessage] - Custom error message (overrides response.message)
 * @param {number} [options.duration] - Toast duration in milliseconds (default: 5000)
 * @param {Function} [options.onSuccess] - Callback function to execute on success
 * @param {Function} [options.onError] - Callback function to execute on error
 * @param {Function} toast - Toast context functions (from useToast hook)
 * 
 * @returns {boolean} - Returns true if successful, false otherwise
 * 
 * @example
 * const { handleApiResponse } = useToast();
 * 
 * const result = await api.systemadmin.createMerchant(data);
 * handleApiResponse(result, {
 *   successMessage: 'Merchant created successfully!',
 *   onSuccess: () => refreshMerchantList()
 * });
 */
export function handleApiResponseWithToast(response, options = {}, toast) {
  const {
    successMessage,
    errorMessage,
    duration = 5000,
    onSuccess,
    onError,
  } = options;

  if (response?.success) {
    const message = successMessage || response?.message || 'Operation completed successfully';
    toast.showSuccess(message, duration);
    
    if (onSuccess) {
      onSuccess(response);
    }
    
    return true;
  } else {
    const message = errorMessage || response?.message || response?.error || 'Operation failed. Please try again.';
    toast.showError(message, duration);
    
    if (onError) {
      onError(response);
    }
    
    return false;
  }
}

/**
 * Wrap an API call with automatic toast handling
 * 
 * @param {Promise} apiCall - Promise that returns API response
 * @param {Object} options - Configuration options (same as handleApiResponseWithToast)
 * @param {Function} toast - Toast context functions (from useToast hook)
 * 
 * @returns {Promise} - The API call promise
 * 
 * @example
 * const { wrapApiCall } = useToast();
 * 
 * await wrapApiCall(
 *   api.systemadmin.createMerchant(data),
 *   { successMessage: 'Merchant created!' }
 * );
 */
export async function wrapApiCallWithToast(apiCall, options = {}, toast) {
  try {
    const response = await apiCall;
    handleApiResponseWithToast(response, options, toast);
    return response;
  } catch (error) {
    const message = options.errorMessage || error?.message || 'An error occurred. Please try again.';
    toast.showError(message, options.duration || 5000);
    
    if (options.onError) {
      options.onError(error);
    }
    
    throw error;
  }
}
