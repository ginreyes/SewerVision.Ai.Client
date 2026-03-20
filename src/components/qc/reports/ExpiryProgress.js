const ExpiryProgress = ({ issueDate, expiryDate, status }) => {
  const now = new Date()
  const start = new Date(issueDate)
  const end = new Date(expiryDate)
  const total = end - start
  const elapsed = now - start
  const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 100

  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))

  let barColor = 'bg-emerald-500'
  if (status === 'expired' || daysLeft === 0) barColor = 'bg-red-500'
  else if (status === 'expiring' || daysLeft <= 30) barColor = 'bg-amber-500'

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Validity</span>
        <span className="font-medium">
          {status === 'expired' ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default ExpiryProgress
