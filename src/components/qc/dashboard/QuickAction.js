// Quick Action Button
// Static Tailwind class maps — dynamic `bg-${color}-50` doesn't work with JIT.
const COLOR_CLASSES = {
  blue: {
    border: 'hover:border-blue-200',
    iconBg: 'bg-blue-50 group-hover:bg-blue-100',
    iconText: 'text-blue-600',
  },
  indigo: {
    border: 'hover:border-indigo-200',
    iconBg: 'bg-indigo-50 group-hover:bg-indigo-100',
    iconText: 'text-indigo-600',
  },
  purple: {
    border: 'hover:border-purple-200',
    iconBg: 'bg-purple-50 group-hover:bg-purple-100',
    iconText: 'text-purple-600',
  },
  green: {
    border: 'hover:border-green-200',
    iconBg: 'bg-green-50 group-hover:bg-green-100',
    iconText: 'text-green-600',
  },
  emerald: {
    border: 'hover:border-emerald-200',
    iconBg: 'bg-emerald-50 group-hover:bg-emerald-100',
    iconText: 'text-emerald-600',
  },
  rose: {
    border: 'hover:border-rose-200',
    iconBg: 'bg-rose-50 group-hover:bg-rose-100',
    iconText: 'text-rose-600',
  },
  red: {
    border: 'hover:border-red-200',
    iconBg: 'bg-red-50 group-hover:bg-red-100',
    iconText: 'text-red-700',
  },
  amber: {
    border: 'hover:border-amber-200',
    iconBg: 'bg-amber-50 group-hover:bg-amber-100',
    iconText: 'text-amber-600',
  },
  orange: {
    border: 'hover:border-orange-200',
    iconBg: 'bg-orange-50 group-hover:bg-orange-100',
    iconText: 'text-orange-600',
  },
  yellow: {
    border: 'hover:border-yellow-200',
    iconBg: 'bg-yellow-50 group-hover:bg-yellow-100',
    iconText: 'text-yellow-700',
  },
};

const QuickAction = ({ icon: Icon, label, onClick, color = 'blue' }) => {
  const classes = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md ${classes.border} transition-all bg-white group w-full`}
    >
      <div className={`p-3 rounded-xl ${classes.iconBg} transition-colors`}>
        <Icon className={`w-5 h-5 ${classes.iconText}`} />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
};

export default QuickAction;
