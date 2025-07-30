"use client";

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
} from "lucide-react";

import { getFileTypeIcon, getStatusColor } from "@/lib/utils"; 



export const FileCard = ({
  upload,
  selectedFiles = [],
  handleFileSelect = () => {},
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <Checkbox
          checked={selectedFiles.includes(upload.id)}
          onCheckedChange={() => handleFileSelect(upload.id)}
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
              {typeof upload.uploadedBy === "object" ? upload.uploadedBy.email : upload.uploadedBy}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(upload.uploadedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="outline" className={getStatusColor(upload.status)}>
              {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
            </Badge>

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
              {upload.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {upload.type === "video" && upload.status === "completed" && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-medium text-gray-900">{upload.duration}</div>
                  <div className="text-gray-500">Duration</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{upload.defectsFound}</div>
                  <div className="text-gray-500">Defects</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{upload.confidence}%</div>
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
