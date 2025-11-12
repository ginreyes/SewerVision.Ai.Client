'use client'

import React, { useState } from 'react'

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const SettingsPage = () => {
  const [confidenceThreshold, setConfidenceThreshold] = useState([75])
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [streamQuality, setStreamQuality] = useState('high')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [feedbackLoopEnabled, setFeedbackLoopEnabled] = useState(true)
  const [selectedModels, setSelectedModels] = useState({
    fractures: true,
    cracks: true,
    brokenPipes: true,
    roots: true,
  })

  // NEW: User Management State
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice Chen', email: 'alice@sewervision.ai', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Bob Rivera', email: 'bob@sewervision.ai', role: 'QC Technician', status: 'Active' },
    { id: 3, name: 'Carol Kim', email: 'carol@sewervision.ai', role: 'customer', status: 'Disabled' },
  ])

  // NEW: Model Weights State
  const [modelVersion, setModelVersion] = useState('v2.1.4')
  const [uploadedModel, setUploadedModel] = useState(null)

  // NEW: AWS Credentials State
  const [awsConfig, setAwsConfig] = useState({
    bucket: 'sewervision-prod-videos',
    region: 'us-east-1',
    accessKey: 'AKIA************',
    secretKey: '••••••••••••••••••••••••••••••••••••••••',
    showSecret: false,
  })

  // NEW: Logs & Monitoring
  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2025-04-04 10:22:01', level: 'INFO', message: 'AI model v2.1.4 loaded successfully' },
    { id: 2, timestamp: '2025-04-04 09:45:33', level: 'WARN', message: 'High latency detected in stream segment #8812' },
    { id: 3, timestamp: '2025-04-04 08:30:12', level: 'ERROR', message: 'Failed to upload video segment #7709 – retrying...' },
  ])

  const handleModelToggle = (key) => {
    setSelectedModels((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const saveSettings = (section) => {
    console.log(`${section} settings saved`)
    // Here you would typically call your API
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedModel(file)
      alert(`Model file "${file.name}" selected. Click Save to deploy.`)
    }
  }

  const toggleSecretKey = () => {
    setAwsConfig(prev => ({
      ...prev,
      showSecret: !prev.showSecret
    }))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="ai-models" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 lg:grid-cols-7 gap-1 mb-8">
              <TabsTrigger value="ai-models">AI Models</TabsTrigger>
              <TabsTrigger value="cloud-streaming">Cloud & Streaming</TabsTrigger>
              <TabsTrigger value="qc-workflow">QC Workflow</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="feedback-loop">AI Learning</TabsTrigger>
              <TabsTrigger value="manage-users">Manage Users</TabsTrigger>
              <TabsTrigger value="system-admin">System Admin</TabsTrigger>
            </TabsList>

            {/* ===== AI Models Tab ===== */}
            <TabsContent value="ai-models">
              <Card>
                <CardHeader>
                  <CardTitle>AI Detection Models</CardTitle>
                  <CardDescription>
                    Configure which defects AI should detect and adjust sensitivity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {Object.entries(selectedModels).map(([key, enabled]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => handleModelToggle(key)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Confidence Threshold: {confidenceThreshold[0]}%
                    </Label>
                    <Slider
                      value={confidenceThreshold}
                      onValueChange={setConfidenceThreshold}
                      min={50}
                      max={99}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower = more detections (higher false positives), Higher = fewer but more certain.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings('AI Models')}>
                    Save AI Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ===== Cloud & Streaming Tab ===== */}
            <TabsContent value="cloud-streaming">
              <Card>
                <CardHeader>
                  <CardTitle>Cloud & Video Streaming</CardTitle>
                  <CardDescription>
                    Configure upload, storage, and streaming preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Default Stream Quality</Label>
                    <Select value={streamQuality} onValueChange={setStreamQuality}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Faster, Less Data)</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High (Best Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Auto-Save Processed Data</Label>
                    <Switch
                      checked={autoSaveEnabled}
                      onCheckedChange={setAutoSaveEnabled}
                    />
                  </div>

                  <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                    <strong>Note:</strong> All inspection videos are automatically uploaded to SewerVision.ai
                    Cloud upon capture for real-time access.
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings('Cloud & Streaming')}>
                    Save Streaming Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ===== QC Workflow Tab ===== */}
            <TabsContent value="qc-workflow">
              <Card>
                <CardHeader>
                  <CardTitle>QC Technician Workflow</CardTitle>
                  <CardDescription>
                    Configure review and annotation workflow for PACP/LACP Certified Staff.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Default Review Priority</Label>
                    <Select defaultValue="high-confidence">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-confidence">High Confidence First</SelectItem>
                        <SelectItem value="low-confidence">Low Confidence First</SelectItem>
                        <SelectItem value="chronological">Chronological</SelectItem>
                        <SelectItem value="by-segment">By Pipe Segment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Annotation Tools Enabled</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Add Defect Tags', defaultChecked: true },
                        { label: 'Add Measurements', defaultChecked: true },
                        { label: 'Add Severity Ratings', defaultChecked: true },
                        { label: 'Add Repair Recommendations', defaultChecked: true },
                      ].map((tool, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Switch id={`tool-${i}`} defaultChecked={tool.defaultChecked} />
                          <Label htmlFor={`tool-${i}`}>{tool.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Auto-Assign QC Reviewer</Label>
                    <Select defaultValue="round-robin">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="least-loaded">Least Loaded</SelectItem>
                        <SelectItem value="by-expertise">By Expertise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings('QC Workflow')}>
                    Save QC Workflow Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ===== Notifications Tab ===== */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Customer & Admin Notifications</CardTitle>
                  <CardDescription>
                    Configure when and how notifications are sent.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label>Notify Customer When PACP Deliverables Ready</Label>
                    <Switch
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Channels</Label>
                    <div className="space-y-2">
                      {[
                        { label: 'Email', defaultChecked: true },
                        { label: 'SMS', defaultChecked: false },
                        { label: 'In-App Notification', defaultChecked: true },
                      ].map((channel, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Switch id={`channel-${i}`} defaultChecked={channel.defaultChecked} />
                          <Label htmlFor={`channel-${i}`}>{channel.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Alerts</Label>
                    <div className="space-y-2">
                      {[
                        { label: 'AI Processing Errors', defaultChecked: true },
                        { label: 'QC Review Backlog > 24hrs', defaultChecked: true },
                        { label: 'Storage Usage > 80%', defaultChecked: false },
                      ].map((alert, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Switch id={`alert-${i}`} defaultChecked={alert.defaultChecked} />
                          <Label htmlFor={`alert-${i}`}>{alert.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings('Notifications')}>
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ===== Feedback Loop Tab ===== */}
            <TabsContent value="feedback-loop">
              <Card>
                <CardHeader>
                  <CardTitle>AI Learning & Feedback Loop</CardTitle>
                  <CardDescription>
                    Configure how QC annotations improve AI models.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label>Enable Continuous AI Learning</Label>
                    <Switch
                      checked={feedbackLoopEnabled}
                      onCheckedChange={setFeedbackLoopEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Training Data Frequency</Label>
                    <Select defaultValue="per-project">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per-project">After Every Project</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="manual">Manually Triggered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Minimum Annotations per Defect Type</Label>
                    <Input type="number" defaultValue="50" className="w-32" />
                    <p className="text-xs text-muted-foreground">
                      Minimum QC-reviewed annotations required before model retraining.
                    </p>
                  </div>

                  <div className="rounded-md bg-green-50 p-4 text-sm space-y-1 text-green-800">
                    <h4 className="font-medium">Current AI Performance Metrics</h4>
                    <ul className="list-disc list-inside">
                      <li>Accuracy: 92.4%</li>
                      <li>False Positive Rate: 6.1%</li>
                      <li>Last Model Update: 2 days ago</li>
                      <li>Next Training Scheduled: Tomorrow</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => saveSettings('AI Learning')}>
                    Save Feedback Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ===== Manage Users Tab ===== */}
            <TabsContent value="manage-users">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Users</CardTitle>
                  <CardDescription>
                    Add, edit, or disable user accounts and permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <Button variant="outline" size="sm">+ Invite User</Button>
                    <Button variant="outline" size="sm">Export CSV</Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600">Remove</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <Button>Save User Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* ===== System Admin Tab ===== */}
            <TabsContent value="system-admin">
              <div className="space-y-6">

                {/* Model Weights Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Update AI Model Weights</CardTitle>
                    <CardDescription>
                      Upload and deploy new trained model versions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Current Model Version</Label>
                      <div className="mt-1 p-2 bg-muted rounded-md font-mono">
                        {modelVersion}
                      </div>
                    </div>

                    <div>
                      <Label>Upload New Model (.pt, .onnx, .bin)</Label>
                      <Input type="file" accept=".pt,.onnx,.bin" onChange={handleFileUpload} />
                      {uploadedModel && (
                        <p className="text-sm text-green-600 mt-1">
                          Selected: {uploadedModel.name} ({(uploadedModel.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                      ⚠️ Deploying a new model will restart inference services. Schedule during maintenance window.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled={!uploadedModel}>Deploy New Model</Button>
                  </CardFooter>
                </Card>

                <Separator />

                {/* AWS Credentials Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>AWS Storage Configuration</CardTitle>
                    <CardDescription>
                      Configure S3 bucket and credentials for video storage.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>S3 Bucket Name</Label>
                        <Input
                          value={awsConfig.bucket}
                          onChange={(e) => setAwsConfig(prev => ({ ...prev, bucket: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>AWS Region</Label>
                        <Select
                          value={awsConfig.region}
                          onValueChange={(value) => setAwsConfig(prev => ({ ...prev, region: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us-east-1">us-east-1 (N. Virginia)</SelectItem>
                            <SelectItem value="us-west-2">us-west-2 (Oregon)</SelectItem>
                            <SelectItem value="eu-west-1">eu-west-1 (Ireland)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>AWS Access Key ID</Label>
                      <Input
                        value={awsConfig.accessKey}
                        onChange={(e) => setAwsConfig(prev => ({ ...prev, accessKey: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>AWS Secret Access Key</Label>
                      <div className="flex">
                        <Input
                          type={awsConfig.showSecret ? "text" : "password"}
                          value={awsConfig.secretKey}
                          onChange={(e) => setAwsConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={toggleSecretKey}
                          className="ml-2"
                        >
                          {awsConfig.showSecret ? '🙈' : '👁️'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save AWS Configuration</Button>
                  </CardFooter>
                </Card>

                <Separator />

                {/* Logs & Monitoring Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Logs & Monitoring</CardTitle>
                    <CardDescription>
                      View recent system events, errors, and performance metrics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Refresh</Button>
                        <Button variant="outline" size="sm">Export Logs</Button>
                      </div>
                      <Select defaultValue="24h">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">Last Hour</SelectItem>
                          <SelectItem value="24h">Last 24 Hours</SelectItem>
                          <SelectItem value="7d">Last 7 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  log.level === 'ERROR'
                                    ? 'bg-red-100 text-red-800'
                                    : log.level === 'WARN'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {log.level}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">{log.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <h4 className="font-medium mb-2">System Health</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">CPU Usage</div>
                          <div className="font-bold">42%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Memory</div>
                          <div className="font-bold">6.2 GB / 16 GB</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Storage</div>
                          <div className="font-bold">1.2 TB / 5 TB</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Uptime</div>
                          <div className="font-bold">14 days</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage