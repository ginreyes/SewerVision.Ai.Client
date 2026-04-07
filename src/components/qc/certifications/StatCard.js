const StatCard = ({ icon: Icon, value, label, gradient, onClick, isActive }) => (
  <button
    type="button"
    onClick={onClick}
    className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all text-left w-full
      ${isActive ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-100'}`}
  >
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </button>
)

export default StatCard
