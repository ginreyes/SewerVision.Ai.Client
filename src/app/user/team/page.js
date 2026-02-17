'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  Briefcase,
  Mail,
  Loader2,
  Search,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/helper';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAlert } from '@/components/providers/AlertProvider';
import PageHeroBanner from '@/components/shared/PageHeroBanner';

/* ─── Role config with real background pictures ─── */

const ROLE_STYLE = {
  operator: {
    bg: '/background_pictures/operator_background.jpg',
    label: 'Operator',
    icon: Briefcase,
    overlay: 'from-amber-900/70 via-orange-900/50 to-transparent',
  },
  'qc-technician': {
    bg: '/background_pictures/qc-techinician_background.jpg',
    label: 'QC Technician',
    icon: Shield,
    overlay: 'from-violet-900/70 via-purple-900/50 to-transparent',
  },
};

const getRoleStyle = (role) => ROLE_STYLE[role] || ROLE_STYLE.operator;

export default function UserTeamPage() {
  const { showAlert } = useAlert();
  const [operators, setOperators] = useState([]);
  const [qcTechs, setQcTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const getName = (u) =>
    [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
    u.username ||
    u.email ||
    'Unknown';

  const getInitials = (u) =>
    getName(u)
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatStatus = (u) => {
    if (u.active === true) return 'Active';
    if (u.active === false) return 'Inactive';
    return 'Pending';
  };

  const statusConfig = (status) => {
    if (status === 'Active')
      return { classes: 'border-emerald-200 text-emerald-700 bg-emerald-50', dot: 'bg-emerald-500' };
    if (status === 'Inactive')
      return { classes: 'border-slate-200 text-slate-500 bg-slate-50', dot: 'bg-slate-400' };
    return { classes: 'border-amber-200 text-amber-700 bg-amber-50', dot: 'bg-amber-500' };
  };

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const { ok, data } = await api('/api/users/get-all-user?limit=200', 'GET');
        if (!ok || !Array.isArray(data?.users)) {
          setOperators([]);
          setQcTechs([]);
          return;
        }
        setOperators(data.users.filter((u) => u.role === 'operator'));
        setQcTechs(data.users.filter((u) => u.role === 'qc-technician'));
      } catch (err) {
        console.error('Failed to load team:', err);
        showAlert('Failed to load team members', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [showAlert]);

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

  /* ── Thumbnail-style card with real background picture ── */

  const renderCard = (u, role) => {
    const name = getName(u);
    const initials = getInitials(u);
    const status = formatStatus(u);
    const stCfg = statusConfig(status);
    const rlCfg = getRoleStyle(role);
    const RoleIcon = rlCfg.icon;

    return (
      <Link key={u._id} href={`/user/team/${u._id}`} className="group block">
        <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300">
          {/* ── Banner with real background picture ── */}
          <div className="relative h-24 overflow-hidden">
            {/* Actual background image */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
              style={{ backgroundImage: `url(${rlCfg.bg})` }}
            />
            {/* Dark overlay for readability */}
            <div className={`absolute inset-0 bg-gradient-to-r ${rlCfg.overlay}`} />
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

            {/* Role badge on banner */}
            <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white shadow-sm">
              <RoleIcon className="w-3 h-3" />
              {rlCfg.label}
            </div>

            {/* Status indicator */}
            <div className="absolute top-3 left-3">
              <Badge
                variant="outline"
                className={`${stCfg.classes} text-[10px] px-2 py-0.5 shadow-sm`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot} mr-1 inline-block`} />
                {status}
              </Badge>
            </div>
          </div>

          {/* ── Avatar overlapping the banner ── */}
          <div className="flex justify-center -mt-9 relative z-10">
            <Avatar className="w-[72px] h-[72px] ring-[3px] ring-white shadow-lg">
              <AvatarImage src={u.avatar} alt={name} />
              <AvatarFallback className="text-lg font-bold bg-slate-100 text-slate-600">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* ── Info section ── */}
          <div className="px-4 pt-2.5 pb-4 text-center space-y-2">
            <div>
              <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5 truncate">
                <Mail className="w-3 h-3 flex-shrink-0 opacity-60" />
                {u.email}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:text-indigo-800 transition-colors">
                View profile
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  /* ── Section renderer ── */

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
          {users.map((u) => renderCard(u, role))}
        </div>
      )}
    </div>
  );

  /* ──────────── render ──────────── */

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Hero Banner (also uses real bg picture) ── */}
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

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search team members by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white border-slate-200 text-sm shadow-sm focus-visible:ring-indigo-500"
        />
      </div>

      {/* ── Sections ── */}
      {renderSection(
        'Operator Team',
        Briefcase,
        'text-orange-500',
        filteredOps,
        'operator',
        'No operators found.',
      )}

      {renderSection(
        'QC Technician Team',
        Shield,
        'text-violet-500',
        filteredQc,
        'qc-technician',
        'No QC technicians found.',
      )}
    </div>
  );
}