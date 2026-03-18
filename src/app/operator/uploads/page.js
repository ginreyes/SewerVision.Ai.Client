"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Upload,
  CloudUpload,
  FolderOpen,
  FileVideo,
  FileText,
  Archive,
  Image,
  Database,
  File,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Download,
  Eye,
  Search,
  RefreshCw,
  HardDrive,
  Calendar,
  User,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import uploadsApi from "@/data/uploadsApi";
import { api } from "@/lib/helper";
import { useOperatorProjects } from "@/hooks/useQueryHooks";
import SewerTable from "@/components/ui/SewerTable";
import { getFileTypeIcon, getStatusColor } from "@/lib/utils";

export default function OperatorUploadsPage() {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const [activeTab, setActiveTab] = useState("upload");
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const [uploadData, setUploadData] = useState({
    device: "",
    location: "",
    projectId: "",
  });

  // Fetch operator's projects for dropdown
  const { data: projectsData, isLoading: loadingProjects } = useOperatorProjects(
    userId,
    { page: 1, limit: 100 }
  );
  const projects = projectsData?.data ?? [];

  // Fetch operator's uploads
  const [uploads, setUploads] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUploads = useCallback(async () => {
    if (!userId) return;
    setUploadsLoading(true);
    try {
      const response = await api("/api/uploads/operator", "GET");
      if (response?.ok) {
        const list = response.data?.data ?? response.data ?? [];
        setUploads(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error("Failed to fetch uploads:", e);
    } finally {
      setUploadsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (activeTab === "history") fetchUploads();
  }, [activeTab, fetchUploads]);

  // File handling
  const addFiles = useCallback((newFiles) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const unique = newFiles.filter((f) => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
  }, []);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setUploadProgress({});
  };

  const handleFileSelect = (e) => {
    addFiles(Array.from(e.target.files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag & drop
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) addFiles(droppedFiles);
    },
    [addFiles]
  );

  // Utility functions
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (file) => {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("image/")) return "image";
    if (file.type.includes("pdf") || file.type.includes("document")) return "document";
    if (file.type.includes("zip") || file.type.includes("rar")) return "archive";
    return "data";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "video": return <FileVideo className="w-5 h-5 text-blue-500" />;
      case "image": return <Image className="w-5 h-5 text-pink-500" />;
      case "document": return <FileText className="w-5 h-5 text-green-500" />;
      case "archive": return <Archive className="w-5 h-5 text-purple-500" />;
      default: return <Database className="w-5 h-5 text-orange-500" />;
    }
  };

  const getFileTypeBadge = (type) => {
    const colors = {
      video: "bg-blue-100 text-blue-700",
      image: "bg-pink-100 text-pink-700",
      document: "bg-green-100 text-green-700",
      archive: "bg-purple-100 text-purple-700",
      data: "bg-orange-100 text-orange-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  // Upload handler
  const handleUpload = async () => {
    if (files.length === 0) {
      showAlert("Please select at least one file", "error");
      return;
    }
    if (!uploadData.projectId) {
      showAlert("Please select a project", "error");
      return;
    }
    if (!uploadData.device || !uploadData.location) {
      showAlert("Please fill in device and location", "error");
      return;
    }

    setUploading(true);
    const errors = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const fileType = getFileType(file);
          const timestamp = Date.now();
          const filename = `${timestamp}-${file.name}`;

          setUploadProgress((prev) => ({ ...prev, [i]: 50 }));

          await uploadsApi.createUpload({
            filename,
            originalName: file.name,
            type: fileType,
            sizeBytes: file.size,
            uploadedBy: userId || userData?.username || "operator",
            device: uploadData.device,
            location: uploadData.location,
            projectId: uploadData.projectId,
            mimeType: file.type,
            filePath: `uploads/${filename}`,
            status: "completed",
          });

          setUploadProgress((prev) => ({ ...prev, [i]: 100 }));
        } catch (error) {
          errors.push({ file: file.name, error: error.message });
          setUploadProgress((prev) => ({ ...prev, [i]: -1 }));
        }
      }

      const successCount = files.length - errors.length;
      if (successCount > 0) {
        showAlert(`Successfully uploaded ${successCount} file(s)`, "success");
      }
      if (errors.length > 0) {
        showAlert(`${errors.length} file(s) failed`, "error");
      }
      if (errors.length === 0) {
        setTimeout(() => {
          setFiles([]);
          setUploadData({ device: "", location: "", projectId: "" });
          setUploadProgress({});
          setActiveTab("history");
        }, 1500);
      }
    } catch (error) {
      showAlert("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  // Upload history table
  const filteredUploads = useMemo(() => {
    if (!searchQuery) return uploads;
    const q = searchQuery.toLowerCase();
    return uploads.filter(
      (u) =>
        u.originalName?.toLowerCase().includes(q) ||
        u.filename?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q)
    );
  }, [uploads, searchQuery]);

  const historyColumns = [
    { key: "file", name: "File" },
    { key: "size", name: "Size" },
    { key: "status", name: "Status" },
    { key: "location", name: "Location" },
    { key: "uploadedAt", name: "Date" },
  ];

  const historyData = useMemo(() => {
    return filteredUploads.map((u) => ({
      _id: u._id,
      file: { name: u.originalName || u.filename, type: u.type },
      size: u.size || formatFileSize(u.sizeBytes),
      status: u.status,
      location: u.location || "—",
      uploadedAt: u.uploadedAt,
    }));
  }, [filteredUploads]);

  const renderHistoryCell = (item, col) => {
    if (col.key === "file") {
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0">
            {getFileTypeIcon(item.file.type)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
            <Badge className={`text-[10px] px-1.5 py-0 mt-0.5 ${getFileTypeBadge(item.file.type)}`}>
              {item.file.type}
            </Badge>
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
          {item.status}
        </Badge>
      );
    }
    if (col.key === "location") {
      return (
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {item.location}
        </span>
      );
    }
    if (col.key === "uploadedAt") {
      if (!item.uploadedAt) return <span className="text-sm text-gray-400">—</span>;
      const date = new Date(item.uploadedAt);
      return (
        <div>
          <p className="text-sm text-gray-900">{date.toLocaleDateString()}</p>
          <p className="text-[11px] text-gray-400">{date.toLocaleTimeString()}</p>
        </div>
      );
    }
    return null;
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const completedCount = Object.values(uploadProgress).filter((v) => v === 100).length;
  const overallProgress = files.length > 0 && uploading ? Math.round((completedCount / files.length) * 100) : 0;

  // Selected project name for display
  const selectedProject = projects.find((p) => p._id === uploadData.projectId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <CloudUpload className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Upload Center</h1>
                <p className="text-sm text-gray-500">Upload inspection files to your assigned projects</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-fit grid-cols-2 mb-6">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Upload area (2/3) */}
              <div className="lg:col-span-2 space-y-5">
                {/* Step 1: Select Project */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                      Select Project
                    </CardTitle>
                    <CardDescription>Choose which project these files belong to</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={uploadData.projectId}
                      onValueChange={(value) => setUploadData((prev) => ({ ...prev, projectId: value }))}
                      disabled={uploading || loadingProjects}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Select a project"} />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            <div className="flex items-center gap-2">
                              <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                              <span>{project.name}</span>
                              {project.client && (
                                <span className="text-[11px] text-gray-400">— {project.client}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedProject && (
                      <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedProject.name}</p>
                            <p className="text-xs text-gray-500">
                              {selectedProject.client && `Client: ${selectedProject.client}`}
                              {selectedProject.location && ` | Location: ${selectedProject.location}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Step 2: Drag & Drop */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</div>
                      Add Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={dropZoneRef}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-blue-400 bg-blue-50/80 scale-[1.01]"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"
                      } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="flex flex-col items-center gap-3">
                        <div className={`p-4 rounded-full ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}>
                          <Upload className={`w-8 h-8 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {isDragging ? "Drop files here" : "Drag & drop files here"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            or <span className="text-blue-500 font-medium">browse</span> to select files
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Video, documents, images, archives — single or multiple files
                        </p>
                      </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {files.length} file{files.length !== 1 ? "s" : ""}
                            </span>
                            <Badge variant="outline" className="text-xs text-gray-500">
                              {formatFileSize(totalSize)}
                            </Badge>
                          </div>
                          {!uploading && (
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-3 h-3 mr-1" /> Add more
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs text-red-500 h-7" onClick={clearAllFiles}>
                                <Trash2 className="w-3 h-3 mr-1" /> Clear
                              </Button>
                            </div>
                          )}
                        </div>

                        {uploading && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Uploading... {completedCount}/{files.length}</span>
                              <span>{overallProgress}%</span>
                            </div>
                            <Progress value={overallProgress} className="h-2" />
                          </div>
                        )}

                        <div className="border rounded-lg divide-y divide-gray-100 max-h-52 overflow-y-auto">
                          {files.map((file, index) => {
                            const type = getFileType(file);
                            const progress = uploadProgress[index];
                            const isComplete = progress === 100;
                            const isFailed = progress === -1;

                            return (
                              <div
                                key={`${file.name}-${file.size}-${index}`}
                                className={`flex items-center gap-3 px-3 py-2.5 ${
                                  isComplete ? "bg-emerald-50/50" : isFailed ? "bg-red-50/50" : "hover:bg-gray-50/50"
                                }`}
                              >
                                {getFileIcon(type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-gray-400">{formatFileSize(file.size)}</span>
                                    <Badge className={`text-[10px] px-1.5 py-0 ${getFileTypeBadge(type)}`}>{type}</Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {isComplete && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                  {isFailed && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                  {uploading && !isComplete && !isFailed && progress !== undefined && (
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                  )}
                                  {!uploading && (
                                    <button onClick={() => removeFile(index)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-500">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Upload Details (1/3) */}
              <div className="space-y-5">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</div>
                      Upload Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">
                        Device <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="e.g., CCTV Unit 1"
                        value={uploadData.device}
                        onChange={(e) => setUploadData((prev) => ({ ...prev, device: e.target.value }))}
                        disabled={uploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="e.g., Main Street, Section A-7"
                        value={uploadData.location}
                        onChange={(e) => setUploadData((prev) => ({ ...prev, location: e.target.value }))}
                        disabled={uploading}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Upload Summary & Button */}
                <Card className={files.length > 0 ? "border-blue-200 bg-blue-50/30" : ""}>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Project</span>
                        <span className={`font-medium ${selectedProject ? "text-gray-900" : "text-gray-400"}`}>
                          {selectedProject?.name || "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Files</span>
                        <span className="font-medium text-gray-900">
                          {files.length} file{files.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Size</span>
                        <span className="font-medium text-gray-900">{formatFileSize(totalSize)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleUpload}
                      disabled={uploading || files.length === 0 || !uploadData.projectId || !uploadData.device || !uploadData.location}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading... {completedCount}/{files.length}
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-4 h-4 mr-2" />
                          Upload {files.length > 0 ? `${files.length} File${files.length !== 1 ? "s" : ""}` : "Files"}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <SewerTable
              data={historyData}
              columns={historyColumns}
              search={searchQuery}
              onSearch={setSearchQuery}
              loading={uploadsLoading}
              renderCell={renderHistoryCell}
              showCheckbox={false}
              showActions={false}
              showCsvActions={false}
              emptyMessage="No uploads yet"
              emptySubtext="Upload files to see them here"
              columnDefaults={{
                file: 280,
                size: 100,
                status: 120,
                location: 180,
                uploadedAt: 140,
              }}
              rowsPerPageOptions={[10, 20, 50]}
              ButtonPlacement={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUploads}
                  disabled={uploadsLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1.5 ${uploadsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
