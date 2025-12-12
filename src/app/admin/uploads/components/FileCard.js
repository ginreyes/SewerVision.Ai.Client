"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  MoreVertical,
  HardDrive,
  User,
  Calendar,
  Eye,
  Download,
  Loader2,
} from "lucide-react";

import { getFileTypeIcon, getStatusColor } from "@/lib/utils";
import uploadsApi from "@/data/uploadsApi";
import { useAlert } from "@/components/providers/AlertProvider"; 



export const FileCard = ({
  upload,
  selectedFiles = [],
  handleFileSelect = () => {},
}) => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [downloading, setDownloading] = useState(false);
  const uploadId = upload._id || upload.id;

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!uploadId) {
      showAlert('Invalid file ID', 'error');
      return;
    }
    try {
      setDownloading(true);
      await uploadsApi.downloadFile(uploadId, upload.originalName || upload.filename);
      showAlert('File downloaded successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to download file';
      showAlert(errorMessage, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleView = (e) => {
    e.stopPropagation();
    if (!uploadId) {
      showAlert('Invalid file ID', 'error');
      return;
    }
    // Navigate to the file view page
    router.push(`/admin/uploads/view/${uploadId}`);
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Checkbox
            checked={selectedFiles.includes(uploadId)}
            onCheckedChange={() => handleFileSelect(uploadId)}
          />

        <div className="flex-shrink-0">
          {getFileTypeIcon(upload.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 truncate">{upload.originalName}</h3>
              <p className="text-sm text-gray-500 truncate">{upload.filename}</p>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center">
              <HardDrive className="w-4 h-4 mr-1" />
              {upload.size}
            </span>
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {typeof upload.uploadedBy === "object" && upload.uploadedBy?.email 
                ? upload.uploadedBy.email 
                : upload.uploadedBy || 'Unknown'}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {upload.uploadedAt ? new Date(upload.uploadedAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            {upload.status && (
              <Badge variant="outline" className={getStatusColor(upload.status)}>
                {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
              </Badge>
            )}

            {upload.type === "video" && upload.aiStatus && (
              <Badge
                variant="outline"
                className={
                  upload.aiStatus === "processed"
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : upload.aiStatus === "pending"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }
              >
                AI: {upload.aiStatus}
              </Badge>
            )}

            {upload.qcStatus !== "not_applicable" && (
              <Badge
                variant="outline"
                className={
                  upload.qcStatus === "approved"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : upload.qcStatus === "pending"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }
              >
                QC: {upload.qcStatus}
              </Badge>
            )}

            {upload.isPublic && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                Public
              </Badge>
            )}
          </div>

          {upload.status === "uploading" && (
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>73%</span>
              </div>
              <Progress value={73} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {upload.tags && Array.isArray(upload.tags) && upload.tags.length > 0 && upload.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleView}
                disabled={downloading}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download
              </Button>
            </div>
          </div>

            {upload.type === "video" && upload.status === "completed" && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-medium text-gray-900">{upload.duration || 'N/A'}</div>
                  <div className="text-gray-500">Duration</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{upload.defectsFound || 0}</div>
                  <div className="text-gray-500">Defects</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{upload.confidence || 0}%</div>
                  <div className="text-gray-500">AI Confidence</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
  );
};
