'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fmtTime } from '@/components/qc/constants';

// Manual Detection Form (project-detail style, larger text)
const ManualForm = ({ currentTime, onSubmit, onClose }) => {
    const [type, setType] = useState('');
    const [severity, setSeverity] = useState('medium');
    const [distance, setDistance] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ type, severity, distance, notes, timestamp: currentTime });
        setType(''); setSeverity('medium'); setDistance(''); setNotes('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-b border-rose-100 bg-white/60 rounded-lg space-y-3 text-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Add manual detection</span>
                <button type="button" onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-rose-100 transition-colors" aria-label="Close">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Crack, Defect, Root intrusion"
                    autoFocus
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Distance (m)</label>
                    <input
                        type="number"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        placeholder="—"
                        step="0.1"
                        min="0"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional details..."
                />
            </div>
            <div className="flex items-center gap-2 pt-1">
                <Button type="submit" disabled={!type.trim()} size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4">
                    Add detection
                </Button>
                <span className="text-xs text-gray-500">At {fmtTime(currentTime)}</span>
            </div>
        </form>
    );
};

export default ManualForm;
