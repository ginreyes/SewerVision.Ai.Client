"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  X,
  FileVideo,
  FileText,
  Archive,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  CloudUpload,
  FolderOpen,
  Image,
  Database,
  File,
} from 'lucide-react';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import uploadsApi from '@/data/uploadsApi';
import { api } from '@/lib/helper';

const BulkUploadModal = ({ open, onClose, onUploadComplete }) => {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploadData, setUploadData] = useState({
    device: '',
    location: '',
    projectId: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Fetch projects for dropdown
  useEffect(() => {
    if (!open) return;
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await api('/api/projects/get-all-projects?limit=100', 'GET');
        if (response?.ok) {
          const list = response.data?.data ?? response.data ?? [];
          setProjects(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error('Failed to fetch projects:', e);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [open]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
    // Reset input so same file can be re-added
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addFiles = (newFiles) => {
    // Prevent duplicates by name+size
    setFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}-${f.size}`));
      const unique = newFiles.filter(f => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
    setErrors([]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setUploadProgress({});
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false when leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (file) => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('word') || file.type.includes('text')) return 'document';
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('tar') || file.type.includes('gzip')) return 'archive';
    if (file.type.includes('csv') || file.type.includes('excel') || file.type.includes('spreadsheet')) return 'data';
    return 'data';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'video': return <FileVideo className="w-5 h-5 text-blue-500" />;
      case 'image': return <Image className="w-5 h-5 text-pink-500" />;
      case 'document': return <FileText className="w-5 h-5 text-green-500" />;
      case 'archive': return <Archive className="w-5 h-5 text-purple-500" />;
      case 'data': return <Database className="w-5 h-5 text-orange-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
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

  const handleUpload = async () => {
    if (files.length === 0) {
      showAlert('Please select at least one file', 'error');
      return;
    }

    if (!uploadData.device || !uploadData.location) {
      showAlert('Please fill in device and location', 'error');
      return;
    }

    setUploading(true);
    setErrors([]);
    const newErrors = [];

    try {
      const uploadPromises = files.map(async (file, index) => {
        try {
          const fileType = getFileType(file);
          const timestamp = Date.now();
          const filename = `${timestamp}-${file.name}`;

          const uploadPayload = {
            filename: filename,
            originalName: file.name,
            type: fileType,
            sizeBytes: file.size,
            uploadedBy: userId || userData?.username || userData?.email || 'admin',
            device: uploadData.device,
            location: uploadData.location,
            projectId: uploadData.projectId || undefined,
            mimeType: file.type,
            filePath: `uploads/${filename}`,
            status: 'completed',
          };

          setUploadProgress(prev => ({ ...prev, [index]: 50 }));
          const result = await uploadsApi.createUpload(uploadPayload);
          setUploadProgress(prev => ({ ...prev, [index]: 100 }));
          return { success: true, file: file.name, result };
        } catch (error) {
          newErrors.push({ file: file.name, error: error.message });
          setUploadProgress(prev => ({ ...prev, [index]: -1 })); // -1 = failed
          return { success: false, file: file.name, error: error.message };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        showAlert(`Successfully uploaded ${successCount} file(s)`, 'success');
        if (onUploadComplete) onUploadComplete();
      }

      if (failCount > 0) {
        setErrors(newErrors);
        showAlert(`${failCount} file(s) failed to upload`, 'error');
      }

      if (successCount === files.length) {
        setTimeout(() => handleClose(), 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showAlert('Failed to upload files', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setUploadData({ device: '', location: '', projectId: '' });
      setUploadProgress({});
      setErrors([]);
      onClose();
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const completedCount = Object.values(uploadProgress).filter(v => v === 100).length;
  const overallProgress = files.length > 0 && uploading
    ? Math.round((completedCount / files.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CloudUpload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span>Upload Files</span>
              <p className="text-sm font-normal text-gray-500 mt-0.5">
                Drag & drop or browse to upload files
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Drag & Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-blue-400 bg-blue-50/80 scale-[1.01]'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
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
              <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  or <span className="text-blue-500 font-medium">browse</span> to select files
                </p>
              </div>
              <p className="text-[11px] text-gray-400">
                Supports video, documents, images, archives, and data files
              </p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {files.length} file{files.length !== 1 ? 's' : ''}
                  </span>
                  <Badge variant="outline" className="text-xs text-gray-500">
                    {formatFileSize(totalSize)}
                  </Badge>
                </div>
                {!uploading && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 h-7"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Add more
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-500 hover:text-red-600 h-7"
                      onClick={clearAllFiles}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear all
                    </Button>
                  </div>
                )}
              </div>

              {/* Overall progress during upload */}
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
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                        isComplete ? 'bg-emerald-50/50' : isFailed ? 'bg-red-50/50' : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getFileIcon(type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400">{formatFileSize(file.size)}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 ${getFileTypeBadge(type)}`}>
                            {type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isComplete && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {isFailed && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        {uploading && !isComplete && !isFailed && progress !== undefined && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        )}
                        {!uploading && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                          >
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

          {/* Upload Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Device <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., CCTV Unit 1"
                value={uploadData.device}
                onChange={(e) => setUploadData(prev => ({ ...prev, device: e.target.value }))}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g., Main Street, Section A-7"
                value={uploadData.location}
                onChange={(e) => setUploadData(prev => ({ ...prev, location: e.target.value }))}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" />
                Link to Project
              </Label>
              <Select
                value={uploadData.projectId}
                onValueChange={(value) => setUploadData(prev => ({ ...prev, projectId: value === 'none' ? '' : value }))}
                disabled={uploading || loadingProjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Select a project (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      <div className="flex items-center gap-2">
                        <span>{project.name}</span>
                        {project.status && (
                          <span className="text-[10px] text-gray-400">({project.status})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((err, idx) => (
                    <div key={idx} className="text-sm">
                      <strong>{err.file}:</strong> {err.error}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-gray-400">
              {files.length > 0 && !uploading && `${files.length} file${files.length !== 1 ? 's' : ''} ready to upload`}
              {uploading && `Uploading ${completedCount}/${files.length}...`}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleClose} disabled={uploading}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0 || !uploadData.device || !uploadData.location}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Upload {files.length > 0 ? `${files.length} File${files.length !== 1 ? 's' : ''}` : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;
