'use client';

import Link from 'next/link';
import { Mail, ChevronRight, Briefcase, Shield, GraduationCap, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRoleStyle } from '@/components/user/constants';

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

const ROLE_ICONS = { operator: Briefcase, 'qc-technician': Shield };

export default function TeamMemberCard({ user, role, training, selectable = false, selected = false, onToggleSelect }) {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.username || user.email || 'Unknown';
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const status = formatStatus(user);
    const stCfg = statusConfig(status);
    const rlCfg = getRoleStyle(role);
    const RoleIcon = ROLE_ICONS[role] || Briefcase;

    const handleSelectClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleSelect?.(user._id);
    };

    const handleCardClick = (e) => {
        if (!selectable) return;
        // In selectable mode, the whole card toggles selection. Esc/keyboard
        // accessibility is provided by the explicit checkbox button.
        e.preventDefault();
        onToggleSelect?.(user._id);
    };

    const cardContent = (
        <div className={`relative rounded-2xl border bg-white overflow-hidden shadow-sm transition-all duration-300 ${
            selected
                ? 'border-indigo-400 ring-2 ring-indigo-200 shadow-md'
                : 'border-slate-200 hover:shadow-lg hover:border-slate-300'
        }`}>
            {selectable && (
                <button
                    type="button"
                    onClick={handleSelectClick}
                    aria-label={selected ? 'Deselect member' : 'Select member'}
                    aria-pressed={selected}
                    className={`absolute top-3 left-3 z-20 w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                        selected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white/90 backdrop-blur-sm border-slate-300 hover:border-indigo-400'
                    }`}
                >
                    {selected && <Check className="w-3.5 h-3.5" />}
                </button>
            )}
            <div className="relative h-24 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
                    style={{ backgroundImage: `url(${rlCfg.bg})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${rlCfg.overlay}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
                <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white shadow-sm">
                    <RoleIcon className="w-3 h-3" />
                    {rlCfg.label}
                </div>
                {!selectable && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="outline" className={`${stCfg.classes} text-[10px] px-2 py-0.5 shadow-sm`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot} mr-1 inline-block`} />
                            {status}
                        </Badge>
                    </div>
                )}
            </div>
            <div className="flex justify-center -mt-9 relative z-10">
                <Avatar className="w-[72px] h-[72px] ring-[3px] ring-white shadow-lg">
                    <AvatarImage src={user.avatar} alt={name} />
                    <AvatarFallback className="text-lg font-bold bg-slate-100 text-slate-600">{initials}</AvatarFallback>
                </Avatar>
            </div>
            <div className="px-4 pt-2.5 pb-4 text-center space-y-2">
                <div>
                    <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0 opacity-60" />
                        {user.email}
                    </p>
                </div>
                {training && (
                    <div className="pt-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span className="flex items-center gap-0.5"><GraduationCap className="w-2.5 h-2.5" /> Training</span>
                            <span className="font-semibold text-slate-700">{training.modulesCompleted || 0} modules · {training.avgScore || 0}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, (training.avgScore || 0))}%` }} />
                        </div>
                    </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:text-indigo-800 transition-colors">
                        {selectable ? (selected ? 'Selected' : 'Tap to select') : 'View profile'}
                        {!selectable && <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />}
                    </span>
                </div>
            </div>
        </div>
    );

    if (selectable) {
        return (
            <div role="button" tabIndex={0} onClick={handleCardClick} className="group block cursor-pointer">
                {cardContent}
            </div>
        );
    }

    return (
        <Link href={`/user/team/${user._id}`} className="group block">
            {cardContent}
        </Link>
    );
}
