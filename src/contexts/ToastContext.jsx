import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast from '../components/ui/Toast';
import { toastManager } from '../lib/toastManager';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  // Helper function to handle API responses
  const handleApiResponse = useCallback((response, options = {}) => {
    const {
      successMessage,
      errorMessage,
      duration = 5000,
    } = options;

    if (response?.success) {
      const message = successMessage || response?.message || 'Operation completed successfully';
      showSuccess(message, duration);
    } else {
      const message = errorMessage || response?.message || response?.error || 'Operation failed. Please try again.';
      showError(message, duration);
    }
  }, [showSuccess, showError]);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addToast,
    removeToast,
    handleApiResponse,
  };

  // Register toast functions globally so they can be accessed from API layer
  useEffect(() => {
    toastManager.register({
      showSuccess,
      showError,
      showWarning,
      showInfo,
    });

    // Cleanup on unmount
    return () => {
      toastManager.unregister();
    };
  }, [showSuccess, showError, showWarning, showInfo]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
