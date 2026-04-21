'use client';

import React from 'react';
import {
    FileText,
    Eye,
    Edit3,
    Download,
    Share2,
    Clock,
    MoreVertical,
    Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getStatusVariant, getGradeColor } from '@/components/qc/constants';

const ReportCard = ({ report, onView, onEdit, onDownload, onShare, onDelete }) => {
    const projectName = report.projectId?.name || report.projectName || 'Unknown Project';
    const operatorName = report.operator?.first_name && report.operator?.last_name
        ? `${report.operator.first_name} ${report.operator.last_name}`
        : report.operator || 'N/A';
    const qcTechName = report.qcTechnician?.first_name && report.qcTechnician?.last_name
        ? `${report.qcTechnician.first_name} ${report.qcTechnician.last_name}`
        : report.qcTechnician || 'N/A';

    return (
        <Card className="hover:shadow-md transition-all">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <FileText className="w-5 h-5 text-red-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{projectName}</h3>
                            <p className="text-xs text-gray-500">{report.reportType || 'PACP Condition Assessment'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                        <Badge variant={getStatusVariant(report.status)} className="text-xs">
                            {report.status?.replace('_', ' ') || report.status}
                        </Badge>
                        {report.overallGrade && (
                            <Badge className={`${getGradeColor(report.overallGrade)} text-xs`}>
                                {report.overallGrade}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3 pb-3 border-b border-gray-100">
                    <div>
                        <span className="text-gray-500 text-xs">Operator</span>
                        <p className="font-medium text-gray-900 text-sm truncate">{operatorName}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs">QC Tech</span>
                        <p className="font-medium text-gray-900 text-sm truncate">{qcTechName}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs">Length</span>
                        <p className="font-medium text-gray-900 text-sm">{report.footage || report.pipeLength || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-gray-500 text-xs">Defects</span>
                        <p className="font-medium text-gray-900 text-sm">{report.totalDefects || report.aiDetections || 0} total</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(report.createdAt || report.createdDate || Date.now()).toLocaleDateString()}
                        </span>
                        {report.confidence > 0 && (
                            <span>• {report.confidence}%</span>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onView?.(report)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(report)}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDownload?.(report)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShare?.(report)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete?.(report)}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReportCard;
