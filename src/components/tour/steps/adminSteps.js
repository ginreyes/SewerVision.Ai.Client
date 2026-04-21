'use client';

import React from 'react';
import {
    Sparkles,
    LayoutDashboard,
    FolderOpen,
    Upload,
    CheckCircle,
    Rocket,
    Brain,
    Video,
    Camera,
    Database,
    Eye,
    Plus,
    RefreshCw,
    PencilIcon,
    Trash2Icon,
    Bell,
} from 'lucide-react';

// Admin Tour Steps
export const adminSteps = [
    {
        id: 'welcome',
        moduleKeys: null, // Always show
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
        moduleKeys: ['dashboard'],
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
        moduleKeys: ['projects'],
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
        moduleKeys: ['projects'],
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
        moduleKeys: ['uploads'],
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
        moduleKeys: null, // Always show
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
