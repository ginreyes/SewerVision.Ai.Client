import { Award, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const EmptyState = ({ filter, onAdd }) => (
  <Card className="border-dashed border-2 border-gray-200">
    <CardContent className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
        <Award className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {filter === 'all' ? 'No certifications yet' : `No ${filter} certifications`}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        {filter === 'all'
          ? 'Start tracking your professional certifications by adding your first one.'
          : `You don't have any certifications with "${filter}" status.`}
      </p>
      {filter === 'all' && (
        <Button onClick={onAdd} variant="rose" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Your First Certification
        </Button>
      )}
    </CardContent>
  </Card>
)

export default EmptyState
