"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Trash2,
  Archive,
  RefreshCw,
  CloudUpload,
  ShieldCheck,
  Loader2,
  Eye,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import uploadsApi from "@/data/uploadsApi";
import SewerTable from "@/components/ui/SewerTable";
import BulkUploadModal from "@/components/admin/uploads/BulkUploadModal";
import UploadStatsGrid from "@/components/admin/uploads/UploadStatsGrid";
import { getFileTypeIcon, getStatusColor } from "@/lib/utils";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";
import { useAdminUploads, useAdminUploadStats } from "@/hooks/useQueryHooks";
import OverviewTab from "@/components/admin/uploads/tabs/OverviewTab";
import StorageTab from "@/components/admin/uploads/tabs/StorageTab";
import MonitoringTab from "@/components/admin/uploads/tabs/MonitoringTab";
import SettingsTab from "@/components/admin/uploads/tabs/SettingsTab";
import { SavedViewsDropdown, useSavedViewSync } from "@/components/shared/SavedViews";
import ExportButton from "@/components/shared/ExportButton";

const AdminUploads = () => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Saved Views sync — named filter combinations per user
  const captureFilters = useCallback(
    () => ({ searchQuery, filterStatus, filterType }),
    [searchQuery, filterStatus, filterType]
  );
  const applyFilters = useCallback((filters) => {
    if (filters.searchQuery !== undefined) setSearchQuery(filters.searchQuery || "");
    if (filters.filterStatus !== undefined) setFilterStatus(filters.filterStatus || "all");
    if (filters.filterType !== undefined) setFilterType(filters.filterType || "all");
  }, []);
  const {
    activeViewId,
    applyView,
    clearView,
    snapshot: snapshotFilters,
  } = useSavedViewSync({ applyFilters, captureFilters });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
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

  // Save upload settings to the backend via Settings API
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const res = await api('/api/settings/system-admin', 'PATCH', {
        uploadConfig: uploadSettings,
      });
      if (res.ok) {
        showAlert('Upload settings saved successfully', 'success');
      } else {
        showAlert(res.data?.message || 'Failed to save settings', 'error');
      }
    } catch (error) {
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
    // Restore upload settings from backend Settings API
    const fetchUploadConfig = async () => {
      try {
        const res = await api('/api/settings', 'GET');
        if (res.ok) {
          const config = res.data?.data?.systemAdmin?.uploadConfig;
          if (config && typeof config === 'object') {
            setUploadSettings((prev) => ({ ...prev, ...config }));
          }
        }
      } catch { /* silent — will use defaults */ }
    };
    fetchUploadConfig();

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

  const filteredUploads = uploads.filter((upload) => {
    const matchesSearch =
      (upload.filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof upload.uploadedBy === 'string' ? upload.uploadedBy : upload.uploadedBy?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (upload.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || upload.status === filterStatus;
    const matchesType = filterType === "all" || upload.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleBulkAction = async (action) => {
    if (selectedFiles.length === 0) {
      showAlert('Please select files to perform action', 'error');
      return;
    }

    try {
      await uploadsApi.bulkAction(action, selectedFiles);
      showAlert(`Successfully ${action}ed ${selectedFiles.length} file(s)`, 'success');
      setSelectedFiles([]);
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

  const handleRefreshAll = useCallback(() => {
    refetchUploads();
    refetchStats();
  }, [refetchUploads, refetchStats]);

  const handleMonitoringRefresh = useCallback(() => {
    fetchMonitoringData(true);
    refetchStats();
  }, [fetchMonitoringData, refetchStats]);

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
      const upBy = typeof item.uploadedBy === 'object' ? item.uploadedBy?.email || 'Unknown' : item.uploadedBy || 'Unknown';
      return <span className="text-sm text-gray-600 truncate">{upBy}</span>;
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
    <div className="max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Admin Upload Management
              </h1>
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-800"
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
            </div>
            <Button variant="outline" onClick={handleRefreshAll}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
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
          <OverviewTab
            uploads={uploads}
            systemStats={systemStats}
            monitoringData={monitoringData}
            loading={loading}
            onRefresh={handleRefreshAll}
          />

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            {/* Analytics widget */}
            <UploadStatsGrid uploads={uploads} />

            {/* Saved Views + Export row */}
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <SavedViewsDropdown
                entityType="upload"
                activeViewId={activeViewId}
                onApply={applyView}
                onClear={clearView}
                snapshotFilters={snapshotFilters}
                accentColor="rose"
              />
              <ExportButton
                data={filteredUploads.map((u) => ({
                  filename: u.originalName || u.filename,
                  size: u.size,
                  status: u.status,
                  type: u.type,
                  uploadedBy:
                    typeof u.uploadedBy === "object"
                      ? u.uploadedBy?.email || ""
                      : u.uploadedBy || "",
                  location: u.location || "",
                  uploadedAt: u.uploadedAt || "",
                }))}
                columns={[
                  { key: "filename", label: "File" },
                  { key: "size", label: "Size" },
                  { key: "status", label: "Status" },
                  { key: "type", label: "Type" },
                  { key: "uploadedBy", label: "Uploaded By" },
                  { key: "location", label: "Location" },
                  { key: "uploadedAt", label: "Date" },
                ]}
                filename="uploads"
              />
            </div>

            {/* Bulk Actions Bar */}
            {selectedFiles.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
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
                <Button variant="rose" size="sm" onClick={() => setShowBulkUploadModal(true)}>
                  <CloudUpload className="w-4 h-4 mr-1.5" />
                  Upload Files
                </Button>
              }
            />
          </TabsContent>

          {/* Storage Tab */}
          <StorageTab
            storageConfig={storageConfig}
            storageConfigLoading={storageConfigLoading}
            storageUsage={storageUsage}
            storageUsageLoading={storageUsageLoading}
            setStorageUsage={setStorageUsage}
            setStorageUsageLoading={setStorageUsageLoading}
            systemStats={systemStats}
            loading={loading}
          />

          {/* Monitoring Tab */}
          <MonitoringTab
            systemStats={systemStats}
            monitoringData={monitoringData}
            monitoringLoading={monitoringLoading}
            statsLoading={statsLoading}
            storageConfig={storageConfig}
            onRefresh={handleMonitoringRefresh}
          />

          {/* Settings Tab */}
          <SettingsTab
            uploadSettings={uploadSettings}
            setUploadSettings={setUploadSettings}
            loading={loading}
            onSave={handleSaveSettings}
          />
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
