'use client';

import Link from 'next/link';
import { Mail, ChevronRight, Briefcase, Shield } from 'lucide-react';
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

export default function TeamMemberCard({ user, role }) {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.username || user.email || 'Unknown';
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const status = formatStatus(user);
    const stCfg = statusConfig(status);
    const rlCfg = getRoleStyle(role);
    const RoleIcon = ROLE_ICONS[role] || Briefcase;

    return (
        <Link href={`/user/team/${user._id}`} className="group block">
            <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300">
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
                    <div className="absolute top-3 left-3">
                        <Badge variant="outline" className={`${stCfg.classes} text-[10px] px-2 py-0.5 shadow-sm`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot} mr-1 inline-block`} />
                            {status}
                        </Badge>
                    </div>
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
}
