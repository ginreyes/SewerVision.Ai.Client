'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getUserDisplayName } from '@/components/user/constants';

export default function AssignmentSelector({ label, icon: Icon, value, onChange, options, placeholder }) {
    const selectedUser = options.find((o) => o._id === value);
    const { name, initials, avatar } = getUserDisplayName(selectedUser);

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </label>
            <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-600">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <Select value={value || '__none__'} onValueChange={(v) => onChange(v === '__none__' ? '' : v)}>
                    <SelectTrigger className="h-9 text-sm flex-1 bg-white border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__none__">
                            <span className="text-slate-400">Unassigned</span>
                        </SelectItem>
                        {options.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                                {[user.first_name, user.last_name].filter(Boolean).join(' ') ||
                                    user.username ||
                                    'Unknown'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
