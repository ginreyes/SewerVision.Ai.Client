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
    User as UserIcon,
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
import { Card, CardContent } from '@/components/ui/card';

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


    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 rounded-lg">
                            <FileText className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {userData?.role === 'admin' ? 'System Notes' : 'My Field Notes'}
                            </h1>
                            <p className="text-sm text-gray-500">Create and manage inspection notes</p>
                        </div>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Note
                    </Button>
                </div>
            </div>

            {/* Stats Overview - Compact like dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-sm text-gray-500">Total Notes</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
                            <Pin className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-bold text-gray-900">{stats.pinned}</p>
                        <p className="text-sm text-gray-500">Pinned</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-bold text-gray-900">{notes.filter(n => n.category === 'defect').length}</p>
                        <p className="text-sm text-gray-500">Defects</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                            <Eye className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-bold text-gray-900">{notes.filter(n => n.category === 'observation').length}</p>
                        <p className="text-sm text-gray-500">Observations</p>
                    </div>
                </div>
            </div>

                {/* Tabs */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex space-x-1 overflow-x-auto">
                            {[
                                { id: 'all', label: 'All Notes', icon: FileText },
                                { id: 'pinned', label: 'Pinned', icon: Pin },
                                { id: 'defects', label: 'Defects', icon: AlertTriangle },
                                { id: 'ai', label: 'AI Insights', icon: Brain },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Search and Filter */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search notes, locations, tags..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select
                                value={filterCategory}
                                onValueChange={setFilterCategory}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Categories" />
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
                    </CardContent>
                </Card>

                {/* Content */}
                {loading ? (
                    <Card>
                        <CardContent className="py-12 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
                            <p className="text-sm text-gray-500">Loading notes...</p>
                        </CardContent>
                    </Card>
                ) : filteredNotes.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">No notes found</h3>
                            <p className="text-sm text-gray-500">
                                {searchQuery ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first note.'}
                            </p>
                            {!searchQuery && (
                                <Button onClick={() => setShowCreateModal(true)} variant="outline" className="mt-4">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Note
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredNotes.map((note) => {
                            const Icon = getCategoryIcon(note.category);
                            const colorClass = getCategoryColor(note.category);

                            return (
                                <Card
                                    key={note._id}
                                    className="hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className={`p-2 rounded-lg ${colorClass} text-white`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {note.isPinned && <Pin className="w-3 h-3 text-orange-500 fill-current" />}
                                                        <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">
                                                            {note.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(note.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-900">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                                            {note.content}
                                        </p>

                                        {note.tags && note.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {note.tags.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {note.tags.length > 3 && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                        +{note.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {note.projectId && (
                                            <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{note.projectId.location || 'Unknown Location'}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

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
