import { CheckCircle, Clock, Eye, FileText } from 'lucide-react'

export const statusConfig = {
  completed: {
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
    icon: CheckCircle, label: 'Completed',
  },
  pending: {
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200',
    icon: Clock, label: 'Pending',
  },
  'in-review': {
    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
    icon: Eye, label: 'In Review',
  },
  in_review: {
    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
    icon: Eye, label: 'In Review',
  },
  draft: {
    bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200',
    icon: FileText, label: 'Draft',
  },
}
