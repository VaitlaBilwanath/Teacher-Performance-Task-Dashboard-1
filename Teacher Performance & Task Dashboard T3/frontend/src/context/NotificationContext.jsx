/* src/context/NotificationContext.jsx */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, message, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title, message) => showToast('success', title, message), [showToast]);
  const error = useCallback((title, message) => showToast('error', title, message), [showToast]);
  const warning = useCallback((title, message) => showToast('warning', title, message), [showToast]);
  const info = useCallback((title, message) => showToast('info', title, message), [showToast]);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="toast-icon success" size={20} />;
      case 'error': return <XCircle className="toast-icon error" size={20} />;
      case 'warning': return <AlertTriangle className="toast-icon warning" size={20} />;
      default: return <Info className="toast-icon info" size={20} />;
    }
  };

  return (
    <NotificationContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`toast ${toast.type}`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              layout
            >
              {getIcon(toast.type)}
              <div className="toast-content">
                <div className="toast-title">{toast.title}</div>
                {toast.message && <div className="toast-message">{toast.message}</div>}
              </div>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
