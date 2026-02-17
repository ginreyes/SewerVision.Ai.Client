'use client'

import React, { useEffect, useState } from 'react'
import {  
  Cloud, 
  Truck,
  MapPin,
  User,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader,
  Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { connectivityOptions, deviceTypes } from './DataTypes'
import { api } from '@/lib/helper'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'
import { useQueryClient } from '@tanstack/react-query'

// ❌ REMOVED: import { userAgent } from 'next/server' — causes client/server conflict

const AddDeviceModal = (props) => {
  const { isOpen, onClose, onAddDevice, onSuccess } = props
  const { showAlert } = useAlert()
  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [deviceData, setDeviceData] = useState({
    name: '',
    type: '',
    category: 'field',
    location: '',
    teamLeader: '',
    operator: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    ipAddress: '',
    macAddress: '',
    specifications: {
      resolution: '',
      storage: '',
      battery: null, // number (hours)
      connectivity: []
    },
    certifications: {
      pacp: false,
      lacp: false,
      other: ''
    },
    settings: {
      aiEnabled: true,
      autoUpload: true,
      qualityThreshold: [80],
      confidenceThreshold: [85]
    }
  })
  const [deviceImage, setDeviceImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [teamLeaders, setTeamLeaders] = useState([])
  const { userId } = useUser()

  useEffect(() => {
    const fetchTeamLeaders = async () => {
      try {
        const { ok, data } = await api("/api/users/get-all-user", "GET")
        if (!ok || !Array.isArray(data?.users)) {
          setTeamLeaders([])
          return
        }
        const leaders = data.users.filter((u) => String(u.role || '').toLowerCase() === 'user')
        setTeamLeaders(leaders)
      } catch (error) {
        console.error('Error fetching team leaders:', error.message)
        setTeamLeaders([])
      }
    }
    fetchTeamLeaders()
  }, [])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setDeviceData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setDeviceData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      if (!deviceData.name) newErrors.name = 'Device name is required'
      if (!deviceData.type) newErrors.type = 'Device type is required'
      if (!deviceData.location) newErrors.location = 'Location is required'
      if (deviceData.category === 'field' && !deviceData.teamLeader) {
        newErrors.teamLeader = 'Team leader is required for field devices'
      }
    }
    
    if (step === 2) {
      if (!deviceData.serialNumber) newErrors.serialNumber = 'Serial number is required'
      if (!deviceData.model) newErrors.model = 'Model is required'
      if (!deviceData.manufacturer) newErrors.manufacturer = 'Manufacturer is required'
    }
    
    if (step === 3 && deviceData.category === 'cloud') {
      if (!deviceData.ipAddress) newErrors.ipAddress = 'IP address is required for cloud devices'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors({ ...errors, image: 'Image must be less than 10MB' })
        return
      }
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select a valid image file' })
        return
      }
      setDeviceImage(file)
      setImagePreview(URL.createObjectURL(file))
      setErrors({ ...errors, image: '' })
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    if (!userId) {
      showAlert('You must be logged in to add a device', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const normalizedBattery =
        deviceData.specifications?.battery === '' ||
        deviceData.specifications?.battery === null ||
        typeof deviceData.specifications?.battery === 'undefined'
          ? null
          : Number(deviceData.specifications?.battery);

      const payload = {
        ...deviceData,
        operator: deviceData.operator || undefined,
        createdBy: userId,
        teamLeader:
          deviceData.category === 'field' ? deviceData.teamLeader || undefined : undefined,
        specifications: {
          ...deviceData.specifications,
          battery: normalizedBattery,
        },
        settings: {
          ...deviceData.settings,
          qualityThreshold: deviceData.settings.qualityThreshold[0],
          confidenceThreshold: deviceData.settings.confidenceThreshold[0],
        },
      }
      const res = await api('/api/devices/create-device', 'POST', payload)
      if (!res.ok) {
        const msg = res.data?.message || res.data?.error?.message || 'Failed to create device'
        throw new Error(typeof msg === 'string' ? msg : 'Failed to create device')
      }
      const data = res.data?.data ?? res.data
      const deviceId = data?._id || data?.id

      // Upload device image if selected
      if (deviceImage && deviceId) {
        const formData = new FormData()
        formData.append('image', deviceImage)
        try {
          await api(`/api/devices/${deviceId}/upload-image`, 'POST', formData)
        } catch (imageError) {
          console.error('Error uploading device image:', imageError)
        }
      }

      const createdDevice = {
        id: deviceId || Date.now(),
        ...payload,
        status: 'offline',
        dateAdded: new Date().toISOString(),
        lastSeen: 'Never',
      }

      onAddDevice(createdDevice)
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      if (onSuccess) onSuccess()

      onClose()
  
      // Reset form
      setDeviceData({
        name: '',
        type: '',
        category: 'field',
        location: '',
        teamLeader: '',
        operator: '',
        serialNumber: '',
        model: '',
        manufacturer: '',
        ipAddress: '',
        macAddress: '',
        specifications: {
          resolution: '',
          storage: '',
          battery: null,
          connectivity: []
        },
        certifications: {
          pacp: false,
          lacp: false,
          other: ''
        },
        settings: {
          aiEnabled: true,
          autoUpload: true,
          qualityThreshold: [80],
          confidenceThreshold: [85]
        }
      })
      setDeviceImage(null)
      setImagePreview(null)
      setCurrentStep(1)
    } catch (error) {
      console.error('Error adding device:', error)
      showAlert(error?.message || 'Failed to create device', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }
  const toggleConnectivity = (option) => {
    const current = deviceData.specifications.connectivity
    const updated = current.includes(option)
      ? current.filter(c => c !== option)
      : [...current, option]
    
    handleInputChange('specifications.connectivity', updated)
  }

  const selectedDeviceType = deviceTypes[deviceData.category]?.find(type => type.id === deviceData.type)
  const Icon = selectedDeviceType?.icon || Settings
  const progress = (currentStep / 5) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add New Device</DialogTitle>
              <DialogDescription>
                Register device in SewerVision.ai system
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 pb-4 border-b">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of 5</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Form Content */}
        <div className="py-4">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                
                {/* Device Category */}
                <div className="space-y-3 mb-6">
                  <Label>Device Category</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer transition-colors ${
                        deviceData.category === 'field' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => {
                        handleInputChange('category', 'field')
                        handleInputChange('type', '')
                        handleInputChange('teamLeader', '')
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <Truck className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                        <div className="text-sm font-medium">Field Equipment</div>
                        <div className="text-xs text-muted-foreground">Inspection cameras, tablets, trucks</div>
                      </CardContent>
                    </Card>
                    <Card 
                      className={`cursor-pointer transition-colors ${
                        deviceData.category === 'cloud' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => {
                        handleInputChange('category', 'cloud')
                        handleInputChange('type', '')
                        handleInputChange('teamLeader', '')
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <Cloud className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                        <div className="text-sm font-medium">Cloud Infrastructure</div>
                        <div className="text-xs text-muted-foreground">AI servers, storage, workstations</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Device Type */}
                <div className="space-y-3 mb-6">
                  <Label>Device Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {deviceTypes[deviceData.category]?.map((type) => {
                      const TypeIcon = type.icon
                      return (
                        <Card
                          key={type.id}
                          className={`cursor-pointer transition-colors ${
                            deviceData.type === type.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => handleInputChange('type', type.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <TypeIcon className="w-5 h-5 text-gray-600" />
                              <div>
                                <div className="text-sm font-medium">{type.name}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  {errors.type && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.type}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Device Name */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="name">Device Name</Label>
                  <Input
                    id="name"
                    value={deviceData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter device name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="location"
                      value={deviceData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                      placeholder="Enter location"
                    />
                  </div>
                  {errors.location && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.location}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Team Leader (Field devices only) – team lead assigns device to QC/operators */}
                {deviceData.category === 'field' && (
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="teamLeader">Assigned Team Leader</Label>
                    <div className="flex items-center relative w-full">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                      <Select
                        value={deviceData.teamLeader}
                        onValueChange={(value) => handleInputChange('teamLeader', value)}
                      >
                        <SelectTrigger
                          id="teamLeader"
                          className={`pl-10 w-full ${errors.teamLeader ? 'border-red-500' : ''}`}
                        >
                          <SelectValue placeholder="Select a team leader" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamLeaders.length > 0 ? (
                            teamLeaders.map((tl) => (
                              <SelectItem key={tl._id} value={tl._id}>
                                {tl.first_name && tl.last_name
                                  ? `${tl.first_name} ${tl.last_name}`.trim()
                                  : tl.username || 'Unnamed Team Leader'}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="no-team-leaders">
                              No team leaders available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.teamLeader && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.teamLeader}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Technical Specifications */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Technical Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={deviceData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    placeholder="Enter serial number"
                    className={errors.serialNumber ? 'border-red-500' : ''}
                  />
                  {errors.serialNumber && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.serialNumber}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={deviceData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Enter model"
                    className={errors.model ? 'border-red-500' : ''}
                  />
                  {errors.model && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.model}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={deviceData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="Enter manufacturer"
                    className={errors.manufacturer ? 'border-red-500' : ''}
                  />
                  {errors.manufacturer && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.manufacturer}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="macAddress">MAC Address</Label>
                  <Input
                    id="macAddress"
                    value={deviceData.macAddress}
                    onChange={(e) => handleInputChange('macAddress', e.target.value)}
                    placeholder="Enter MAC address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Select value={deviceData.specifications.resolution} onValueChange={(value) => handleInputChange('specifications.resolution', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p HD</SelectItem>
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="4K">4K Ultra HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage">Storage Capacity</Label>
                  <Select
                    value={deviceData.specifications.storage || ''}
                    onValueChange={(v) => handleInputChange('specifications.storage', v)}
                  >
                    <SelectTrigger id="storage">
                      <SelectValue placeholder="Select storage capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="32GB">32 GB</SelectItem>
                      <SelectItem value="64GB">64 GB</SelectItem>
                      <SelectItem value="128GB">128 GB</SelectItem>
                      <SelectItem value="256GB">256 GB</SelectItem>
                      <SelectItem value="512GB">512 GB</SelectItem>
                      <SelectItem value="1TB">1 TB</SelectItem>
                      <SelectItem value="2TB">2 TB</SelectItem>
                      <SelectItem value="4TB">4 TB</SelectItem>
                      <SelectItem value="8TB">8 TB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {deviceData.category === 'field' && (
                <div className="space-y-2">
                  <Label htmlFor="battery">Battery Life (hours)</Label>
                  <Input
                    id="battery"
                    type="number"
                    min={0}
                    max={72}
                    step={0.5}
                    value={deviceData.specifications.battery ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleInputChange('specifications.battery', v === '' ? null : Number(v));
                    }}
                    placeholder="e.g. 8"
                  />
                  <p className="text-xs text-muted-foreground">Expected runtime in hours</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Connectivity & Network */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Connectivity & Network</h3>
              
              {deviceData.category === 'cloud' && (
                <div className="space-y-2 mb-6">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    value={deviceData.ipAddress}
                    onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                    placeholder="Enter IP address"
                    className={errors.ipAddress ? 'border-red-500' : ''}
                  />
                  {errors.ipAddress && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.ipAddress}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <div className="space-y-3 mb-6">
                <Label>Connectivity Options</Label>
                <div className="grid grid-cols-2 gap-3">
                  {connectivityOptions.map((option) => {
                    const OptionIcon = option.icon
                    const isSelected = deviceData.specifications.connectivity.includes(option.id)
                    return (
                      <Card
                        key={option.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => toggleConnectivity(option.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-2">
                            <OptionIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium">{option.name}</span>
                            {isSelected && <CheckCircle className="w-4 h-4 text-blue-500 ml-auto" />}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {deviceData.category === 'field' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pacp"
                        checked={deviceData.certifications.pacp}
                        onCheckedChange={(checked) => handleInputChange('certifications.pacp', checked)}
                      />
                      <Label htmlFor="pacp" className="text-sm">PACP Certified</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lacp"
                        checked={deviceData.certifications.lacp}
                        onCheckedChange={(checked) => handleInputChange('certifications.lacp', checked)}
                      />
                      <Label htmlFor="lacp" className="text-sm">LACP Certified</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otherCert">Other Certifications</Label>
                      <Input
                        id="otherCert"
                        value={deviceData.certifications.other}
                        onChange={(e) => handleInputChange('certifications.other', e.target.value)}
                        placeholder="Other certifications"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Device Image */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Device Image</h3>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img 
                            src={imagePreview} 
                            alt="Device preview" 
                            className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setDeviceImage(null)
                              setImagePreview(null)
                            }}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-64 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No image selected</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="device-image">Upload Device Image (Optional)</Label>
                      <Input
                        id="device-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      {errors.image && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{errors.image}</AlertDescription>
                        </Alert>
                      )}
                      <p className="text-xs text-gray-500">
                        Recommended: Square image, max 10MB, JPG or PNG format
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: AI Settings */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">AI & Quality Settings</h3>
              
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="aiEnabled">Enable AI Processing</Label>
                      <p className="text-sm text-muted-foreground">Automatically process inspection data with AI</p>
                    </div>
                    <Switch
                      id="aiEnabled"
                      checked={deviceData.settings.aiEnabled}
                      onCheckedChange={(checked) => handleInputChange('settings.aiEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autoUpload">Auto Upload</Label>
                      <p className="text-sm text-muted-foreground">Automatically upload footage to cloud</p>
                    </div>
                    <Switch
                      id="autoUpload"
                      checked={deviceData.settings.autoUpload}
                      onCheckedChange={(checked) => handleInputChange('settings.autoUpload', checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Quality Threshold</Label>
                      <Badge variant="outline">{deviceData.settings.qualityThreshold[0]}%</Badge>
                    </div>
                    <Slider
                      value={deviceData.settings.qualityThreshold}
                      onValueChange={(value) => handleInputChange('settings.qualityThreshold', value)}
                      max={100}
                      min={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Lower Quality</span>
                      <span>Higher Quality</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>AI Confidence Threshold</Label>
                      <Badge variant="outline">{deviceData.settings.confidenceThreshold[0]}%</Badge>
                    </div>
                    <Slider
                      value={deviceData.settings.confidenceThreshold}
                      onValueChange={(value) => handleInputChange('settings.confidenceThreshold', value)}
                      max={100}
                      min={60}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>More Detections</span>
                      <span>Higher Accuracy</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Device Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Name:</span> {deviceData.name}</div>
                    <div><span className="font-medium">Type:</span> {selectedDeviceType?.name}</div>
                    <div><span className="font-medium">Location:</span> {deviceData.location}</div>
                    {deviceData.teamLeader && (
                      <div>
                        <span className="font-medium">Team Leader:</span>{' '}
                        {teamLeaders.find((tl) => tl._id === deviceData.teamLeader)
                          ? `${teamLeaders.find((tl) => tl._id === deviceData.teamLeader)?.first_name || ''} ${teamLeaders.find((tl) => tl._id === deviceData.teamLeader)?.last_name || ''}`.trim() || 'Unknown'
                          : 'Unknown'}
                      </div>
                    )}
                    <div><span className="font-medium">AI Enabled:</span> {deviceData.settings.aiEnabled ? 'Yes' : 'No'}</div>
                    <div><span className="font-medium">Auto Upload:</span> {deviceData.settings.autoUpload ? 'Yes' : 'No'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < 5 ? (
              <Button 
                onClick={handleNext}
                variant='rose'
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Adding Device...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Device
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddDeviceModal