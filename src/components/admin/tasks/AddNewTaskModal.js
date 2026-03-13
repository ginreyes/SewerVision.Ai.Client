import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Camera, FileText, Eye, MapPin, AlertCircle } from 'lucide-react'

const AddNewTaskModal = ({ onAddTask }) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'inspection',
    priority: 'medium',
    assignee: '',
    location: '',
    device: '',
    startTime: '',
    estimatedDuration: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create new task object
    const newTask = {
      id: Date.now(),
      ...formData,
      status: 'pending',
      progress: 0,
      aiProcessing: 'pending',
      footage: '0 GB'
    }
    
    // Call parent callback if provided
    if (onAddTask) {
      onAddTask(newTask)
    }
    
    // Reset form and close modal
    setFormData({
      title: '',
      description: '',
      type: 'inspection',
      priority: 'medium',
      assignee: '',
      location: '',
      device: '',
      startTime: '',
      estimatedDuration: ''
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new inspection or assessment task.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Task Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Task Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Main St Pipeline Inspection"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Provide a detailed description of the task..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Task Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-gray-700">
                Task Type *
              </label>
              <select
                id="type"
                name="type"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="inspection">Inspection</option>
                <option value="assessment">Assessment</option>
                <option value="review">Review</option>
                <option value="survey">Survey</option>
                <option value="report">Report</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium text-gray-700">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Assignee and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="assignee" className="text-sm font-medium text-gray-700">
                Assignee *
              </label>
              <input
                id="assignee"
                name="assignee"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Team member name"
                value={formData.assignee}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Site location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Device */}
          <div className="space-y-2">
            <label htmlFor="device" className="text-sm font-medium text-gray-700">
              Device/Equipment *
            </label>
            <input
              id="device"
              name="device"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CCTV Inspection Camera Unit 1"
              value={formData.device}
              onChange={handleInputChange}
            />
          </div>

          {/* Start Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                Start Time *
              </label>
              <input
                id="startTime"
                name="startTime"
                type="datetime-local"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.startTime}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="estimatedDuration" className="text-sm font-medium text-gray-700">
                Estimated Duration *
              </label>
              <input
                id="estimatedDuration"
                name="estimatedDuration"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2 hours"
                value={formData.estimatedDuration}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddNewTaskModal