'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  LayoutGrid, Search, ChevronDown, ChevronRight, Users,
  AlertTriangle, Shield, Clock, Loader2, BarChart3,
  TrendingUp, Zap,
} from 'lucide-react';
import { usePipeline, useSLACompliance } from '@/data/pipelineApi';

const STATUS_COLORS = {
  planning: 'bg-blue-500',
  'field-capture': 'bg-rose-500',
  uploading: 'bg-indigo-500',
  'ai-processing': 'bg-purple-500',
  'qc-review': 'bg-amber-500',
  completed: 'bg-emerald-500',
  'customer-notified': 'bg-teal-500',
};

export default function CustomerRepProjectOverview() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const { data: pipelineData, isLoading: pipelineLoading } = usePipeline({});
  const { data: complianceData, isLoading: complianceLoading } = useSLACompliance();

  const isLoading = pipelineLoading || complianceLoading;

  // Group all projects by customer
  const allProjects = [];
  if (pipelineData?.data?.columns) {
    Object.values(pipelineData.data.columns).forEach((col) => {
      if (Array.isArray(col)) allProjects.push(...col);
    });
  }

  const customerMap = {};
  allProjects.forEach((p) => {
    const key = p.customerId || p.client || 'Unknown';
    if (!customerMap[key]) {
      customerMap[key] = { name: p.client || 'Unknown Customer', projects: [], statusCounts: {} };
    }
    customerMap[key].projects.push(p);
    const s = p.status || 'planning';
    customerMap[key].statusCounts[s] = (customerMap[key].statusCounts[s] || 0) + 1;
  });

  const customers = Object.entries(customerMap)
    .map(([id, data]) => ({ id, ...data }))
    .filter((c) =>
      !search || c.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.projects.length - a.projects.length);

  const compliance = complianceData?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center text-white shadow-md">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Project Overview</h1>
            <p className="text-sm text-gray-500">All customer projects grouped by account</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/customer-rep/projects')}
          className="text-sm"
        >
          List View
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{customers.length}</p>
              <p className="text-xs text-gray-500">Customers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{allProjects.length}</p>
              <p className="text-xs text-gray-500">Total Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {allProjects.filter((p) => ['completed', 'customer-notified'].includes(p.status)).length}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {allProjects.filter((p) => p.status === 'on-hold').length}
              </p>
              <p className="text-xs text-gray-500">On Hold</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Customer Accordions */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : customers.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No customers found</h3>
            <p className="text-sm text-gray-500">Try a different search term</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => {
            const isExpanded = expandedCustomer === customer.id;
            const total = customer.projects.length;

            return (
              <Card key={customer.id} className="border-gray-200 overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedCustomer(isExpanded ? null : customer.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  )}

                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-xs text-gray-500">{total} project{total !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Mini Status Distribution Bar */}
                  <div className="flex rounded-full overflow-hidden h-2 w-32 bg-gray-100 shrink-0">
                    {Object.entries(customer.statusCounts).map(([status, count]) => (
                      <div
                        key={status}
                        className={STATUS_COLORS[status] || 'bg-gray-400'}
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    ))}
                  </div>

                  <Badge variant="outline" className="text-xs shrink-0">
                    {total}
                  </Badge>
                </div>

                {/* Expanded Project List */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {customer.projects.map((project) => (
                        <div
                          key={project._id}
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => router.push(`/customer-rep/projects/${project._id}`)}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{project.name}</h4>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {project.status?.replace('-', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{project.location}</p>
                          {project.aiDetections?.total > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Zap className="w-3 h-3 text-amber-500" />
                              <span className="text-xs text-gray-600">
                                {project.aiDetections.total} detections
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
