'use client';

import React, { useMemo, useState } from 'react';
import {
  Users,
  Shield,
  Briefcase,
  Loader2,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import PageHeroBanner from '@/components/shared/PageHeroBanner';
import TeamMemberCard from '@/components/user/team/TeamMemberCard';
import { useUserTeamMembers } from '@/hooks/useQueryHooks';

export default function UserTeamPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allUsers = [], isLoading: loading } = useUserTeamMembers();

  const operators = useMemo(() => allUsers.filter((u) => u.role === 'operator'), [allUsers]);
  const qcTechs = useMemo(() => allUsers.filter((u) => u.role === 'qc-technician'), [allUsers]);

  const getName = (u) =>
    [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
    u.username ||
    u.email ||
    'Unknown';

  const filterUsers = (users) => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        getName(u).toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q),
    );
  };

  const filteredOps = filterUsers(operators);
  const filteredQc = filterUsers(qcTechs);

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
          {users.map((u) => (
            <TeamMemberCard key={u._id} user={u} role={role} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
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

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search team members by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white border-slate-200 text-sm shadow-sm focus-visible:ring-indigo-500"
        />
      </div>

      {renderSection('Operator Team', Briefcase, 'text-orange-500', filteredOps, 'operator', 'No operators found.')}
      {renderSection('QC Technician Team', Shield, 'text-violet-500', filteredQc, 'qc-technician', 'No QC technicians found.')}
    </div>
  );
}
