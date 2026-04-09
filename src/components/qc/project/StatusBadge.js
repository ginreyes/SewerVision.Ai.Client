import {
  Folder,
  MapPin,
} from 'lucide-react';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'in-progress': { color: 'bg-amber-100 text-red-800 border-amber-200', dot: 'bg-red-600 animate-pulse', label: 'In Progress' },
    'assigned': { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'Assigned' },
    'completed': { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Completed' },
    'on-hold': { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500', label: 'On Hold' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400', label: status };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
