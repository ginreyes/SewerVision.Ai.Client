'use client';

import { UserCheck, ChevronRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getAvatarUrl, getInitials } from '@/components/user/constants';

export default function TeamMemberList({ teamList = [], selectedTeamUser, onSelectUser, onViewCompliance }) {
    return (
        <Card className="lg:col-span-1 border-0 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Operators & QC Technicians</CardTitle>
                <p className="text-xs text-gray-500 font-normal">
                    Assigned to your projects. Click a user to view their dashboard.
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="max-h-[420px] overflow-y-auto divide-y">
                    {teamList.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No operators or QC technicians found.</div>
                    ) : (
                        teamList.map((u) => {
                            const id = u._id ?? u.id;
                            const role = String(u.role || '').toLowerCase();
                            const isOperator = role === 'operator';
                            const name = u.name || [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || '—';
                            const isSelected = selectedTeamUser?.id === id;
                            return (
                                <div
                                    key={id}
                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                                        isSelected ? 'bg-[var(--role-accent,#d76b84)] text-white shadow-sm' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onSelectUser({
                                                id,
                                                name,
                                                role,
                                                firstName: u.first_name,
                                                lastName: u.last_name,
                                            })
                                        }
                                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                    >
                                        <UserAvatar
                                            src={getAvatarUrl(id)}
                                            fallback={getInitials(name)}
                                            size="sm"
                                            className="shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className={`font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                {name}
                                            </p>
                                            <p className={`text-xs truncate ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                                                {isOperator ? 'Operator' : 'QC Technician'}
                                            </p>
                                        </div>
                                    </button>
                                    {onViewCompliance && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewCompliance({ memberId: id, memberName: name });
                                            }}
                                            title="View compliance"
                                            className={`p-1.5 rounded transition-colors ${
                                                isSelected
                                                    ? 'text-white/90 hover:bg-white/10'
                                                    : 'text-gray-500 hover:bg-gray-100 hover:text-cyan-700'
                                            }`}
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                        </button>
                                    )}
                                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
