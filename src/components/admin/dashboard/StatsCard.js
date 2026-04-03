'use client'

const StatsCard = ({ label, value, icon: Icon, iconBg, iconColor, subtitle, subtitleColor = 'text-gray-500' }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
    {subtitle && (
      <div className="mt-4">
        <span className={`text-sm font-medium ${subtitleColor}`}>{subtitle}</span>
      </div>
    )}
  </div>
)

export default StatsCard
