// Quick Action Button
const QuickAction = ({ icon: Icon, label, onClick, color = 'blue' }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-${color}-200 transition-all bg-white group w-full`}
  >
    <div className={`p-3 rounded-xl bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
      <Icon className={`w-5 h-5 text-${color}-600`} />
    </div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
)

export default QuickAction
