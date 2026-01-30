'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    Plus,
    Search,
    AlertTriangle,
    CheckCircle,
    Eye,
    Settings,
    MoreHorizontal,
    Brain,
    Pin,
    Clock,
    MapPin,
    Calendar,
    User as UserIcon,
    Trash2,
    Edit3,
    Loader2,
    BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { notesApi } from '@/data/notesApi';
import AddNoteModal from './AddNoteModal';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const NotesPage = () => {
    const { userId, userData } = useUser();
    const { showAlert } = useAlert();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [activeTab, setActiveTab] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [stats, setStats] = useState({ total: 0, pinned: 0, archived: 0, aiGenerated: 0, critical: 0 });

    const fetchNotes = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await notesApi.getNotes(userId, {
                search: searchQuery,
                category: filterCategory,
                // Backend handles these filters
            });
            setNotes(data || []);

            const statsData = await notesApi.getStats(userId);
            // Backend stats might need adjustment or we calculate client side common stats
            // We'll calculate some stats client side for immediate feedback if backend doesn't provide all
            setStats({
                total: statsData.total || 0,
                pinned: statsData.pinned || 0,
                archived: statsData.archived || 0,
                aiGenerated: data ? data.filter(n => n.tags?.includes('ai-generated')).length : 0, // Heuristic
                critical: data ? data.filter(n => n.tags?.includes('critical') || n.title.toLowerCase().includes('critical')).length : 0 // Heuristic
            });

        } catch (error) {
            console.error('Error fetching notes:', error);
            showAlert('Failed to fetch notes', 'error');
        } finally {
            setLoading(false);
        }
    }, [userId, searchQuery, filterCategory, showAlert]);

    useEffect(() => {
        if (userId) {
            fetchNotes();
        }
    }, [userId, fetchNotes]);

    const handleCreateNote = async (noteData) => {
        try {
            setCreating(true);
            await notesApi.createNote({
                ...noteData,
                userId
            });
            showAlert('Note created successfully', 'success');
            setShowCreateModal(false);
            fetchNotes();
        } catch (error) {
            console.error('Error creating note:', error);
            showAlert('Failed to create note', 'error');
        } finally {
            setCreating(false);
        }
    };

    const getFilteredNotes = () => {
        let filtered = notes;

        // Client-side tab filtering
        if (activeTab === 'pinned') {
            filtered = filtered.filter(note => note.isPinned);
        } else if (activeTab === 'ai') {
            // Tag based check for AI
            filtered = filtered.filter(note => note.tags && (note.tags.includes('ai') || note.tags.includes('ai-generated')));
        } else if (activeTab === 'defects') {
            filtered = filtered.filter(note => note.category === 'defect');
        }

        // Backend handles search and main category, but we re-apply for tab logic if needed or immediate response
        return filtered;
    };

    const filteredNotes = getFilteredNotes();

    const getCategoryColor = (category) => {
        const colors = {
            'defect': 'bg-gradient-to-br from-red-500 to-red-700',
            'review': 'bg-gradient-to-br from-blue-500 to-purple-600',
            'observation': 'bg-gradient-to-br from-green-500 to-emerald-600',
            'maintenance': 'bg-gradient-to-br from-orange-500 to-red-600',
            'general': 'bg-gradient-to-br from-gray-500 to-gray-700'
        };
        return colors[category] || colors['general'];
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'defect': AlertTriangle,
            'review': CheckCircle,
            'observation': Eye,
            'maintenance': Settings,
            'general': FileText
        };
        return icons[category] || FileText;
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('-100', '-600')}`} /> {/* Hacky color fix */}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {userData?.role === 'admin' ? 'System Notes' : 'My Field Notes'}
                            </h1>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="gradient" onClick={() => setShowCreateModal(true)} className="shadow-lg shadow-blue-500/20">
                                <Plus className="w-4 h-4 mr-2" />
                                New Note
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Notes"
                        value={stats.total}
                        subtitle="All active notes"
                        icon={BookOpen}
                        color="bg-blue-600 text-white"
                    />
                    <StatCard
                        title="Pinned"
                        value={stats.pinned}
                        subtitle="Important items"
                        icon={Pin}
                        color="bg-orange-500 text-white"
                    />
                    <StatCard
                        title="Defects"
                        value={notes.filter(n => n.category === 'defect').length}
                        subtitle="Reported issues"
                        icon={AlertTriangle}
                        color="bg-red-600 text-white"
                    />
                    <StatCard
                        title="Observations"
                        value={notes.filter(n => n.category === 'observation').length}
                        subtitle="Field findings"
                        icon={Eye}
                        color="bg-emerald-600 text-white"
                    />
                </div>

                {/* Tabs */}
                <div className="mb-6 overflow-x-auto">
                    <div className="flex space-x-1 bg-white p-1 rounded-xl w-fit border border-gray-200 shadow-sm">
                        {[
                            { id: 'all', label: 'All Notes', icon: FileText },
                            { id: 'pinned', label: 'Pinned', icon: Pin },
                            { id: 'defects', label: 'Defects', icon: AlertTriangle },
                            { id: 'ai', label: 'AI Insights', icon: Brain },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                                        ? 'bg-gray-100 text-gray-900 mobile-hover:bg-gray-200'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 sticky top-20 z-10 bg-gray-50/95 backdrop-blur-sm py-2">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            placeholder="Search notes, locations, tags..."
                            className="pl-10 bg-white border-gray-200 focus:border-blue-500 rounded-xl transition-all shadow-sm hover:border-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select
                        value={filterCategory}
                        onValueChange={setFilterCategory}
                    >
                        <SelectTrigger className="w-full sm:w-[200px] bg-white border-gray-200 rounded-xl shadow-sm">
                            <SelectValue placeholder="Filter Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="defect">Defects</SelectItem>
                            <SelectItem value="review">Reviews</SelectItem>
                            <SelectItem value="observation">Observations</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-500 animate-pulse">Loading notes...</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No notes found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            {searchQuery ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first note.'}
                        </p>
                        <Button onClick={() => setShowCreateModal(true)} variant="outline">
                            Create Note
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.map((note) => {
                            const Icon = getCategoryIcon(note.category);
                            const colorClass = getCategoryColor(note.category);

                            return (
                                <div
                                    key={note._id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 overflow-hidden flex flex-col"
                                >
                                    <div className="p-6 flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2.5 rounded-xl ${colorClass} text-white shadow-lg shadow-gray-200`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {note.isPinned && <Pin className="w-3.5 h-3.5 text-orange-500 fill-current" />}
                                                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                            {note.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(note.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 -mr-2">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                            {note.content}
                                        </p>

                                        <div className="space-y-3">
                                            {note.tags && note.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {note.tags.map((tag, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-md text-[10px] uppercase tracking-wide font-medium">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Footer Meta */}
                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                                {note.projectId ? (
                                                    <span className="flex items-center gap-1.5 truncate max-w-[150px]">
                                                        <MapPin className="w-3 h-3" />
                                                        {note.projectId.location || 'Unknown Location'}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5">
                                                        <UserIcon className="w-3 h-3" />
                                                        Personal Note
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AddNoteModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={handleCreateNote}
                loading={creating}
            />
        </div>
    );
};

export default NotesPage; 
