'use client';

import React from 'react';
import {
    Users,
    LayoutDashboard,
    FolderOpen,
    FileText,
    ClipboardCheck,
    ClipboardCheckIcon,
    Rocket,
    Plus,
    Calendar,
    Monitor,
    Inbox,
} from 'lucide-react';

// User (Team Lead) Tour Steps
export const userSteps = [
    {
        id: 'welcome',
        moduleKeys: null,
        title: 'Welcome, Team Lead! 🧭',
        description:
            'As a Team Lead (User role), you coordinate operator and QC work across projects. This tour will show you how to use your management dashboard, My Projects, tasks, team, and device views.',
        tips: [
            'Use the left sidebar to jump between Dashboard, My Projects, Tasks, Team, Devices, and Inbox',
            'Your top navbar gives you quick access to profile, settings, and the Tour Guide again',
            'Most pages support search, filters, and rich detail views',
        ],
        icon: Users,
        color: 'from-emerald-500 to-teal-500',
        illustration: (
            <div className="w-full h-64 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 rounded-xl border border-emerald-200 p-6">
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Management Portal</h3>
                        <p className="text-sm text-gray-500 mt-1">Lead projects • Coordinate operators & QC • Track outcomes</p>
                        <div className="flex justify-center gap-2 mt-4">
                            {['My Projects', 'Team Management', 'Device Assignments'].map((badge) => (
                                <span
                                    key={badge}
                                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
                                >
                                    {badge}
                                </span>
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
        title: 'Dashboard – Your Overview',
        description:
            'The User Dashboard gives you a snapshot of the projects you manage, task load, QC review state, and upcoming schedule. It is the same view as /user/dashboard.',
        tips: [
            'Top cards show Managed Projects, In Progress, QC Pending, and Team Tasks Today',
            'Use the quick links on the right to jump to Projects, Tasks, and Inbox',
            'Refresh occasionally when you know operators are uploading new footage',
        ],
        icon: LayoutDashboard,
        color: 'from-blue-500 to-indigo-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                {/* Top stat cards – mirror /user/dashboard */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                        { label: 'Managed Projects', value: '24', icon: FolderOpen, color: 'rose' },
                        { label: 'In Progress', value: '8', icon: LayoutDashboard, color: 'purple' },
                        { label: 'QC Pending', value: '5', icon: ClipboardCheck, color: 'emerald' },
                        { label: 'Team Tasks Today', value: '12', icon: Calendar, color: 'sky' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div
                                    className={`w-8 h-8 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                                >
                                    <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-[11px] text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
                {/* Bottom row – Upcoming Schedule & Task Snapshot, matching dashboard layout */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <p className="text-xs font-medium text-gray-700">Upcoming Schedule</p>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-gray-600">
                            <div className="flex items-center justify-between border border-gray-100 rounded-lg px-2 py-1">
                                <span>Sector 7 inspection</span>
                                <span className="text-gray-400">Tomorrow</span>
                            </div>
                            <div className="flex items-center justify-between border border-gray-100 rounded-lg px-2 py-1">
                                <span>Camera truck maintenance</span>
                                <span className="text-gray-400">Fri</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-rose-500" />
                            <p className="text-xs font-medium text-gray-700">Task Snapshot</p>
                        </div>
                        <div className="space-y-1 text-[11px] text-gray-700">
                            <div className="flex justify-between">
                                <span>Active / Pending</span>
                                <span className="font-semibold">6</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Scheduled</span>
                                <span className="font-semibold">4</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Completed</span>
                                <span className="font-semibold">18</span>
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
        title: 'My Projects – Lead View',
        description:
            'My Projects lists every project where you are the manager. You can switch between card grid view and table view, create new projects, open the Project Console, and request deletions.',
        tips: [
            'Use search and status filters to quickly find a project',
            'Toggle between Grid and Table views depending on how much detail you want',
            'Click a project to open the full Project Console with video, AI detections, and observations',
        ],
        icon: FolderOpen,
        color: 'from-rose-500 to-pink-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-rose-500" />
                        <h3 className="text-sm font-bold text-gray-900">My Projects</h3>
                    </div>
                    <button className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow">
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Grid View</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="h-14 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg" />
                            <div className="h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg" />
                            <div className="h-14 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg" />
                            <div className="h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Table View</p>
                        <div className="space-y-1">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100"
                                >
                                    <div className="text-[11px] text-gray-700 font-medium">
                                        Project {i}
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                        ACTIVE
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <p className="text-[11px] text-gray-500">
                    Tip: When you open a project, you&apos;ll see the full Project Console with video player,
                    AI detections, observations timeline, and recording metadata.
                </p>
            </div>
        ),
    },
    {
        id: 'team-assets',
        moduleKeys: ['team', 'device-assignments', 'tasks'],
        title: 'Team, Tasks & Devices',
        description:
            'The User sidebar also gives you access to Track Tasks, Team Management, Device Assignments, and Inbox so you can coordinate work across operators and QC technicians.',
        tips: [
            'Track Tasks shows what your team is working on and their progress',
            'Team Management helps you see who reports to you and how they are assigned',
            'Device Assignments shows which trucks/cameras are assigned to which operators',
            'Use Inbox for cross-role messages and important system notifications',
        ],
        icon: ClipboardCheckIcon,
        color: 'from-amber-500 to-orange-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-3 gap-3 h-full">
                    <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                            Track Tasks
                        </p>
                        <div className="space-y-2">
                            <div className="bg-gray-50 rounded-lg p-2 border-l-4 border-l-red-500">
                                <p className="text-[11px] font-semibold text-gray-800">
                                    Review Sector 7
                                </p>
                                <p className="text-[10px] text-gray-500">High priority</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 border-l-4 border-l-amber-500">
                                <p className="text-[11px] font-semibold text-gray-800">
                                    Confirm device assignment
                                </p>
                                <p className="text-[10px] text-gray-500">Due tomorrow</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                            Team Management
                        </p>
                        <div className="space-y-1">
                            {['Operators', 'QC Technicians'].map((label) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-50"
                                >
                                    <span className="text-[11px] text-gray-700">{label}</span>
                                    <span className="text-[10px] text-gray-500">view</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                            Devices & Inbox
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] text-gray-700">
                                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Camera Truck #3 → Assigned</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-700">
                                <Inbox className="w-3.5 h-3.5 text-rose-500" />
                                <span>New message from QC Supervisor</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'complete',
        moduleKeys: null,
        title: 'You\'re Ready to Lead 🚀',
        description:
            'You now know how to use the User (Team Lead) workspace: dashboard, projects, team, tasks, devices, and inbox. Keep your projects moving by coordinating operators, QC, and AI review.',
        tips: [
            'Start in Dashboard each day to see where attention is needed',
            'Create or update projects from My Projects as scopes change',
            'Use Team Management and Device Assignments to keep field work running smoothly',
            'Return to this tour anytime from the Tour Guide entry in your profile menu',
        ],
        icon: Rocket,
        color: 'from-emerald-500 via-teal-500 to-sky-500',
        illustration: (
            <div className="w-full h-64 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 rounded-xl border border-emerald-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl">
                        <Rocket className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Ready to Manage!</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Head to your Dashboard or My Projects to put this into action.
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                            View Dashboard
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-sm font-medium text-white shadow-lg">
                            Open My Projects
                        </button>
                    </div>
                </div>
            </div>
        ),
    },
];
