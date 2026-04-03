'use client';

import { useState, memo } from 'react';
import { Check, Trash2, CheckCheck, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { typeConfig, getTimeLabel } from './inboxConfig';

const ChatBubble = memo(function ChatBubble({ item, onOpen, onMarkRead, onDelete, isConsecutive }) {
    const [showActions, setShowActions] = useState(false);
    const cfg = typeConfig[item.type] || typeConfig.system;
    const Icon = cfg.icon;

    return (
        <div
            className="group relative flex items-start gap-2.5 px-4 py-1"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Avatar — only show if not consecutive from same type */}
            <div className="w-9 flex-shrink-0 pt-1">
                {!isConsecutive ? (
                    <div
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${cfg.avatar} flex items-center justify-center shadow-md`}
                    >
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                ) : (
                    <div className="w-9" />
                )}
            </div>

            {/* Bubble */}
            <div className="flex-1 min-w-0 max-w-[85%]">
                {/* Sender label — only on first of consecutive */}
                {!isConsecutive && (
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">{cfg.label}</span>
                        {item.projectId?.name && (
                            <span className="text-[10px] text-gray-400">
                                in {item.projectId.name}
                            </span>
                        )}
                    </div>
                )}

                <button
                    onClick={() => onOpen(item)}
                    className={`text-left w-full rounded-2xl px-4 py-2.5 transition-all relative ${
                        item.read
                            ? 'bg-gray-100 hover:bg-gray-150'
                            : 'bg-white border border-rose-100 shadow-sm hover:shadow-md'
                    }`}
                    style={{
                        borderTopLeftRadius: isConsecutive ? '0.75rem' : '0.25rem',
                    }}
                >
                    {/* Unread indicator */}
                    {!item.read && (
                        <div className="absolute -left-1 top-3 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                    )}

                    {/* Title */}
                    <p className={`text-sm leading-snug ${item.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                        {item.title}
                    </p>

                    {/* Message body */}
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3">
                        {item.message}
                    </p>

                    {/* Bottom row: badge + time + link indicator */}
                    <div className="flex items-center gap-2 mt-2">
                        <Badge
                            variant="outline"
                            className={`text-[10px] font-medium border-0 px-1.5 py-0 ${cfg.color}`}
                        >
                            {cfg.label}
                        </Badge>
                        <span className="text-[10px] text-gray-400">
                            {getTimeLabel(item.createdAt)}
                        </span>
                        {item.read && (
                            <CheckCheck className="w-3 h-3 text-sky-400 ml-auto" />
                        )}
                        {item.actionUrl && !item.read && (
                            <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                        )}
                    </div>
                </button>
            </div>

            {/* Hover actions */}
            <div
                className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg px-1 py-0.5 transition-all ${
                    showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
            >
                {!item.read && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(item);
                        }}
                        className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors"
                        title="Mark as read"
                    >
                        <Check className="w-3.5 h-3.5" />
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                    }}
                    className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500 transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
});

export default ChatBubble;
