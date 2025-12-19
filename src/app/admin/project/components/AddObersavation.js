'use client'
import React, { useCallback, useState ,useEffect } from 'react'
import { 
  Save, 
  Clock, 
  MapPin, 
  AlertTriangle,
  Info,
  FileText,
  Plus,
  Camera,
  PlayCircle,
  Video,
  ImageIcon,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { api } from '@/lib/helper'
import { useAlert } from '@/components/providers/AlertProvider'

const AddObservation = (props) => {
  
  const {
    isOpen, 
    onClose, 
    currentTime = "00:00:00", 
    currentDistance = "0.00", 
    project_id, 
    user_id ,
    pacpCodes,
    snapshots = [],
  } = props
  
  //statess
  
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    distance: currentDistance,
    pacpCode: '',
    observation: '',
    time: currentTime,
    remarks: '',
    severity: 'low',
    clockPosition: '',
    length: '',
    width: '',
    percentage: '',
    joint: '',
    continuous: false,
    snapshot: false,
    snapshotLabel: '',
    snapshotTimestamp: '',
  })



  

  const selectedPacpCode = Object.values(pacpCodes).find(
    (code) => code.code === formData.pacpCode
  );
  


  

  const severityLevels = [
    { value: 'low', label: 'Grade 1-2 (Minor)', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'medium', label: 'Grade 3 (Moderate)', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'high', label: 'Grade 4-5 (Severe)', color: 'bg-red-100 text-red-800 border-red-200' }
  ]

  const clockPositions = [
    '12:00', '1:00', '2:00', '3:00', '4:00', '5:00',
    '6:00', '7:00', '8:00', '9:00', '10:00', '11:00',
    '12:00-3:00', '3:00-6:00', '6:00-9:00', '9:00-12:00',
    '12:00-6:00', '6:00-12:00', 'All Around'
  ]

  // Helper function to generate snapshot timestamp
  const generateSnapshotTimestamp = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate timestamp when snapshot is enabled
      if (field === 'snapshot' && value === true) {
        newData.snapshotTimestamp = generateSnapshotTimestamp();
        // Auto-set label based on PACP code if available
        if (prev.pacpCode) {
          const selectedCode = pacpCodes.find(code => code.code === prev.pacpCode);
          newData.snapshotLabel = selectedCode ? `${selectedCode.code} - ${selectedCode.name}` : '';
        }
      }
      
      // Clear snapshot data when disabled
      if (field === 'snapshot' && value === false) {
        newData.snapshotLabel = '';
        newData.snapshotTimestamp = '';
      }
      
      // Update snapshot label when PACP code changes and snapshot is enabled
      if (field === 'pacpCode' && prev.snapshot) {
        const selectedCode = pacpCodes.find(code => code.code === value);
        newData.snapshotLabel = selectedCode ? `${selectedCode.code} - ${selectedCode.name}` : '';
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  };

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.distance) newErrors.distance = 'Distance is required'
    if (!formData.pacpCode) newErrors.pacpCode = 'PACP Code is required'
    if (!formData.observation) newErrors.observation = 'Observation description is required'
    if (!formData.time) newErrors.time = 'Time is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) return;

      onClose();
      // Reset form after save
      setFormData({
        distance: currentDistance,
        pacpCode: '',
        observation: '',
        time: currentTime,
        remarks: '',
        severity: 'low',
        clockPosition: '',
        length: '',
        width: '',
        percentage: '',
        joint: '',
        continuous: false,
        snapshot: false,
        snapshotLabel: '',
        snapshotTimestamp: '',
      });
  
      // Send observation to backend
      const { ok, data } = await api(
        `/api/observations/create-observations/${project_id}/${user_id}`,
        'POST',
        formData
      );
  
      if (!ok) {
        console.error('Failed to save observation:', data);
      } else {
        console.log('Observation saved:', data);
      }
    } catch (error) {
      console.error('Error saving observation:', error);
    }
  };

  
  



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Add New Observation
          </DialogTitle>
          <DialogDescription>
            Record a new sewer pipe observation with detailed measurements and classifications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="distance" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Distance *
                </Label>
                <Input
                  id="distance"
                  value={formData.distance}
                  onChange={(e) => handleInputChange('distance', e.target.value)}
                  placeholder="0.00m"
                  className={errors.distance ? 'border-red-500' : ''}
                />
                {errors.distance && (
                  <p className="text-red-500 text-xs">{errors.distance}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Time *
                </Label>
                <Input
                  id="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  placeholder="00:00:00"
                  className={errors.time ? 'border-red-500' : ''}
                />
                {errors.time && (
                  <p className="text-red-500 text-xs">{errors.time}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="joint">Joint Number</Label>
                <Input
                  id="joint"
                  value={formData.joint}
                  onChange={(e) => handleInputChange('joint', e.target.value)}
                  placeholder="Joint number if applicable"
                />
              </div>
            </div>
          </div>

          {/* PACP Code and Observation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Classification & Description
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pacpCode">PACP Code *</Label>
                <Select 
                  value={formData.pacpCode} 
                  onValueChange={(value) => handleInputChange('pacpCode', value)}
                >
                  <SelectTrigger className={errors.pacpCode ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select PACP Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacpCodes.map(code => (
                      <SelectItem key={code.code} value={code.code}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{code.code}</Badge>
                          <span>{code.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pacpCode && (
                  <p className="text-red-500 text-xs">{errors.pacpCode}</p>
                )}
                {selectedPacpCode && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-3">
                      <p className="text-sm text-blue-800 flex items-center gap-1">
                        <Info className="h-4 w-4" />
                        {selectedPacpCode.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observation" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Observation Description *
                </Label>
                <Textarea
                  id="observation"
                  value={formData.observation}
                  onChange={(e) => handleInputChange('observation', e.target.value)}
                  placeholder="Detailed description of the observation"
                  className={errors.observation ? 'border-red-500' : ''}
                  rows={4}
                />
                {errors.observation && (
                  <p className="text-red-500 text-xs">{errors.observation}</p>
                )}
              </div>
            </div>
          </div>

          {/* Severity Level Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Severity Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {severityLevels.map(level => (
                <Button
                  key={level.value}
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange('severity', level.value)}
                  className={`h-auto p-4 ${
                    formData.severity === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : ''
                  }`}
                >
                  <Badge className={level.color} variant="outline">
                    {level.label}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Measurements Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Measurements & Position
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clockPosition">Clock Position</Label>
                <Select 
                  value={formData.clockPosition} 
                  onValueChange={(value) => handleInputChange('clockPosition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {clockPositions.map(position => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Input
                  id="length"
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  placeholder="e.g., 25cm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  value={formData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  placeholder="e.g., 5mm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Percentage</Label>
                <Input
                  id="percentage"
                  value={formData.percentage}
                  onChange={(e) => handleInputChange('percentage', e.target.value)}
                  placeholder="e.g., 25%"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Snapshot Identification Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Snapshot Identification
            </h3>
            
            {/* Snapshot Toggle Card */}
            <Card className={`border-2 transition-all duration-200 ${
              formData.snapshot 
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full transition-all duration-200 ${
                      formData.snapshot 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {formData.snapshot ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <ImageIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        {formData.snapshot ? 'Snapshot Capture Enabled' : 'Enable Snapshot Capture'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formData.snapshot 
                          ? 'This observation will include a snapshot for documentation and quick reference'
                          : 'Capture and identify a snapshot at this location for better documentation'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant={formData.snapshot ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleInputChange('snapshot', !formData.snapshot)}
                    className={`px-6 transition-all duration-200 ${
                      formData.snapshot 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {formData.snapshot ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5 mr-2" />
                        Enable Snapshot
                      </>
                    )}
                  </Button>
                </div>

                {/* Status Indicator */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  formData.snapshot 
                    ? 'bg-green-100 border border-green-200' 
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    formData.snapshot ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    formData.snapshot ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {formData.snapshot ? 'Snapshot capture is active' : 'Snapshot capture is disabled'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Snapshot Configuration - Only show when enabled */}
            {formData.snapshot && (
              <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Video Preview Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-900 text-lg">Live Video Feed</h5>
                          <p className="text-sm text-blue-700">Current frame will be captured</p>
                        </div>
                      </div>
                      
                      <div className="relative bg-gradient-to-br from-amber-400 to-amber-700 rounded-xl p-8 h-56 flex items-center justify-center border-4 border-amber-200 shadow-lg">
                        {/* Simulated pipe view */}
                        <div className="w-36 h-36 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center relative border-4 border-amber-200 shadow-xl">
                          <div className="w-24 h-24 rounded-full bg-black opacity-70"></div>
                          {formData.pacpCode && (
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                                {formData.pacpCode}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Crosshair overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-0.5 bg-red-400 absolute"></div>
                            <div className="w-0.5 h-8 bg-red-400 absolute"></div>
                          </div>
                        </div>
                        
                        {/* Live indicator */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </div>
                        
                        {/* Frame info overlay */}
                        <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium">
                          📍 {formData.distance} | ⏱️ {formData.time}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          type="button" 
                          size="lg" 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          Capture Now
                        </Button>
                        <Button 
                          type="button" 
                          size="lg" 
                          variant="outline"
                          className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold"
                        >
                          <PlayCircle className="h-5 w-5 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>

                    {/* Snapshot Configuration Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-600 rounded-lg">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-purple-900 text-lg">Snapshot Configuration</h5>
                          <p className="text-sm text-purple-700">Configure snapshot metadata and settings</p>
                        </div>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <Label htmlFor="snapshotLabel" className="text-sm font-semibold text-gray-700">
                            Snapshot Label *
                          </Label>
                          <Input
                            id="snapshotLabel"
                            value={formData.snapshotLabel}
                            onChange={(e) => handleInputChange('snapshotLabel', e.target.value)}
                            placeholder="e.g., Main crack location"
                            className="bg-white border-2 border-gray-200 focus:border-purple-400 h-12 text-base"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <Label htmlFor="snapshotTimestamp" className="text-sm font-semibold text-gray-700">
                            Timestamp
                          </Label>
                          <Input
                            id="snapshotTimestamp"
                            value={formData.snapshotTimestamp}
                            placeholder="Auto-generated timestamp"
                            disabled
                            className="bg-gray-50 border-2 border-gray-200 h-12 text-base"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700">Snapshot Category</Label>
                          <Select defaultValue="defect">
                            <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-purple-400 h-12">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="defect">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🔍</span>
                                  <span>Defect Documentation</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="reference">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">📍</span>
                                  <span>Reference Point</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="measurement">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">📏</span>
                                  <span>Measurement Point</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="joint">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🔗</span>
                                  <span>Joint/Connection</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="anomaly">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">⚠️</span>
                                  <span>Anomaly</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="general">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">📋</span>
                                  <span>General Documentation</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="p-1 bg-blue-600 rounded-full">
                              <Info className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-sm text-blue-800">
                              <p className="font-semibold mb-2">Snapshot Benefits:</p>
                              <ul className="space-y-1 text-xs">
                                <li>• Quick navigation to exact location</li>
                                <li>• Visual reference in reports</li>
                                <li>• Before/after comparisons</li>
                                <li>• Training documentation</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Existing Snapshots List */}
                        {Array.isArray(snapshots) && snapshots.length > 0 && (
                          <div className="space-y-3 mt-6">
                            <Label className="text-sm font-semibold text-gray-700">
                              Existing Snapshots ({snapshots.length})
                            </Label>
                            <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3 bg-white">
                              {snapshots.map((snapshot, index) => (
                                <div 
                                  key={snapshot.id || snapshot._id || index}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-3 h-3 rounded-full ${snapshot.color || 'bg-gray-400'} flex-shrink-0`}></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {snapshot.label || 'Unlabeled'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {snapshot.distance || 'N/A'} • {snapshot.timestamp ? new Date(snapshot.timestamp).toLocaleString() : 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                  {snapshot.imageUrl && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(snapshot.imageUrl, '_blank')}
                                      className="flex-shrink-0"
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Options Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Additional Options
            </h3>
            
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="continuous"
                checked={formData.continuous}
                onCheckedChange={(checked) => handleInputChange('continuous', checked)}
              />
              <Label htmlFor="continuous" className="text-sm font-normal">
                Continuous defect (spans multiple joints/segments)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Additional Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={4}
                placeholder="Additional notes, context, or details about this observation..."
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex items-center gap-2"
            variant='rose'
          >
            <Save className="h-4 w-4" />
            Save Observation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddObservation