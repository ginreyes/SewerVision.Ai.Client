'use client'
import React, { useCallback, useState ,useEffect, useRef } from 'react'
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
    videoRef,
  } = props
  
  //statess
  
  const [errors, setErrors] = useState({});
  const [capturedFrame, setCapturedFrame] = useState(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
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



  

  // Handle pacpCodes - can be array or object
  const pacpCodesArray = Array.isArray(pacpCodes) 
    ? pacpCodes 
    : pacpCodes && typeof pacpCodes === 'object' 
      ? Object.values(pacpCodes) 
      : [];

  const selectedPacpCode = pacpCodesArray.find(
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

  // Format time (seconds) to hh:mm:ss
  const formatTime = (timeSec) => {
    if (!timeSec && timeSec !== 0) return '00:00:00';
    if (typeof timeSec === 'string') return timeSec;
    const hours = Math.floor(timeSec / 3600);
    const minutes = Math.floor((timeSec % 3600) / 60);
    const seconds = Math.floor(timeSec % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Capture frame from video
  const captureFrame = () => {
    if (!videoRef?.current) {
      console.warn('Video reference not available');
      return;
    }

    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      console.warn('Video not ready for capture');
      return;
    }

    // Use canvas ref or create new one
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth || 640;
    canvas.height = video.videoHeight || video.clientHeight || 360;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedFrame(dataUrl);
    
    // Auto-enable snapshot if not already enabled
    if (!formData.snapshot) {
      handleInputChange('snapshot', true);
    }
  };

  // Update preview canvas with video frame
  useEffect(() => {
    if (!isOpen || !videoRef?.current || !previewCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const updatePreview = () => {
      if (video && video.readyState >= 2 && !capturedFrame && canvas && ctx) {
        try {
          canvas.width = video.videoWidth || video.clientWidth || 640;
          canvas.height = video.videoHeight || video.clientHeight || 360;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch (error) {
          console.warn('Error updating preview:', error);
        }
      }
      animationFrameId = requestAnimationFrame(updatePreview);
    };

    updatePreview();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen, videoRef, capturedFrame]);

  // Update form data when props change
  useEffect(() => {
    if (isOpen) {
      const formattedTime = typeof currentTime === 'number' ? formatTime(currentTime) : currentTime;
      setFormData(prev => ({
        ...prev,
        time: formattedTime,
        distance: currentDistance,
      }));
    }
  }, [isOpen, currentTime, currentDistance]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate timestamp when snapshot is enabled
      if (field === 'snapshot' && value === true) {
        newData.snapshotTimestamp = generateSnapshotTimestamp();
        // Auto-set label based on PACP code if available
        if (prev.pacpCode && pacpCodesArray.length > 0) {
          const selectedCode = pacpCodesArray.find(code => code.code === prev.pacpCode);
          newData.snapshotLabel = selectedCode ? `${selectedCode.code} - ${selectedCode.name}` : '';
        }
      }
      
      // Clear snapshot data when disabled
      if (field === 'snapshot' && value === false) {
        newData.snapshotLabel = '';
        newData.snapshotTimestamp = '';
      }
      
      // Update snapshot label when PACP code changes and snapshot is enabled
      if (field === 'pacpCode' && prev.snapshot && pacpCodesArray.length > 0) {
        const selectedCode = pacpCodesArray.find(code => code.code === value);
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

      // Prepare observation data with captured frame
      const observationData = {
        ...formData,
        capturedFrame: capturedFrame, // Include captured frame if available
      };

      // If snapshot is enabled and we have a captured frame, save it as snapshot
      if (formData.snapshot && capturedFrame && project_id) {
        try {
          const snapshotData = {
            projectId: project_id,
            distance: formData.distance,
            label: formData.snapshotLabel || `${formData.pacpCode || 'Observation'} - ${formData.time}`,
            timestamp: formData.snapshotTimestamp || generateSnapshotTimestamp(),
            imageData: capturedFrame, // Base64 image data
          };

          const snapshotResponse = await api(
            `/api/snapshots/create-snapshot/${project_id}/${user_id}`,
            'POST',
            snapshotData
          );

          if (snapshotResponse.ok) {
            console.log('Snapshot saved:', snapshotResponse.data);
          }
        } catch (snapshotError) {
          console.error('Error saving snapshot:', snapshotError);
          // Don't block observation save if snapshot fails
        }
      }

      // Send observation to backend
      const { ok, data } = await api(
        `/api/observations/create-observations/${project_id}/${user_id}`,
        'POST',
        observationData
      );
  
      if (!ok) {
        console.error('Failed to save observation:', data);
      } else {
        console.log('Observation saved:', data);
      }

      onClose();
      // Reset form after save
      setFormData({
        distance: currentDistance,
        pacpCode: '',
        observation: '',
        time: typeof currentTime === 'number' ? formatTime(currentTime) : currentTime,
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
      setCapturedFrame(null);
    } catch (error) {
      console.error('Error saving observation:', error);
    }
  };

  
  



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                    {pacpCodesArray.length > 0 ? (
                      pacpCodesArray.map(code => (
                        <SelectItem key={code.code || code._id} value={code.code}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{code.code}</Badge>
                            <span>{code.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-pacp-codes" disabled>No PACP codes available</SelectItem>
                    )}
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
                ? 'border-pink-400 bg-gradient-to-r from-pink-50 via-rose-50 to-fuchsia-50 shadow-lg' 
                : 'border-gray-200 hover:border-pink-300'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full transition-all duration-200 ${
                      formData.snapshot 
                        ? 'bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600' 
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
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg' 
                        : 'border-pink-300 hover:border-pink-400 hover:bg-pink-50 text-pink-600'
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
                    ? 'bg-gradient-to-r from-pink-100 to-rose-100 border border-pink-300' 
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    formData.snapshot ? 'bg-pink-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    formData.snapshot ? 'text-pink-700' : 'text-gray-600'
                  }`}>
                    {formData.snapshot ? 'Snapshot capture is active' : 'Snapshot capture is disabled'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Snapshot Configuration - Only show when enabled */}
            {formData.snapshot && (
              <Card className="border-2 border-pink-400 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 shadow-xl">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Video Preview Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-md">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent text-lg">Live Video Feed</h5>
                          <p className="text-sm text-pink-700">Current frame will be captured</p>
                        </div>
                      </div>
                      
                      <div className="relative bg-black rounded-xl overflow-hidden border-4 border-pink-300 shadow-lg h-56">
                        {videoRef?.current ? (
                          <>
                            {/* Canvas for video preview */}
                            <canvas
                              ref={previewCanvasRef}
                              className="w-full h-full object-cover"
                              style={{ display: capturedFrame ? 'none' : 'block' }}
                            />
                            
                            {/* Captured frame display */}
                            {capturedFrame && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                <img 
                                  src={capturedFrame} 
                                  alt="Captured frame" 
                                  className="max-w-full max-h-full object-contain border-4 border-pink-400 rounded-lg shadow-2xl"
                                />
                              </div>
                            )}
                            
                            {/* Live indicator */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-3 py-1 rounded-full text-sm font-medium z-10 shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              {capturedFrame ? 'CAPTURED' : 'LIVE'}
                            </div>
                            
                            {/* Frame info overlay */}
                            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-pink-600/90 to-rose-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium z-10 shadow-lg">
                              📍 {formData.distance} | ⏱️ {formData.time}
                            </div>
                            
                            {/* PACP Code badge */}
                            {formData.pacpCode && (
                              <div className="absolute top-4 right-4 z-10">
                                <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 text-sm font-semibold shadow-lg border-2 border-pink-300">
                                  {formData.pacpCode}
                                </Badge>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600">
                            <div className="text-center text-white">
                              <Video className="h-12 w-12 mx-auto mb-2 opacity-70" />
                              <p className="text-sm font-medium">Video feed not available</p>
                              <p className="text-xs mt-1 opacity-80">Snapshot can still be added manually</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          type="button" 
                          size="lg" 
                          onClick={captureFrame}
                          disabled={!videoRef?.current}
                          className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
                          title={!videoRef?.current ? 'Video not available for capture' : ''}
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          {capturedFrame ? 'Recapture' : 'Capture Now'}
                        </Button>
                        <Button 
                          type="button" 
                          size="lg" 
                          variant="outline"
                          onClick={() => setCapturedFrame(null)}
                          disabled={!capturedFrame}
                          className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <PlayCircle className="h-5 w-5 mr-2" />
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Snapshot Configuration Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-lg shadow-md">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent text-lg">Snapshot Configuration</h5>
                          <p className="text-sm text-pink-700">Configure snapshot metadata and settings</p>
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
                            className="bg-white border-2 border-pink-200 focus:border-pink-400 focus:ring-pink-300 h-12 text-base"
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
                            className="bg-pink-50 border-2 border-pink-200 h-12 text-base"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700">Snapshot Category</Label>
                          <Select defaultValue="defect">
                            <SelectTrigger className="bg-white border-2 border-pink-200 focus:border-pink-400 focus:ring-pink-300 h-12">
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

                        <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-fuchsia-100 border-2 border-pink-300 rounded-xl p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="p-1 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full">
                              <Info className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-sm text-pink-800">
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