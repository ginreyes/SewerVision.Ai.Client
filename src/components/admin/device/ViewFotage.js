import React, { useState, useRef, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Download,
  Share2,
  Eye,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  Settings,
  ZoomIn,
  ZoomOut,
  MoreVertical,
  Flag,
  Edit,
  Trash2,
  FileText,
  Camera,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const ViewFootage = ({ deviceId, footageId, deviceName, onBack }) => {
  // Video player state
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([1])
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // UI state
  const [selectedDefect, setSelectedDefect] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showControls, setShowControls] = useState(true)
  const [filterDefects, setFilterDefects] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock footage data
  const [footageData] = useState({
    id: footageId || 'footage-001',
    title: 'Main Street Pipeline Inspection',
    videoUrl: '/api/placeholder/video/600/400', // Placeholder video
    thumbnailUrl: '/api/placeholder/400/300',
    duration: 2847, // 47 minutes 27 seconds
    recordedAt: '2024-07-18T09:30:00Z',
    location: 'Main Street, Section A-7',
    operator: 'John Smith',
    device: 'CCTV Inspection Camera Unit 1',
    pipelineId: 'PIPE-MS-A7-001',
    diameter: '12 inches',
    material: 'Concrete',
    depth: '8.5 feet',
    weather: 'Clear, 72°F',
    aiProcessingStatus: 'completed',
    confidence: 94,
    qcStatus: 'reviewed',
    qcTechnician: 'Sarah Johnson',
    qcDate: '2024-07-18T14:22:00Z'
  })

  // Mock AI defects data
  const [defects] = useState([
    {
      id: 1,
      type: 'crack',
      severity: 'medium',
      confidence: 96,
      timestamp: 342, // 5:42
      location: '15.2m from start',
      description: 'Longitudinal crack, 0.3m length',
      pacpCode: 'C2',
      clockPosition: '3:00',
      coordinates: { x: 0.3, y: 0.6 },
      aiNotes: 'Clear structural crack with visible separation',
      verified: true,
      qcNotes: 'Confirmed - requires monitoring'
    },
    {
      id: 2,
      type: 'root',
      severity: 'high',
      confidence: 92,
      timestamp: 567, // 9:27
      location: '23.8m from start',
      description: 'Root intrusion blocking 40% of pipe',
      pacpCode: 'R3',
      clockPosition: '6:00',
      coordinates: { x: 0.5, y: 0.8 },
      aiNotes: 'Significant root mass detected',
      verified: true,
      qcNotes: 'Immediate attention required'
    },
    {
      id: 3,
      type: 'joint',
      severity: 'low',
      confidence: 88,
      timestamp: 1203, // 20:03
      location: '45.6m from start',
      description: 'Minor joint offset',
      pacpCode: 'J1',
      clockPosition: '12:00',
      coordinates: { x: 0.7, y: 0.4 },
      aiNotes: 'Slight misalignment at joint connection',
      verified: false,
      qcNotes: 'Review pending'
    },
    {
      id: 4,
      type: 'fracture',
      severity: 'high',
      confidence: 98,
      timestamp: 1856, // 30:56
      location: '78.3m from start',
      description: 'Circumferential fracture with debris',
      pacpCode: 'F4',
      clockPosition: '9:00',
      coordinates: { x: 0.4, y: 0.7 },
      aiNotes: 'Complete break with loose material',
      verified: true,
      qcNotes: 'Critical - schedule immediate repair'
    }
  ])

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const seekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const jumpToDefect = (timestamp) => {
    seekTo(timestamp)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const changeVolume = (newVolume) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume[0]
      setVolume(newVolume)
    }
  }

  const changePlaybackSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
  }

  // Filter defects
  const filteredDefects = defects.filter(defect => {
    const matchesFilter = filterDefects === 'all' || defect.severity === filterDefects
    const matchesSearch = defect.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         defect.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         defect.pacpCode.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDefectIcon = (type) => {
    switch (type) {
      case 'crack': return <AlertTriangle className="w-4 h-4" />
      case 'root': return <Flag className="w-4 h-4" />
      case 'joint': return <Settings className="w-4 h-4" />
      case 'fracture': return <AlertTriangle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate)
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Devices
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">{deviceName || footageData.title}</h1>
              <Badge variant={footageData.qcStatus === 'reviewed' ? 'default' : 'secondary'}>
                {footageData.qcStatus === 'reviewed' ? 'QC Approved' : 'Pending Review'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Container */}
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {/* Video Element */}
                  <video
                    ref={videoRef}
                    className="w-full aspect-video"
                    src="/api/placeholder/video/800/450" // Placeholder video
                    poster={footageData.thumbnailUrl}
                    onEnded={() => setIsPlaying(false)}
                  />
                  
                  {/* Defect Markers Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {defects.map((defect) => (
                      <div
                        key={defect.id}
                        className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-lg animate-pulse"
                        style={{
                          left: `${defect.coordinates.x * 100}%`,
                          top: `${defect.coordinates.y * 100}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={`${defect.type} - ${defect.description}`}
                      />
                    ))}
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <Slider
                        value={[currentTime]}
                        max={duration}
                        step={1}
                        onValueChange={(value) => seekTo(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-white mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePlay}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => seekTo(Math.max(0, currentTime - 10))}
                          className="text-white hover:bg-white/20"
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                          className="text-white hover:bg-white/20"
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/20"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </Button>
                          <div className="w-20">
                            <Slider
                              value={volume}
                              max={1}
                              step={0.1}
                              onValueChange={changeVolume}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Select value={playbackSpeed.toString()} onValueChange={(value) => changePlaybackSpeed(parseFloat(value))}>
                          <SelectTrigger className="w-20 bg-transparent border-white/20 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.5">0.5x</SelectItem>
                            <SelectItem value="1">1x</SelectItem>
                            <SelectItem value="1.25">1.25x</SelectItem>
                            <SelectItem value="1.5">1.5x</SelectItem>
                            <SelectItem value="2">2x</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <Maximize className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI Analysis Summary</span>
                  <Badge variant="outline" className="ml-auto">
                    {footageData.confidence}% Confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {defects.filter(d => d.severity === 'high').length}
                    </div>
                    <div className="text-sm text-gray-600">Critical Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {defects.filter(d => d.severity === 'medium').length}
                    </div>
                    <div className="text-sm text-gray-600">Medium Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {defects.filter(d => d.severity === 'low').length}
                    </div>
                    <div className="text-sm text-gray-600">Minor Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {defects.filter(d => d.verified).length}/{defects.length}
                    </div>
                    <div className="text-sm text-gray-600">QC Verified</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Inspection Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Inspection Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Recorded:</span>
                  <span>{new Date(footageData.recordedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Location:</span>
                  <span>{footageData.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Operator:</span>
                  <span>{footageData.operator}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Device:</span>
                  <span>{footageData.device}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">Pipeline Specifications</div>
                  <div className="mt-1 space-y-1 text-sm">
                    <div>ID: {footageData.pipelineId}</div>
                    <div>Diameter: {footageData.diameter}</div>
                    <div>Material: {footageData.material}</div>
                    <div>Depth: {footageData.depth}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Defects List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Detected Issues</span>
                  </div>
                  <Badge variant="outline">{filteredDefects.length}</Badge>
                </CardTitle>
                <CardDescription>
                  AI-detected defects and anomalies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search defects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterDefects} onValueChange={setFilterDefects}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Defects List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredDefects.map((defect) => (
                    <div 
                      key={defect.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedDefect?.id === defect.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        setSelectedDefect(defect)
                        jumpToDefect(defect.timestamp)
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getDefectIcon(defect.type)}
                          <span className="font-medium text-sm capitalize">{defect.type}</span>
                          <Badge className={`text-xs ${getSeverityColor(defect.severity)}`}>
                            {defect.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          {defect.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                          <span className="text-xs text-gray-500">{defect.confidence}%</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2">
                        {defect.description}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>@ {formatTime(defect.timestamp)}</span>
                        <span>{defect.pacpCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Defect Details */}
            {selectedDefect && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Defect Details</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDefect(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Type & Severity</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="capitalize font-medium">{selectedDefect.type}</span>
                      <Badge className={getSeverityColor(selectedDefect.severity)}>
                        {selectedDefect.severity}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">Location</Label>
                    <div className="mt-1 text-sm">
                      <div>{selectedDefect.location}</div>
                      <div className="text-gray-500">Clock: {selectedDefect.clockPosition}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">PACP Code</Label>
                    <div className="mt-1 font-mono text-sm">{selectedDefect.pacpCode}</div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">AI Analysis</Label>
                    <div className="mt-1 text-sm text-gray-700">{selectedDefect.aiNotes}</div>
                  </div>
                  
                  {selectedDefect.qcNotes && (
                    <div>
                      <Label className="text-xs text-gray-500">QC Notes</Label>
                      <div className="mt-1 text-sm text-gray-700">{selectedDefect.qcNotes}</div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewFootage