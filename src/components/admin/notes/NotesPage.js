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
    BookOpen,
    Pencil,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { useDialog } from '@/components/providers/DialogProvider';
import { notesApi } from '@/data/notesApi';
import AddNoteModal from './AddNoteModal';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Pure helpers — kept at module scope so React doesn't re-create them per render
// and so the detail dialog subcomponent can share them.
const CATEGORY_COLORS = {
    defect: 'bg-gradient-to-br from-red-500 to-red-700',
    review: 'bg-gradient-to-br from-blue-500 to-purple-600',
    observation: 'bg-gradient-to-br from-green-500 to-emerald-600',
    maintenance: 'bg-gradient-to-br from-orange-500 to-red-600',
    general: 'bg-gradient-to-br from-gray-500 to-gray-700',
};

const CATEGORY_ICONS = {
    defect: AlertTriangle,
    review: CheckCircle,
    observation: Eye,
    maintenance: Settings,
    general: FileText,
};

const categoryColor = (category) => CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
const categoryIcon = (category) => CATEGORY_ICONS[category] || FileText;

const formatDateTime = (value) => {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
};

function NoteDetailDialog({ note, open, onClose, onEdit }) {
    if (!note) return null;
    const Icon = categoryIcon(note.category);

    return (
        <Dialog open={open} onOpenChange={(v) => (!v ? onClose?.() : null)}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${categoryColor(note.category)} text-white`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-lg font-bold text-gray-900">{note.title}</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 capitalize">
                                {note.category} Note
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Content</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {note.tags.map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-sm text-gray-700">{formatDateTime(note.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Updated</p>
                            <p className="text-sm text-gray-700">{formatDateTime(note.updatedAt)}</p>
                        </div>
                        {note.projectId && (
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="text-sm text-gray-700 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {note.projectId.location || 'Unknown'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => { onClose?.(); onEdit?.(note); }}>
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const NotesPage = () => {
    const { userId, userData } = useUser();
    const { showAlert } = useAlert();
    const { showDelete } = useDialog();

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [activeTab, setActiveTab] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [stats, setStats] = useState({ total: 0, pinned: 0, archived: 0, aiGenerated: 0, critical: 0 });
    const [selectedNote, setSelectedNote] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    const tabs ={
        
    }

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

    const handleViewDetails = (note) => {
        setSelectedNote(note);
        setShowDetailModal(true);
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setShowCreateModal(true);
    };

    const handleUpdateNote = async (noteData) => {
        if (!editingNote) return handleCreateNote(noteData);
        try {
            setCreating(true);
            await notesApi.updateNote(editingNote._id, noteData);
            showAlert('Note updated successfully', 'success');
            setShowCreateModal(false);
            setEditingNote(null);
            fetchNotes();
        } catch (error) {
            console.error('Error updating note:', error);
            showAlert('Failed to update note', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteNote = (note) => {
        showDelete({
            title: 'Delete Note',
            description: `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await notesApi.deleteNote(note._id);
                    showAlert('Note deleted successfully', 'success');
                    fetchNotes();
                } catch (error) {
                    console.error('Error deleting note:', error);
                    showAlert('Failed to delete note', 'error');
                }
            },
            onCancel: () => {},
        });
    };

    const handleTogglePin = async (note) => {
        try {
            await notesApi.updateNote(note._id, { isPinned: !note.isPinned });
            showAlert(note.isPinned ? 'Note unpinned' : 'Note pinned', 'success');
            fetchNotes();
        } catch (error) {
            console.error('Error toggling pin:', error);
            showAlert('Failed to update note', 'error');
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

    const getCategoryColor = categoryColor;
    const getCategoryIcon = categoryIcon;


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
                    <Button onClick={() => setShowCreateModal(true)} variant='rose'>
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-900">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => handleViewDetails(note)} className="cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                                        <span>View Details</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditNote(note)} className="cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4 text-amber-600" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleTogglePin(note)} className="cursor-pointer">
                                                        <Pin className="mr-2 h-4 w-4 text-orange-500" />
                                                        <span>{note.isPinned ? 'Unpin' : 'Pin'}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDeleteNote(note)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingNote(null);
                }}
                onSave={editingNote ? handleUpdateNote : handleCreateNote}
                loading={creating}
                editData={editingNote}
            />

            <NoteDetailDialog
                note={selectedNote}
                open={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                onEdit={handleEditNote}
            />
        </div>
    );
};

export default NotesPage; 
