"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Download,
  Trash2,
  Search,
  Brain,
  AlertTriangle,
  CheckCircle,
  FileVideo,
  Archive,
  HardDrive,
  Server,
  Activity,
  RefreshCw,
  CloudUpload,
  FolderOpen,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import uploadsApi from "@/data/uploadsApi";
import { FileCard } from "./components/FileCard";
import { getFileTypeIcon, getStatusColor } from "@/lib/utils";
import BulkUploadModal from "./components/BulkUploadModal";
import { useAlert } from "@/components/providers/AlertProvider";

const AdminUploads = () => {
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const fileInputRef = useRef(null);
  const [uploads, setUploads] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalStorage: "0 GB",
    usedStorage: "0 GB",
    storageUsage: 0,
    totalFiles: 0,
    monthlyUploads: 0,
    activeUploads: 0,
    failedUploads: 0,
    videoFiles: 0,
    documentFiles: 0,
    archiveFiles: 0,
    otherFiles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [monitoringData, setMonitoringData] = useState({
    activeUploads: [],
    processingQueue: [],
    errors: [],
  });

  const [uploadSettings, setUploadSettings] = useState({
    maxFileSize: "5gb",
    concurrentUploads: "10",
    autoAiProcessing: true,
    autoBackup: true,
    fileEncryption: true,
    virusScanning: true,
    accessLogging: true,
    publicAccess: false,
    notifyCompletion: true,
    notifyStorage: true,
    notifyFailed: true,
    notifyMaintenance: true,
    retentionVideo: "2years",
    retentionDocs: "5years",
    retentionBackup: "6months"
  });

  const handleFetchUploads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await uploadsApi.getAllUploads({
        status: filterStatus !== "all" ? filterStatus : undefined,
        type: filterType !== "all" ? filterType : undefined,
        search: searchQuery || undefined,
      });
      setUploads(data.uploads || []);
    } catch (error) {
      console.error(`Fetching Upload Error: ${error.message}`);
      showAlert('Failed to fetch uploads', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, searchQuery, showAlert]);

  const fetchSystemStats = useCallback(async () => {
    try {
      // Fetch base stats
      const result = await uploadsApi.getSystemStats();

      // Fetch real-time active/processing counts to ensure accuracy
      const activeData = await uploadsApi.getAllUploads({ status: 'uploading', limit: 1 });
      const processingData = await uploadsApi.getAllUploads({ status: 'processing', limit: 1 });
      // Also check for 'in_progress' or 'pending' for AI
      const pendingData = await uploadsApi.getAllUploads({ status: 'pending', limit: 1 });

      const realTimeActive = activeData.total || 0;
      const realTimeProcessing = (processingData.total || 0) + (pendingData.total || 0);

      setSystemStats(prev => ({
        ...(result || {
          totalStorage: "0 GB",
          usedStorage: "0 GB",
          storageUsage: 0,
          totalFiles: 0,
          monthlyUploads: 0,
          failedUploads: 0,
          videoFiles: 0,
          documentFiles: 0,
          archiveFiles: 0,
          otherFiles: 0,
        }),
        activeUploads: realTimeActive, // Override with real-time count
        aiProcessing: realTimeProcessing // Add specific AI processing stat
      }));
    } catch (error) {
      console.error(`Fetching stats Error: ${error.message}`);
      // Don't show alert here to avoid spamming if background refresh fails
    }
  }, []);

  const fetchMonitoringData = useCallback(async () => {
    try {
      const data = await uploadsApi.getAllUploads({
        status: 'uploading',
        limit: 10,
      });

      const processingData = await uploadsApi.getAllUploads({
        status: 'processing',
        limit: 10,
      });

      const failedData = await uploadsApi.getAllUploads({
        status: 'failed',
        limit: 5,
      });

      setMonitoringData({
        activeUploads: data.uploads || [],
        processingQueue: processingData.uploads || [],
        errors: failedData.uploads || [],
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app: await uploadsApi.updateSettings(uploadSettings);
      showAlert('Settings saved successfully', 'success');
    } catch (error) {
      showAlert('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
    handleFetchUploads();
    if (activeTab === 'monitoring') {
      fetchMonitoringData();
      const interval = setInterval(fetchMonitoringData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [fetchSystemStats, handleFetchUploads, activeTab, fetchMonitoringData]);

  useEffect(() => {
    handleFetchUploads();
  }, [handleFetchUploads]);

  // Auto-refresh when there are videos in AI processing
  useEffect(() => {
    const hasProcessingVideos = uploads.some(
      upload => upload.type === 'video' &&
        (upload.aiStatus === 'pending' || upload.processingStatus === 'in_progress' || upload.status === 'processing')
    );

    if (!hasProcessingVideos) return; // Don't poll if nothing is processing

    const interval = setInterval(() => {
      handleFetchUploads();
      fetchSystemStats();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [uploads, handleFetchUploads, fetchSystemStats]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredUploads = uploads.filter((upload) => {
    const matchesSearch =
      upload.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      upload.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      upload.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || upload.status === filterStatus;
    const matchesType = filterType === "all" || upload.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleFileSelect = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredUploads.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredUploads.map((upload) => upload._id || upload.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedFiles.length === 0) {
      showAlert('Please select files to perform action', 'error');
      return;
    }

    try {
      await uploadsApi.bulkAction(action, selectedFiles);
      showAlert(`Successfully ${action}ed ${selectedFiles.length} file(s)`, 'success');
      setSelectedFiles([]);
      setShowBulkActions(false);
      handleFetchUploads();
    } catch (error) {
      console.error('Bulk action error:', error);
      showAlert(`Failed to ${action} files: ${error.message}`, 'error');
    }
  };

  const handleUploadComplete = () => {
    handleFetchUploads();
    fetchSystemStats();
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Upload Management
              </h1>
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 border-red-200"
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => { handleFetchUploads(); fetchSystemStats(); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="gradient" onClick={() => setShowBulkUploadModal(true)}>
                <CloudUpload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-fit grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* AI Processing Status - Prominent Section */}
            {(() => {
              const processingVideos = uploads.filter(
                upload => upload.type === 'video' &&
                  (upload.aiStatus === 'pending' || upload.processingStatus === 'in_progress' || upload.status === 'processing') &&
                  upload.status !== 'failed' &&
                  upload.processingStatus !== 'failed'
              );
              const processedVideos = uploads.filter(
                upload => upload.type === 'video' && upload.aiStatus === 'processed'
              );
              const failedVideos = uploads.filter(
                upload => upload.type === 'video' &&
                  (upload.status === 'failed' || upload.processingStatus === 'failed' || upload.processingError)
              );

              if (processingVideos.length > 0 || processedVideos.length > 0 || failedVideos.length > 0) {
                return (
                  <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Brain className="w-6 h-6 text-purple-600" />
                          <CardTitle className="text-xl">AI Processing Status</CardTitle>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleFetchUploads();
                            fetchSystemStats();
                          }}
                          disabled={loading}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Processing Videos */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin text-purple-600" />
                              Currently Processing ({processingVideos.length})
                            </h3>
                          </div>
                          {processingVideos.length === 0 ? (
                            <p className="text-sm text-gray-500">No videos currently processing</p>
                          ) : (
                            <div className="space-y-3">
                              {processingVideos.slice(0, 5).map((upload) => (
                                <div key={upload._id} className="bg-white rounded-lg p-4 border border-purple-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-gray-900 truncate">
                                        {upload.originalName || upload.filename}
                                      </p>
                                      <div className="flex items-center space-x-3 mt-1">
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                          {upload.processingStatus === 'in_progress' ? 'Processing' :
                                            upload.aiStatus === 'pending' ? 'Pending' : 'Queued'}
                                        </Badge>
                                        {upload.processingStartedAt && (
                                          <span className="text-xs text-gray-500">
                                            Started: {new Date(upload.processingStartedAt).toLocaleTimeString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Brain className="w-5 h-5 text-purple-600 animate-pulse ml-2" />
                                  </div>
                                </div>
                              ))}
                              {processingVideos.length > 5 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{processingVideos.length - 5} more processing...
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Processed Videos */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              Recently Processed ({processedVideos.length})
                            </h3>
                          </div>
                          {processedVideos.length === 0 ? (
                            <p className="text-sm text-gray-500">No videos processed yet</p>
                          ) : (
                            <div className="space-y-3">
                              {processedVideos.slice(0, 5).map((upload) => (
                                <div key={upload._id} className="bg-white rounded-lg p-4 border border-green-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-gray-900 truncate">
                                        {upload.originalName || upload.filename}
                                      </p>
                                      <div className="flex items-center space-x-3 mt-1">
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                          Processed
                                        </Badge>
                                        {upload.defectsFound !== undefined && (
                                          <span className="text-xs text-gray-600">
                                            {upload.defectsFound} defects found
                                          </span>
                                        )}
                                        {upload.confidence !== undefined && (
                                          <span className="text-xs text-gray-600">
                                            {upload.confidence.toFixed(1)}% confidence
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                                  </div>
                                </div>
                              ))}
                              {processedVideos.length > 5 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{processedVideos.length - 5} more processed
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Failed Videos */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                              Failed ({failedVideos.length})
                            </h3>
                          </div>
                          {failedVideos.length === 0 ? (
                            <p className="text-sm text-gray-500">No failed videos</p>
                          ) : (
                            <div className="space-y-3">
                              {failedVideos.slice(0, 5).map((upload) => (
                                <div key={upload._id} className="bg-white rounded-lg p-4 border border-red-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm text-gray-900 truncate">
                                        {upload.originalName || upload.filename}
                                      </p>
                                      <div className="flex items-center space-x-3 mt-1">
                                        <Badge className="bg-red-100 text-red-800 border-red-200">
                                          Failed
                                        </Badge>
                                        {upload.processingError && (
                                          <span className="text-xs text-red-600 truncate" title={upload.processingError}>
                                            {upload.processingError.substring(0, 50)}...
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <AlertTriangle className="w-5 h-5 text-red-600 ml-2" />
                                  </div>
                                </div>
                              ))}
                              {failedVideos.length > 5 && (
                                <p className="text-xs text-gray-500 text-center">
                                  +{failedVideos.length - 5} more failed
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Storage"
                value={systemStats.totalStorage}
                subtitle={`${systemStats.usedStorage} used`}
                icon={HardDrive}
                color="bg-gradient-to-br from-blue-500 to-purple-600"
              />
              <StatCard
                title="Total Files"
                value={systemStats.totalFiles}
                subtitle={`+${systemStats.monthlyUploads} this month`}
                icon={FolderOpen}
                color="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <StatCard
                title="Active Uploads"
                value={systemStats.activeUploads}
                subtitle={`${systemStats.failedUploads} failed`}
                icon={Upload}
                color="bg-gradient-to-br from-orange-500 to-red-600"
              />
              <StatCard
                title="AI Processing"
                value={monitoringData.processingQueue.length}
                subtitle="Videos in queue"
                icon={Brain}
                color="bg-gradient-to-br from-purple-500 to-pink-600"
              />
            </div>

            {/* Storage Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>Storage Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      Used: {systemStats.usedStorage} of{" "}
                      {systemStats.totalStorage}
                    </span>
                    <span>{systemStats.storageUsage}%</span>
                  </div>
                  <Progress value={systemStats.storageUsage} className="h-3" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {systemStats.videoFiles}
                    </div>
                    <div className="text-sm text-gray-600">Video Files</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {systemStats.documentFiles}
                    </div>
                    <div className="text-sm text-gray-600">Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {systemStats.archiveFiles}
                    </div>
                    <div className="text-sm text-gray-600">Archives</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">
                      {systemStats.otherFiles}
                    </div>
                    <div className="text-sm text-gray-600">Other</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Upload Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploads.slice(0, 5).map((upload) => (
                    <div
                      key={upload._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileTypeIcon(upload.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {upload.originalName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {/* {upload.uploadedBy.email} •{" "} */}
                            {new Date(upload.uploadedAt).toLocaleDateString()} •{" "}
                            {upload.size}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(upload.status)}
                      >
                        {upload.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            {/* Filters and Bulk Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search files, users, locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="uploading">Uploading</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="archive">Archive</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={
                        selectedFiles.length === filteredUploads.length &&
                        filteredUploads.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-gray-600">
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length} selected`
                        : "Select all"}
                    </span>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction("download")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAction("archive")}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBulkAction("delete")}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Files Grid */}
            <div className="space-y-4">
              {filteredUploads.map((upload) => (
                <FileCard
                  key={upload._id}
                  upload={upload}
                  selectedFiles={selectedFiles}
                  handleFileSelect={handleFileSelect}
                />
              ))}
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Storage Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Storage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Video Files</span>
                        <span className="text-sm text-gray-600">
                          {systemStats.videoFiles} files
                        </span>
                      </div>
                      <Progress value={systemStats.videoFiles > 0 ? (systemStats.videoFiles / systemStats.totalFiles) * 100 : 0} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Documents</span>
                        <span className="text-sm text-gray-600">
                          {systemStats.documentFiles} files
                        </span>
                      </div>
                      <Progress value={systemStats.documentFiles > 0 ? (systemStats.documentFiles / systemStats.totalFiles) * 100 : 0} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Archives</span>
                        <span className="text-sm text-gray-600">{systemStats.archiveFiles} files</span>
                      </div>
                      <Progress value={systemStats.archiveFiles > 0 ? (systemStats.archiveFiles / systemStats.totalFiles) * 100 : 0} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Other</span>
                        <span className="text-sm text-gray-600">{systemStats.otherFiles} files</span>
                      </div>
                      <Progress value={systemStats.otherFiles > 0 ? (systemStats.otherFiles / systemStats.totalFiles) * 100 : 0} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Storage Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Storage Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemStats.storageUsage > 70 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Storage is {systemStats.storageUsage}% full. Consider archiving old files or
                        expanding storage.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Archive className="w-4 h-4 mr-2" />
                      Archive files older than 1 year
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clean up temporary files
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <HardDrive className="w-4 h-4 mr-2" />
                      Optimize storage compression
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Server className="w-4 h-4 mr-2" />
                      Expand storage capacity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Retention Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Retention Policies</CardTitle>
                <CardDescription>
                  Manage automatic file retention and cleanup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label>Video Files</Label>
                    <Select defaultValue="2years">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Documents</Label>
                    <Select defaultValue="5years">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>System Backups</Label>
                    <Select defaultValue="6months">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            {/* Real-time Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Upload Service</span>
                      <Badge className="bg-green-100 text-green-800">
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Processing</span>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage</span>
                      <Badge className="bg-amber-100 text-amber-800">
                        Warning
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup Service</span>
                      <Badge className="bg-green-100 text-green-800">
                        Running
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Upload Speed</span>
                        <span>145 MB/s</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>34%</span>
                      </div>
                      <Progress value={34} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span>Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Storage usage approaching 70%
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        2 failed uploads require attention
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>Active Uploads & Processing</CardTitle>
                <CardDescription>
                  Real-time monitoring of file operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {monitoringData.activeUploads.length === 0 && monitoringData.processingQueue.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No active uploads or processing</p>
                      </div>
                    ) : (
                      <>
                        {monitoringData.activeUploads.map((upload) => (
                          <div key={upload._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                              {getFileTypeIcon(upload.type)}
                              <div>
                                <h4 className="font-medium">{upload.originalName}</h4>
                                <p className="text-sm text-gray-500">
                                  {upload.uploadedBy} • {upload.size}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm font-medium capitalize">{upload.status}</div>
                                <div className="text-xs text-gray-500">
                                  {upload.location}
                                </div>
                              </div>
                              <Badge className={getStatusColor(upload.status)}>
                                {upload.status}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {monitoringData.processingQueue.map((upload) => (
                          <div key={upload._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Brain className="w-5 h-5 text-purple-600" />
                              <div>
                                <h4 className="font-medium">
                                  AI Processing: {upload.originalName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Defect detection in progress
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm font-medium">Processing</div>
                                <div className="text-xs text-gray-500">
                                  {upload.processingStatus || 'pending'}
                                </div>
                              </div>
                              <Badge className="bg-purple-100 text-purple-800">
                                Processing
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Errors & Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : monitoringData.errors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p>No recent errors</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {monitoringData.errors.map((upload) => (
                      <div key={upload._id} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-900">
                            Upload Failed
                          </h4>
                          <p className="text-sm text-red-700">
                            {upload.originalName} - {upload.processingError || 'Upload failed'}
                          </p>
                          <p className="text-xs text-red-600">
                            {new Date(upload.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Upload Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Configuration</CardTitle>
                <CardDescription>
                  Configure upload limits and processing settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Maximum File Size</Label>
                    <Select
                      value={uploadSettings.maxFileSize}
                      onValueChange={(val) => setUploadSettings(s => ({ ...s, maxFileSize: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1gb">1 GB</SelectItem>
                        <SelectItem value="2gb">2 GB</SelectItem>
                        <SelectItem value="5gb">5 GB</SelectItem>
                        <SelectItem value="10gb">10 GB</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Concurrent Uploads</Label>
                    <Select
                      value={uploadSettings.concurrentUploads}
                      onValueChange={(val) => setUploadSettings(s => ({ ...s, concurrentUploads: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Auto AI Processing</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={uploadSettings.autoAiProcessing}
                        onCheckedChange={(val) => setUploadSettings(s => ({ ...s, autoAiProcessing: val }))}
                      />
                      <span className="text-sm">
                        Enable automatic AI processing for video uploads
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Auto Backup</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={uploadSettings.autoBackup}
                        onCheckedChange={(val) => setUploadSettings(s => ({ ...s, autoBackup: val }))}
                      />
                      <span className="text-sm">
                        Create automatic backups of uploaded files
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security & Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>File Encryption</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={uploadSettings.fileEncryption}
                        onCheckedChange={(val) => setUploadSettings(s => ({ ...s, fileEncryption: val }))}
                      />
                      <span className="text-sm">Encrypt files at rest</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Virus Scanning</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={uploadSettings.virusScanning}
                        onCheckedChange={(val) => setUploadSettings(s => ({ ...s, virusScanning: val }))}
                      />
                      <span className="text-sm">Scan uploads for malware</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Access Logging</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={uploadSettings.accessLogging}
                        onCheckedChange={(val) => setUploadSettings(s => ({ ...s, accessLogging: val }))}
                      />
                      <span className="text-sm">
                        Log all file access and downloads
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Public Access</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={uploadSettings.publicAccess}
                        onCheckedChange={(val) => setUploadSettings(s => ({ ...s, publicAccess: val }))}
                      />
                      <span className="text-sm">Allow public file sharing</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Upload Completion</Label>
                      <p className="text-sm text-gray-500">
                        Notify when uploads complete
                      </p>
                    </div>
                    <Checkbox
                      checked={uploadSettings.notifyCompletion}
                      onCheckedChange={(val) => setUploadSettings(s => ({ ...s, notifyCompletion: val }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Storage Warnings</Label>
                      <p className="text-sm text-gray-500">
                        Alert when storage is running low
                      </p>
                    </div>
                    <Checkbox
                      checked={uploadSettings.notifyStorage}
                      onCheckedChange={(val) => setUploadSettings(s => ({ ...s, notifyStorage: val }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Failed Uploads</Label>
                      <p className="text-sm text-gray-500">
                        Immediate notification of upload failures
                      </p>
                    </div>
                    <Checkbox
                      checked={uploadSettings.notifyFailed}
                      onCheckedChange={(val) => setUploadSettings(s => ({ ...s, notifyFailed: val }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Maintenance</Label>
                      <p className="text-sm text-gray-500">
                        Scheduled maintenance notifications
                      </p>
                    </div>
                    <Checkbox
                      checked={uploadSettings.notifyMaintenance}
                      onCheckedChange={(val) => setUploadSettings(s => ({ ...s, notifyMaintenance: val }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4 pb-8">
              <Button onClick={handleSaveSettings} disabled={loading} size="lg" className="px-8">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect all system data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">
                      Clear All Upload Cache
                    </h4>
                    <p className="text-sm text-red-700">
                      Remove all temporary and cached files
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Clear Cache
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">
                      Reset All Upload Statistics
                    </h4>
                    <p className="text-sm text-red-700">
                      Clear all upload history and analytics
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Reset Stats
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-900">
                      Emergency Stop All Uploads
                    </h4>
                    <p className="text-sm text-red-700">
                      Immediately halt all active upload processes
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Stop
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default AdminUploads;
