'use client';

import React from 'react';
import { FileText, FileCheck, X, Plus } from 'lucide-react';
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

const EditTemplateModal = ({
    isOpen,
    onOpenChange,
    editTemplateForm,
    setEditTemplateForm,
    onSubmit,
    onCancel,
    onAddSection,
    onRemoveSection,
    onUpdateSection,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Report Template</DialogTitle>
                    <DialogDescription>
                        Customize your {editTemplateForm.isDefault ? 'default ' : ''}template for sewer inspection reports
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editTemplateName">
                                Template Name *
                                {editTemplateForm.isDefault && (
                                    <span className="text-xs text-gray-500 ml-2">(Default template name cannot be changed)</span>
                                )}
                            </Label>
                            <Input
                                id="editTemplateName"
                                placeholder="e.g., PACP Sewer Inspection Report"
                                value={editTemplateForm.name}
                                onChange={(e) => setEditTemplateForm({ ...editTemplateForm, name: e.target.value })}
                                disabled={editTemplateForm.isDefault}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editTemplateDescription">Description</Label>
                            <Textarea
                                id="editTemplateDescription"
                                placeholder="Describe what this template includes..."
                                value={editTemplateForm.description}
                                onChange={(e) => setEditTemplateForm({ ...editTemplateForm, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Quick Fields (comma-separated)</Label>
                            <Input
                                placeholder="e.g., Executive Summary, Project Details, Pipeline Specifications"
                                value={editTemplateForm.fields.join(', ')}
                                onChange={(e) => {
                                    const fields = e.target.value.split(',').map(f => f.trim()).filter(f => f);
                                    setEditTemplateForm({ ...editTemplateForm, fields });
                                }}
                            />
                            <p className="text-xs text-gray-500">Quick reference field names</p>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Template Sections</Label>
                            <Button size="sm" variant="outline" onClick={onAddSection}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Section
                            </Button>
                        </div>

                        {editTemplateForm.sections.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No sections yet. Click "Add Section" to create one.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {editTemplateForm.sections.map((section, index) => (
                                    <Card key={index} className="border-l-4 border-l-red-600">
                                        <CardContent className="pt-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            Section {index + 1}
                                                        </Badge>
                                                        <Input
                                                            placeholder="Section Name (e.g., Executive Summary)"
                                                            value={section.name}
                                                            onChange={(e) => onUpdateSection(index, 'name', e.target.value)}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-gray-600 mb-1 block">
                                                            Fields (comma-separated)
                                                        </Label>
                                                        <Textarea
                                                            placeholder="e.g., Overall Condition Rating, Total Footage Inspected, Critical Defects"
                                                            value={section.fields.join(', ')}
                                                            onChange={(e) => onUpdateSection(index, 'fields', e.target.value)}
                                                            rows={2}
                                                            className="text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onRemoveSection(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {editTemplateForm.sections.length > 0 && (
                        <Card className="bg-gray-50">
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                    <FileCheck className="h-5 w-5 text-red-700 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 mb-1">Template Summary</p>
                                        <p className="text-sm text-gray-600">
                                            {editTemplateForm.sections.length} section{editTemplateForm.sections.length !== 1 ? 's' : ''} with {editTemplateForm.sections.reduce((acc, s) => acc + s.fields.length, 0)} total fields
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={!editTemplateForm.name || editTemplateForm.sections.some(s => !s.name)}
                    >
                        <FileCheck className="h-4 w-4 mr-2" />
                        Update Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditTemplateModal;
