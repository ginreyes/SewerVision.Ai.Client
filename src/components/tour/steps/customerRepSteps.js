'use client';

import React from 'react';
import {
    Headphones,
    LayoutDashboard,
    Inbox,
    Ticket,
    MessageSquareWarning,
    ListTodo,
    Activity,
    Users,
    FileText,
    Rocket,
    Plus,
    CheckCircle,
    Clock,
    MessageSquare,
    ArrowRight,
    Copy,
} from 'lucide-react';

// Customer Rep Tour Steps
export const customerRepSteps = [
    {
        id: 'welcome',
        moduleKeys: null,
        title: 'Welcome, Support Rep! 🎧',
        description: 'As a Customer Representative, you\'re the front line of support. You manage tickets, monitor SLA compliance, and ensure every customer gets a timely, high-quality response. Let\'s walk through your Support Console.',
        tips: ['Use the sidebar to navigate between Tickets, Monitoring, and Team', 'Your dashboard shows real-time support metrics', 'Quick actions help you respond faster'],
        icon: Headphones,
        color: 'from-teal-500 to-cyan-500',
        illustration: (
            <div className="w-full h-64 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200 p-6">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600 flex items-center justify-center shadow-xl">
                            <Headphones className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Support Console v2.1</h3>
                        <p className="text-sm text-gray-500 mt-1">Respond • Resolve • Delight</p>
                        <div className="flex justify-center gap-2 mt-4">
                            {['Ticket Pro', 'SLA Tracker', 'Team Player'].map((badge) => (
                                <span key={badge} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">{badge}</span>
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
        title: 'Your Support Dashboard',
        description: 'The dashboard gives you a snapshot of all support activity at a glance. Track open tickets, in-progress items, resolved counts, and your personal queue. Stats refresh every 30 seconds.',
        tips: ['Monitor "Open Tickets" to see what needs attention', 'Check assigned tickets for your personal queue', 'Use quick actions to jump to common tasks'],
        icon: LayoutDashboard,
        color: 'from-blue-500 to-indigo-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                        { label: 'Open', value: '14', icon: Ticket, color: 'teal' },
                        { label: 'In Progress', value: '8', icon: Clock, color: 'amber' },
                        { label: 'Resolved', value: '52', icon: CheckCircle, color: 'green' },
                        { label: 'My Queue', value: '5', icon: Inbox, color: 'blue' },
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
                        <p className="text-xs font-medium text-gray-600 mb-2">Weekly Resolution Trend</p>
                        <div className="flex items-end gap-1 h-16">
                            {[40, 55, 35, 70, 60, 85, 75].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-lg p-3 border border-teal-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Today&apos;s Activity</p>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-teal-600">5</p>
                                <p className="text-[10px] text-gray-600">Assigned</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">3</p>
                                <p className="text-[10px] text-gray-600">Resolved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'inbox',
        moduleKeys: ['rep-inbox'],
        title: 'Your Inbox 📬',
        description: 'Stay connected with your team through the internal messaging system. Receive ticket update notifications, send messages to colleagues, and manage your communication all in one place.',
        tips: ['Unread messages show a badge count', 'Use folders to organize: Inbox, Sent, Drafts', 'Compose messages to coordinate with your team'],
        icon: Inbox,
        color: 'from-violet-500 to-purple-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex gap-3 h-full">
                    <div className="w-24 space-y-1">
                        {[
                            { name: 'Inbox', count: 4, active: true },
                            { name: 'Sent', count: 0, active: false },
                            { name: 'Drafts', count: 1, active: false },
                        ].map((folder) => (
                            <div key={folder.name} className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${folder.active ? 'bg-teal-100 text-teal-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <span>{folder.name}</span>
                                {folder.count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${folder.active ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{folder.count}</span>}
                            </div>
                        ))}
                        <div className="pt-2">
                            <div className="px-2 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-xs font-medium text-white text-center shadow-sm">
                                <Plus className="w-3 h-3 inline mr-1" />Compose
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        {[
                            { from: 'Admin', subject: 'New ticket assigned: #1042', time: '2m ago', unread: true },
                            { from: 'Sarah K.', subject: 'Re: SLA escalation for Beach Rd', time: '15m ago', unread: true },
                            { from: 'System', subject: 'Ticket #1038 resolved automatically', time: '1h ago', unread: false },
                        ].map((msg, idx) => (
                            <div key={idx} className={`p-2.5 rounded-lg border ${msg.unread ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className={`text-xs ${msg.unread ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{msg.from}</span>
                                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                                </div>
                                <p className={`text-[11px] ${msg.unread ? 'text-gray-800' : 'text-gray-500'}`}>{msg.subject}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'tickets',
        moduleKeys: ['tickets'],
        title: 'Manage Support Tickets 🎫',
        description: 'Your core workspace. View all customer support tickets in a powerful table with search, filtering, and sorting. Click any ticket to see full details, respond, and update status. New tickets appear automatically.',
        tips: ['Use search to find tickets by subject or customer', 'Filter by priority (High, Medium, Low) or status', 'Click a ticket row to open its full detail view'],
        icon: Ticket,
        color: 'from-teal-500 to-emerald-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Support Tickets</h3>
                    <div className="flex gap-1">
                        <span className="text-[10px] px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-600">All Status</span>
                        <span className="text-[10px] px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-600">All Priority</span>
                    </div>
                </div>
                <div className="space-y-2">
                    {[
                        { id: '#1042', subject: 'Report PDF not loading', customer: 'Acme Corp', priority: 'High', status: 'Open', responses: 2 },
                        { id: '#1041', subject: 'Request access to project data', customer: 'City of Miami', priority: 'Medium', status: 'In Progress', responses: 5 },
                        { id: '#1039', subject: 'Invoice discrepancy Q3', customer: 'Pipeline Solutions', priority: 'Low', status: 'Resolved', responses: 8 },
                    ].map((ticket, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border transition-all ${idx === 0 ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-sm' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-start justify-between mb-1.5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 font-mono">{ticket.id}</span>
                                        <p className="font-semibold text-gray-900 text-sm">{ticket.subject}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-500">{ticket.customer}</p>
                                </div>
                                <div className="flex gap-1">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${ticket.priority === 'High' ? 'bg-red-100 text-red-700' : ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{ticket.priority}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${ticket.status === 'Open' ? 'bg-teal-100 text-teal-700' : ticket.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{ticket.status}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                <MessageSquare className="w-3 h-3" /> {ticket.responses} responses
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'complaints',
        moduleKeys: ['rep-complaints'],
        title: 'Customer Complaints 📋',
        description: 'Track and manage customer complaints from all channels. Customers submit complaints through their portal, and you can review, investigate, and escalate them into support tickets. Each complaint tracks severity, category, and resolution status.',
        tips: ['Review new complaints daily and update their status', 'Escalate critical complaints by creating tickets directly', 'Add notes to document your investigation progress'],
        icon: MessageSquareWarning,
        color: 'from-red-500 to-orange-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Complaints</h3>
                    <div className="flex gap-1">
                        <span className="text-[10px] px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-600">All Status</span>
                        <span className="text-[10px] px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-600">All Severity</span>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                        { label: 'New', value: '6', color: 'teal' },
                        { label: 'Investigating', value: '4', color: 'amber' },
                        { label: 'Action Required', value: '2', color: 'red' },
                        { label: 'Resolved', value: '18', color: 'green' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                            <p className={`text-lg font-bold text-${stat.color}-600`}>{stat.value}</p>
                            <p className="text-[9px] text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    {[
                        { title: 'Billing overcharge on invoice #4521', customer: 'Acme Corp', severity: 'High', status: 'New', category: 'Billing' },
                        { title: 'Delayed delivery of inspection report', customer: 'City of Miami', severity: 'Medium', status: 'Investigating', category: 'Delivery' },
                        { title: 'Equipment malfunction during survey', customer: 'Pipeline Solutions', severity: 'Critical', status: 'Action Required', category: 'Technical' },
                    ].map((complaint, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl border ${idx === 0 ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 truncate">{complaint.title}</p>
                                    <p className="text-[10px] text-gray-500">{complaint.customer}</p>
                                </div>
                                <div className="flex gap-1 ml-2 flex-shrink-0">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${complaint.severity === 'Critical' ? 'bg-red-100 text-red-700' : complaint.severity === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{complaint.severity}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${complaint.status === 'New' ? 'bg-teal-100 text-teal-700' : complaint.status === 'Investigating' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{complaint.status}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{complaint.category}</span>
                                <ArrowRight className="w-3 h-3" />
                                <span className="text-teal-600 font-medium">Create Ticket</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'tasks',
        moduleKeys: ['rep-tasks'],
        title: 'Your Assigned Tasks 📌',
        description: 'View all tickets assigned to you as task cards. Each card shows the ticket status, priority, customer info, and SLA indicators. Click any card to see full details, reply to the customer, and update the ticket status.',
        tips: ['Cards are color-coded by status for quick scanning', 'Red SLA badge means the ticket is overdue — prioritize it', 'Use the inline reply to respond without leaving the page'],
        icon: ListTodo,
        color: 'from-indigo-500 to-teal-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">My Tasks</h3>
                    <div className="flex gap-1">
                        {['All', 'Open', 'In Progress', 'Resolved'].map((f, i) => (
                            <span key={f} className={`text-[10px] px-2 py-1 rounded-lg font-medium ${i === 0 ? 'bg-teal-100 text-teal-700' : 'bg-white border border-gray-200 text-gray-500'}`}>{f}</span>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                        { label: 'Total', value: '8', color: 'gray' },
                        { label: 'Open', value: '3', color: 'teal' },
                        { label: 'In Progress', value: '4', color: 'amber' },
                        { label: 'Overdue', value: '1', color: 'red' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-lg p-2 border border-gray-100 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${stat.color}-500`}></div>
                            <span className="text-[10px] text-gray-500">{stat.label}</span>
                            <span className={`text-sm font-bold text-${stat.color}-600 ml-auto`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    {[
                        { subject: 'Report PDF not loading', customer: 'Acme Corp', priority: 'High', status: 'Open', time: '2h ago', sla: true },
                        { subject: 'Request access to project data', customer: 'City of Miami', priority: 'Medium', status: 'In Progress', time: '5h ago', sla: false },
                    ].map((task, idx) => (
                        <div key={idx} className="flex items-stretch bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className={`w-1.5 ${task.status === 'Open' ? 'bg-teal-500' : 'bg-amber-500'}`}></div>
                            <div className="flex-1 p-2.5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 truncate">{task.subject}</p>
                                        <p className="text-[10px] text-gray-500">{task.customer} • {task.time}</p>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{task.priority}</span>
                                        {task.sla && <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-100 text-red-600">SLA</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'monitoring',
        moduleKeys: ['rep-monitoring'],
        title: 'SLA Monitoring 📊',
        description: 'Track your team\'s Service Level Agreement compliance in real-time. Monitor average first response time, resolution time, SLA compliance percentage, and overdue tickets. Data refreshes every 15 seconds.',
        tips: ['Green = within SLA targets', 'Yellow = approaching deadline', 'Red = SLA breached, escalate immediately'],
        icon: Activity,
        color: 'from-orange-500 to-amber-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">SLA Performance</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                        { label: 'Avg First Response', value: '12m', target: '< 15m', ok: true },
                        { label: 'Avg Resolution', value: '4.2h', target: '< 8h', ok: true },
                        { label: 'SLA Compliance', value: '94%', target: '> 90%', ok: true },
                        { label: 'Overdue Tickets', value: '2', target: '0', ok: false },
                    ].map((metric) => (
                        <div key={metric.label} className={`p-3 rounded-xl border ${metric.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <p className="text-[10px] text-gray-500 mb-1">{metric.label}</p>
                            <p className={`text-xl font-bold ${metric.ok ? 'text-green-700' : 'text-red-700'}`}>{metric.value}</p>
                            <p className="text-[9px] text-gray-400">Target: {metric.target}</p>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs font-medium text-gray-600 mb-2">SLA Compliance Trend</p>
                    <div className="flex items-end gap-1 h-10">
                        {[85, 90, 88, 92, 95, 94, 96].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t ${h >= 90 ? 'bg-gradient-to-t from-green-500 to-emerald-400' : 'bg-gradient-to-t from-yellow-500 to-amber-400'}`} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 'team',
        moduleKeys: ['rep-team'],
        title: 'Support Team Overview',
        description: 'View your support team members, their current workload, and availability status. See who\'s online, how many tickets each person is handling, and coordinate work distribution effectively.',
        tips: ['Green dot = online and available', 'Check workload before reassigning tickets', 'Team stats show overall performance'],
        icon: Users,
        color: 'from-indigo-500 to-blue-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Support Team</h3>
                    <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">3 online</span>
                </div>
                <div className="space-y-2">
                    {[
                        { name: 'Sarah Kim', role: 'Senior Rep', tickets: 4, status: 'online', avatar: 'SK' },
                        { name: 'James Chen', role: 'Support Rep', tickets: 6, status: 'online', avatar: 'JC' },
                        { name: 'Maria Lopez', role: 'Support Rep', tickets: 3, status: 'online', avatar: 'ML' },
                        { name: 'David Park', role: 'Junior Rep', tickets: 0, status: 'offline', avatar: 'DP' },
                    ].map((member, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">{member.avatar}</div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-[10px] text-gray-500">{member.role}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-700">{member.tickets}</p>
                                <p className="text-[9px] text-gray-400">tickets</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'templates',
        moduleKeys: ['rep-templates'],
        title: 'Response Templates 📝',
        description: 'Save time with canned response templates. Create, edit, and organize reusable responses for common support scenarios. Copy templates with one click and personalize them before sending.',
        tips: ['Create templates for common ticket types', 'Use categories to organize (Greeting, Closing, etc.)', 'Click copy icon to use a template instantly'],
        icon: FileText,
        color: 'from-purple-500 to-violet-500',
        illustration: (
            <div className="w-full h-64 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">My Templates</h3>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-xs font-medium text-white shadow-sm">
                        <Plus className="w-3 h-3 inline mr-1" />New Template
                    </div>
                </div>
                <div className="space-y-2">
                    {[
                        { name: 'Welcome Response', category: 'Greeting', tags: ['new-ticket', 'intro'], preview: 'Thank you for reaching out! We\'ve received your...' },
                        { name: 'Status Update', category: 'Follow-up', tags: ['update', 'progress'], preview: 'I wanted to update you on the status of your...' },
                        { name: 'Resolution Confirmation', category: 'Closing', tags: ['resolved', 'closing'], preview: 'Great news! Your issue has been resolved. Here\'s...' },
                    ].map((template, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-start justify-between mb-1">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                                    <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">{template.category}</span>
                                </div>
                                <Copy className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-1">{template.preview}</p>
                            <div className="flex gap-1 mt-1.5">
                                {template.tags.map((tag) => (
                                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'complete',
        moduleKeys: null,
        title: 'Ready to Support! 💚',
        description: 'You\'re all set to deliver outstanding customer support. Remember: fast responses and clear communication make all the difference. Your customers are counting on you!',
        tips: ['Respond to high-priority tickets first', 'Use templates for consistent, fast replies', 'Monitor SLA compliance throughout the day'],
        icon: Rocket,
        color: 'from-green-500 to-emerald-500',
        illustration: (
            <div className="w-full h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-2xl">
                        <Headphones className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Ready to Support!</h3>
                    <p className="text-sm text-gray-500 mt-2">Deliver outstanding customer experiences 🎉</p>
                    <div className="flex justify-center gap-2 mt-4">
                        <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">View Dashboard</span>
                        <span className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-sm font-medium text-white shadow-lg">Open Tickets</span>
                    </div>
                </div>
            </div>
        ),
    },
];
