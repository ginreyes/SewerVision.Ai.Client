'use client'
import React, { useState } from 'react'
import { 
  FileText,
  Plus,
  Search,
  Filter,
  Star,
  Calendar,
  Clock,
  User,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Share2,
  Download,
  Trash2,
  Pin,
  Eye,
  MessageCircle,
  Paperclip,
  Tag,
  MoreHorizontal,
  Archive,
  BookOpen,
  Brain,
  Image,
  Video,
  Settings 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const Notes = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedNote, setSelectedNote] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const notes = [
    {
      id: 1,
      title: 'Severe Crack Detection - Main St Pipeline',
      content: 'AI detected multiple structural cracks in section 120-140ft. Requires immediate attention. Confidence level 96%. Recommended for emergency repair.',
      category: 'defect',
      priority: 'critical',
      author: 'AI System',
      location: 'Main St Pipeline, Section 120-140ft',
      createdAt: '2024-08-12T10:30:00',
      updatedAt: '2024-08-12T10:30:00',
      tags: ['structural', 'crack', 'emergency'],
      isPinned: true,
      hasAttachments: true,
      attachmentCount: 3,
      aiGenerated: true,
      linkedTask: 'Main St Pipeline Inspection',
      confidence: 96,
      defectType: 'Structural Crack',
      severity: 'high'
    },
    {
      id: 2,
      title: 'QC Review Notes - Oak Ave Assessment',
      content: 'Post-repair inspection completed successfully. All defects have been properly addressed. PACP grading improved from 4 to 2. Documentation complete.',
      category: 'review',
      priority: 'medium',
      author: 'Mike Davis',
      location: 'Oak Ave Pipeline',
      createdAt: '2024-08-12T14:15:00',
      updatedAt: '2024-08-12T15:20:00',
      tags: ['qc', 'post-repair', 'pacp'],
      isPinned: false,
      hasAttachments: true,
      attachmentCount: 2,
      aiGenerated: false,
      linkedTask: 'Oak Ave Pipeline Assessment',
      reviewStatus: 'approved'
    },
    {
      id: 3,
      title: 'Field Observations - Industrial District',
      content: 'Multiple manholes showing signs of corrosion. Recommend scheduling detailed inspections. Water levels higher than expected in sections 5-7.',
      category: 'observation',
      priority: 'medium',
      author: 'Sarah Johnson',
      location: 'Industrial District',
      createdAt: '2024-08-12T09:45:00',
      updatedAt: '2024-08-12T09:45:00',
      tags: ['field-notes', 'corrosion', 'manholes'],
      isPinned: false,
      hasAttachments: false,
      attachmentCount: 0,
      aiGenerated: false,
      linkedTask: 'Industrial District Survey'
    },
    {
      id: 4,
      title: 'Root Intrusion Alert - Elm Street',
      content: 'Significant root intrusion detected at 89ft mark. AI analysis shows 78% pipe obstruction. Scheduling root cutting operation for tomorrow.',
      category: 'defect',
      priority: 'high',
      author: 'AI System',
      location: 'Elm Street Pipeline, 89ft',
      createdAt: '2024-08-11T16:22:00',
      updatedAt: '2024-08-12T08:15:00',
      tags: ['root-intrusion', 'obstruction', 'scheduled'],
      isPinned: false,
      hasAttachments: true,
      attachmentCount: 1,
      aiGenerated: true,
      confidence: 78,
      defectType: 'Root Intrusion',
      severity: 'medium'
    },
    {
      id: 5,
      title: 'Equipment Calibration Log',
      content: 'CCTV Unit 1 calibrated and tested. All systems operational. Battery performance optimal. Lens cleaned and focused.',
      category: 'maintenance',
      priority: 'low',
      author: 'John Smith',
      location: 'Equipment Bay',
      createdAt: '2024-08-12T07:30:00',
      updatedAt: '2024-08-12T07:30:00',
      tags: ['maintenance', 'calibration', 'cctv'],
      isPinned: false,
      hasAttachments: false,
      attachmentCount: 0,
      aiGenerated: false
    },
    {
      id: 6,
      title: 'Customer Complaint Follow-up',
      content: 'Investigated reported backup at 123 Maple St. Found minor blockage cleared during inspection. Customer notified of resolution.',
      category: 'report',
      priority: 'medium',
      author: 'Lisa Chen',
      location: '123 Maple St',
      createdAt: '2024-08-11T13:20:00',
      updatedAt: '2024-08-11T16:45:00',
      tags: ['customer', 'complaint', 'resolved'],
      isPinned: false,
      hasAttachments: true,
      attachmentCount: 2,
      aiGenerated: false,
      customerRef: 'COMP-2024-0089'
    }
  ]

  const getFilteredNotes = () => {
    let filtered = notes

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(note => note.category === filterCategory)
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(note => note.priority === filterPriority)
    }

    // Filter by tab
    if (activeTab === 'pinned') {
      filtered = filtered.filter(note => note.isPinned)
    } else if (activeTab === 'ai') {
      filtered = filtered.filter(note => note.aiGenerated)
    } else if (activeTab === 'defects') {
      filtered = filtered.filter(note => note.category === 'defect')
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Sort by pinned first, then by date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      'defect': 'bg-gradient-to-br from-red-500 to-red-700',
      'review': 'bg-gradient-to-br from-blue-500 to-purple-600',
      'observation': 'bg-gradient-to-br from-green-500 to-emerald-600',
      'maintenance': 'bg-gradient-to-br from-orange-500 to-red-600',
      'report': 'bg-gradient-to-br from-purple-500 to-pink-600'
    }
    return colors[category] || 'bg-gradient-to-br from-gray-500 to-gray-700'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'defect': AlertTriangle,
      'review': CheckCircle,
      'observation': Eye,
      'maintenance': Settings,
      'report': FileText
    }
    const Icon = icons[category] || FileText
    return <Icon className="w-5 h-5" />
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-gray-600 bg-gray-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'high': 'text-orange-600 bg-orange-100',
      'critical': 'text-red-600 bg-red-100'
    }
    return colors[priority] || 'text-gray-600 bg-gray-100'
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  const NoteCard = ({ note }) => {
    const categoryColor = getCategoryColor(note.category)
    const priorityClasses = getPriorityColor(note.priority)
    const categoryIcon = getCategoryIcon(note.category)
    
    return (
      <div 
        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
          selectedNote?.id === note.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => setSelectedNote(note)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${categoryColor} text-white flex-shrink-0`}>
                {categoryIcon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {note.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                  {note.aiGenerated && <Brain className="w-4 h-4 text-purple-500" />}
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{note.title}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses}`}>
                  {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)} Priority
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{note.content}</p>

          {/* AI Confidence & Defect Info */}
          {note.aiGenerated && note.confidence && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-purple-700">
                  <Brain className="w-4 h-4 mr-1" />
                  AI Analysis: {note.defectType}
                </span>
                <span className="text-purple-600 font-medium">{note.confidence}% Confidence</span>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {note.author}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {note.location}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(note.updatedAt).toLocaleTimeString()}
              </span>
            </div>

            {note.linkedTask && (
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                <span className="text-blue-600">Linked to: {note.linkedTask}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {note.hasAttachments && (
            <div className="mb-4 flex items-center text-sm text-gray-600">
              <Paperclip className="w-4 h-4 mr-1" />
              <span>{note.attachmentCount} attachment{note.attachmentCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button className="flex-1 bg-blue-500">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Note
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const filteredNotes = getFilteredNotes()

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">SewerVision.ai Notes</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Live System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
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
            value={notes.length.toString()} 
            subtitle="All inspection notes"
            icon={BookOpen}
            color="bg-gradient-to-br from-blue-500 to-purple-600"
          />
          <StatCard 
            title="AI Generated" 
            value={notes.filter(n => n.aiGenerated).length.toString()} 
            subtitle="Automated defect alerts"
            icon={Brain}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <StatCard 
            title="Critical Defects" 
            value={notes.filter(n => n.priority === 'critical').length.toString()} 
            subtitle="Requiring immediate action"
            icon={AlertTriangle}
            color="bg-gradient-to-br from-red-500 to-red-700"
          />
          <StatCard 
            title="Pinned Items" 
            value={notes.filter(n => n.isPinned).length.toString()} 
            subtitle="Important references"
            icon={Pin}
            color="bg-gradient-to-br from-orange-500 to-red-600"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'all' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 mr-2 inline" />
              All Notes
            </button>
            <button
              onClick={() => setActiveTab('pinned')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pinned' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Pin className="w-4 h-4 mr-2 inline" />
              Pinned
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ai' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Brain className="w-4 h-4 mr-2 inline" />
              AI Generated
            </button>
            <button
              onClick={() => setActiveTab('defects')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'defects' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4 mr-2 inline" />
              Defect Alerts
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes, locations, tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="defect">Defects</option>
            <option value="review">Reviews</option>
            <option value="observation">Observations</option>
            <option value="maintenance">Maintenance</option>
            <option value="report">Reports</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notes