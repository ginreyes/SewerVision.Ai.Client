'use client';

import { Battery, ChevronRight } from 'lucide-react';
import { getEquipmentStatusColor } from '@/components/operator/constants';

export default function EquipmentCard({ equipment, onClick }) {
    const statusColor = getEquipmentStatusColor(equipment.status);

    return (
        <div
            onClick={() => onClick(equipment)}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${statusColor} ${equipment.status === 'recording' ? 'animate-pulse' : ''}`} />
                <div>
                    <p className="font-medium text-gray-900 text-sm">{equipment.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{equipment.status}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {equipment.battery && equipment.battery !== 'N/A' && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Battery className="w-3 h-3" />
                        {typeof equipment.battery === 'number' ? `${equipment.battery}%` : equipment.battery}
                    </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    );
}
