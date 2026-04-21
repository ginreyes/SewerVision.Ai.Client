'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { whatsNewData } from '@/data/whatsNewData';

// What's New Component — surfaces the most recent changelog entry inside the Tour dialog
const WhatsNewContent = () => {
    const router = useRouter();
    const latestVersion = whatsNewData[0];

    return (
        <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 mb-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">Version {latestVersion?.id} is here!</h4>
                        <p className="text-sm text-gray-600 mt-1">Check out the latest features and improvements we've added to enhance your experience.</p>
                        <Button
                            size="sm"
                            onClick={() => router.push('/whats-new')}
                            className="mt-3 bg-white text-purple-700 hover:bg-purple-50 border border-purple-200 shadow-sm"
                        >
                            Read Full Release Notes <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {whatsNewData.map((release, idx) => {
                    const allChanges = Object.values(release.updates).flat();

                    return (
                        <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-800">{release.id}</span>
                                    {release.isNew && (
                                        <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">NEW</span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">{release.date}</span>
                            </div>
                            <div className="p-3 space-y-2">
                                {allChanges.length > 0 ? (
                                    allChanges.slice(0, 5).map((change, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${change.type === 'feature' ? 'bg-green-100 text-green-700' :
                                                change.type === 'fix' ? 'bg-red-100 text-red-700' :
                                                    change.type === 'ui' ? 'bg-blue-100 text-blue-700' :
                                                        change.type === 'security' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-gray-100 text-gray-700'
                                                }`}>
                                                {change.type === 'feature' ? '✨ New' :
                                                    change.type === 'fix' ? '🔧 Fix' :
                                                        change.type === 'ui' ? '🎨 UI' :
                                                            change.type === 'security' ? '🛡️ Sec' :
                                                                '⚡ Upd'}
                                            </span>
                                            <span className="text-sm text-gray-700 line-clamp-1">{change.title}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-gray-400 italic">No specific updates listed.</div>
                                )}
                                {allChanges.length > 5 && (
                                    <div className="text-xs text-purple-600 font-medium pl-1">
                                        + {allChanges.length - 5} more updates...
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-2 text-center">
                <Button variant="link" size="sm" onClick={() => router.push('/whats-new')} className="text-gray-500">
                    View All Updates
                </Button>
            </div>
        </div>
    );
};

export default WhatsNewContent;
