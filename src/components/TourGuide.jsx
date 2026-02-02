'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    ChevronRight,
    ChevronLeft,
    X,
    Sparkles,
    LayoutDashboard,
    FolderOpen,
    FileText,
    Upload,
    Settings,
    Users,
    Bell,
    CheckCircle,
    Rocket,
    HelpCircle,
    Brain,
    Target,
    Play,
    Video,
    Camera,
    Database,
    Zap,
    Eye,
    Plus,
    ClipboardCheck,
    RefreshCw,
    PencilIcon,
    Trash2Icon,
    Star,
    Gift,
    Megaphone,
    MapPin,
    Filter,
    Download,
} from 'lucide-react';

// What's New Changelog Data
import { whatsNewData } from '@/data/whatsNewData';

// What's New Component
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
                    // Flatten all updates from different roles into one array for the summary
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

// Admin Tour Steps
const adminSteps = [
    {
        id: 'welcome',
        title: 'Welcome to SewerVision.ai! 🎉',
        description: 'SewerVision.ai is your complete solution for AI-powered pipeline inspection. This tour will guide you through all the powerful features available to help you manage inspections efficiently.',
        tips: ['Navigate using the sidebar on the left', 'Access your profile from the top-right avatar', 'Use keyboard shortcuts for faster navigation'],
        icon: Sparkles,
        color: 'from-purple-500 to-pink-500',
        illustration: (
            <div className="relative w-full h-64 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Camera className="w-6 h-6 text-blue-600" />
                        <span className="text-lg font-bold text-gray-900">SewerVision.ai</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg"><Bell className="w-4 h-4 text-gray-500" /></button>
                        <button className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs">
                            <Upload className="w-3 h-3" /><span>Upload</span>
                        </button>
                    </div>
                </div>
                <div className="p-6 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                            <Camera className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">AI-Powered Pipeline Inspection</h3>
                        <p className="text-sm text-gray-500 mt-1">PACP Certified • Real-time Analysis • Cloud-based</p>
                        <div className="flex justify-center gap-2 mt-4">
                            {['96% Accuracy', 'PACP Certified', '24/7 Processing'].map((badge) => (
                                <span key={badge} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{badge}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'dashboard',
        title: 'Your Command Center',
        description: 'The dashboard gives you a real-time overview of all your inspection activities. Monitor project progress, AI processing status, and team productivity from one central location.',
        tips: ['Stats update in real-time', 'Click on any card to see details', 'Use the refresh button to update manually'],
        icon: LayoutDashboard,
        color: 'from-blue-500 to-cyan-500',
        illustration: (
            <div className="relative w-full h-64 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 p-4">
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                        { label: 'Total Projects', value: '24', icon: Database, color: 'blue', change: '+12%' },
                        { label: 'AI Processing', value: '3', icon: Brain, color: 'purple', change: 'Active' },
                        { label: 'Pending QC', value: '8', icon: Eye, color: 'amber', change: '5 urgent' },
                        { label: 'Completed', value: '156', icon: CheckCircle, color: 'green', change: '+8 today' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-8 h-8 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                                </div>
                                <span className={`text-[10px] font-medium text-${stat.color}-600`}>{stat.change}</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-[10px] text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-600 mb-2">Weekly Activity</p>
                        <div className="flex items-end gap-1 h-20">
                            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                        <p className="text-xs font-medium text-gray-600 mb-2">AI Detections</p>
                        <div className="flex items-center justify-center h-20">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent rotate-45"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-gray-800">96%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'projects',
        title: 'Project Management',
        description: 'Create and manage inspection projects with ease. Each project contains all related videos, observations, and reports. Assign team members, set priorities, and track progress through the complete inspection workflow.',
        tips: ['Use filters to find projects quickly', 'Click a project card to view details', 'Drag to reorder by priority'],
        icon: FolderOpen,
        color: 'from-rose-500 to-pink-500',
        illustration: (
            <div className="relative w-full h-64 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Inspection Projects</h3>
                    <button className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-lg shadow-purple-200">
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600 text-white p-4">
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-bold text-white">Riveria Beach Pipeline</p>
                                    <p className="text-xs text-white/80 mt-1">Florida Utilities • Miami, FL</p>
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-1.5 bg-white/20 rounded hover:bg-white/30"><PencilIcon className="w-3 h-3" /></button>
                                    <button className="p-1.5 bg-white/20 rounded hover:bg-white/30"><Trash2Icon className="w-3 h-3" /></button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium">AI PROCESSING</span>
                            </div>
                            <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Progress</span><span className="font-medium">65%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-[#D76A84] to-pink-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600 text-white p-4">
                            <p className="font-bold">Downtown Sewer Main</p>
                            <p className="text-xs text-white/80 mt-1">City Works • Orlando, FL</p>
                        </div>
                        <div className="p-3">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">COMPLETED</span>
                            <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500">Progress</span><span className="font-medium text-green-600">100%</span>
                                </div>
                                <div className="w-full bg-green-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'ai-processing',
        title: 'AI-Powered Analysis',
        description: 'Our advanced AI analyzes pipeline videos in real-time, detecting cracks, root intrusions, joint offsets, and more. Review AI findings, adjust confidence thresholds, and reprocess videos when needed.',
        tips: ['AI processes videos automatically after upload', 'Click "Reprocess AI" to re-analyze with updated models', 'Review detections in the timeline view'],
        icon: Brain,
        color: 'from-violet-500 to-purple-600',
        illustration: (
            <div className="relative w-full h-64 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 p-4">
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-900">Pipeline Inspection #1042</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs text-gray-600"><span className="w-2 h-2 rounded-full bg-rose-400"></span>Miami, FL</span>
                                <span className="flex items-center gap-1 text-xs text-gray-600"><span className="w-2 h-2 rounded-full bg-blue-400"></span>Florida Utils</span>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Reprocessing...
                        </button>
                    </div>
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" style={{ width: '45%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">AI is analyzing video footage...</p>
                    </div>
                </div>
                <p className="text-xs font-medium text-gray-700 mb-2">AI Detections Found:</p>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { type: 'Crack', distance: '45.2m', conf: '95%', color: 'red' },
                        { type: 'Root Intrusion', distance: '78.5m', conf: '89%', color: 'amber' },
                        { type: 'Joint Offset', distance: '112.3m', conf: '92%', color: 'blue' },
                    ].map((d) => (
                        <div key={d.type} className={`bg-white rounded-lg p-3 border border-${d.color}-100 shadow-sm`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2.5 h-2.5 rounded-full bg-${d.color}-500`}></span>
                                <span className={`text-xs font-medium text-${d.color}-600`}>{d.type}</span>
                            </div>
                            <p className="text-[10px] text-gray-500">Distance: {d.distance}</p>
                            <p className="text-[10px] text-gray-500">Confidence: {d.conf}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'uploads',
        title: 'Upload & Manage Files',
        description: 'Upload inspection videos, documents, and images directly to the cloud. Files are automatically processed by our AI system and organized within their respective projects.',
        tips: ['Drag & drop multiple files at once', 'Supported formats: MP4, MOV, PDF, JPG', 'Maximum file size: 5GB per file'],
        icon: Upload,
        color: 'from-rose-500 to-red-500',
        illustration: (
            <div className="relative w-full h-64 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 p-4">
                <div className="border-2 border-dashed border-rose-300 rounded-xl p-6 bg-white/50 text-center mb-4">
                    <Upload className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-rose-600">Drop files here or click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">MP4, MOV, PDF, JPG up to 5GB</p>
                </div>
                <p className="text-xs font-medium text-gray-700 mb-2">Recent Uploads:</p>
                <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                        <Video className="w-6 h-6 text-rose-500" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">pipeline_inspection_001.mp4</p>
                            <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                                <div className="h-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-rose-600">75%</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-green-100 flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">inspection_report.pdf</p>
                            <p className="text-xs text-green-600">Upload complete • AI Processing started</p>
                        </div>
                        <span className="text-xs text-gray-500">2.4 MB</span>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'complete',
        title: "You're All Set! 🚀",
        description: 'Congratulations! You now know the essentials. Explore each section to discover more advanced features. Need this tour again? Just click "Tour Guide" from your profile menu.',
        tips: ['Explore the sidebar for all features', 'Check notifications regularly', 'Reach out to support if you need help'],
        icon: Rocket,
        color: 'from-purple-500 via-pink-500 to-rose-500',
        illustration: (
            <div className="relative w-full h-64 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl overflow-hidden border border-purple-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Ready to Inspect!</h3>
                    <p className="text-sm text-gray-500 mt-2">Start managing your pipeline inspections now 🎉</p>
                    <div className="flex justify-center gap-2 mt-4">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">View Dashboard</button>
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium text-white shadow-lg">Create Project</button>
                    </div>
                </div>
            </div>
        ),
    },
];

// Tour steps by role
const tourSteps = {
    admin: adminSteps,
    'qc-technician': [
        {
            id: 'welcome',
            title: 'Welcome, QC Technician! 🔍',
            description: 'As a QC Technician, you play a critical role in ensuring the quality and accuracy of pipeline inspections. You\'ll review AI-detected defects, verify findings, and certify that all observations meet PACP standards.',
            tips: ['Your reviews ensure accurate reporting', 'Take time to verify each detection', 'Use PACP codes correctly for compliance'],
            icon: ClipboardCheck,
            color: 'from-rose-500 to-pink-600',
            illustration: (
                <div className="w-full h-64 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-6">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D76A84] via-rose-500 to-pink-600 flex items-center justify-center shadow-xl">
                                <Target className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Quality Control Technician</h3>
                            <p className="text-sm text-gray-500 mt-1">Review • Verify • Certify</p>
                            <div className="flex justify-center gap-2 mt-4">
                                {['PACP Certified', 'AI Review', 'Quality First'].map((badge) => (
                                    <span key={badge} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">{badge}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'dashboard',
            title: 'Your QC Dashboard',
            description: 'The dashboard shows your workload at a glance. Monitor pending QC reviews, approved/rejected counts, and track your daily progress. Stats update in real-time as you complete reviews.',
            tips: ['Check "Pending QC" for items needing attention', 'The refresh button updates all stats', 'Charts show your weekly review trends'],
            icon: LayoutDashboard,
            color: 'from-blue-500 to-indigo-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {[
                            { label: 'Pending QC', value: '12', icon: Eye, color: 'rose' },
                            { label: 'Approved', value: '45', icon: CheckCircle, color: 'green' },
                            { label: 'Rejected', value: '8', icon: Target, color: 'red' },
                            { label: 'Needs Review', value: '6', icon: ClipboardCheck, color: 'amber' },
                            { label: 'Total Reviewed', value: '156', icon: Database, color: 'purple' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-lg p-2.5 border border-gray-100 shadow-sm">
                                <div className={`w-7 h-7 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-1.5`}>
                                    <stat.icon className={`w-3.5 h-3.5 text-${stat.color}-600`} />
                                </div>
                                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                <p className="text-[9px] text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-xs font-medium text-gray-600 mb-2">Weekly QC Trends</p>
                            <div className="flex items-end gap-1 h-16">
                                {[30, 50, 40, 70, 55, 80, 65].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-rose-500 to-pink-400 rounded-t" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-lg p-3 border border-rose-200">
                            <p className="text-xs font-medium text-gray-700 mb-2">Today's Progress</p>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-rose-600">8</p>
                                    <p className="text-[10px] text-gray-600">Assigned</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">5</p>
                                    <p className="text-[10px] text-gray-600">Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'assignments',
            title: 'Project Assignments',
            description: 'Projects are assigned to you by admins for QC review. Each project card shows the project name, location, priority level, and review progress. Click on a project to start reviewing its detections.',
            tips: ['High priority projects should be reviewed first', 'Check the detection count before starting', 'Progress bar shows how many detections you\'ve reviewed'],
            icon: FolderOpen,
            color: 'from-amber-500 to-orange-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900">Assigned Projects</h3>
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                        {[
                            { name: 'Beach Road Pipeline', location: 'Miami, FL', priority: 'high', status: 'assigned', progress: 0, detections: 24 },
                            { name: 'Downtown Sewer Main', location: 'Orlando, FL', priority: 'medium', status: 'in-progress', progress: 45, detections: 18 },
                            { name: 'Industrial Park Line', location: 'Tampa, FL', priority: 'low', status: 'completed', progress: 100, detections: 12 },
                        ].map((project, idx) => (
                            <div key={idx} className={`p-3 rounded-xl border transition-all ${idx === 1 ? 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 shadow-sm' : 'border-gray-200 bg-white'}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{project.name}</p>
                                        <p className="text-[10px] text-gray-500">{project.location}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${project.priority === 'high' ? 'bg-red-100 text-red-700' : project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{project.priority}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${project.status === 'completed' ? 'bg-green-100 text-green-700' : project.status === 'in-progress' ? 'bg-rose-100 text-rose-700' : 'bg-yellow-100 text-yellow-700'}`}>{project.status}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                                        <div className="h-1.5 bg-gradient-to-r from-[#D76A84] to-pink-600 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-gray-600">{project.detections} detections</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            id: 'detections',
            title: 'Review AI Detections',
            description: 'When you select a project, you\'ll see all AI-detected defects. Each detection shows the type (crack, root intrusion, etc.), confidence level, severity, and current status. Pending detections need your review.',
            tips: ['Yellow ring indicates pending review', 'Confidence % shows how certain the AI is', 'Click a detection to see full details'],
            icon: Brain,
            color: 'from-violet-500 to-purple-600',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900">AI Detections (8 need review)</h3>
                        <div className="flex gap-1">
                            <select className="text-[10px] px-2 py-1 border border-gray-200 rounded-lg bg-white">
                                <option>All Severity</option>
                            </select>
                            <select className="text-[10px] px-2 py-1 border border-gray-200 rounded-lg bg-white">
                                <option>Pending</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {[
                            { type: 'Longitudinal Crack', confidence: 95, severity: 'Major', status: 'pending' },
                            { type: 'Root Intrusion', confidence: 88, severity: 'Moderate', status: 'pending' },
                            { type: 'Joint Offset', confidence: 92, severity: 'Minor', status: 'approved' },
                        ].map((detection, idx) => (
                            <div key={idx} className={`p-3 rounded-xl border transition-all ${idx === 0 ? 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 ring-2 ring-yellow-200' : detection.status === 'approved' ? 'border-green-200 bg-white' : 'border-gray-200 bg-white ring-2 ring-yellow-100'}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900 text-sm">{detection.type}</span>
                                            {detection.status === 'pending' && <ClipboardCheck className="w-3 h-3 text-yellow-500" />}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${detection.confidence >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{detection.confidence}% conf</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-semibold">{detection.severity}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${detection.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{detection.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            id: 'approve-reject',
            title: 'Approve or Reject',
            description: 'For each pending detection, review the evidence and decide: Approve if the AI correctly identified the defect, or Reject if it\'s a false positive. Your decision updates the detection status instantly.',
            tips: ['Approve = AI detection is correct', 'Reject = False positive or incorrect', 'You can bulk select multiple detections'],
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="bg-white rounded-xl border border-rose-200 shadow-lg p-4 mb-3">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-bold text-gray-900">Longitudinal Crack</p>
                                <p className="text-xs text-gray-500">Distance: 45.2m • Frame: 1342</p>
                            </div>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-semibold">PENDING REVIEW</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                <p className="text-lg font-bold text-green-600">95%</p>
                                <p className="text-[10px] text-gray-500">Confidence</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                <p className="text-lg font-bold text-orange-600">Major</p>
                                <p className="text-[10px] text-gray-500">Severity</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                <p className="text-lg font-bold text-gray-700">3:00</p>
                                <p className="text-[10px] text-gray-500">Clock Pos</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-green-200">
                                <CheckCircle className="w-4 h-4" /> Approve
                            </button>
                            <button className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-200">
                                <Target className="w-4 h-4" /> Reject
                            </button>
                        </div>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-center justify-between">
                        <span className="text-xs text-rose-700 font-medium">3 detections selected</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-600 text-white text-[10px] rounded-lg font-semibold">Approve All</button>
                            <button className="px-3 py-1 bg-red-600 text-white text-[10px] rounded-lg font-semibold">Reject All</button>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'shortcuts',
            title: 'Keyboard Shortcuts ⌨️',
            description: 'Speed up your workflow with keyboard shortcuts! Press A to approve, R to reject, and use arrow keys to navigate between detections. Press Escape to deselect.',
            tips: ['A = Approve current detection', 'R = Reject current detection', '↑↓ = Navigate between detections', 'Esc = Deselect'],
            icon: Zap,
            color: 'from-amber-500 to-yellow-500',
            illustration: (
                <div className="w-full h-64 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 text-center">Keyboard Shortcuts</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'A', action: 'Approve Detection', color: 'green' },
                            { key: 'R', action: 'Reject Detection', color: 'red' },
                            { key: '↑', action: 'Previous Detection', color: 'blue' },
                            { key: '↓', action: 'Next Detection', color: 'blue' },
                            { key: 'Esc', action: 'Deselect', color: 'gray' },
                            { key: 'Space', action: 'Quick Approve', color: 'purple' },
                        ].map((shortcut) => (
                            <div key={shortcut.key} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                <kbd className={`px-3 py-1.5 bg-${shortcut.color}-100 text-${shortcut.color}-700 rounded-lg text-sm font-bold min-w-[40px] text-center shadow-sm`}>{shortcut.key}</kbd>
                                <span className="text-xs text-gray-700">{shortcut.action}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-500 text-center mt-4">Use shortcuts to review detections faster!</p>
                </div>
            ),
        },
        {
            id: 'complete',
            title: 'Ready for Quality Reviews! ✅',
            description: 'You\'re now equipped to review AI detections efficiently. Remember: your careful reviews ensure accurate PACP-compliant reports for our clients. Quality is our top priority!',
            tips: ['Review each detection carefully', 'Use keyboard shortcuts for speed', 'Mark projects complete when done'],
            icon: Rocket,
            color: 'from-green-500 to-emerald-500',
            illustration: (
                <div className="w-full h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Ready to Review!</h3>
                        <p className="text-sm text-gray-500 mt-2">Start reviewing your assigned projects 🎉</p>
                        <div className="flex justify-center gap-2 mt-4">
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">View Dashboard</button>
                            <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg text-sm font-medium text-white shadow-lg">Start Reviews</button>
                        </div>
                    </div>
                </div>
            ),
        },
    ],
    operator: [
        {
            id: 'welcome',
            title: 'Welcome, Operator! 🎬',
            description: 'As a Field Operator, you\'re the eyes and ears on the ground. You capture inspection footage, manage equipment, and ensure high-quality data collection. Let\'s walk through your revamped workflow.',
            tips: ['Quality video = better AI detection', 'Check equipment before each job', 'Upload footage daily for faster processing'],
            icon: Video,
            color: 'from-orange-500 to-red-500',
            illustration: (
                <div className="w-full h-64 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-xl">
                                <Video className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Field Operator v2.1</h3>
                            <p className="text-sm text-gray-500 mt-1">Capture • Upload • Monitor</p>
                            <div className="flex justify-center gap-2 mt-4">
                                {['Field Ready', 'Equipment Pro', 'Data Collector'].map((badge) => (
                                    <span key={badge} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">{badge}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'dashboard',
            title: 'Your Operations Dashboard',
            description: 'Monitor all your field operations from one place. Track active operations, equipment status, system uptime, and critical alerts. The dashboard updates in real-time.',
            tips: ['Green = Running smoothly', 'Yellow = Needs attention', 'Red = Critical - take action'],
            icon: LayoutDashboard,
            color: 'from-blue-500 to-indigo-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {[
                            { label: 'Active Ops', value: '8', icon: Play, color: 'green' },
                            { label: 'Equipment', value: '12', icon: Camera, color: 'blue' },
                            { label: 'Alerts', value: '2', icon: Bell, color: 'orange' },
                            { label: 'Maintenance', value: '3', icon: Settings, color: 'yellow' },
                            { label: 'Uptime', value: '99%', icon: Zap, color: 'green' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-lg p-2.5 border border-gray-100 shadow-sm">
                                <div className={`w-7 h-7 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-1.5`}>
                                    <stat.icon className={`w-3.5 h-3.5 text-${stat.color}-600`} />
                                </div>
                                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                <p className="text-[9px] text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-xs font-medium text-gray-600 mb-2">Weekly Performance</p>
                            <div className="flex items-end gap-1 h-16">
                                {[60, 80, 70, 90, 85, 95, 88].map((h, i) => (
                                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3 border border-orange-200">
                            <p className="text-xs font-medium text-gray-700 mb-2">Status Distribution</p>
                            <div className="flex gap-2">
                                <div className="text-center flex-1">
                                    <div className="w-8 h-8 mx-auto rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">10</div>
                                    <p className="text-[9px] text-gray-600 mt-1">Running</p>
                                </div>
                                <div className="text-center flex-1">
                                    <div className="w-8 h-8 mx-auto rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">2</div>
                                    <p className="text-[9px] text-gray-600 mt-1">Paused</p>
                                </div>
                                <div className="text-center flex-1">
                                    <div className="w-8 h-8 mx-auto rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">2</div>
                                    <p className="text-[9px] text-gray-600 mt-1">Maint.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'tasks',
            title: 'Manage Your Tasks 📋',
            description: 'Stay organized with your personal task board. View assigned jobs, track progress, and update statuses as you complete your work. Filter tasks by priority to focus on what matters.',
            tips: ['Drag and drop to update status', 'Check high-priority tasks first', 'Add comments for your team'],
            icon: ClipboardCheck,
            color: 'from-emerald-500 to-green-600',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">My Tasks</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">To Do</p>
                            <div className="space-y-2">
                                <div className="bg-white p-2 rounded border border-gray-200 shadow-sm border-l-4 border-l-red-500">
                                    <p className="text-xs font-bold text-gray-800">Inspect Sector 7</p>
                                    <p className="text-[10px] text-gray-500">Due Today</p>
                                </div>
                                <div className="bg-white p-2 rounded border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
                                    <p className="text-xs font-bold text-gray-800">Calibrate Sensors</p>
                                    <p className="text-[10px] text-gray-500">Due Tomorrow</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-lg">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">In Progress</p>
                            <div className="space-y-2">
                                <div className="bg-white p-2 rounded border border-gray-200 shadow-sm border-l-4 border-l-yellow-500">
                                    <p className="text-xs font-bold text-gray-800">Upload Footage</p>
                                    <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                                        <div className="h-1 bg-yellow-500 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'equipment',
            title: 'Equipment Monitoring',
            description: 'Keep track of all your field equipment - cameras, crawlers, and sensors. Check battery levels, connectivity status, and location. Click any device for detailed information.',
            tips: ['Check battery before going to field', 'Green dot = online and connected', 'Report issues immediately'],
            icon: Camera,
            color: 'from-purple-500 to-violet-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Equipment Status</h3>
                    <div className="space-y-2">
                        {[
                            { name: 'Camera Unit A1', status: 'recording', battery: '85%', location: 'Site 1' },
                            { name: 'Crawler Bot C3', status: 'online', battery: '72%', location: 'Site 2' },
                            { name: 'Sensor Hub S1', status: 'maintenance', battery: '45%', location: 'Depot' },
                        ].map((device, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${device.status === 'recording' ? 'bg-green-500 animate-pulse' : device.status === 'online' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{device.name}</p>
                                        <p className="text-[10px] text-gray-500">{device.location}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${device.status === 'recording' ? 'bg-green-100 text-green-700' : device.status === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{device.status}</span>
                                    <p className="text-[10px] text-gray-500 mt-1">🔋 {device.battery}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            id: 'uploads',
            title: 'Upload Inspection Videos',
            description: 'Upload your captured inspection footage directly to the cloud for AI analysis. You can upload multiple files at once. Ensure you have a stable connection for large files.',
            tips: ['MP4 and MOV formats supported', 'Maximum 5GB per file', 'Wait for upload to complete before closing'],
            icon: Upload,
            color: 'from-rose-500 to-red-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="border-2 border-dashed border-rose-300 rounded-xl p-6 bg-white/50 text-center mb-3">
                        <Upload className="w-10 h-10 text-rose-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-rose-600">Drop video files here or click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">MP4, MOV up to 5GB</p>
                    </div>
                    <div className="space-y-2">
                        <div className="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3">
                            <Video className="w-5 h-5 text-rose-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">inspection_site1.mp4</p>
                                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                                    <div className="h-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-rose-600">65%</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'notifications',
            title: 'Stay Informed 🔔',
            description: 'Never miss an important update. The revamped notifications center keeps you posted on new assignments, equipment alerts, and processing statuses.',
            tips: ['Click notifications to take action', 'Mark as read to clear clutter', 'Filter by type (Alert, Info, Task)'],
            icon: Bell,
            color: 'from-amber-400 to-orange-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Notifications</h3>
                    <div className="space-y-2">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-3">
                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">New Task Assigned</p>
                                <p className="text-[10px] text-gray-600">You have been assigned to "Sector 7 Inspection"</p>
                                <span className="text-[9px] text-gray-400">2 mins ago</span>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-100 flex gap-3">
                            <div className="mt-1 w-2 h-2 rounded-full bg-green-500"></div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">Upload Complete</p>
                                <p className="text-[10px] text-gray-600">Video "site1.mp4" processed successfully</p>
                                <span className="text-[9px] text-gray-400">1 hour ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'settings',
            title: 'Customize Your Profile ⚙️',
            description: 'Make the app yours. Update your profile picture, change your password, and configure preferences in the new Settings page. You can access this anytime from your avatar.',
            tips: ['Keep your profile up to date', 'Adjust notification preferences', 'Check "Video & AI" settings for upload quality'],
            icon: Settings,
            color: 'from-slate-600 to-slate-800',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-lg w-64 border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-purple-600">JD</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">John Doe</p>
                                <p className="text-xs text-gray-500">Senior Operator</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-50 rounded flex items-center px-3 text-xs text-gray-600">👤 Profile Settings</div>
                            <div className="h-8 bg-gray-50 rounded flex items-center px-3 text-xs text-gray-600">🔔 Notifications</div>
                            <div className="h-8 bg-gray-50 rounded flex items-center px-3 text-xs text-gray-600">🔒 Security</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'complete',
            title: 'Ready for the Field! 🚀',
            description: 'You\'re equipped with all the tools you need in this new version. Go capture high-quality inspections, monitor your equipment, and report your findings. Stay safe out there!',
            tips: ['Check equipment daily', 'Upload footage regularly', 'Report any issues immediately'],
            icon: Rocket,
            color: 'from-green-500 to-emerald-500',
            illustration: (
                <div className="w-full h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl">
                            <Rocket className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Field Ready!</h3>
                        <p className="text-sm text-gray-500 mt-2">Go capture great inspections 🎬</p>
                        <div className="flex justify-center gap-2 mt-4">
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">View Dashboard</button>
                            <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-sm font-medium text-white shadow-lg">Upload Video</button>
                        </div>
                    </div>
                </div>
            ),
        },
    ],
    customer: [
        {
            id: 'welcome',
            title: 'Welcome to Your Portal! 👋',
            description: 'This is your dedicated customer portal where you can track all your pipeline inspection projects. View progress, download reports, and stay updated on every inspection.',
            tips: ['Bookmark this page for quick access', 'Check back for project updates', 'Reports are available once inspections complete'],
            icon: Eye,
            color: 'from-teal-500 to-cyan-500',
            illustration: (
                <div className="w-full h-64 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200 p-6">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-xl">
                                <Eye className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Customer Portal</h3>
                            <p className="text-sm text-gray-500 mt-1">Track • View • Download</p>
                            <div className="flex justify-center gap-2 mt-4">
                                {['Project Tracking', 'PACP Reports', '24/7 Access'].map((badge) => (
                                    <span key={badge} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">{badge}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'projects',
            title: 'Your Projects Dashboard',
            description: 'View all your inspection projects at a glance. See total projects, completed inspections, and those currently in review. Use search and filters to find specific projects quickly.',
            tips: ['Use search to find projects fast', 'Filter by status to see what needs attention', 'Click any project for full details'],
            icon: FolderOpen,
            color: 'from-blue-500 to-indigo-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            { label: 'Total Projects', value: '12', icon: FileText, color: 'blue' },
                            { label: 'Completed', value: '8', icon: CheckCircle, color: 'green' },
                            { label: 'In Review', value: '4', icon: Target, color: 'yellow' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        {[
                            { name: 'Main Street Pipeline', status: 'Ready for Review', location: 'Miami, FL' },
                            { name: 'Downtown Sewer Line', status: 'QC Review', location: 'Orlando, FL' },
                        ].map((project, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-3 border border-gray-200 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{project.name}</p>
                                    <p className="text-[10px] text-gray-500">{project.location}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${idx === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{project.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            id: 'status',
            title: 'Understand Project Status',
            description: 'Each project goes through several stages: Planning → Field Capture → AI Processing → QC Review → Ready for Review → Completed. Status badges help you track where your project is.',
            tips: ['Green = Ready or Completed', 'Yellow = In progress or review', 'Purple = Completed and delivered'],
            icon: Target,
            color: 'from-purple-500 to-violet-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 text-center">Project Workflow</h3>
                    <div className="space-y-2">
                        {[
                            { stage: 'Planning', status: 'complete', desc: 'Project scope defined' },
                            { stage: 'Field Capture', status: 'complete', desc: 'Video captured on site' },
                            { stage: 'AI Processing', status: 'complete', desc: 'Defects auto-detected' },
                            { stage: 'QC Review', status: 'current', desc: 'Expert verification' },
                            { stage: 'Ready for Review', status: 'pending', desc: 'Awaiting your review' },
                            { stage: 'Completed', status: 'pending', desc: 'Report delivered' },
                        ].map((step, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.status === 'complete' ? 'bg-green-500' : step.status === 'current' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-200'}`}>
                                    {step.status === 'complete' ? <CheckCircle className="w-4 h-4 text-white" /> : <span className="text-[10px] text-white font-bold">{idx + 1}</span>}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${step.status === 'complete' ? 'text-green-700' : step.status === 'current' ? 'text-yellow-700' : 'text-gray-400'}`}>{step.stage}</p>
                                </div>
                                <span className={`text-[10px] ${step.status === 'current' ? 'text-yellow-600 font-semibold' : 'text-gray-400'}`}>{step.status === 'current' ? 'In Progress' : ''}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            id: 'reports',
            title: 'Access Your Reports',
            description: 'Once an inspection is complete, you can download the full PACP-compliant inspection report in PDF format. Reports include all AI-detected defects, severity ratings, and recommendations.',
            tips: ['Reports are auto-generated', 'PDF format for easy sharing', 'Includes photos and severity ratings'],
            icon: FileText,
            color: 'from-orange-500 to-amber-500',
            illustration: (
                <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center w-full max-w-xs">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-8 h-8 text-orange-500" />
                        </div>
                        <p className="font-bold text-gray-800">PACP Inspection Report</p>
                        <p className="text-xs text-gray-500 mt-1">Main Street Pipeline</p>
                        <p className="text-xs text-gray-400 mt-1">Generated: Jan 30, 2026</p>
                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">Preview</button>
                            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-lg shadow">Download</button>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'complete',
            title: 'We\'re Here for You! 💼',
            description: 'Explore your portal to track projects and access reports. If you have any questions or need support, our team is just a click away. Quality inspections, delivered on time.',
            tips: ['Check status updates regularly', 'Download reports when ready', 'Contact support if you need help'],
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-500',
            illustration: (
                <div className="w-full h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">You're All Set!</h3>
                        <p className="text-sm text-gray-500 mt-2">Start exploring your projects 📊</p>
                        <div className="flex justify-center gap-2 mt-4">
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">View Projects</button>
                            <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-sm font-medium text-white shadow-lg">Get Support</button>
                        </div>
                    </div>
                </div>
            ),
        },
    ],
};

const TOUR_COMPLETED_KEY = 'sewervision_tour_completed';
const TOUR_DISMISSED_KEY = 'sewervision_tour_dismissed';
const WHATS_NEW_VERSION_KEY = 'sewervision_whats_new_last_viewed_version';

export const TourGuide = ({ isOpen, onClose, role = 'admin' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [activeTab, setActiveTab] = useState('tour'); // 'tour' or 'whats-new'
    const [isAnimating, setIsAnimating] = useState(false);

    const steps = tourSteps[role] || tourSteps.admin;
    const currentStepData = steps[currentStep];
    const StepIcon = currentStepData?.icon || HelpCircle;

    const [unreadCount, setUnreadCount] = useState(0);

    // Initial check for unread updates
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lastViewedVersion = localStorage.getItem(WHATS_NEW_VERSION_KEY);
            const latestVersion = whatsNewData[0];

            if (lastViewedVersion !== latestVersion.id) {
                // Calculate total new items
                const totalUpdates = Object.values(latestVersion.updates).flat().length;
                setUnreadCount(totalUpdates > 0 ? totalUpdates : 1);
            }
        }
    }, []);

    // Listen for custom events to open specific tabs
    useEffect(() => {
        const handleOpenEvent = (e) => {
            if (e.detail?.tab === 'whats-new') {
                setActiveTab('whats-new');
            }
        };
        window.addEventListener('openTourGuide', handleOpenEvent);
        return () => window.removeEventListener('openTourGuide', handleOpenEvent);
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setIsAnimating(true);
            setTimeout(() => { setCurrentStep(currentStep + 1); setIsAnimating(false); }, 150);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setIsAnimating(true);
            setTimeout(() => { setCurrentStep(currentStep - 1); setIsAnimating(false); }, 150);
        }
    };

    const handleComplete = () => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        localStorage.setItem(`${TOUR_COMPLETED_KEY}_${role}`, 'true');
        onClose?.();
    };

    const handleSkip = () => {
        localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
        onClose?.();
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'whats-new') {
            const latestVersion = whatsNewData[0];
            localStorage.setItem(WHATS_NEW_VERSION_KEY, latestVersion.id);
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // If opening specifically for Whats New (via event prop or default), dont reset to tour
            // But here we rely on the internal state activeTab which is set by the listener
            // If just opening, default to tour unless already set to whats-new
            if (activeTab !== 'whats-new') {
                setCurrentStep(0);
                setActiveTab('tour');
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh]">
                {/* Tab Header */}
                <div className="flex border-b border-gray-200 bg-white">
                    <button onClick={() => handleTabChange('tour')} className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'tour' ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50' : 'text-gray-500'}`}>
                        <Rocket className="w-4 h-4" /> Tour Guide
                    </button>
                    <button onClick={() => handleTabChange('whats-new')} className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'whats-new' ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50' : 'text-gray-500'}`}>
                        <Megaphone className="w-4 h-4" /> What's New
                        {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">{unreadCount}</span>
                        )}
                    </button>
                </div>

                {activeTab === 'whats-new' ? (
                    <div className="p-5">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Gift className="w-5 h-5 text-purple-500" /> What's New</h2>
                            <p className="text-sm text-gray-500">See the latest updates and improvements</p>
                        </div>
                        <WhatsNewContent />
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                            <Button onClick={() => handleTabChange('tour')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                Back to Tour <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${currentStepData?.color || 'from-blue-500 to-purple-500'} p-5 text-white relative`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                        <StepIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-white/80 text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
                                </div>
                                <button onClick={handleSkip} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <DialogHeader className="text-left mt-3">
                                <DialogTitle className={`text-2xl font-bold text-white transition-opacity ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                                    {currentStepData?.title}
                                </DialogTitle>
                            </DialogHeader>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 overflow-y-auto max-h-[50vh]">
                            {/* Illustration */}
                            <div className={`transition-opacity ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                                {currentStepData?.illustration}
                            </div>

                            {/* Description */}
                            <DialogDescription className={`text-gray-600 text-sm mt-4 leading-relaxed transition-opacity ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                                {currentStepData?.description}
                            </DialogDescription>

                            {/* Tips */}
                            {currentStepData?.tips?.length > 0 && (
                                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Pro Tips:</p>
                                    <ul className="space-y-1">
                                        {currentStepData.tips.map((tip, i) => (
                                            <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                                                <Star className="w-3 h-3 mt-0.5 text-amber-500" /> {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Progress Dots */}
                            <div className="flex justify-center gap-2 mt-5">
                                {steps.map((_, i) => (
                                    <button key={i} onClick={() => setCurrentStep(i)} className={`h-2 rounded-full transition-all ${i === currentStep ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' : i < currentStep ? 'w-2 bg-green-400' : 'w-2 bg-gray-200'}`} />
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <DialogFooter className="px-5 py-4 bg-gray-50 border-t flex justify-between">
                            <Button variant="ghost" onClick={handleSkip} className="text-gray-500">Skip Tour</Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                                </Button>
                                <Button onClick={handleNext} className={`bg-gradient-to-r ${currentStepData?.color} text-white px-6`}>
                                    {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                                    {currentStep === steps.length - 1 ? <Rocket className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export const useTourGuide = (role = 'admin') => {
    const [showTour, setShowTour] = useState(false);
    const [hasSeenTour, setHasSeenTour] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem(`${TOUR_COMPLETED_KEY}_${role}`);
        const dismissed = localStorage.getItem(TOUR_DISMISSED_KEY);
        if (!completed && !dismissed) {
            setHasSeenTour(false);
            const timer = setTimeout(() => setShowTour(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [role]);

    return { showTour, openTour: () => setShowTour(true), closeTour: () => setShowTour(false), resetTour: () => { localStorage.removeItem(`${TOUR_COMPLETED_KEY}_${role}`); localStorage.removeItem(TOUR_DISMISSED_KEY); setShowTour(true); }, hasSeenTour };
};

export default TourGuide;
