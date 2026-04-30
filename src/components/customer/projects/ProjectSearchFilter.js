'use client';

import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProjectSearchFilter = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter = 'all',
  onPriorityChange,
  sortBy,
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  resultCount,
  totalCount,
}) => {
  return (
    <Card data-tour="customer-project-filters">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects by name or location..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="field-capture">Field Capture</SelectItem>
                <SelectItem value="uploading">Uploading</SelectItem>
                <SelectItem value="ai-processing">Processing</SelectItem>
                <SelectItem value="qc-review">QC Review</SelectItem>
                <SelectItem value="completed">Ready for Review</SelectItem>
                <SelectItem value="customer-notified">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            {onPriorityChange && (
              <Select value={priorityFilter} onValueChange={onPriorityChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="priority-desc">Priority (high → low)</SelectItem>
                <SelectItem value="priority-asc">Priority (low → high)</SelectItem>
              </SelectContent>
            </Select>

            {/* Grid / List toggle */}
            <div className="flex items-center rounded-md border">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => onViewModeChange?.('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-l-none border-l"
                onClick={() => onViewModeChange?.('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Result count */}
        {totalCount > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Showing {resultCount} of {totalCount} project{totalCount !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSearchFilter;
