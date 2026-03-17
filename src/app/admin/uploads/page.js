"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Cloud,
  Globe,
  Key,
  Database,
  CheckCircle2,
  XCircle,
  Copy,
  Eye,
  MapPin,
  Clock,
  FileText,
  Image,
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
import SewerTable from "@/components/ui/SewerTable";
import { FileCard } from "@/components/admin/uploads/FileCard";
import { getFileTypeIcon, getStatusColor } from "@/lib/utils";
import BulkUploadModal from "@/components/admin/uploads/BulkUploadModal";
import { useAlert } from "@/components/providers/AlertProvider";
import { useAdminUploads, useAdminUploadStats } from "@/hooks/useQueryHooks";

const AdminUploads = () => {
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [monitoringData, setMonitoringData] = useState({
    activeUploads: [],
    processingQueue: [],
    errors: [],
  });

  const [storageConfig, setStorageConfig] = useState(null);
  const [storageConfigLoading, setStorageConfigLoading] = useState(true);
  const [storageUsage, setStorageUsage] = useState(null);
  const [storageUsageLoading, setStorageUsageLoading] = useState(true);

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

  // TanStack Query: admin upload list & system stats
  const {
    data: uploadsData,
    isLoading: uploadsLoading,
    refetch: refetchUploads,
  } = useAdminUploads(
    {
      status: filterStatus !== "all" ? filterStatus : undefined,
      type: filterType !== "all" ? filterType : undefined,
      search: searchQuery || undefined,
    },
    {
      keepPreviousData: true,
    }
  );

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useAdminUploadStats();

  const fetchMonitoringData = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setMonitoringLoading(true);

      const [data, processingData, failedData] = await Promise.all([
        uploadsApi.getAllUploads({ status: 'uploading', limit: 10 }),
        uploadsApi.getAllUploads({ status: 'processing', limit: 10 }),
        uploadsApi.getAllUploads({ status: 'failed', limit: 10 }),
      ]);

      setMonitoringData({
        activeUploads: data.uploads || [],
        processingQueue: processingData.uploads || [],
        errors: failedData.uploads || [],
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setMonitoringLoading(false);
    }
  }, []);

  // Sync TanStack Query results into local derived state
  useEffect(() => {
    if (uploadsData && Array.isArray(uploadsData.uploads)) {
      setUploads(uploadsData.uploads);
    }
  }, [uploadsData]);

  useEffect(() => {
    if (statsData) {
      setSystemStats((prev) => ({
        ...prev,
        ...statsData,
      }));
    }
  }, [statsData]);

  // Persist upload settings locally as a lightweight workaround until a backend endpoint exists
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'adminUploadSettings',
          JSON.stringify(uploadSettings)
        );
      }
      // In a real app: await uploadsApi.updateSettings(uploadSettings);
      showAlert('Upload settings saved on this browser', 'success');
    } catch (error) {
      console.error('Failed to save upload settings:', error);
      showAlert('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch storage provider config and usage on mount
  useEffect(() => {
    const fetchStorageConfig = async () => {
      try {
        setStorageConfigLoading(true);
        const config = await uploadsApi.getStorageConfig();
        setStorageConfig(config);
      } catch (error) {
        console.error('Error fetching storage config:', error);
      } finally {
        setStorageConfigLoading(false);
      }
    };
    const fetchStorageUsage = async () => {
      try {
        setStorageUsageLoading(true);
        const usage = await uploadsApi.getStorageUsage();
        setStorageUsage(usage);
      } catch (error) {
        console.error('Error fetching storage usage:', error);
      } finally {
        setStorageUsageLoading(false);
      }
    };
    fetchStorageConfig();
    fetchStorageUsage();
  }, []);

  // Initial load: monitoring (when needed) and persisted upload settings
  useEffect(() => {
    // Restore upload settings from localStorage if present
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('adminUploadSettings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setUploadSettings((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch (e) {
        console.warn('Failed to parse stored upload settings:', e);
      }
    }

    if (activeTab === 'monitoring') {
      fetchMonitoringData(true);
      const interval = setInterval(fetchMonitoringData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchMonitoringData]);

  // Auto-refresh when there are videos in AI processing
  useEffect(() => {
    const hasProcessingVideos = uploads.some(
      upload => upload.type === 'video' &&
        (upload.aiStatus === 'pending' || upload.processingStatus === 'in_progress' || upload.status === 'processing')
    );

    if (!hasProcessingVideos) return; // Don't poll if nothing is processing

    const interval = setInterval(() => {
      refetchUploads();
      refetchStats();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [uploads, refetchUploads, refetchStats]);

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
      // Refresh list & stats via TanStack Query
      refetchUploads();
      refetchStats();
    } catch (error) {
      console.error('Bulk action error:', error);
      showAlert(`Failed to ${action} files: ${error.message}`, 'error');
    }
  };

  const handleUploadComplete = () => {
    refetchUploads();
    refetchStats();
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

  /* ─── Files Tab: SewerTable config ─── */
  const fileColumns = [
    { key: "file", name: "File" },
    { key: "size", name: "Size" },
    { key: "status", name: "Status" },
    { key: "uploadedBy", name: "Uploaded By" },
    { key: "location", name: "Location" },
    { key: "uploadedAt", name: "Date" },
    { key: "actions", name: "" },
  ];

  const fileFilters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Status" },
        { value: "completed", label: "Completed" },
        { value: "uploading", label: "Uploading" },
        { value: "processing", label: "Processing" },
        { value: "failed", label: "Failed" },
        { value: "queued", label: "Queued" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { value: "all", label: "All Types" },
        { value: "video", label: "Video" },
        { value: "document", label: "Document" },
        { value: "image", label: "Image" },
        { value: "archive", label: "Archive" },
        { value: "data", label: "Data" },
      ],
    },
  ];

  const fileTableData = useMemo(() => {
    return filteredUploads.map((upload) => ({
      _id: upload._id || upload.id,
      file: {
        name: upload.originalName || upload.filename,
        filename: upload.filename,
        type: upload.type,
        aiStatus: upload.aiStatus,
        processingStatus: upload.processingStatus,
        qcStatus: upload.qcStatus,
        defectsFound: upload.defectsFound,
        confidence: upload.confidence,
        duration: upload.duration,
        isPublic: upload.isPublic,
        tags: upload.tags,
      },
      size: upload.size,
      status: upload.status,
      uploadedBy: typeof upload.uploadedBy === 'object' ? upload.uploadedBy?.email || 'Unknown' : upload.uploadedBy || 'Unknown',
      location: upload.location || '—',
      uploadedAt: upload.uploadedAt,
      actions: upload,
    }));
  }, [filteredUploads]);

  const handleFileFilterChange = (key, val) => {
    if (key === "status") setFilterStatus(val);
    if (key === "type") setFilterType(val);
  };

  const renderFileCell = (item, col) => {
    if (col.key === "file") {
      const f = item.file;
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0">
            {getFileTypeIcon(f.type)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[11px] text-gray-400 truncate">{f.filename}</span>
              {f.type === "video" && f.aiStatus === "processed" && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">
                  AI Processed
                </Badge>
              )}
              {f.type === "video" && (f.processingStatus === "in_progress" || f.aiStatus === "pending") && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0 animate-pulse">
                  <Loader2 className="w-2.5 h-2.5 mr-0.5 animate-spin inline" />
                  AI Processing
                </Badge>
              )}
              {f.qcStatus && f.qcStatus !== "not_applicable" && (
                <Badge className={`text-[10px] px-1.5 py-0 ${
                  f.qcStatus === "approved"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                }`}>
                  QC: {f.qcStatus}
                </Badge>
              )}
              {f.isPublic && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0">
                  Public
                </Badge>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (col.key === "size") {
      return <span className="text-sm text-gray-600 font-mono">{item.size}</span>;
    }

    if (col.key === "status") {
      return (
        <Badge variant="outline" className={`${getStatusColor(item.status)} text-xs font-semibold capitalize`}>
          {item.status === "uploading" && <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />}
          {item.status}
        </Badge>
      );
    }

    if (col.key === "uploadedBy") {
      return <span className="text-sm text-gray-600 truncate">{item.uploadedBy}</span>;
    }

    if (col.key === "location") {
      return (
        <span className="text-sm text-gray-500 truncate flex items-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {item.location}
        </span>
      );
    }

    if (col.key === "uploadedAt") {
      if (!item.uploadedAt) return <span className="text-sm text-gray-400">—</span>;
      const date = new Date(item.uploadedAt);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      let relative;
      if (diffMin < 1) relative = "Just now";
      else if (diffMin < 60) relative = `${diffMin}m ago`;
      else if (diffHr < 24) relative = `${diffHr}h ago`;
      else if (diffDay < 7) relative = `${diffDay}d ago`;
      else relative = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return (
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{relative}</p>
          <p className="text-[11px] text-gray-400">{date.toLocaleDateString()}</p>
        </div>
      );
    }

    if (col.key === "actions") {
      const upload = item.actions;
      const uploadId = upload._id || upload.id;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/uploads/view/${uploadId}`);
            }}
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await uploadsApi.downloadFile(uploadId, upload.originalName || upload.filename);
                showAlert('File downloaded successfully', 'success');
              } catch (error) {
                showAlert(error?.message || 'Failed to download file', 'error');
              }
            }}
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      );
    }

    return null;
  };

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
            {/* Bulk Actions Bar */}
            {selectedFiles.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("download")}>
                    <Download className="w-4 h-4 mr-1.5" /> Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("archive")}>
                    <Archive className="w-4 h-4 mr-1.5" /> Archive
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction("delete")}>
                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* SewerTable for Files */}
            <SewerTable
              data={fileTableData}
              columns={fileColumns}
              filters={fileFilters}
              search={searchQuery}
              onSearch={setSearchQuery}
              onFilterChange={handleFileFilterChange}
              loading={uploadsLoading}
              renderCell={renderFileCell}
              showCheckbox={true}
              showActions={false}
              showCsvActions={false}
              selectedRows={selectedFiles}
              onSelectionChange={setSelectedFiles}
              getRowId={(row) => row._id}
              emptyMessage="No files found"
              emptySubtext="Try adjusting your filters or search, or upload new files"
              columnDefaults={{
                file: 300,
                size: 100,
                status: 120,
                uploadedBy: 150,
                location: 150,
                uploadedAt: 140,
                actions: 80,
              }}
              rowsPerPageOptions={[10, 20, 50]}
              ButtonPlacement={
                <Button variant="gradient" size="sm" onClick={() => setShowBulkUploadModal(true)}>
                  <CloudUpload className="w-4 h-4 mr-1.5" />
                  Upload Files
                </Button>
              }
            />
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-6">
            {/* Cloud Storage Provider */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                      <Cloud className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Cloud Storage Provider</CardTitle>
                      <CardDescription>Active storage backend configuration</CardDescription>
                    </div>
                  </div>
                  {storageConfig && (
                    <Badge className={storageConfig.configured
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-red-100 text-red-700 border-red-200"
                    }>
                      {storageConfig.configured ? (
                        <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                      ) : (
                        <><XCircle className="w-3 h-3 mr-1" /> Not Configured</>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {storageConfigLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                        <div className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : storageConfig ? (
                  <div className="space-y-5">
                    {/* Provider Header */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                      <img
                        src="https://www.backblaze.com/favicon.ico"
                        alt="Backblaze"
                        className="w-8 h-8 rounded"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{storageConfig.providerName}</p>
                        <p className="text-xs text-gray-500">S3-Compatible Cloud Object Storage</p>
                      </div>
                      {storageConfig.s3Compatible && (
                        <Badge variant="outline" className="ml-auto text-xs bg-indigo-50 text-indigo-600 border-indigo-200">
                          S3 Compatible
                        </Badge>
                      )}
                    </div>

                    {/* Credentials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <Database className="w-3 h-3" /> Bucket Name
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                          {storageConfig.bucketName || '—'}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <Globe className="w-3 h-3" /> Region
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                          {storageConfig.region || '—'}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <Server className="w-3 h-3" /> S3 Endpoint
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800 truncate">
                          {storageConfig.endpoint || '—'}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <Key className="w-3 h-3" /> Application Key ID
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                          {storageConfig.keyId || '—'}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <HardDrive className="w-3 h-3" /> Bucket ID
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                          {storageConfig.bucketId || '—'}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          <ShieldCheck className="w-3 h-3" /> Application Key
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm text-gray-800">
                          ••••••••••••••••
                        </div>
                      </div>
                    </div>

                    {/* Storage Usage Section */}
                    <div className="mt-5 pt-5 border-t border-blue-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-blue-500" />
                        Bucket Storage Usage
                      </h4>
                      {storageUsageLoading ? (
                        <div className="space-y-3">
                          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                          <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                          </div>
                        </div>
                      ) : storageUsage ? (
                        <div className="space-y-4">
                          {/* Total Usage Summary */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-gray-900">{storageUsage.totalFormatted}</span>
                              <span className="text-sm text-gray-500 ml-2">across {storageUsage.fileCount.toLocaleString()} files</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={async () => {
                                try {
                                  setStorageUsageLoading(true);
                                  const usage = await uploadsApi.getStorageUsage();
                                  setStorageUsage(usage);
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setStorageUsageLoading(false);
                                }
                              }}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Refresh
                            </Button>
                          </div>

                          {/* Breakdown by Folder/Prefix */}
                          {storageUsage.byPrefix && Object.keys(storageUsage.byPrefix).length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {Object.entries(storageUsage.byPrefix)
                                .sort(([, a], [, b]) => b.bytes - a.bytes)
                                .map(([prefix, info]) => {
                                  const percentage = storageUsage.totalBytes > 0
                                    ? ((info.bytes / storageUsage.totalBytes) * 100).toFixed(1)
                                    : 0;
                                  return (
                                    <div key={prefix} className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                                      <div className="flex items-center gap-2 mb-1">
                                        <FolderOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                        <span className="text-xs font-semibold text-gray-700 capitalize truncate">{prefix}</span>
                                      </div>
                                      <p className="text-sm font-bold text-gray-900">{info.formatted}</p>
                                      <p className="text-[11px] text-gray-400">{info.count} files · {percentage}%</p>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Unable to load storage usage</p>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                      Credentials are configured via environment variables. Contact your system administrator to update storage settings.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Cloud className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Unable to load storage configuration</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
            {/* Refresh Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Real-time Monitoring</h2>
                <p className="text-sm text-gray-500">Auto-refreshes every 5 seconds when active</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchMonitoringData(true);
                  refetchStats();
                }}
                disabled={monitoringLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${monitoringLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Status Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* System Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span>System Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                          <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Upload Service</span>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Online
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AI Processing</span>
                        <Badge className={
                          monitoringData.processingQueue.length > 0
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }>
                          {monitoringData.processingQueue.length > 0 ? `${monitoringData.processingQueue.length} Active` : 'Idle'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Storage Health</span>
                        <Badge className={
                          systemStats.diskHealthStatus === 'critical'
                            ? "bg-red-100 text-red-800 border-red-200"
                            : systemStats.diskHealthStatus === 'warning'
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-green-100 text-green-800 border-green-200"
                        }>
                          {systemStats.diskHealthStatus === 'critical' ? 'Critical' :
                           systemStats.diskHealthStatus === 'warning' ? 'Warning' : 'Healthy'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Backblaze B2</span>
                        <Badge className={
                          storageConfig?.configured
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }>
                          {storageConfig?.configured ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Storage & Upload Metrics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Upload Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disk Usage</span>
                          <span className="font-medium">{systemStats.usedStorage || '—'} / {systemStats.totalStorage || '—'}</span>
                        </div>
                        <Progress value={systemStats.storageUsage || 0} className="h-2" />
                        <p className="text-[11px] text-gray-400 mt-0.5">{systemStats.storageUsage || 0}% used · {systemStats.availableStorage || '—'} free</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Upload Storage</span>
                          <span className="font-medium">{systemStats.totalUploadSize || '0 Bytes'}</span>
                        </div>
                        <Progress value={systemStats.uploadStorageUsage || 0} className="h-2" />
                        <p className="text-[11px] text-gray-400 mt-0.5">{systemStats.uploadStorageUsage || 0}% of disk · {systemStats.totalFiles || 0} files</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Avg File Size</span>
                          <span className="font-medium">{systemStats.avgUploadSize || '—'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span>Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (() => {
                    const alerts = [];

                    // Storage alerts
                    if (systemStats.diskHealthStatus === 'critical') {
                      alerts.push({ type: 'error', icon: AlertTriangle, message: `Storage critically full at ${systemStats.storageUsage}%` });
                    } else if (systemStats.diskHealthStatus === 'warning') {
                      alerts.push({ type: 'warning', icon: AlertTriangle, message: `Storage usage at ${systemStats.storageUsage}%` });
                    }

                    // Failed uploads
                    if (systemStats.failedUploads > 0) {
                      alerts.push({ type: 'error', icon: AlertCircle, message: `${systemStats.failedUploads} failed upload${systemStats.failedUploads !== 1 ? 's' : ''} require attention` });
                    }

                    // Active uploads
                    if (systemStats.activeUploads > 0) {
                      alerts.push({ type: 'info', icon: Upload, message: `${systemStats.activeUploads} upload${systemStats.activeUploads !== 1 ? 's' : ''} in progress` });
                    }

                    // Processing queue
                    if (monitoringData.processingQueue.length > 0) {
                      alerts.push({ type: 'info', icon: Brain, message: `${monitoringData.processingQueue.length} file${monitoringData.processingQueue.length !== 1 ? 's' : ''} in AI processing queue` });
                    }

                    if (alerts.length === 0) {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                          <p className="text-sm">All systems normal</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {alerts.map((alert, idx) => (
                          <Alert key={idx} className={
                            alert.type === 'error' ? 'border-red-200 bg-red-50' :
                            alert.type === 'warning' ? 'border-amber-200 bg-amber-50' :
                            'border-blue-200 bg-blue-50'
                          }>
                            <alert.icon className={`h-4 w-4 ${
                              alert.type === 'error' ? 'text-red-600' :
                              alert.type === 'warning' ? 'text-amber-600' :
                              'text-blue-600'
                            }`} />
                            <AlertDescription className="text-xs">
                              {alert.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* File Type Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">File Distribution</CardTitle>
                <CardDescription>Breakdown of uploaded files by type</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Videos', count: systemStats.videoFiles, icon: FileVideo, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
                      { label: 'Documents', count: systemStats.documentFiles, icon: FolderOpen, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                      { label: 'Archives', count: systemStats.archiveFiles, icon: Archive, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                      { label: 'Other', count: systemStats.otherFiles, icon: HardDrive, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100' },
                      { label: 'Total', count: systemStats.totalFiles, icon: Database, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
                    ].map((item) => (
                      <div key={item.label} className={`p-4 rounded-lg border ${item.bg}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-xs font-medium text-gray-600">{item.label}</span>
                        </div>
                        <p className={`text-2xl font-bold ${item.color}`}>{item.count || 0}</p>
                        {systemStats.totalFiles > 0 && item.label !== 'Total' && (
                          <p className="text-[11px] text-gray-400">
                            {((item.count / systemStats.totalFiles) * 100).toFixed(1)}% of total
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Activity Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Monthly Uploads</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{systemStats.monthlyUploads || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Completed</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{systemStats.completedUploads || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Failed</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">{systemStats.failedUploads || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Uploads & Processing */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Active Uploads & Processing</CardTitle>
                    <CardDescription>Real-time monitoring of file operations</CardDescription>
                  </div>
                  {(monitoringData.activeUploads.length > 0 || monitoringData.processingQueue.length > 0) && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {monitoringData.activeUploads.length + monitoringData.processingQueue.length} active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {monitoringLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : monitoringData.activeUploads.length === 0 && monitoringData.processingQueue.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No active uploads or processing</p>
                    <p className="text-sm text-gray-400 mt-1">Files will appear here when uploading or being processed by AI</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {monitoringData.activeUploads.map((upload) => (
                      <div key={upload._id} className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getFileTypeIcon(upload.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{upload.originalName}</h4>
                            <p className="text-xs text-gray-500">
                              {upload.uploadedBy} · {upload.size} · {upload.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Uploading
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {monitoringData.processingQueue.map((upload) => (
                      <div key={upload._id} className="flex items-center justify-between p-4 border border-purple-100 bg-purple-50/50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Brain className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{upload.originalName}</h4>
                            <p className="text-xs text-gray-500">
                              AI processing · {upload.processingStatus || 'pending'} · {upload.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            Processing
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Logs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Recent Errors & Issues</CardTitle>
                    <CardDescription>Failed uploads and processing errors</CardDescription>
                  </div>
                  {monitoringData.errors.length > 0 && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {monitoringData.errors.length} error{monitoringData.errors.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {monitoringLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 bg-red-50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : monitoringData.errors.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p className="font-medium">No recent errors</p>
                    <p className="text-sm text-gray-400 mt-1">All uploads have been processed successfully</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {monitoringData.errors.map((upload) => (
                      <div key={upload._id} className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="p-1.5 bg-red-100 rounded-lg mt-0.5">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-red-900 truncate">
                              {upload.originalName}
                            </h4>
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] ml-2 flex-shrink-0">
                              Failed
                            </Badge>
                          </div>
                          <p className="text-sm text-red-700 mt-0.5">
                            {upload.processingError || 'Upload failed — unknown error'}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-red-500">
                            <span>{upload.uploadedBy}</span>
                            <span>·</span>
                            <span>{upload.size}</span>
                            <span>·</span>
                            <span>{new Date(upload.uploadedAt).toLocaleString()}</span>
                          </div>
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
