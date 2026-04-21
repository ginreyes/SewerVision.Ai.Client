'use client';

import React from 'react';
import { FileText, FileCheck, CheckCircle, X, Plus, Award } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const CreateTemplateModal = ({
    isOpen,
    onOpenChange,
    newTemplateForm,
    setNewTemplateForm,
    createTemplateTab,
    setCreateTemplateTab,
    onSubmit,
    onCancel,
    onAddSection,
    onRemoveSection,
    onUpdateSection,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Create New Template</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Design your PACP inspection template using the sidebar sections
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Sidebar Navigation */}
                    <div className="w-64 border-r bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex flex-col">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                                Template Builder
                            </p>
                        </div>

                        <nav className="space-y-2 flex-1">
                            <button
                                onClick={() => setCreateTemplateTab('info')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    createTemplateTab === 'info'
                                        ? 'bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg shadow-amber-200 scale-105'
                                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                                }`}
                            >
                                <div className={`p-1.5 rounded-lg ${createTemplateTab === 'info' ? 'bg-white/20' : 'bg-amber-100'}`}>
                                    <FileCheck className="h-4 w-4" />
                                </div>
                                <span className="flex-1 text-left">Basic Information</span>
                                {createTemplateTab === 'info' && <CheckCircle className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => setCreateTemplateTab('sections')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    createTemplateTab === 'sections'
                                        ? 'bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg shadow-amber-200 scale-105'
                                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                                }`}
                            >
                                <div className={`p-1.5 rounded-lg ${createTemplateTab === 'sections' ? 'bg-white/20' : 'bg-amber-100'}`}>
                                    <FileText className="h-4 w-4" />
                                </div>
                                <span className="flex-1 text-left">Report Sections</span>
                                {createTemplateTab === 'sections' && <CheckCircle className="h-4 w-4" />}
                            </button>
                        </nav>

                        <div className="mt-4 p-3 bg-white rounded-lg border border-amber-100">
                            <p className="text-xs text-gray-600">
                                <span className="font-semibold text-red-700">Tip:</span> Templates can be reused for consistent reporting
                            </p>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 bg-white" style={{ minHeight: '500px', maxHeight: '500px' }}>
                        {/* Information Tab */}
                        {createTemplateTab === 'info' && (
                            <div className="space-y-6">
                                <Card className="bg-gradient-to-br from-amber-50 via-amber-50 to-amber-50 border-amber-200">
                                    <CardContent className="pt-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                <FileCheck className="h-6 w-6 text-red-700" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Template Information</h3>
                                                <div className="space-y-2 text-sm text-gray-700">
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Give your template a descriptive name (e.g., "PACP Sewer Inspection")</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Add a clear description of what this template will be used for</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Quick reference fields help categorize your report structure</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="templateName" className="text-base font-semibold">Template Name *</Label>
                                        <Input
                                            id="templateName"
                                            placeholder="e.g., Comprehensive PACP Inspection Report"
                                            value={newTemplateForm.name}
                                            onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="templateDescription">Description</Label>
                                        <Textarea
                                            id="templateDescription"
                                            placeholder="Describe the purpose and scope of this template (e.g., 'Complete PACP condition assessment for sewer pipelines with AI-assisted defect detection')"
                                            value={newTemplateForm.description}
                                            onChange={(e) => setNewTemplateForm({ ...newTemplateForm, description: e.target.value })}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Quick Reference Fields</Label>
                                        <Input
                                            placeholder="e.g., Executive Summary, Pipeline Info, AI Detections"
                                            value={newTemplateForm.fields.join(', ')}
                                            onChange={(e) => {
                                                const fields = e.target.value.split(',').map(f => f.trim()).filter(f => f);
                                                setNewTemplateForm({ ...newTemplateForm, fields });
                                            }}
                                        />
                                        <p className="text-xs text-gray-500">Comma-separated high-level categories</p>
                                    </div>

                                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                        <CardContent className="pt-4">
                                            <div className="flex items-start gap-3">
                                                <FileCheck className="h-5 w-5 text-red-700 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 mb-1">💡 Next Step</p>
                                                    <p className="text-xs text-gray-600">
                                                        After filling in the basic information, switch to the "Sections" tab to add detailed report sections.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Sections Tab */}
                        {createTemplateTab === 'sections' && (
                            <div className="space-y-6">
                                <Card className="bg-gradient-to-br from-amber-50 via-amber-50 to-amber-50 border-amber-200">
                                    <CardContent className="pt-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                <FileText className="h-6 w-6 text-red-700" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Building Template Sections</h3>
                                                <div className="space-y-2 text-sm text-gray-700">
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Create sections like "Executive Summary", "Pipeline Specs", etc.</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Each section can have multiple fields (comma-separated)</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Use the PACP suggestions below for industry-standard templates</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="text-base font-semibold">Report Sections</Label>
                                        <Button size="sm" variant="outline" onClick={onAddSection}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Section
                                        </Button>
                                    </div>
                                    {newTemplateForm.sections.length === 0 ? (
                                        <Card className="border-dashed border-2">
                                            <CardContent className="py-12 text-center">
                                                <div className="p-3 bg-gray-100 rounded-lg inline-flex mb-3">
                                                    <FileText className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-sm font-medium text-gray-900 mb-1">No sections yet</h3>
                                                <p className="text-sm text-gray-500 mb-4">Start building your template</p>
                                                <Button size="sm" variant="outline" onClick={onAddSection}>
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Your First Section
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="space-y-3">
                                            {newTemplateForm.sections.map((section, index) => (
                                                <Card key={index} className="border-l-4 border-l-red-600">
                                                    <CardContent className="pt-4">
                                                        <div className="flex items-start gap-2">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="default" className="bg-red-700 text-xs whitespace-nowrap">
                                                                        #{index + 1}
                                                                    </Badge>
                                                                    <Input
                                                                        placeholder="Section Name"
                                                                        value={section.name}
                                                                        onChange={(e) => onUpdateSection(index, 'name', e.target.value)}
                                                                        className="flex-1 font-medium"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Textarea
                                                                        placeholder="Section fields (comma-separated)"
                                                                        value={section.fields.join(', ')}
                                                                        onChange={(e) => onUpdateSection(index, 'fields', e.target.value)}
                                                                        rows={2}
                                                                        className="text-sm"
                                                                    />
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => onRemoveSection(index)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}

                                    {newTemplateForm.sections.length > 0 && (
                                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                                            <CardContent className="pt-4">
                                                <div className="flex items-center gap-3">
                                                    <Award className="h-5 w-5 text-red-700" />
                                                    <div>
                                                        <p className="text-sm font-medium text-red-800">
                                                            {newTemplateForm.sections.length} section{newTemplateForm.sections.length !== 1 ? 's' : ''},{' '}
                                                            {newTemplateForm.sections.reduce((acc, s) => acc + s.fields.length, 0)} total fields
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                        <CardContent className="pt-4">
                                            <div className="flex items-start gap-3">
                                                <FileCheck className="h-5 w-5 text-red-700 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 mb-1">💡 PACP Sections</p>
                                                    <p className="text-xs text-gray-600">
                                                        Executive Summary, Project Info, Pipeline Specs, Methodology, AI Detections,
                                                        Structural/O&M Assessment, Observations, Grading, Recommendations, QC Verification
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-8 py-5 border-t bg-gradient-to-r from-gray-50 to-gray-100 gap-3">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={!newTemplateForm.name || (newTemplateForm.sections.length > 0 && newTemplateForm.sections.some(s => !s.name))}
                        className="min-w-[140px]"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTemplateModal;
