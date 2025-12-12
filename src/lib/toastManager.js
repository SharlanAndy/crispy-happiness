/**
 * Global Toast Manager
 * 
 * This allows toast notifications to be shown from anywhere in the codebase,
 * including non-React code like API handlers.
 * 
 * The ToastContext will register its functions here on mount.
 */

let toastFunctions = null;

export const toastManager = {
  /**
   * Register toast functions from ToastContext
   * @param {Object} functions - { showSuccess, showError, showWarning, showInfo }
   */
  register: (functions) => {
    toastFunctions = functions;
  },

  /**
   * Unregister toast functions
   */
  unregister: () => {
    toastFunctions = null;
  },

  /**
   * Show success toast
   */
  showSuccess: (message, duration = 5000) => {
    if (toastFunctions?.showSuccess) {
      toastFunctions.showSuccess(message, duration);
    } else {
      console.log('[Toast] Success:', message);
    }
  },

  /**
   * Show error toast
   */
  showError: (message, duration = 5000) => {
    if (toastFunctions?.showError) {
      toastFunctions.showError(message, duration);
    } else {
      console.error('[Toast] Error:', message);
    }
  },

  /**
   * Show warning toast
   */
  showWarning: (message, duration = 5000) => {
    if (toastFunctions?.showWarning) {
      toastFunctions.showWarning(message, duration);
    } else {
      console.warn('[Toast] Warning:', message);
    }
  },

  /**
   * Show info toast
   */
  showInfo: (message, duration = 5000) => {
    if (toastFunctions?.showInfo) {
      toastFunctions.showInfo(message, duration);
    } else {
      console.info('[Toast] Info:', message);
    }
  },
};
