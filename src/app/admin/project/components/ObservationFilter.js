'use client';

import React from 'react';



const ObservationFilterPopover = ({ onClose, onApply , pacpCodes }) => {
  return (
    <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Filter Observations</h4>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-700">PACP Code</label>
          <select className="w-full mt-1 text-sm border border-gray-300 rounded px-2 py-1">
            <option value="">All Codes</option>
            {pacpCodes.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} 
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700">Severity</label>
          <select className="w-full mt-1 text-sm border border-gray-300 rounded px-2 py-1">
            <option value="">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={onApply}
            className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObservationFilterPopover;
