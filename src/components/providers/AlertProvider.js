"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null); // { message, type }

  const showAlert = (message, type = "info") => {
    setAlert({ message, type });
  };

  const hideAlert = () => setAlert(null);

  // Auto-hide after 4 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
      {alert && <Alert message={alert.message} type={alert.type} onClose={hideAlert} />}
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

function Alert({ message, type, onClose }) {
  const iconColors = {
    success: "bg-green-100 text-green-600",
    error: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600",
    warning: "bg-yellow-100 text-yellow-700",
  };

  const borderColors = {
    success: "border-green-300",
    error: "border-red-300",
    info: "border-blue-300",
    warning: "border-yellow-300",
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86L12 4 5.07 19z" />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed top-8 right-8 z-50 w-full max-w-md flex items-center space-x-4 p-4
        bg-white text-gray-900 border-l-4 rounded-md shadow-md animate-slide-in
        ${borderColors[type] || borderColors.info}`}
      role="alert"
    >
      <div className={`rounded-full p-2 ${iconColors[type] || iconColors.info}`}>
        {icons[type] || icons.info}
      </div>
      <div className="flex-1 text-sm font-medium text-center">
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 text-lg font-bold px-2"
        aria-label="Close alert"
      >
        &times;
      </button>

      <style jsx>{`
        @keyframes slide-in {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
}
