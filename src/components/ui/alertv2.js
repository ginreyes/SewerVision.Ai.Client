import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

const ICONS = {
  success: <FaCheckCircle size={24} className="mr-3 text-white" />,
  error:   <FaExclamationCircle size={24} className="mr-3 text-white" />,
  info:    <FaInfoCircle size={24} className="mr-3 text-white" />,
};

const COLORS = {
  success: {
    bg:     "bg-green-600",
    border: "border-green-700",
  },
  error: {
    bg:     "bg-red-700",
    border: "border-red-800",
  },
  info: {
    bg:     "bg-blue-600",
    border: "border-blue-700",
  },
};

const Alertv2 = ({ message, type = "info", onClose }) => {
  const [visible, setVisible] = useState(false);
  const duration = 5000;

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const hideTimer = setTimeout(() => setVisible(false), duration - 300);
    const closeTimer = setTimeout(onClose, duration);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [message, onClose]);

  if (!message) return null;

  const { bg, border } = COLORS[type] || COLORS.info;

  return (
    <div
      className={`
        fixed top-5 right-5 w-80 max-w-full
        transform transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}
        ${bg} border-l-4 ${border} rounded-lg shadow-2xl overflow-hidden
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start p-4">
        {ICONS[type]}
        <div className="flex-1">
          <p className="text-white font-semibold text-lg leading-snug">
            {message}
          </p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Close alert"
        >
          <span className="text-2xl leading-none">×</span>
        </button>
      </div>
      <div
        className="h-1 bg-white/30"
        style={{
          animation: `progress ${duration}ms linear forwards`
        }}
      />
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Alertv2;
