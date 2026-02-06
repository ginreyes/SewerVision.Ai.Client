'use client'

import React from 'react'
import { X, FileText, MapPin, Calendar, Ruler, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const GenerateReportModal = ({
  open,
  onClose,
  projects,
  loadingProjects,
  reportForm,
  setReportForm,
  onGenerate,
  generating
}) => {
  const handleInputChange = (field, value) => {
    setReportForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate()
  }

  const selectedProject = projects.find(p => p._id === reportForm.projectId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Generate Inspection Report</DialogTitle>
              <DialogDescription>
                Create a new PACP inspection report for your project
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Select Project *
            </Label>
            <Select 
              value={reportForm.projectId} 
              onValueChange={(value) => {
                handleInputChange('projectId', value)
                const project = projects.find(p => p._id === value)
                if (project) {
                  handleInputChange('location', project.location || '')
                }
              }}
              disabled={loadingProjects}
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Choose a project"} />
              </SelectTrigger>
              <SelectContent>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name} - {project.location}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-projects" disabled>
                    No projects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {selectedProject && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Project:</strong> {selectedProject.name}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  <strong>Location:</strong> {selectedProject.location}
                </p>
              </div>
            )}
          </div>

          {/* Report Title */}
          <div className="space-y-2">
            <Label htmlFor="reportTitle" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Report Title *
            </Label>
            <Input
              id="reportTitle"
              placeholder="e.g., Main Street Sewer Inspection"
              value={reportForm.reportTitle}
              onChange={(e) => handleInputChange('reportTitle', e.target.value)}
              className="border-gray-300"
              required
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inspection Date */}
            <div className="space-y-2">
              <Label htmlFor="inspectionDate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Inspection Date *
              </Label>
              <Input
                id="inspectionDate"
                type="date"
                value={reportForm.inspectionDate}
                onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                className="border-gray-300"
                required
              />
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <Label htmlFor="reportType" className="text-sm font-semibold text-gray-700">
                Report Type *
              </Label>
              <Select 
                value={reportForm.reportType} 
                onValueChange={(value) => handleInputChange('reportType', value)}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PACP">PACP</SelectItem>
                  <SelectItem value="MACP">MACP</SelectItem>
                  <SelectItem value="LACP">LACP</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Footage */}
            <div className="space-y-2">
              <Label htmlFor="footage" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-blue-600" />
                Footage Inspected
              </Label>
              <Input
                id="footage"
                type="number"
                placeholder="e.g., 250"
                value={reportForm.footage}
                onChange={(e) => handleInputChange('footage', e.target.value)}
                className="border-gray-300"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Specific Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Main St & 1st Ave"
                value={reportForm.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="border-gray-300"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
              Initial Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any initial observations, conditions, or notes about the inspection..."
              value={reportForm.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="border-gray-300 min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Report Generation</h4>
                <p className="text-sm text-blue-700">
                  A draft report will be created and you can add detailed findings, AI analysis results, 
                  and observations later. The report will be marked as "Draft" until you submit it for QC review.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              disabled={!reportForm.projectId || !reportForm.reportTitle || generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default GenerateReportModal
