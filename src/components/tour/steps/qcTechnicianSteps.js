'use client';

import React from 'react';
import {
    ClipboardCheck,
    LayoutDashboard,
    FolderOpen,
    CheckCircle,
    Rocket,
    Brain,
    Target,
    Eye,
    Database,
    RefreshCw,
    Zap,
} from 'lucide-react';

// QC Technician Tour Steps
export const qcTechnicianSteps = [
    {
        id: 'welcome',
        moduleKeys: null,
        title: 'Welcome, QC Technician! 🔍',
        description: 'As a QC Technician, you play a critical role in ensuring the quality and accuracy of pipeline inspections. You\'ll review AI-detected defects, verify findings, and certify that all observations meet PACP standards.',
        tips: ['Your reviews ensure accurate reporting', 'Take time to verify each detection', 'Use PACP codes correctly for compliance'],
        icon: ClipboardCheck,
        color: 'from-purple-500 to-violet-600',
        illustration: (
            <div className="w-full h-64 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 p-6">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-xl">
                            <Target className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Quality Control Technician</h3>
                        <p className="text-sm text-gray-500 mt-1">Review • Verify • Certify</p>
                        <div className="flex justify-center gap-2 mt-4">
                            {['PACP Certified', 'AI Review', 'Quality First'].map((badge) => (
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
                                <div key={i} className="flex-1 bg-gradient-to-t from-purple-500 to-violet-400 rounded-t" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg p-3 border border-purple-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Today's Progress</p>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">8</p>
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
        moduleKeys: ['projects'],
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
                        <div key={idx} className={`p-3 rounded-xl border transition-all ${idx === 1 ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 shadow-sm' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{project.name}</p>
                                    <p className="text-[10px] text-gray-500">{project.location}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${project.priority === 'high' ? 'bg-red-100 text-red-700' : project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{project.priority}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${project.status === 'completed' ? 'bg-green-100 text-green-700' : project.status === 'in-progress' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>{project.status}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                                    <div className="h-1.5 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" style={{ width: `${project.progress}%` }}></div>
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
        moduleKeys: ['quality-control'],
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
                        <span className="text-[10px] px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-600">All Severity</span>
                        <span className="text-[10px] px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-600">Pending</span>
                    </div>
                </div>
                <div className="space-y-2">
                    {[
                        { type: 'Longitudinal Crack', confidence: 95, severity: 'Major', status: 'pending' },
                        { type: 'Root Intrusion', confidence: 88, severity: 'Moderate', status: 'pending' },
                        { type: 'Joint Offset', confidence: 92, severity: 'Minor', status: 'approved' },
                    ].map((detection, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border transition-all ${idx === 0 ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-violet-50 ring-2 ring-yellow-200' : detection.status === 'approved' ? 'border-green-200 bg-white' : 'border-gray-200 bg-white ring-2 ring-yellow-100'}`}>
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
        moduleKeys: ['quality-control'],
        title: 'Approve or Reject',
        description: 'For each pending detection, review the evidence and decide: Approve if the AI correctly identified the defect, or Reject if it\'s a false positive. Your decision updates the detection status instantly.',
        tips: ['Approve = AI detection is correct', 'Reject = False positive or incorrect', 'You can bulk select multiple detections'],
        icon: CheckCircle,
        color: 'from-green-500 to-emerald-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="bg-white rounded-xl border border-purple-200 shadow-lg p-4 mb-3">
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
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 flex items-center justify-between">
                    <span className="text-xs text-purple-700 font-medium">3 detections selected</span>
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
        moduleKeys: ['quality-control'],
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
        moduleKeys: null,
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
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg text-sm font-medium text-white shadow-lg">Start Reviews</button>
                    </div>
                </div>
            </div>
        ),
    },
];
