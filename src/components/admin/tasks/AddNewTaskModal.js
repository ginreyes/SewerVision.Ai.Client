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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

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

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newTask = {
      id: Date.now(),
      ...formData,
      status: 'pending',
      progress: 0,
      aiProcessing: 'pending',
      footage: '0 GB'
    }

    if (onAddTask) {
      onAddTask(newTask)
    }

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
        <Button variant="rose">
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
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g., Main St Pipeline Inspection"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={3}
              placeholder="Provide a detailed description of the task..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Task Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Task Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger>
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

          {/* Assignee and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee *</Label>
              <Input
                id="assignee"
                name="assignee"
                type="text"
                required
                placeholder="Team member name"
                value={formData.assignee}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                type="text"
                required
                placeholder="Site location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Device */}
          <div className="space-y-2">
            <Label htmlFor="device">Device/Equipment *</Label>
            <Input
              id="device"
              name="device"
              type="text"
              required
              placeholder="e.g., CCTV Inspection Camera Unit 1"
              value={formData.device}
              onChange={handleInputChange}
            />
          </div>

          {/* Start Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Estimated Duration *</Label>
              <Input
                id="estimatedDuration"
                name="estimatedDuration"
                type="text"
                required
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
              variant="rose"
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
