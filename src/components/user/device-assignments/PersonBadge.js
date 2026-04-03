'use client';

import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserDisplayName } from '@/components/user/constants';

const PersonBadge = memo(function PersonBadge({ user, role, colorClass }) {
    const { name, initials, avatar } = getUserDisplayName(user);
    return (
        <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${colorClass} transition-colors`}>
            <Avatar className="w-5 h-5">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium opacity-70">{role}</span>
            <span className="text-xs font-semibold">{name}</span>
        </div>
    );
});

export default PersonBadge;
