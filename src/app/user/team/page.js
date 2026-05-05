'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  Users,
  Shield,
  Briefcase,
  Loader2,
  Search,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PageHeroBanner from '@/components/shared/PageHeroBanner';
import TeamMemberCard from '@/components/user/team/TeamMemberCard';
import BulkRoleModal from '@/components/user/team/BulkRoleModal';
import { BulkActionBar, BulkResultToast } from '@/components/shared/bulk';
import { useUserTeamMembers, useTeamTrainingProgress } from '@/hooks/useQueryHooks';
import { useBulkMutation } from '@/data/bulkApi';
import { useAlert } from '@/components/providers/AlertProvider';
import { useDialog } from '@/components/providers/DialogProvider';
import { exportToExcel } from '@/lib/csvExport';

const getName = (u) =>
  [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
  u.username ||
  u.email ||
  'Unknown';

export default function UserTeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkModal, setBulkModal] = useState(null); // 'role' | null
  const [bulkResult, setBulkResult] = useState(null);

  const { data: allUsers = [], isLoading: loading, refetch } = useUserTeamMembers();
  const { data: trainingProgress = [] } = useTeamTrainingProgress();
  const bulk = useBulkMutation('user');
  const { showAlert } = useAlert();
  const { showDelete } = useDialog();

  const operators = useMemo(() => allUsers.filter((u) => u.role === 'operator'), [allUsers]);
  const qcTechs = useMemo(() => allUsers.filter((u) => u.role === 'qc-technician'), [allUsers]);

  const filterUsers = useCallback((users) => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        getName(u).toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const filteredOps = filterUsers(operators);
  const filteredQc = filterUsers(qcTechs);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const enterSelectMode = () => {
    setSelectMode(true);
  };

  const runBulk = (op, payload) => {
    bulk.mutate(
      { ids: selectedIds, op, payload },
      {
        onSuccess: (result) => {
          setBulkResult(result);
          setBulkModal(null);
          setSelectedIds([]);
          refetch();
        },
        onError: (err) => showAlert(err.message || 'Bulk operation failed', 'error'),
      }
    );
  };

  const handleBulkExport = () => {
    const selected = allUsers.filter((u) => selectedSet.has(u._id));
    if (selected.length === 0) return;
    exportToExcel(
      selected,
      [
        { key: 'first_name', label: 'First name' },
        { key: 'last_name', label: 'Last name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'active', label: 'Active', format: (v) => (v === true ? 'Yes' : v === false ? 'No' : 'Pending') },
        { key: 'createdAt', label: 'Joined', format: (v) => (v ? new Date(v).toLocaleDateString() : '') },
      ],
      'team-members'
    );
    showAlert(`Exported ${selected.length} member${selected.length === 1 ? '' : 's'}`, 'success');
  };

  const handleBulkAction = (op, action) => {
    if (action?.clientOnly && op === 'export') {
      handleBulkExport();
      return;
    }
    if (op === 'role') {
      setBulkModal('role');
      return;
    }
    if (action?.destructive && op === 'deactivate') {
      showDelete({
        title: `Deactivate ${selectedIds.length} member${selectedIds.length === 1 ? '' : 's'}?`,
        description: 'They will lose access until reactivated.',
        onConfirm: () => runBulk('deactivate'),
      });
      return;
    }
    runBulk(op);
  };

  const renderSection = (title, icon, iconColor, users, role, emptyMsg) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {React.createElement(icon, { className: `w-4 h-4 ${iconColor}` })}
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <span className="text-xs text-slate-400 font-normal bg-slate-100 px-2 py-0.5 rounded-full">
          {users.length}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-14 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-14 text-sm text-slate-400">{emptyMsg}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((u) => {
            const tp = trainingProgress.find((t) => String(t.user?._id || t.userId || t._id) === String(u._id));
            return (
              <TeamMemberCard
                key={u._id}
                user={u}
                role={role}
                training={tp}
                selectable={selectMode}
                selected={selectedSet.has(u._id)}
                onToggleSelect={toggleSelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-32">
      <PageHeroBanner
        role="team"
        title="Team Overview"
        subtitle="Your Operator and QC Technician teams at a glance."
        icon={<Users className="w-6 h-6" />}
      >
        <div className="flex flex-wrap gap-3 mt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-xs text-white/80">
            <Briefcase className="w-3.5 h-3.5 text-amber-300" />
            Operators
            <span className="font-bold text-white">{operators.length}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-xs text-white/80">
            <Shield className="w-3.5 h-3.5 text-violet-300" />
            QC Technicians
            <span className="font-bold text-white">{qcTechs.length}</span>
          </div>
        </div>
      </PageHeroBanner>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search team members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200 text-sm shadow-sm focus-visible:ring-indigo-500"
          />
        </div>
        <Button
          variant={selectMode ? 'default' : 'outline'}
          onClick={selectMode ? exitSelectMode : enterSelectMode}
          className="h-11 gap-2 text-sm"
        >
          {selectMode ? (
            <>
              <Square className="w-4 h-4" />
              Exit selection
            </>
          ) : (
            <>
              <CheckSquare className="w-4 h-4" />
              Select members
            </>
          )}
        </Button>
      </div>

      {renderSection('Operator Team', Briefcase, 'text-orange-500', filteredOps, 'operator', 'No operators found.')}
      {renderSection('QC Technician Team', Shield, 'text-violet-500', filteredQc, 'qc-technician', 'No QC technicians found.')}

      {selectMode && (
        <BulkActionBar
          entity="user"
          selectedCount={selectedIds.length}
          onAction={handleBulkAction}
          onClear={clearSelection}
          isPending={bulk.isPending}
          accent="indigo"
        />
      )}
      {bulkResult && (
        <BulkResultToast
          result={bulkResult}
          onDismiss={() => setBulkResult(null)}
        />
      )}

      <BulkRoleModal
        open={bulkModal === 'role'}
        onClose={() => setBulkModal(null)}
        selectedCount={selectedIds.length}
        isPending={bulk.isPending}
        onConfirm={(payload) => runBulk('role', payload)}
      />
    </div>
  );
}
