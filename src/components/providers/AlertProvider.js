"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]); // Array of { id, message, type, duration }
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, title, onConfirm, onCancel, type }

  const showAlert = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    // Auto-hide
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Legacy support for old API
  const hideAlert = useCallback(() => {
    setToasts([]);
  }, []);

  // Confirmation dialog
  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, toast: showAlert, showConfirm }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-md">
      {toasts.map((toast, index) => (
        <Toast 
          key={toast.id} 
          {...toast} 
          onClose={() => onRemove(toast.id)}
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
}

function Toast({ message, type, onClose, style }) {
  const [isExiting, setIsExiting] = React.useState(false);

  const configs = {
    success: {
      gradient: "from-emerald-500 to-green-600",
      bg: "bg-white",
      icon: CheckCircle,
      iconColor: "text-emerald-500",
      shadow: "shadow-emerald-500/20"
    },
    error: {
      gradient: "from-red-500 to-rose-600",
      bg: "bg-white",
      icon: XCircle,
      iconColor: "text-red-500",
      shadow: "shadow-red-500/20"
    },
    info: {
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-white",
      icon: Info,
      iconColor: "text-blue-500",
      shadow: "shadow-blue-500/20"
    },
    warning: {
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-white",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
      shadow: "shadow-amber-500/20"
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div
      style={style}
      className={`${config.bg} backdrop-blur-xl rounded-2xl shadow-2xl ${config.shadow} 
        border border-gray-100 overflow-hidden pointer-events-auto
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 animate-slide-in-toast'}`}
      role="alert"
    >
      <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
      <div className="flex items-center gap-3 p-4">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-sm font-medium text-gray-900 pr-2">
          {message}
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-in-toast {
          0% {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slide-in-toast {
          animation: slide-in-toast 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmText, cancelText, type, onConfirm, onCancel }) {
  const configs = {
    danger: {
      gradient: "from-red-500 to-rose-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700",
      icon: AlertTriangle
    },
    warning: {
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      buttonBg: "bg-amber-600 hover:bg-amber-700",
      icon: AlertTriangle
    },
    info: {
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
      icon: Info
    }
  };

  const config = configs[type] || configs.warning;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header gradient bar */}
        <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl ${config.iconBg}`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${config.buttonBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
