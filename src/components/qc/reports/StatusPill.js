import { statusConfig } from './constants'

const StatusPill = ({ status }) => {
  const key = status?.toLowerCase()?.replace(/\s/g, '_')
  const cfg = statusConfig[key] || statusConfig.draft
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

export default StatusPill
