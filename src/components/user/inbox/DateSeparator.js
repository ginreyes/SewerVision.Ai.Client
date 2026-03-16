'use client';

export default function DateSeparator({ label }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
                {label}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
        </div>
    );
}
