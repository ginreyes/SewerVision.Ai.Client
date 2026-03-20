'use client';

import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/components/providers/UserContext';
import { useCustomerReports } from '@/hooks/useQueryHooks';

import ReportCard from '@/components/customer/reports/ReportCard';

export default function MyReportsPage() {
  const router = useRouter();
  const { userId } = useUser();

  const {
    data: reports = [],
    isLoading: loading,
  } = useCustomerReports(userId);

  const handleViewReport = (id) => {
    router.push(`/customer/reports/${id}`);
  };

  const handleDownload = (id) => {
    alert(`Downloading report for project ${id}`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6" data-tour="customer-reports">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Reports</h1>
        <p className="text-muted-foreground">
          Download or review finalized inspection reports
        </p>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-[200px]" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <Skeleton className="h-3 w-[120px]" />
                      <Skeleton className="h-3 w-[100px]" />
                      <Skeleton className="h-3 w-[90px]" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Skeleton className="h-5 w-[80px]" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Available Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your inspection reports will appear here once they have been finalized and delivered.
              Reports are generated after the inspection is completed and quality control is finished.
            </p>
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/customer/projects')}
              >
                View My Projects
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Check your projects to see their current status
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              onView={handleViewReport}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
