'use client';
import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    CheckCircle2,
    AlertCircle,
    Camera,
    FileText,
    Brain,
    Eye,
    Download,
    MoreHorizontal,
    Play,
    Search,
    Star,
    Flag,
    RefreshCw,
    Loader2,
    Filter,
    ChevronRight,
    Zap,
    ClipboardList,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddNewTaskModal from './AddNewTaskModal';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import qcApi from '@/data/qcApi';
import operatorApi from '@/data/operatorApi';
import { useRouter } from 'next/navigation';

// Compact Stat Card
const StatCard = ({ icon: Icon, value, label, color = 'blue' }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-emerald-600',
        orange: 'from-orange-500 to-amber-600',
        red: 'from-red-500 to-rose-600',
        purple: 'from-purple-500 to-indigo-600'
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );
};

// Status Badge
const StatusBadge = ({ status }) => {
    const config = {
        pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
        'in-progress': { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500 animate-pulse' },
        completed: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
        scheduled: { color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
        urgent: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500 animate-pulse' }
    };

    const statusConfig = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
        </span>
    );
};

// Priority Badge
const PriorityBadge = ({ priority }) => {
    const config = {
        low: 'text-gray-500',
        medium: 'text-yellow-500',
        high: 'text-orange-500',
        critical: 'text-red-500'
    };

    return (
        <Flag className={`w-4 h-4 ${config[priority] || config.medium}`} fill="currentColor" />
    );
};

// Task Card (Compact)
const TaskCard = ({ task, onClick, isSelected }) => {
    const typeIcons = {
        inspection: Camera,
        assessment: FileText,
        review: Eye,
        survey: MapPin,
        report: FileText,
        emergency: AlertCircle
    };

    const typeColors = {
        inspection: 'bg-blue-500',
        assessment: 'bg-green-500',
        review: 'bg-orange-500',
        survey: 'bg-indigo-500',
        report: 'bg-purple-500',
        emergency: 'bg-red-500'
    };

    const Icon = typeIcons[task.type] || FileText;

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${isSelected ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-gray-200'
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeColors[task.type] || 'bg-gray-500'}`}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{task.title}</h3>
                        <p className="text-xs text-gray-500 truncate">{task.description}</p>
                    </div>
                </div>
                <PriorityBadge priority={task.priority} />
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {task.assignee}
                </span>
                <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {task.location}
                </span>
            </div>

            {/* Progress (if applicable) */}
            {task.progress > 0 && task.progress < 100 && (
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
                <StatusBadge status={task.status} />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {task.estimatedDuration}
                </div>
            </div>

            {/* AI Badge */}
            {task.aiProcessing && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${task.aiProcessing === 'completed' ? 'bg-green-50 text-green-700' :
                                task.aiProcessing === 'processing' ? 'bg-yellow-50 text-yellow-700' :
                                    'bg-gray-50 text-gray-600'
                            }`}>
                            <Brain className="w-3 h-3" />
                            AI {task.aiProcessing}
                        </span>
                        {task.confidence && (
                            <span className="text-xs text-gray-500">{task.confidence}% confidence</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Component
const TasksPage = ({ role = 'admin' }) => {
    const { userId, userData } = useUser();
    const { showAlert } = useAlert();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [activeTab, setActiveTab] = useState('active');
    const [selectedTask, setSelectedTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        active: 0,
        urgent: 0,
        completedToday: 0,
        efficiency: 94
    });

    // Fetch tasks based on role
    useEffect(() => {
        if (userId && role) {
            fetchTasks();
        }
    }, [userId, role, filterStatus]);

    const fetchTasks = async () => {
        try {
            setLoading(true);

            if (role === 'qc-technician') {
                const status = filterStatus === 'all' ? 'all' : filterStatus;
                const assignments = await qcApi.getAssignments(userId, status);

                const tasksList = assignments.map(assignment => ({
                    id: assignment._id,
                    title: `QC Review: ${assignment.projectId?.name || 'Project'}`,
                    description: `Review ${assignment.totalDetections || 0} AI detections`,
                    status: assignment.status === 'assigned' ? 'pending' :
                        assignment.status === 'in-progress' ? 'in-progress' : 'completed',
                    priority: assignment.priority || 'medium',
                    assignee: userData?.first_name ? `${userData.first_name} ${userData.last_name}` : 'You',
                    location: assignment.projectId?.location || 'N/A',
                    device: 'QC Review Station',
                    startTime: assignment.assignedAt || new Date().toISOString(),
                    estimatedDuration: `${assignment.totalDetections * 2 || 30} min`,
                    progress: assignment.totalDetections > 0
                        ? Math.round((assignment.reviewedDetections / assignment.totalDetections) * 100)
                        : 0,
                    type: 'review',
                    aiProcessing: assignment.reviewedDetections === assignment.totalDetections ? 'completed' : 'pending',
                    footage: `${assignment.totalDetections || 0} detections`,
                    confidence: 92,
                    projectId: assignment.projectId?._id || assignment.projectId,
                    totalDetections: assignment.totalDetections || 0,
                    reviewedDetections: assignment.reviewedDetections || 0
                }));

                setTasks(tasksList);
                calculateStats(tasksList);
            } else if (role === 'operator') {
                try {
                    const tasksList = await operatorApi.getTasks(userId, filterStatus);
                    setTasks(tasksList);
                    calculateStats(tasksList);
                } catch (error) {
                    console.log('No operator tasks found');
                    setTasks([]);
                    setStats({ active: 0, urgent: 0, completedToday: 0, efficiency: 94 });
                }
            } else {
                setTasks(getMockTasks());
                setStats({ active: 5, urgent: 1, completedToday: 3, efficiency: 94 });
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showAlert(`Error loading tasks: ${error.message}`, 'error');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (tasksList) => {
        const activeCount = tasksList.filter(t => ['pending', 'in-progress'].includes(t.status)).length;
        const urgentCount = tasksList.filter(t => t.priority === 'critical' || t.priority === 'high').length;
        const today = new Date();
        const completedToday = tasksList.filter(t => {
            const taskDate = new Date(t.startTime);
            return t.status === 'completed' && taskDate.toDateString() === today.toDateString();
        }).length;

        setStats({
            active: activeCount,
            urgent: urgentCount,
            completedToday,
            efficiency: tasksList.length > 0
                ? Math.round((tasksList.filter(t => t.status === 'completed').length / tasksList.length) * 100)
                : 94
        });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchTasks();
        setRefreshing(false);
    };

    const getMockTasks = () => [
        {
            id: 1,
            title: 'Main St Pipeline Inspection',
            description: 'CCTV inspection of 500ft sewer line',
            status: 'in-progress',
            priority: 'high',
            assignee: 'John Smith',
            location: 'Main St Pipeline',
            device: 'CCTV Unit 1',
            startTime: '2024-08-12 09:00',
            estimatedDuration: '2 hours',
            progress: 65,
            type: 'inspection',
            aiProcessing: 'ready',
            footage: '2.3 GB',
            confidence: 94
        },
        {
            id: 2,
            title: 'Oak Ave Assessment',
            description: 'Post-repair verification',
            status: 'pending',
            priority: 'medium',
            assignee: 'Sarah Johnson',
            location: 'Oak Ave',
            device: 'Mobile Tablet',
            startTime: '2024-08-12 14:00',
            estimatedDuration: '1.5 hours',
            progress: 0,
            type: 'assessment',
            aiProcessing: 'pending'
        },
        {
            id: 3,
            title: 'QC Review - Pipeline 45A',
            description: 'Review AI defect detection',
            status: 'in-progress',
            priority: 'high',
            assignee: 'Mike Davis',
            location: 'QC Department',
            device: 'QC Station',
            startTime: '2024-08-12 10:30',
            estimatedDuration: '45 min',
            progress: 80,
            type: 'review',
            aiProcessing: 'completed',
            confidence: 92
        },
        {
            id: 4,
            title: 'Emergency Blockage',
            description: 'Urgent inspection - reported backup',
            status: 'urgent',
            priority: 'critical',
            assignee: 'Emergency Team',
            location: 'Block 5',
            device: 'Mobile Unit',
            startTime: '2024-08-12 11:45',
            estimatedDuration: '1 hour',
            progress: 25,
            type: 'emergency',
            aiProcessing: 'processing'
        }
    ];

    const handleAddTask = (newTask) => {
        setTasks(prevTasks => [newTask, ...prevTasks]);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        if (role === 'qc-technician' && task.projectId) {
            router.push(`/qc-technician/quality-control?projectId=${task.projectId}`);
        }
    };

    const getFilteredTasks = () => {
        let filtered = tasks;

        if (activeTab === 'active') {
            filtered = filtered.filter(task => ['pending', 'in-progress', 'scheduled', 'urgent'].includes(task.status));
        } else if (activeTab === 'completed') {
            filtered = filtered.filter(task => task.status === 'completed');
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query) ||
                task.assignee.toLowerCase().includes(query) ||
                task.location.toLowerCase().includes(query)
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(task => task.status === filterStatus);
        }

        if (filterPriority !== 'all') {
            filtered = filtered.filter(task => task.priority === filterPriority);
        }

        return filtered;
    };

    const filteredTasks = getFilteredTasks();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-gray-500">Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {role === 'admin' ? 'Task Management' : 'My Tasks'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {role === 'operator' ? 'Your assigned inspections and operations' :
                            role === 'qc-technician' ? 'QC reviews and assignments' :
                                'Manage all system tasks'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {role === 'admin' && <AddNewTaskModal onAddTask={handleAddTask} />}
                    <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Clock} value={stats.active} label="Active Tasks" color="blue" />
                <StatCard icon={AlertCircle} value={stats.urgent} label="Urgent" color="red" />
                <StatCard icon={CheckCircle2} value={stats.completedToday} label="Completed Today" color="green" />
                <StatCard icon={TrendingUp} value={`${stats.efficiency}%`} label="Efficiency" color="purple" />
            </div>

            {/* Tabs & Filters */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'completed' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                All
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search tasks..."
                                    className="pl-9 w-full sm:w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterPriority} onValueChange={setFilterPriority}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Grid */}
            {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => handleTaskClick(task)}
                            isSelected={selectedTask?.id === task.id}
                        />
                    ))}
                </div>
            ) : (
                <Card className="border-0 shadow-sm">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="font-medium text-gray-900 mb-1">No tasks found</h3>
                            <p className="text-sm text-gray-500">
                                {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'No tasks have been assigned yet'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TasksPage;
