import { Badge } from '@/components/ui/badge'

const SeverityBadge = ({ severity }) => {
  const styles = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    major: 'bg-orange-100 text-orange-800 border-orange-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    minor: 'bg-green-100 text-green-800 border-green-200',
  }
  const s = severity?.toLowerCase()
  const cls = styles[s] || 'bg-gray-100 text-gray-800 border-gray-200'
  return <Badge className={`${cls} border`}>{severity || 'Unknown'}</Badge>
}

export default SeverityBadge
