import React from 'react';
import { Loader2 } from 'lucide-react';

const SettingsPageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
      <span className="ml-2 mt-2 block text-gray-500">Loading settings...</span>
    </div>
  </div>
);

export default SettingsPageLoading;
