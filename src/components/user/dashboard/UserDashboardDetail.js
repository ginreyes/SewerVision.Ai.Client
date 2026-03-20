'use client';

import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function OperatorDashboardContent({ data }) {
    const stats = data?.operationalStats ?? {};
    const recent = data?.recentOperations ?? [];
    const devices = data?.devices ?? [];
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Active operations', value: stats.activeOperations },
                    { label: 'Equipment online', value: stats.equipmentOnline },
                    { label: 'Maintenance due', value: stats.maintenanceDue },
                    { label: 'System uptime', value: `${stats.systemUptime ?? 0}%` },
                    { label: 'Critical alerts', value: stats.criticalAlerts },
                ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-xl font-bold text-gray-900">{value ?? 0}</p>
                    </div>
                ))}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Devices / recent operations</h4>
                <div className="rounded-lg border divide-y max-h-48 overflow-y-auto">
                    {(devices.length ? devices : recent).slice(0, 10).map((d) => (
                        <div key={d.id} className="flex items-center justify-between px-3 py-2 text-sm">
                            <span className="font-medium">{d.name}</span>
                            <span className="text-gray-500 capitalize">{d.status || '—'}</span>
                        </div>
                    ))}
                    {!(devices.length || recent.length) && (
                        <div className="px-3 py-4 text-sm text-gray-500">No devices or operations</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function QCDashboardContent({ data }) {
    const stats = data?.stats ?? {};
    const recent = data?.recentAssignments ?? [];
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total assignments', value: stats.totalAssignments },
                    { label: 'Pending', value: stats.pendingAssignments },
                    { label: 'In review', value: stats.inReviewAssignments },
                    { label: 'Completed', value: stats.completedAssignments },
                ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg border bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-xl font-bold text-gray-900">{value ?? 0}</p>
                    </div>
                ))}
            </div>
            <div className="rounded-lg border bg-gray-50 p-3">
                <p className="text-xs text-gray-500 mb-1">Review summary</p>
                <p className="text-sm text-gray-700">
                    Approved: {stats.totalApproved ?? 0} · Rejected: {stats.totalRejected ?? 0} · Modified: {stats.totalModified ?? 0}
                </p>
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent assignments</h4>
                <div className="rounded-lg border divide-y max-h-48 overflow-y-auto">
                    {recent.slice(0, 8).map((a) => (
                        <div key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
                            <span className="font-medium truncate">{a.projectName}</span>
                            <span className="text-gray-500 capitalize shrink-0 ml-2">{a.status}</span>
                        </div>
                    ))}
                    {!recent.length && <div className="px-3 py-4 text-sm text-gray-500">No assignments</div>}
                </div>
            </div>
        </div>
    );
}

export default function UserDashboardDetail({ user, data, isOperator, onBack, onBackToDashboard }) {
    if (!data) return null;
    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="ghost" size="sm" className="gap-1 -ml-2" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4" />
                        Back to list
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1" onClick={onBackToDashboard}>
                        <LayoutDashboard className="w-4 h-4" />
                        Back to dashboard
                    </Button>
                    <CardTitle className="text-base">
                        {user?.name} — {isOperator ? 'Operator' : 'QC Technician'} dashboard
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isOperator ? (
                    <OperatorDashboardContent data={data} />
                ) : (
                    <QCDashboardContent data={data} />
                )}
            </CardContent>
        </Card>
    );
}
