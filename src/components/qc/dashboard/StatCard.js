// Compact Stat Card Component (gradient-style)
const StatCard = ({ icon: Icon, value, label, trend, color = 'blue', suffix = '' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-indigo-600',
    rose: 'from-red-600 to-amber-500',
    yellow: 'from-yellow-400 to-orange-500'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} bg-opacity-10`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && trend !== null && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default StatCard
