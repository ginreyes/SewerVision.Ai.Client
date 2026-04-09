import { CheckCircle, XCircle } from 'lucide-react';
import { fmtTime, normalizeConfidence } from '@/components/qc/constants';

// Compact Detection Row
const DetectionRow = ({ detection, isSelected, onClick, onApprove, onReject }) => {
    // Use normalizeConfidence — raw value may be 0–1 (AI) or 0–100 (manual entry).
    const confidence = Math.round(normalizeConfidence(detection.confidence));
    const st = detection.qcStatus;

    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm leading-snug
                ${isSelected
                    ? 'bg-amber-50 ring-1 ring-amber-300'
                    : 'hover:bg-gray-100'
                }`}
        >
            {/* Status dot */}
            <div className={`w-1.5 h-1.5 rounded-full shrink-0
                ${st === 'approved' ? 'bg-green-500' : st === 'rejected' ? 'bg-red-500' : 'bg-amber-400'}`}
            />

            {/* Type */}
            <span className="font-medium text-gray-900 truncate min-w-0 flex-1">
                {detection.type || 'Anomaly'}
            </span>

            {/* Confidence bar — tiny inline */}
            <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${confidence > 80 ? 'bg-green-500' : confidence > 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${confidence}%` }}
                    />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right tabular-nums">{confidence}%</span>
            </div>

            {/* Timecode */}
            <span className="text-xs font-mono text-gray-500 shrink-0 tabular-nums">
                {detection.timeCode || fmtTime(detection.timestamp)}
            </span>

            {/* Inline quick actions when selected */}
            {isSelected && (
                <div className="flex gap-0.5 shrink-0 ml-1 animate-in fade-in duration-150">
                    <button
                        onClick={(e) => { e.stopPropagation(); onApprove(detection); }}
                        className="p-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                        title="Approve"
                    >
                        <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onReject(detection); }}
                        className="p-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                        title="Reject"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DetectionRow;
