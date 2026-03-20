// Shared constants for customer module
// Used across dashboard, projects, project-detail, and reports pages

export const statusConfig = {
  completed: { label: 'Ready for Review', color: 'success', bgColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  'customer-notified': { label: 'Completed', color: 'purple', bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  'qc-review': { label: 'QC Review', color: 'warning', bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  'ai-processing': { label: 'Processing', color: 'secondary', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  'field-capture': { label: 'Field Capture', color: 'default', bgColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
  uploading: { label: 'Uploading', color: 'secondary', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  'on-hold': { label: 'On Hold', color: 'destructive', bgColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  planning: { label: 'Planning', color: 'outline', bgColor: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200' },
};

export const getSeverityConfig = (count) => {
  if (count > 20) return { label: 'High', variant: 'destructive' };
  if (count > 10) return { label: 'Medium', variant: 'warning' };
  return { label: 'Low', variant: 'success' };
};

export const getSeverityVariant = (severity) => {
  const variants = {
    high: 'destructive',
    medium: 'warning',
    low: 'success',
  };
  return variants[severity] || 'outline';
};

export const statusLabels = {
  completed: 'Finalized',
  'customer-notified': 'Delivered',
};

export const renderStatusBadge = (status, Badge) => {
  const config = statusConfig[status] || { label: 'In Progress', color: 'outline' };
  return <Badge variant={config.color}>{config.label}</Badge>;
};

export const renderStatusBadgeWithBg = (status, Badge) => {
  const config = statusConfig[status] || { label: 'In Progress', bgColor: 'bg-gray-100 text-gray-800' };
  return (
    <Badge variant="outline" className={config.bgColor}>
      {config.label}
    </Badge>
  );
};
