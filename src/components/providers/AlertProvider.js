"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X, Sparkles } from "lucide-react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showAlert = useCallback((message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAlert = useCallback(() => {
    setToasts([]);
  }, []);

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
      <GlobalStyles />
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

function GlobalStyles() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
      
      @keyframes toast-enter {
        0% {
          opacity: 0;
          transform: translateX(100%) rotateY(-15deg) scale(0.9);
          filter: blur(4px);
        }
        100% {
          opacity: 1;
          transform: translateX(0) rotateY(0) scale(1);
          filter: blur(0);
        }
      }
      
      @keyframes toast-exit {
        0% {
          opacity: 1;
          transform: translateX(0) scale(1);
          filter: blur(0);
        }
        100% {
          opacity: 0;
          transform: translateX(120%) scale(0.8);
          filter: blur(4px);
        }
      }
      
      @keyframes progress-shrink {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      
      @keyframes float-in {
        0% {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      @keyframes backdrop-blur-in {
        0% { backdrop-filter: blur(0); background-color: transparent; }
        100% { backdrop-filter: blur(12px); background-color: rgba(0, 0, 0, 0.4); }
      }
      
      @keyframes icon-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @keyframes gradient-flow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .toast-container {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        perspective: 1000px;
      }
      
      .toast-item {
        animation: toast-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      
      .toast-item.exiting {
        animation: toast-exit 0.4s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
      }
      
      .toast-progress {
        transform-origin: left;
        animation: progress-shrink linear forwards;
      }
      
      .toast-shimmer {
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      
      .toast-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
      
      .confirm-backdrop {
        animation: backdrop-blur-in 0.3s ease-out forwards;
      }
      
      .confirm-dialog {
        animation: float-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      
      .confirm-icon {
        animation: icon-bounce 0.6s ease-out;
      }
      
      .gradient-animate {
        background-size: 200% 200%;
        animation: gradient-flow 3s ease infinite;
      }
    `}</style>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container fixed top-6 right-6 z-50 flex flex-col gap-4 pointer-events-none max-w-sm">
      {toasts.map((toast, index) => (
        <Toast 
          key={toast.id} 
          {...toast} 
          onClose={() => onRemove(toast.id)}
          index={index}
        />
      ))}
    </div>
  );
}

function Toast({ message, type, duration, onClose, index }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const configs = {
    success: {
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
      glowColor: "rgba(16, 185, 129, 0.4)",
      accentColor: "#10b981",
      bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
      icon: CheckCircle,
      label: "Success"
    },
    error: {
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
      glowColor: "rgba(239, 68, 68, 0.4)",
      accentColor: "#ef4444",
      bgGradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
      icon: XCircle,
      label: "Error"
    },
    info: {
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
      glowColor: "rgba(59, 130, 246, 0.4)",
      accentColor: "#3b82f6",
      bgGradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
      icon: Info,
      label: "Info"
    },
    warning: {
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
      glowColor: "rgba(245, 158, 11, 0.4)",
      accentColor: "#f59e0b",
      bgGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)",
      icon: AlertTriangle,
      label: "Warning"
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(), 400);
  };

  return (
    <div
      className={`toast-item ${isExiting ? 'exiting' : ''} pointer-events-auto`}
      style={{ 
        animationDelay: `${index * 80}ms`,
        transform: isHovered ? 'scale(1.02) translateX(-4px)' : 'scale(1)',
        transition: 'transform 0.2s ease'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="alert"
    >
      {/* Main container */}
      <div 
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: `
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -2px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(0, 0, 0, 0.05),
            0 20px 40px -15px ${config.glowColor}
          `
        }}
      >
        {/* Animated glow background */}
        <div 
          className="toast-glow absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: config.bgGradient,
            filter: 'blur(20px)'
          }}
        />
        
        {/* Top accent bar with shimmer */}
        <div className="relative h-1 overflow-hidden">
          <div 
            className="absolute inset-0 gradient-animate"
            style={{ background: config.gradient }}
          />
          <div className="toast-shimmer absolute inset-0" />
        </div>

        {/* Content */}
        <div className="relative flex items-start gap-4 p-4">
          {/* Icon with glow effect */}
          <div className="relative flex-shrink-0">
            <div 
              className="absolute inset-0 rounded-xl opacity-40 blur-lg"
              style={{ background: config.gradient }}
            />
            <div 
              className="relative p-2.5 rounded-xl shadow-lg"
              style={{ background: config.gradient }}
            >
              <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p 
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: config.accentColor }}
            >
              {config.label}
            </p>
            <p className="text-sm font-medium text-gray-800 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="toast-progress h-full rounded-full"
            style={{ 
              background: config.gradient,
              animationDuration: `${duration}ms`,
              animationPlayState: isHovered ? 'paused' : 'running'
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmText, cancelText, type, onConfirm, onCancel }) {
  const [isPressed, setIsPressed] = useState(null);

  const configs = {
    danger: {
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
      iconBg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
      iconColor: "#dc2626",
      buttonGradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      buttonHover: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      glowColor: "rgba(239, 68, 68, 0.3)",
      icon: AlertTriangle
    },
    warning: {
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
      iconBg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      iconColor: "#d97706",
      buttonGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      buttonHover: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
      glowColor: "rgba(245, 158, 11, 0.3)",
      icon: AlertTriangle
    },
    info: {
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
      iconBg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      iconColor: "#2563eb",
      buttonGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      buttonHover: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      glowColor: "rgba(59, 130, 246, 0.3)",
      icon: Info
    },
    success: {
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
      iconBg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      iconColor: "#059669",
      buttonGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      buttonHover: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      glowColor: "rgba(16, 185, 129, 0.3)",
      icon: CheckCircle
    }
  };

  const config = configs[type] || configs.warning;
  const Icon = config.icon;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <div 
      className="confirm-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Backdrop pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      <div 
        className="confirm-dialog relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(0, 0, 0, 0.05),
            0 0 100px -20px ${config.glowColor}
          `
        }}
      >
        {/* Header gradient bar */}
        <div className="relative h-2 overflow-hidden">
          <div 
            className="absolute inset-0 gradient-animate"
            style={{ background: config.gradient }}
          />
          <div className="toast-shimmer absolute inset-0" />
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <div 
            className="w-full h-full rounded-full blur-3xl"
            style={{ background: config.gradient }}
          />
        </div>
        
        {/* Content */}
        <div className="relative p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-2xl opacity-60 blur-xl scale-150"
                style={{ background: config.iconBg }}
              />
              <div 
                className="confirm-icon relative p-4 rounded-2xl shadow-sm"
                style={{ background: config.iconBg }}
              >
                <Icon 
                  className="w-8 h-8" 
                  style={{ color: config.iconColor }}
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              onMouseDown={() => setIsPressed('cancel')}
              onMouseUp={() => setIsPressed(null)}
              onMouseLeave={() => setIsPressed(null)}
              className="flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                color: '#374151',
                boxShadow: isPressed === 'cancel' 
                  ? 'inset 0 2px 4px rgba(0, 0, 0, 0.1)' 
                  : '0 2px 4px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                transform: isPressed === 'cancel' ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              onMouseDown={() => setIsPressed('confirm')}
              onMouseUp={() => setIsPressed(null)}
              onMouseLeave={() => setIsPressed(null)}
              className="flex-1 px-6 py-3.5 rounded-xl text-white font-semibold transition-all duration-200"
              style={{
                background: isPressed === 'confirm' ? config.buttonHover : config.buttonGradient,
                boxShadow: isPressed === 'confirm'
                  ? `inset 0 2px 4px rgba(0, 0, 0, 0.2)`
                  : `0 4px 14px -3px ${config.glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.1) inset`,
                transform: isPressed === 'confirm' ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Sparkle decoration */}
        <div className="absolute top-6 right-6 opacity-20">
          <Sparkles className="w-5 h-5" style={{ color: config.iconColor }} />
        </div>
      </div>
    </div>
  );
}

export default AlertProvider;