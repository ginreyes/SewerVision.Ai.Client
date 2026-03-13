import { Card, CardContent } from '@/components/ui/card'

const CertCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-9 h-9 rounded-md bg-gray-200" />
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

export default CertCardSkeleton
