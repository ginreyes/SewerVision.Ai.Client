import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Tag, Pin, AlertTriangle, FileText, CheckCircle, Settings, Eye, Bold, Italic, List, ListOrdered, Link, Code } from "lucide-react";

export default function AddNoteModal({ isOpen, onClose, onSave, loading }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        tags: '',
        isPinned: false,
        location: '',
        metadata: {}
    });

    const textareaRef = useRef(null);

    const categories = [
        { value: 'general', label: 'General', icon: FileText },
        { value: 'defect', label: 'Defect', icon: AlertTriangle },
        { value: 'review', label: 'Review', icon: CheckCircle },
        { value: 'observation', label: 'Observation', icon: Eye },
        { value: 'maintenance', label: 'Maintenance', icon: Settings }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        });
        setFormData({ 
            title: '', 
            content: '', 
            category: 'general', 
            priority: 'medium', 
            tags: '', 
            isPinned: false,
            location: '',
            metadata: {}
        });
    };

    const insertFormatting = (prefix, suffix = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = formData.content.substring(start, end) || 'text';
        const newText = formData.content.substring(0, start) + prefix + selectedText + suffix + formData.content.substring(end);
        
        setFormData({ ...formData, content: newText });
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
        }, 0);
    };

    const formatButtons = [
        { icon: Bold, label: 'Bold', action: () => insertFormatting('**', '**') },
        { icon: Italic, label: 'Italic', action: () => insertFormatting('_', '_') },
        { icon: Code, label: 'Code', action: () => insertFormatting('`', '`') },
        { icon: List, label: 'Bullet List', action: () => insertFormatting('• ', '') },
        { icon: ListOrdered, label: 'Numbered List', action: () => insertFormatting('1. ', '') },
        { icon: Link, label: 'Link', action: () => insertFormatting('[', '](url)') },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl shadow-2xl border-0 overflow-hidden p-0">
                <DialogHeader className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        New Note
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Create a new note, observation, or report entry
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Title Input */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Note Title</Label>
                            <Input
                                placeholder="e.g., Manhole 45 Inspection Summary"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                            />
                        </div>

                        {/* Category & Pinned */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger className="h-11 border-gray-200 rounded-xl">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                <div className="flex items-center gap-2">
                                                    <cat.icon className="w-4 h-4 text-gray-500" />
                                                    {cat.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(val) => setFormData({ ...formData, priority: val })}
                                >
                                    <SelectTrigger className="h-11 border-gray-200 rounded-xl">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Rich Text Content */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Description</Label>
                            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                {/* Formatting Toolbar */}
                                <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                                    {formatButtons.map((btn, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={btn.action}
                                            className="p-2 hover:bg-white rounded-lg transition-colors group"
                                            title={btn.label}
                                        >
                                            <btn.icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                                        </button>
                                    ))}
                                    <div className="ml-auto text-xs text-gray-500 px-2">
                                        Supports Markdown
                                    </div>
                                </div>
                                <Textarea
                                    ref={textareaRef}
                                    placeholder="Enter detailed observations, findings, or notes...

You can use:
• **Bold text** for emphasis
• _Italic text_ for highlights
• `Code` for technical terms
• Bullet points and numbered lists
• [Links](url) for references"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                    className="min-h-[180px] border-0 focus:ring-0 rounded-none resize-none p-4"
                                />
                            </div>
                        </div>

                        {/* Location/Context Input */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Location/Context (Optional)</Label>
                            <Input
                                placeholder="e.g., Manhole 45, Station 12, Sector A"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                            />
                        </div>

                        {/* Tags & Options */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Tags</Label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="e.g., urgent, repair, manhole (comma separated)"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="pl-10 h-11 border-gray-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isPinned: !prev.isPinned }))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${formData.isPinned
                                        ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500/50'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Pin className={`w-4 h-4 ${formData.isPinned ? 'fill-current' : ''}`} />
                                {formData.isPinned ? 'Pinned to Top' : 'Pin Note'}
                            </button>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl hover:bg-gray-100">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/40"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Create Note'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
