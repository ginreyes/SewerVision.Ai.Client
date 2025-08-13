import React, { useState } from 'react'
import {
  Settings,
  Wifi,
  Battery,
  Camera,
  Brain,
  AlertTriangle,
  Save,
  RotateCcw,
  Trash2,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

const DeviceSettingsModal = ({ isOpen, onClose, device }) => {
  const [settings, setSettings] = useState({
    // General Settings
    deviceName: device?.name || '',
    location: device?.location || '',
    operator: device?.operator || '',
    
    // Network Settings
    wifiEnabled: true,
    wifiSSID: 'SewerVision-Field',
    wifiPassword: '********',
    cellularEnabled: device?.type !== 'workstation',
    ipAddress: device?.ipAddress || '192.168.1.100',
    subnet: '255.255.255.0',
    gateway: '192.168.1.1',
    
    // Recording Settings
    videoQuality: device?.specifications?.resolution || '1080p',
    frameRate: 30,
    compressionLevel: 'medium',
    autoRecord: true,
    maxRecordingDuration: 120, 
    storageThreshold: [85],
    
    // AI Settings
    aiEnabled: device?.settings?.aiEnabled ?? true,
    autoUpload: device?.settings?.autoUpload ?? true,
    aiConfidenceThreshold: device?.settings?.confidenceThreshold ? [device.settings.confidenceThreshold] : [85],
    realTimeProcessing: false,
    defectCategories: {
      cracks: true,
      roots: true,
      joints: true,
      fractures: true,
      blockages: true
    },
    
    // Power Management
    batteryOptimization: true,
    sleepMode: true,
    sleepTimeout: 15, // minutes
    lowBatteryAlert: [20], // percentage
    autoShutdown: [10], // percentage
    
    // Security Settings
    deviceLocked: false,
    pinCode: '',
    encryptStorage: true,
    secureTransmission: true,
    
    // Notifications
    statusNotifications: true,
    errorAlerts: true,
    completionNotifications: true,
    maintenanceReminders: true,
    
    // Maintenance
    calibrationDate: device?.calibrationDate || '2024-06-15',
    nextMaintenance: device?.nextMaintenance || '2024-12-15',
    operatingHours: device?.operatingHours || 1247,
    
    // Advanced
    debugMode: false,
    verboseLogging: false,
    firmwareVersion: device?.firmwareVersion || '2.4.1',
    autoUpdate: true
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  const handleNestedChange = (parent, key, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    console.log('Saving device settings:', settings)
    setHasChanges(false)
    onClose()
  }

  const handleReset = () => {
    // Reset to default/original values
    setSettings({
      // ... reset to defaults
    })
    setHasChanges(false)
    setShowResetDialog(false)
  }

  const getDeviceTypeSettings = () => {
    if (!device) return null

    const isFieldDevice = ['inspection-camera', 'tablet', 'console', 'scanner'].includes(device.type)
    const isCloudDevice = ['ai-server', 'storage', 'workstation'].includes(device.type)

    return { isFieldDevice, isCloudDevice }
  }

  const { isFieldDevice, isCloudDevice } = getDeviceTypeSettings() || { isFieldDevice: true, isCloudDevice: false }

  if (!device) return null

  const StatusIndicator = ({ label, status, description }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="font-medium text-sm">{label}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'online' || status === 'good' ? 'bg-green-500' :
          status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="text-xs capitalize">{status}</span>
      </div>
    </div>
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${device.color}`}>
                <device.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle>Device Settings</DialogTitle>
                <DialogDescription>
                  Configure settings for {device.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              {isFieldDevice && <TabsTrigger value="recording">Recording</TabsTrigger>}
              <TabsTrigger value="ai">AI & Processing</TabsTrigger>
              {isFieldDevice && <TabsTrigger value="power">Power</TabsTrigger>}
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>Device Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceName">Device Name</Label>
                      <Input
                        id="deviceName"
                        value={settings.deviceName}
                        onChange={(e) => handleSettingChange('deviceName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={settings.location}
                        onChange={(e) => handleSettingChange('location', e.target.value)}
                      />
                    </div>
                  </div>

                  {isFieldDevice && (
                    <div className="space-y-2">
                      <Label htmlFor="operator">Assigned Operator</Label>
                      <Input
                        id="operator"
                        value={settings.operator}
                        onChange={(e) => handleSettingChange('operator', e.target.value)}
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Device Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <StatusIndicator 
                        label="Connection" 
                        status={device.status === 'online' ? 'online' : 'offline'}
                        description="Network connectivity"
                      />
                      {isFieldDevice && (
                        <StatusIndicator 
                          label="Battery" 
                          status={device.battery > 30 ? 'good' : device.battery > 15 ? 'warning' : 'critical'}
                          description={`${device.battery}% remaining`}
                        />
                      )}
                      <StatusIndicator 
                        label="AI Processing" 
                        status={device.aiProcessing === 'completed' ? 'good' : 'processing'}
                        description="Analysis engine status"
                      />
                      <StatusIndicator 
                        label="Storage" 
                        status="good"
                        description="Available space: 2.1TB"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Settings */}
            <TabsContent value="network" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wifi className="w-5 h-5" />
                    <span>Network Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Wi-Fi Enabled</Label>
                      <p className="text-sm text-gray-500">Connect to wireless networks</p>
                    </div>
                    <Switch
                      checked={settings.wifiEnabled}
                      onCheckedChange={(checked) => handleSettingChange('wifiEnabled', checked)}
                    />
                  </div>

                  {settings.wifiEnabled && (
                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-blue-100">
                      <div className="space-y-2">
                        <Label>Network SSID</Label>
                        <Input
                          value={settings.wifiSSID}
                          onChange={(e) => handleSettingChange('wifiSSID', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={settings.wifiPassword}
                          onChange={(e) => handleSettingChange('wifiPassword', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {isFieldDevice && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Cellular Backup</Label>
                        <p className="text-sm text-gray-500">Use cellular when Wi-Fi unavailable</p>
                      </div>
                      <Switch
                        checked={settings.cellularEnabled}
                        onCheckedChange={(checked) => handleSettingChange('cellularEnabled', checked)}
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">IP Configuration</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>IP Address</Label>
                        <Input
                          value={settings.ipAddress}
                          onChange={(e) => handleSettingChange('ipAddress', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subnet Mask</Label>
                        <Input
                          value={settings.subnet}
                          onChange={(e) => handleSettingChange('subnet', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gateway</Label>
                        <Input
                          value={settings.gateway}
                          onChange={(e) => handleSettingChange('gateway', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recording Settings (Field devices only) */}
            {isFieldDevice && (
              <TabsContent value="recording" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Camera className="w-5 h-5" />
                      <span>Recording Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Video Quality</Label>
                        <Select value={settings.videoQuality} onValueChange={(value) => handleSettingChange('videoQuality', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="720p">720p HD</SelectItem>
                            <SelectItem value="1080p">1080p Full HD</SelectItem>
                            <SelectItem value="4K">4K Ultra HD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Frame Rate</Label>
                        <Select value={settings.frameRate.toString()} onValueChange={(value) => handleSettingChange('frameRate', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">24 fps</SelectItem>
                            <SelectItem value="30">30 fps</SelectItem>
                            <SelectItem value="60">60 fps</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Storage Alert Threshold: {settings.storageThreshold[0]}%</Label>
                      <Slider
                        value={settings.storageThreshold}
                        onValueChange={(value) => handleSettingChange('storageThreshold', value)}
                        max={95}
                        min={50}
                        step={5}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>50%</span>
                        <span>95%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Recording</Label>
                        <p className="text-sm text-gray-500">Start recording automatically</p>
                      </div>
                      <Switch
                        checked={settings.autoRecord}
                        onCheckedChange={(checked) => handleSettingChange('autoRecord', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* AI Settings */}
            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI & Processing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Processing Enabled</Label>
                      <p className="text-sm text-gray-500">Enable automatic defect detection</p>
                    </div>
                    <Switch
                      checked={settings.aiEnabled}
                      onCheckedChange={(checked) => handleSettingChange('aiEnabled', checked)}
                    />
                  </div>

                  {settings.aiEnabled && (
                    <div className="space-y-4 pl-4 border-l-2 border-purple-100">
                      <div className="space-y-3">
                        <Label>Confidence Threshold: {settings.aiConfidenceThreshold[0]}%</Label>
                        <Slider
                          value={settings.aiConfidenceThreshold}
                          onValueChange={(value) => handleSettingChange('aiConfidenceThreshold', value)}
                          max={100}
                          min={60}
                          step={1}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>More Detections</span>
                          <span>Higher Accuracy</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Upload</Label>
                          <p className="text-sm text-gray-500">Upload footage automatically</p>
                        </div>
                        <Switch
                          checked={settings.autoUpload}
                          onCheckedChange={(checked) => handleSettingChange('autoUpload', checked)}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Detection Categories</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(settings.defectCategories).map(([category, enabled]) => (
                            <div key={category} className="flex items-center space-x-2">
                              <Switch
                                checked={enabled}
                                onCheckedChange={(checked) => handleNestedChange('defectCategories', category, checked)}
                              />
                              <Label className="capitalize">{category}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Power Settings (Field devices only) */}
            {isFieldDevice && (
              <TabsContent value="power" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Battery className="w-5 h-5" />
                      <span>Power Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Battery Optimization</Label>
                        <p className="text-sm text-gray-500">Extend battery life</p>
                      </div>
                      <Switch
                        checked={settings.batteryOptimization}
                        onCheckedChange={(checked) => handleSettingChange('batteryOptimization', checked)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Low Battery Alert: {settings.lowBatteryAlert[0]}%</Label>
                      <Slider
                        value={settings.lowBatteryAlert}
                        onValueChange={(value) => handleSettingChange('lowBatteryAlert', value)}
                        max={50}
                        min={10}
                        step={5}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Auto Shutdown: {settings.autoShutdown[0]}%</Label>
                      <Slider
                        value={settings.autoShutdown}
                        onValueChange={(value) => handleSettingChange('autoShutdown', value)}
                        max={20}
                        min={5}
                        step={1}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sleep Mode</Label>
                        <p className="text-sm text-gray-500">Enter sleep when inactive</p>
                      </div>
                      <Switch
                        checked={settings.sleepMode}
                        onCheckedChange={(checked) => handleSettingChange('sleepMode', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Advanced Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Advanced settings can affect device performance. Change with caution.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Debug Mode</Label>
                        <p className="text-sm text-gray-500">Enable detailed logging</p>
                      </div>
                      <Switch
                        checked={settings.debugMode}
                        onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Updates</Label>
                        <p className="text-sm text-gray-500">Install firmware updates automatically</p>
                      </div>
                      <Switch
                        checked={settings.autoUpdate}
                        onCheckedChange={(checked) => handleSettingChange('autoUpdate', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Firmware Version</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{settings.firmwareVersion}</span>
                        <Button variant="outline" size="sm">Check for Updates</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Operating Hours</Label>
                      <div className="text-sm text-gray-600">{settings.operatingHours} hours</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-red-600">Danger Zone</Label>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowResetDialog(true)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Settings
                      </Button>
                      <Button 
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Factory Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Device Settings</DialogTitle>
            <DialogDescription>
              This will reset all settings to their default values. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeviceSettingsModal