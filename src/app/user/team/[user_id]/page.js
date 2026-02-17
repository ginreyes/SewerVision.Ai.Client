'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Briefcase,
  Shield,
  Mail,
  Activity,
  Clock,
  Loader2,
  Award,
  Hash,
  Sun,
  Moon,
  RotateCw,
  Wrench,
  CalendarDays,
  Upload,
} from 'lucide-react';
import { api } from '@/lib/helper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAlert } from '@/components/providers/AlertProvider';

/* ─── Helpers ─── */

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/* ─── Role config with real background pictures ─── */

const ROLE_CONFIG = {
  operator: {
    label: 'Operator',
    icon: Briefcase,
    iconColor: 'text-amber-500',
    bg: '/background_pictures/operator_background.jpg',
    overlay: 'from-amber-950/70 via-orange-950/50 to-black/30',
  },
  'qc-technician': {
    label: 'QC Technician',
    icon: Shield,
    iconColor: 'text-violet-500',
    bg: '/background_pictures/qc-techinician_background.jpg',
    overlay: 'from-violet-950/70 via-purple-950/50 to-black/30',
  },
  user: {
    label: 'Team Lead',
    icon: Users,
    iconColor: 'text-emerald-500',
    bg: '/background_pictures/user-team_background.jpg',
    overlay: 'from-emerald-950/70 via-teal-950/50 to-black/30',
  },
};

const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.user;

const SHIFT_MAP = {
  day: { label: 'Day Shift', icon: Sun, color: 'text-amber-500' },
  night: { label: 'Night Shift', icon: Moon, color: 'text-indigo-500' },
  rotating: { label: 'Rotating', icon: RotateCw, color: 'text-slate-500' },
};

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function UserTeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();
  const userId = params?.user_id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const { ok, data } = await api(`/api/users/get-user-details/${userId}`, 'GET');
        if (!ok || !data?.user) {
          showAlert('Failed to load team member details', 'error');
          return;
        }
        setProfile(data.user);
      } catch (err) {
        console.error('Failed to load team member details:', err);
        showAlert('Failed to load team member details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [userId, showAlert]);

  /* ── Early returns ── */

  if (!userId) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-sm text-slate-500">No team member specified.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-medium">Loading team member...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-1.5 text-slate-600"
          onClick={() => router.push('/user/team')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Button>
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Users className="w-10 h-10 opacity-40" />
          <span className="text-sm font-medium">Team member not found.</span>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */

  const fullName =
    `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
    profile.username ||
    profile.email;

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const status =
    profile.active === true ? 'Active' : profile.active === false ? 'Inactive' : 'Pending';

  const statusClasses =
    status === 'Active'
      ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
      : status === 'Inactive'
        ? 'border-slate-200 text-slate-500 bg-slate-50'
        : 'border-amber-200 text-amber-700 bg-amber-50';

  const statusDot =
    status === 'Active' ? 'bg-emerald-500' : status === 'Inactive' ? 'bg-slate-400' : 'bg-amber-500';

  const rlCfg = getRoleConfig(profile.role);
  const RoleIcon = rlCfg.icon;
  const { projectStats = {}, uploadStats = {} } = profile;

  /* ── Stat card helper ── */

  const StatCard = ({ icon: Icon, iconColor, label, value, sub }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );

  /* ── Detail row helper ── */

  const DetailRow = ({ icon: Icon, iconColor, label, children }) => (
    <div className="flex items-start gap-3 py-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 flex-shrink-0 ${iconColor || 'text-slate-400'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-900 mt-0.5">{children}</p>
      </div>
    </div>
  );

  /* ──────────── render ──────────── */

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 -ml-2"
        onClick={() => router.push('/user/team')}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Team
      </Button>

      {/* ── Profile hero card with real background picture ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Banner with actual background image */}
        <div className="relative h-36 sm:h-44 overflow-hidden">
          {/* Real background picture */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${rlCfg.bg})` }}
          />
          {/* Dark overlay for readability */}
          <div className={`absolute inset-0 bg-gradient-to-r ${rlCfg.overlay}`} />
          {/* Bottom fade for clean transition to white */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

          {/* Decorative blur circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

          {/* Role pill on banner */}
          <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-sm">
            <RoleIcon className="w-3.5 h-3.5" />
            {rlCfg.label}
          </div>
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-white shadow-xl relative z-10">
              <AvatarImage src={profile.avatar} alt={fullName} />
              <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-slate-100 text-slate-600">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {fullName}
                </h1>
                <Badge variant="outline" className={`${statusClasses} text-xs`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot} mr-1.5 inline-block`} />
                  {status}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 opacity-60" />
                {profile.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Briefcase}
          iconColor="text-amber-500"
          label="Projects as Operator"
          value={projectStats.asOperator?.totalProjects ?? 0}
          sub={`${projectStats.asOperator?.activeProjects ?? 0} active`}
        />
        <StatCard
          icon={Shield}
          iconColor="text-violet-500"
          label="Projects as QC"
          value={projectStats.asQc?.totalProjects ?? 0}
          sub={`${projectStats.asQc?.activeProjects ?? 0} active`}
        />
        <StatCard
          icon={Upload}
          iconColor="text-sky-500"
          label="Video Uploads"
          value={uploadStats.totalUploads ?? 0}
          sub="Total uploads"
        />
      </div>

      {/* ── Role-specific details ── */}
      {(profile.role === 'operator' || profile.role === 'qc-technician') && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <RoleIcon className={`w-4 h-4 ${rlCfg.iconColor}`} />
              {profile.role === 'operator' ? 'Operator Details' : 'QC Technician Details'}
            </h2>
          </div>
          <div className="px-6 divide-y divide-slate-100">
            {profile.certification && (
              <DetailRow icon={Award} iconColor="text-amber-500" label="Certification">
                {profile.certification}
              </DetailRow>
            )}
            {profile.license_number && (
              <DetailRow icon={Hash} iconColor="text-slate-500" label="License Number">
                {profile.license_number}
              </DetailRow>
            )}
            {profile.role === 'operator' && profile.shift_preference && (() => {
              const shift = SHIFT_MAP[profile.shift_preference] || SHIFT_MAP.rotating;
              const ShiftIcon = shift.icon;
              return (
                <DetailRow icon={ShiftIcon} iconColor={shift.color} label="Shift Preference">
                  {shift.label}
                </DetailRow>
              );
            })()}
            {profile.role === 'operator' && profile.equipment_experience && (
              <DetailRow icon={Wrench} iconColor="text-slate-500" label="Equipment Experience">
                {profile.equipment_experience}
              </DetailRow>
            )}
            {profile.role === 'qc-technician' && profile.experience_years && (
              <DetailRow icon={CalendarDays} iconColor="text-violet-500" label="Experience">
                {profile.experience_years} year{profile.experience_years !== 1 ? 's' : ''}
              </DetailRow>
            )}

            {!profile.certification &&
              !profile.license_number &&
              !profile.shift_preference &&
              !profile.equipment_experience &&
              !profile.experience_years && (
                <div className="py-8 text-center text-sm text-slate-400">
                  No additional details available.
                </div>
              )}
          </div>
        </div>
      )}

      {/* ── Account activity ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Account Activity
          </h2>
        </div>
        <div className="px-6 divide-y divide-slate-100">
          <DetailRow icon={CalendarDays} iconColor="text-slate-400" label="Created">
            {formatDate(profile.created_at)}
          </DetailRow>
          <DetailRow icon={Activity} iconColor="text-slate-400" label="Last Updated">
            {formatDate(profile.updated_at)}
          </DetailRow>
        </div>
      </div>
    </div>
  );
}