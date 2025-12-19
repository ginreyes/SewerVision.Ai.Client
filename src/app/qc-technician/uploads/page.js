"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileVideo } from "lucide-react";
import { api } from "@/lib/helper";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import qcApi from "@/data/qcApi";

const QCUploadsPage = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useUser();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (userId) {
      fetchUploads();
    }
  }, [userId]);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      // Get assignments to find related uploads
      const assignments = await qcApi.getAssignments(userId);
      
      // Fetch uploads for projects assigned to this QC technician
      const projectIds = assignments.map(a => a.projectId?._id || a.projectId).filter(Boolean);
      
      if (projectIds.length === 0) {
        setUploads([]);
        return;
      }

      const result = await api("/api/uploads/get-all-uploads", "GET");
      if (result.ok && result.data?.data) {
        // Filter uploads to only show those related to assigned projects
        const filtered = result.data.data.filter(upload => 
          projectIds.some(id => 
            upload.projectId?.toString() === id.toString() || 
            upload.project?.toString() === id.toString()
          )
        );
        setUploads(filtered);
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
      showAlert("Failed to load uploads", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Uploads</h1>
        <p className="text-gray-600">View uploads related to your QC assignments</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">Loading uploads...</div>
          </CardContent>
        </Card>
      ) : uploads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No uploads found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((upload) => (
            <Card key={upload._id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileVideo className="w-5 h-5 text-rose-600" />
                  <CardTitle className="text-lg">
                    {upload.filename || upload.name || "Unnamed File"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{formatFileSize(upload.size || upload.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium">{formatDate(upload.created_at || upload.uploadDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      upload.status === 'completed' ? 'bg-green-100 text-green-800' :
                      upload.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {upload.status || 'unknown'}
                    </span>
                  </div>
                  {upload.projectId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium">{upload.projectId?.name || 'N/A'}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/qc-technician/uploads/view/${upload._id}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {upload.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(upload.url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QCUploadsPage;

