import React from 'react';

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center space-x-4 mb-6">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

export default SectionHeader;
