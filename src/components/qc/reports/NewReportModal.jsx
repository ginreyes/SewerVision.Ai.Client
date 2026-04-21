'use client';

import React from 'react';
import {
    FileText,
    FileCheck,
    Target,
    Eye,
    CheckCircle,
    X,
    Plus,
    Edit3,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const REPORT_TABS = ['project', 'details', 'conditions', 'template', 'review'];

const SidebarTab = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            active
                ? 'bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg shadow-amber-200 scale-105'
                : 'text-gray-700 hover:bg-white hover:shadow-md'
        }`}
    >
        <div className={`p-1.5 rounded-lg ${active ? 'bg-white/20' : 'bg-amber-100'}`}>
            <Icon className="h-4 w-4" />
        </div>
        <span className="flex-1 text-left">{label}</span>
        {active && <CheckCircle className="h-4 w-4" />}
    </button>
);

const NewReportModal = ({
    isOpen,
    onOpenChange,
    projects,
    reportTemplates,
    loading,
    newReportForm,
    setNewReportForm,
    selectedProject,
    setSelectedProject,
    selectedTemplate,
    setSelectedTemplate,
    createReportTab,
    setCreateReportTab,
    onSubmit,
}) => {
    const getCurrentReportTabIndex = () => REPORT_TABS.indexOf(createReportTab);
    const canGoNextReport = () => {
        const currentIndex = getCurrentReportTabIndex();
        if (currentIndex === 0 && !newReportForm.projectId) return false;
        if (currentIndex === 1 && !newReportForm.reportTitle) return false;
        return currentIndex < REPORT_TABS.length - 1;
    };
    const canGoBackReport = () => getCurrentReportTabIndex() > 0;

    const handleNextReport = () => {
        const currentIndex = getCurrentReportTabIndex();
        if (currentIndex < REPORT_TABS.length - 1) {
            setCreateReportTab(REPORT_TABS[currentIndex + 1]);
        }
    };

    const handleBackReport = () => {
        const currentIndex = getCurrentReportTabIndex();
        if (currentIndex > 0) {
            setCreateReportTab(REPORT_TABS[currentIndex - 1]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Create New Report</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Select a category from the left sidebar to fill in report details
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Sidebar Navigation */}
                    <div className="w-64 border-r bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex flex-col">
                        <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                                Report Sections
                            </p>
                        </div>
                        <nav className="space-y-2 flex-1">
                            <SidebarTab
                                active={createReportTab === 'project'}
                                onClick={() => setCreateReportTab('project')}
                                icon={FileText}
                                label="Project Selection"
                            />
                            <SidebarTab
                                active={createReportTab === 'details'}
                                onClick={() => setCreateReportTab('details')}
                                icon={FileCheck}
                                label="Report Details"
                            />
                            <SidebarTab
                                active={createReportTab === 'conditions'}
                                onClick={() => setCreateReportTab('conditions')}
                                icon={Target}
                                label="Conditions"
                            />
                            <SidebarTab
                                active={createReportTab === 'template'}
                                onClick={() => setCreateReportTab('template')}
                                icon={FileText}
                                label="Template"
                            />
                            <SidebarTab
                                active={createReportTab === 'review'}
                                onClick={() => setCreateReportTab('review')}
                                icon={Eye}
                                label="Review & Create"
                            />
                        </nav>

                        <div className="mt-4 p-3 bg-white rounded-lg border border-amber-100">
                            <p className="text-xs text-gray-600">
                                <span className="font-semibold text-red-700">Tip:</span> Fill in all required fields marked with *
                            </p>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 bg-white" style={{ minHeight: '500px', maxHeight: '500px' }}>
                        {/* Project Tab */}
                        {createReportTab === 'project' && (
                            <div className="space-y-6">
                                <Card className="bg-gradient-to-br from-amber-50 via-amber-50 to-amber-50 border-amber-200">
                                    <CardContent className="pt-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                <FileText className="h-6 w-6 text-red-700" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Getting Started</h3>
                                                <div className="space-y-2 text-sm text-gray-700">
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Select the project you'll be inspecting from your assigned projects</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Only projects assigned to you will appear in the dropdown</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Review project details before proceeding to the next section</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <Label htmlFor="project" className="text-base font-semibold">Select Project *</Label>
                                    <Select
                                        value={newReportForm.projectId || ''}
                                        onValueChange={(value) => {
                                            setNewReportForm({ ...newReportForm, projectId: value || '' });
                                            const project = projects.find(p => {
                                                const pId = String(p._id?.toString() || p.id?.toString() || p._id || p.id || '');
                                                return pId === value;
                                            });
                                            setSelectedProject(project || null);
                                        }}
                                    >
                                        <SelectTrigger id="project" className="h-11">
                                            <SelectValue placeholder="Select a project to inspect" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.filter(project => project && (project._id || project.id)).map((project) => {
                                                const projectId = String(project._id?.toString() || project.id?.toString() || project._id || project.id || '');
                                                if (!projectId || projectId === 'undefined' || projectId === 'null') {
                                                    return null;
                                                }
                                                return (
                                                    <SelectItem key={projectId} value={projectId}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{project.name || 'Unnamed'}</span>
                                                            <span className="text-xs text-gray-500">{project.location || 'N/A'}</span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {projects.length === 0 && !loading && (
                                        <p className="text-sm text-gray-500">No projects assigned to you</p>
                                    )}

                                    {selectedProject && (
                                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm">Project Details</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Client</p>
                                                    <p className="font-medium">{selectedProject.client || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Status</p>
                                                    <Badge variant="secondary">{selectedProject.status || 'N/A'}</Badge>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Location</p>
                                                    <p className="font-medium">{selectedProject.location || 'N/A'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Details Tab */}
                        {createReportTab === 'details' && (
                            <div className="space-y-6">
                                <Card className="bg-gradient-to-br from-amber-50 via-amber-50 to-amber-50 border-amber-200">
                                    <CardContent className="pt-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                <FileCheck className="h-6 w-6 text-red-700" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Report Details</h3>
                                                <div className="space-y-2 text-sm text-gray-700">
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Enter a descriptive title for easy identification</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Set the inspection date and report type (initial, follow-up, etc.)</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Assign priority level to help organize your workflow</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reportTitle">Report Title *</Label>
                                        <Input
                                            id="reportTitle"
                                            placeholder="e.g., Main St Sewer Line Inspection"
                                            value={newReportForm.reportTitle}
                                            onChange={(e) => setNewReportForm({ ...newReportForm, reportTitle: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="inspectionDate">Inspection Date *</Label>
                                        <Input
                                            id="inspectionDate"
                                            type="date"
                                            value={newReportForm.inspectionDate}
                                            onChange={(e) => setNewReportForm({ ...newReportForm, inspectionDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reportType">Report Type</Label>
                                        <Select
                                            value={newReportForm.reportType}
                                            onValueChange={(value) => setNewReportForm({ ...newReportForm, reportType: value })}
                                        >
                                            <SelectTrigger id="reportType">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="initial">Initial Assessment</SelectItem>
                                                <SelectItem value="follow-up">Follow-up Inspection</SelectItem>
                                                <SelectItem value="routine">Routine Maintenance</SelectItem>
                                                <SelectItem value="emergency">Emergency Inspection</SelectItem>
                                                <SelectItem value="pre-rehab">Pre-Rehabilitation</SelectItem>
                                                <SelectItem value="post-rehab">Post-Rehabilitation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority Level</Label>
                                        <Select
                                            value={newReportForm.priority}
                                            onValueChange={(value) => setNewReportForm({ ...newReportForm, priority: value })}
                                        >
                                            <SelectTrigger id="priority">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low Priority</SelectItem>
                                                <SelectItem value="normal">Normal Priority</SelectItem>
                                                <SelectItem value="high">High Priority</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="initialNotes">Initial Notes</Label>
                                        <Textarea
                                            id="initialNotes"
                                            placeholder="Add any initial observations, access notes, or special conditions..."
                                            value={newReportForm.initialNotes}
                                            onChange={(e) => setNewReportForm({ ...newReportForm, initialNotes: e.target.value })}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conditions Tab */}
                        {createReportTab === 'conditions' && (
                            <div className="space-y-6">
                                <Card className="bg-gradient-to-br from-amber-50 via-amber-50 to-amber-50 border-amber-200">
                                    <CardContent className="pt-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                <Target className="h-6 w-6 text-red-700" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Inspection Conditions</h3>
                                                <div className="space-y-2 text-sm text-gray-700">
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Document environmental conditions during inspection</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Record flow conditions and pre-cleaning status for PACP compliance</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Specify equipment used for reference and quality control</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weatherConditions">Weather Conditions</Label>
                                        <Select
                                            value={newReportForm.weatherConditions}
                                            onValueChange={(value) => setNewReportForm({ ...newReportForm, weatherConditions: value })}
                                        >
                                            <SelectTrigger id="weatherConditions">
                                                <SelectValue placeholder="Select weather conditions" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="clear">Clear/Sunny</SelectItem>
                                                <SelectItem value="cloudy">Cloudy</SelectItem>
                                                <SelectItem value="rainy">Rainy</SelectItem>
                                                <SelectItem value="stormy">Stormy</SelectItem>
                                                <SelectItem value="snowy">Snowy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="flowConditions">Flow Conditions</Label>
                                        <Select
                                            value={newReportForm.flowConditions}
                                            onValueChange={(value) => setNewReportForm({ ...newReportForm, flowConditions: value })}
                                        >
                                            <SelectTrigger id="flowConditions">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="dry">Dry (No Flow)</SelectItem>
                                                <SelectItem value="low">Low Flow</SelectItem>
                                                <SelectItem value="normal">Normal Flow</SelectItem>
                                                <SelectItem value="high">High Flow</SelectItem>
                                                <SelectItem value="surcharge">Surcharge</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="preCleaningStatus">Pre-Cleaning Status</Label>
                                        <Select
                                            value={newReportForm.preCleaningStatus}
                                            onValueChange={(value) => setNewReportForm({ ...newReportForm, preCleaningStatus: value })}
                                        >
                                            <SelectTrigger id="preCleaningStatus">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="partial">Partial</SelectItem>
                                                <SelectItem value="not-required">Not Required</SelectItem>
                                                <SelectItem value="not-performed">Not Performed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="equipmentUsed">Equipment/Camera Used</Label>
                                        <Input
                                            id="equipmentUsed"
                                            placeholder="e.g., CCTV Camera Model XYZ-500"
                                            value={newReportForm.equipmentUsed}
                                            onChange={(e) => setNewReportForm({ ...newReportForm, equipmentUsed: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Template Tab */}
                        {createReportTab === 'template' && (
                            <div className="space-y-6">
                                <Card className="bg-gradient-to-br from-amber-50 via-amber-50 to-amber-50 border-amber-200">
                                    <CardContent className="pt-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                <FileCheck className="h-6 w-6 text-red-700" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Report Template</h3>
                                                <div className="space-y-2 text-sm text-gray-700">
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Choose a template for structured reporting (optional but recommended)</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>The default PACP template includes comprehensive sewer inspection sections</p>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <CheckCircle className="h-4 w-4 text-red-700 mt-0.5 flex-shrink-0" />
                                                        <p>Templates ensure consistency and compliance with industry standards</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="template" className="text-base font-semibold">Select Template</Label>
                                        <Select
                                            value={newReportForm.templateId || ''}
                                            onValueChange={(value) => {
                                                setNewReportForm({ ...newReportForm, templateId: value || '' });
                                                const template = reportTemplates.find(t => {
                                                    const tId = String(t._id?.toString() || t.id?.toString() || t._id || t.id || '');
                                                    return tId === value;
                                                });
                                                setSelectedTemplate(template || null);
                                            }}
                                        >
                                            <SelectTrigger id="template" className="h-11">
                                                <SelectValue placeholder="Choose a report template (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="no_template">No Template (Basic Report)</SelectItem>
                                                {reportTemplates.filter(template => template && (template._id || template.id)).map((template) => {
                                                    const templateId = String(template._id?.toString() || template.id?.toString() || template._id || template.id || '');
                                                    if (!templateId || templateId === 'undefined' || templateId === 'null') {
                                                        return null;
                                                    }
                                                    return (
                                                        <SelectItem key={templateId} value={templateId}>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{template.name || 'Unnamed Template'}</span>
                                                                {template.isDefault && (
                                                                    <Badge variant="secondary" className="text-xs">Default</Badge>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">Templates provide structured sections for comprehensive reporting</p>
                                    </div>

                                    {selectedTemplate && selectedTemplate.sections && selectedTemplate.sections.length > 0 && (
                                        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    <FileCheck className="h-4 w-4" />
                                                    Template Preview
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm font-medium text-red-800 mb-2">
                                                    {selectedTemplate.sections.length} sections included:
                                                </p>
                                                <div className="space-y-1">
                                                    {selectedTemplate.sections.slice(0, 6).map((section, index) => (
                                                        <div key={index} className="flex items-center gap-2 text-xs text-red-800">
                                                            <CheckCircle className="h-3 w-3" />
                                                            <span>{section.name}</span>
                                                        </div>
                                                    ))}
                                                    {selectedTemplate.sections.length > 6 && (
                                                        <div className="text-xs text-red-800 font-medium">
                                                            +{selectedTemplate.sections.length - 6} more sections...
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Review Tab */}
                        {createReportTab === 'review' && (
                            <div className="space-y-6">
                                <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200">
                                    <CardContent className="pt-5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                                <Eye className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">Review Your Report</h3>
                                                <p className="text-sm text-gray-700">
                                                    Please review all the information below before creating your report. You can go back to any section to make changes.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Project Information</CardTitle>
                                            <Button variant="ghost" size="sm" onClick={() => setCreateReportTab('project')}>
                                                <Edit3 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-gray-600">Project</p>
                                                <p className="font-medium">{selectedProject?.name || 'Not selected'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Location</p>
                                                <p className="font-medium">{selectedProject?.location || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Client</p>
                                                <p className="font-medium">{selectedProject?.client || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Status</p>
                                                <Badge variant="secondary">{selectedProject?.status || 'N/A'}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Report Details</CardTitle>
                                            <Button variant="ghost" size="sm" onClick={() => setCreateReportTab('details')}>
                                                <Edit3 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-gray-600">Report Title</p>
                                                <p className="font-medium">{newReportForm.reportTitle || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Inspection Date</p>
                                                <p className="font-medium">{newReportForm.inspectionDate || 'Not set'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Report Type</p>
                                                <Badge variant="outline">{newReportForm.reportType || 'N/A'}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Priority</p>
                                                <Badge variant="outline">{newReportForm.priority || 'N/A'}</Badge>
                                            </div>
                                        </div>
                                        {newReportForm.initialNotes && (
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-gray-600 mb-1">Initial Notes</p>
                                                <p className="text-sm">{newReportForm.initialNotes}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Inspection Conditions</CardTitle>
                                            <Button variant="ghost" size="sm" onClick={() => setCreateReportTab('conditions')}>
                                                <Edit3 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-gray-600">Weather</p>
                                                <p className="font-medium">{newReportForm.weatherConditions || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Flow Conditions</p>
                                                <p className="font-medium">{newReportForm.flowConditions || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Pre-Cleaning</p>
                                                <p className="font-medium">{newReportForm.preCleaningStatus || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Equipment</p>
                                                <p className="font-medium">{newReportForm.equipmentUsed || 'Not specified'}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Template Selection</CardTitle>
                                            <Button variant="ghost" size="sm" onClick={() => setCreateReportTab('template')}>
                                                <Edit3 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <div>
                                            <p className="text-gray-600">Template</p>
                                            <p className="font-medium">
                                                {selectedTemplate?.name || (newReportForm.templateId === 'no_template' ? 'No Template' : 'Not selected')}
                                            </p>
                                            {selectedTemplate?.description && (
                                                <p className="text-xs text-gray-500 mt-1">{selectedTemplate.description}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-8 py-5 border-t bg-gradient-to-r from-gray-50 to-gray-100 gap-3">
                    {createReportTab !== 'review' ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleBackReport}
                                disabled={!canGoBackReport()}
                            >
                                <X className="h-4 w-4 mr-2" />
                                {canGoBackReport() ? 'Back' : 'Cancel'}
                            </Button>
                            <Button
                                onClick={handleNextReport}
                                disabled={!canGoNextReport()}
                            >
                                Next
                                <CheckCircle className="h-4 w-4 ml-2" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleBackReport}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                onClick={onSubmit}
                                disabled={!newReportForm.projectId || !newReportForm.reportTitle}
                                className="min-w-[140px]"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Report
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewReportModal;
