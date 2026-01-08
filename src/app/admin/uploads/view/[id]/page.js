"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  FileVideo,
  FileText,
  Image as ImageIcon,
  Archive,
  Loader2,
  Calendar,
  User,
  MapPin,
  HardDrive,
  Shield,
  Brain,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import uploadsApi from '@/data/uploadsApi';
import { useAlert } from '@/components/providers/AlertProvider';
import { getFileTypeIcon, getStatusColor } from '@/lib/utils';
import { apiBlob } from '@/lib/helper';

const FileViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [upload, setUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [error, setError] = useState(null);

  const fileId = params.id;

  const fetchUpload = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await uploadsApi.getUpload(fileId);
      setUpload(data);
      
      // Generate file URL for viewing using apiBlob helper
      if (data) {
        try {
          const response = await apiBlob(`/api/uploads/view/${fileId}`, 'GET');

          if (!response.ok) {
            throw new Error(response.error?.message || response.error || 'Failed to load file');
          }

          const contentType = response.headers.get('content-type') || '';
          
          // If it's a text file, read as text
          if (contentType.startsWith('text/')) {
            const text = await response.blob.text();
            setTextContent(text);
          } else {
            // For other files, create blob URL
            const blobUrl = window.URL.createObjectURL(response.blob);
            setFileUrl(blobUrl);
          }
        } catch (e) {
          console.error('Error loading file:', e);
          setError(e.message || 'Failed to load file content');
        }
      }
    } catch (err) {
      console.error('Error fetching upload:', err);
      setError(err.message || 'Failed to load file');
      showAlert(err.message || 'Failed to load file', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fileId) {
      fetchUpload();
    }
  }, [fileId]);

  // Auto-refresh if video is processing
  useEffect(() => {
    if (!upload || upload.type !== 'video') return;
    
    const isProcessing = upload.aiStatus === 'pending' || 
                        upload.processingStatus === 'in_progress' || 
                        upload.status === 'processing';
    
    if (!isProcessing) return; // Don't poll if not processing
    
    const interval = setInterval(() => {
      fetchUpload();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload?.aiStatus, upload?.processingStatus, upload?.status, fileId]);

  const handleDownload = async () => {
    if (!upload) return;
    
    try {
      setDownloading(true);
      await uploadsApi.downloadFile(fileId, upload.originalName || upload.filename);
      showAlert('File downloaded successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showAlert(error.message || 'Failed to download file', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileViewer = () => {
    if (!upload || !fileUrl) return null;

    const contentType = upload.mimeType || '';
    const isVideo = contentType.startsWith('video/');
    const isImage = contentType.startsWith('image/');
    const isPdf = contentType.includes('pdf');
    const isText = contentType.startsWith('text/');

    if (isVideo) {
      return (
        <div className="w-full">
          <video
            controls
            className="w-full max-h-[70vh] rounded-lg"
            src={fileUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="w-full flex justify-center">
          <img
            src={fileUrl}
            alt={upload.originalName}
            className="max-w-full max-h-[70vh] rounded-lg object-contain"
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="w-full h-[70vh]">
          <iframe
            src={fileUrl}
            className="w-full h-full rounded-lg"
            title={upload.originalName}
          />
        </div>
      );
    }

    if (isText) {
      return (
        <div className="w-full">
          <Card>
            <CardContent className="p-6">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-[70vh] font-mono">
                {textContent || 'Loading text content...'}
              </pre>
            </CardContent>
          </Card>
        </div>
      );
    }

    // For other file types, show download option
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            {getFileTypeIcon(upload.type)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {upload.originalName}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                This file type cannot be previewed. Please download to view.
              </p>
            </div>
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !upload) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              File Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'The file you are looking for does not exist or you do not have permission to view it.'}
            </p>
            <Button onClick={() => router.push('/admin/uploads')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Uploads
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/uploads')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
                {upload.originalName}
              </h1>
            </div>
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - File Viewer */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {getFileViewer()}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - File Details */}
          <div className="space-y-6">
            {/* File Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <HardDrive className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{upload.size || formatFileSize(upload.sizeBytes)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium">
                      {new Date(upload.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Uploaded by:</span>
                    <span className="font-medium">
                      {typeof upload.uploadedBy === 'object' && upload.uploadedBy?.email
                        ? upload.uploadedBy.email
                        : upload.uploadedBy || 'Unknown'}
                    </span>
                  </div>
                  {upload.location && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{upload.location}</span>
                    </div>
                  )}
                  {upload.device && (
                    <div className="flex items-center space-x-2 text-sm">
                      <HardDrive className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Device:</span>
                      <span className="font-medium">{upload.device}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upload.status && (
                  <div>
                    <Badge variant="outline" className={getStatusColor(upload.status)}>
                      {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                    </Badge>
                  </div>
                )}
                {upload.type === 'video' && (upload.aiStatus || upload.processingStatus) && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">AI Status:</span>
                      <Badge
                        variant="outline"
                        className={
                          upload.aiStatus === 'processed'
                            ? 'bg-purple-100 text-purple-800 border-purple-200 font-semibold'
                            : upload.processingStatus === 'in_progress' || upload.status === 'processing'
                            ? 'bg-amber-100 text-amber-800 border-amber-200 font-semibold animate-pulse'
                            : upload.aiStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {upload.processingStatus === 'in_progress' ? (
                          <>🔄 Processing...</>
                        ) : upload.aiStatus === 'processed' ? (
                          <>✓ Processed</>
                        ) : (
                          <>{upload.aiStatus || 'Pending'}</>
                        )}
                      </Badge>
                    </div>
                    {upload.processingStatus === 'in_progress' && upload.processingStartedAt && (
                      <div className="text-xs text-gray-500 ml-6">
                        Started: {new Date(upload.processingStartedAt).toLocaleString()}
                      </div>
                    )}
                    {upload.processingError && (
                      <div className="text-xs text-red-600 ml-6">
                        Error: {upload.processingError}
                      </div>
                    )}
                  </div>
                )}
                {upload.qcStatus && upload.qcStatus !== 'not_applicable' && (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">QC Status:</span>
                    <Badge
                      variant="outline"
                      className={
                        upload.qcStatus === 'approved'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }
                    >
                      {upload.qcStatus}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Stats (if video) */}
            {upload.type === 'video' && upload.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Video Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upload.duration && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{upload.duration}</span>
                    </div>
                  )}
                  {upload.resolution && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Resolution:</span>
                      <span className="font-medium">{upload.resolution}</span>
                    </div>
                  )}
                  {upload.defectsFound !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Defects Found:</span>
                      <span className="font-medium">{upload.defectsFound}</span>
                    </div>
                  )}
                  {upload.confidence !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">AI Confidence:</span>
                        <span className="font-medium">{upload.confidence}%</span>
                      </div>
                      <Progress value={upload.confidence} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Download Count */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Downloads:</span>
                  <span className="font-medium">{upload.downloadCount || 0}</span>
                </div>
                {upload.lastAccessed && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Last Accessed:</span>
                    <span className="font-medium">
                      {new Date(upload.lastAccessed).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewPage;

