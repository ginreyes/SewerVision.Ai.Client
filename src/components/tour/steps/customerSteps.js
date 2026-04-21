'use client';

import React from 'react';
import {
    Eye,
    FolderOpen,
    FileText,
    CheckCircle,
    Target,
    Camera,
    Settings,
} from 'lucide-react';

// Customer Tour Steps
export const customerSteps = [
    {
        id: 'welcome',
        moduleKeys: null,
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
        moduleKeys: ['projects'],
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
        moduleKeys: ['projects'],
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
        moduleKeys: ['reports'],
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
        id: 'settings',
        moduleKeys: ['settings'],
        title: 'Your Account Settings ⚙️',
        description: 'Manage your personal profile, upload a custom avatar, and keep your password secure. Your settings page lets you update your name, phone number, and company information anytime.',
        tips: ['Upload a profile photo to personalize your account', 'Change your password regularly for security', 'Keep your contact info up to date'],
        icon: Settings,
        color: 'from-slate-500 to-gray-600',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-center">
                <div className="w-full max-w-sm">
                    <div className="bg-white rounded-xl shadow-lg p-5 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="h-3 w-28 bg-gray-200 rounded-full" />
                                <div className="h-2 w-20 bg-gray-100 rounded-full mt-2" />
                            </div>
                            <div className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">Edit</div>
                        </div>
                        <div className="border-t border-gray-100 pt-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-gray-100" />
                                <div className="h-2.5 flex-1 bg-gray-100 rounded-full" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-gray-100" />
                                <div className="h-2.5 flex-1 bg-gray-100 rounded-full" />
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-3 flex gap-2">
                            <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">Profile</button>
                            <button className="flex-1 px-3 py-2 bg-gradient-to-r from-slate-500 to-gray-600 text-white text-xs font-medium rounded-lg shadow">Security</button>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'complete',
        moduleKeys: null,
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
                    <h3 className="text-xl font-bold text-gray-800">You&apos;re All Set!</h3>
                    <p className="text-sm text-gray-500 mt-2">Start exploring your projects 📊</p>
                    <div className="flex justify-center gap-2 mt-4">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">View Projects</button>
                        <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-sm font-medium text-white shadow-lg">Get Support</button>
                    </div>
                </div>
            </div>
        ),
    },
];
