'use client';

import { Download, Copy, Share2, Settings } from 'lucide-react';

const ObservationAction = ({ onClose, onExport, onCopy, onShare, onSettings }) => {
  return (
    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
      <div className="py-1">
        <DropdownItem icon={<Download />} label="Export Observations" onClick={onExport} />
        <DropdownItem icon={<Copy />} label="Copy All" onClick={onCopy} />
        <DropdownItem icon={<Share2 />} label="Share Report" onClick={onShare} />
        <hr className="my-1" />
        <DropdownItem icon={<Settings />} label="Table Settings" onClick={onSettings} />
      </div>
    </div>
  );
};

const DropdownItem = ({ icon, label, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 ${className}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default ObservationAction;
