import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

function formatErrorMessage(input) {
  if (!input) return 'An unexpected error occurred. Please try again.';

  if (typeof input === 'string') {
    if (input.includes('duplicate key') || input.includes('already exists')) {
      if (input.includes('mobile')) return 'Mobile number is already registered to another account.';
      if (input.includes('username') || input.includes('email')) return 'Email address is already registered.';
      return 'An account with these details already exists. Please sign in.';
    }
    if (input.includes('Not enough Space') || input.includes('storage')) {
      return 'Storage limit reached. Delete some files or upgrade your plan.';
    }
    if (input.includes('Invalid credentials') || input.includes('Bad credentials')) {
      return 'Incorrect email or password. Please check your login details.';
    }
    return input;
  }

  if (input.response) {
    const status = input.response.status;
    const data = input.response.data;

    if (status === 401) return 'Session expired. Please sign in again.';
    if (status === 403) return 'Access denied. You do not have permission to perform this action.';
    if (status === 404) return 'The requested file or folder was not found.';
    if (status === 413) return 'File size exceeds maximum upload limit.';
    if (status >= 500) return 'Server error. Please try again in a few moments.';

    if (typeof data === 'string' && data.trim()) return formatErrorMessage(data);
    if (data?.message) return formatErrorMessage(data.message);
  }

  if (input.message) {
    if (input.message.includes('Network Error')) return 'Network error. Please check your internet connection.';
    return input.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((rawMessage, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const message = type === 'error' ? formatErrorMessage(rawMessage) : String(rawMessage);
    
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toast = {
    success: (msg, d) => addToast(msg, 'success', d),
    error: (msg, d) => addToast(msg, 'error', d),
    warning: (msg, d) => addToast(msg, 'warning', d),
    info: (msg, d) => addToast(msg, 'info', d),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} className="toast-icon success-icon" />;
      case 'error': return <AlertCircle size={20} className="toast-icon error-icon" />;
      case 'warning': return <AlertTriangle size={20} className="toast-icon warning-icon" />;
      default: return <Info size={20} className="toast-icon info-icon" />;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            <div className="toast-content">
              {getIcon(t.type)}
              <span className="toast-message">{t.message}</span>
              <button
                className="toast-close-btn"
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
            <div
              className="toast-progress-bar"
              style={{ animationDuration: `${t.duration}ms` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
