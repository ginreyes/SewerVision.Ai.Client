import React from "react";

const statusMessages = {
  loading: "Please wait to load for component...",
  connecting: "Connecting...",
  fetching: "Fetching Data...",
  complete: "Complete...",
};

const CustomSvgLoader = ({ status = "loading", progress = 25 }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-auto space-y-4">
      {/* SVG Loader */}
      <div className="flex justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          {/* Outer circle */}
          <circle
            cx="32"
            cy="32"
            r="30"
            stroke="#D76A84"
            strokeWidth="4"
            className="animate-spin-slow"
          />

          {/* Hourglass shape */}
          <path
            d="M20 12h24v6l-8 10 8 10v6H20v-6l8-10-8-10v-6z"
            fill="#D76A84"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            backgroundColor: "#D76A84",
          }}
        ></div>
      </div>

      {/* Status Text */}
      <p className="text-center text-sm font-semibold text-gray-700 tracking-tight">
        {statusMessages[status]}
      </p>

      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
          transform-origin: center;
        }
      `}</style>
    </div>
  );
};

export default CustomSvgLoader;
