"use client";

import React, { useState, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import uploadsApi from '@/data/uploadsApi';

const BulkUploadModal = ({ open, onClose, onUploadComplete }) => {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploadData, setUploadData] = useState({
    device: '',
    location: '',
    projectId: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    setErrors([]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (file) => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.includes('pdf') || file.type.includes('document')) return 'document';
    if (file.type.includes('zip') || file.type.includes('rar')) return 'archive';
    return 'data';
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
      // Upload files one by one with progress tracking
      const uploadPromises = files.map(async (file, index) => {
        try {
          const fileType = getFileType(file);
          
          // Generate a unique filename
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
            filePath: `uploads/${filename}`, // Backend will handle actual file storage
            status: 'completed', // Set as completed since we're just creating metadata
          };

          // Simulate progress
          setUploadProgress(prev => ({ ...prev, [index]: 50 }));
          
          const result = await uploadsApi.createUpload(uploadPayload);
          
          setUploadProgress(prev => ({ ...prev, [index]: 100 }));
          return { success: true, file: file.name, result };
        } catch (error) {
          newErrors.push({ file: file.name, error: error.message });
          setUploadProgress(prev => ({ ...prev, [index]: 0 }));
          return { success: false, file: file.name, error: error.message };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        showAlert(`Successfully uploaded ${successCount} file(s)`, 'success');
        if (onUploadComplete) {
          onUploadComplete();
        }
      }

      if (failCount > 0) {
        setErrors(newErrors);
        showAlert(`${failCount} file(s) failed to upload`, 'error');
      }

      if (successCount === files.length) {
        // All successful, close modal
        setTimeout(() => {
          handleClose();
        }, 2000);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Bulk Upload Files</span>
          </DialogTitle>
          <DialogDescription>
            Upload multiple files at once. Select files and provide required information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Device</Label>
              <Input
                placeholder="e.g., CCTV Unit 1"
                value={uploadData.device}
                onChange={(e) => setUploadData(prev => ({ ...prev, device: e.target.value }))}
                disabled={uploading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="e.g., Main Street, Section A-7"
                value={uploadData.location}
                onChange={(e) => setUploadData(prev => ({ ...prev, location: e.target.value }))}
                disabled={uploading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Project ID (Optional)</Label>
              <Input
                placeholder="Project ID if linking to existing project"
                value={uploadData.projectId}
                onChange={(e) => setUploadData(prev => ({ ...prev, projectId: e.target.value }))}
                disabled={uploading}
              />
            </div>
          </div>

          {/* File Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Files</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            {files.length > 0 && (
              <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileType(file) === 'video' && <FileVideo className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                      {getFileType(file) === 'document' && <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />}
                      {getFileType(file) === 'archive' && <Archive className="w-5 h-5 text-purple-600 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      {uploadProgress[index] !== undefined && (
                        <div className="flex items-center space-x-2">
                          {uploadProgress[index] === 100 ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          )}
                        </div>
                      )}
                    </div>
                    {!uploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <div className="text-sm text-gray-600">
                Total: {files.length} file(s) • {formatFileSize(totalSize)}
              </div>
            )}
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
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
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
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {files.length} File{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;

