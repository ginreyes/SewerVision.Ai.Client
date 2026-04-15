'use client';

import React from 'react';
import {
    Video,
    LayoutDashboard,
    Upload,
    ClipboardCheck,
    Bell,
    Settings,
    Rocket,
    Play,
    Camera,
    Zap,
} from 'lucide-react';

// Operator Tour Steps
export const operatorSteps = [
    {
        id: 'welcome',
        moduleKeys: null,
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
        moduleKeys: ['dashboard'],
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
        moduleKeys: ['tasks'],
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
        moduleKeys: ['equipment'],
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
        moduleKeys: ['uploads'],
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
        moduleKeys: ['notifications'],
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
        moduleKeys: ['settings'],
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
        moduleKeys: null,
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
];
