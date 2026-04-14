"use client";

import React, { useState, useCallback, useMemo } from "react";
import { CloudUpload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import { useSearchParams } from "next/navigation";
import uploadsApi from "@/data/uploadsApi";
import { useOperatorProjects, useOperatorDevices, useOperatorUploads } from "@/hooks/useQueryHooks";
import ExportButton from "@/components/shared/ExportButton";
import {
  ProjectSelector,
  FileDropZone,
  UploadDetailsForm,
  UploadSummaryCard,
  UploadHistoryTable,
  getFileType,
} from "@/components/operator/uploads";

export default function OperatorUploadsPage() {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const searchParams = useSearchParams();

  // Pre-select project from URL query param (from route planner "Upload Video" button)
  const preselectedProjectId = searchParams?.get("projectId") || "";

  const [activeTab, setActiveTab] = useState("upload");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const [uploadData, setUploadData] = useState({
    device: "",
    location: "",
    projectId: preselectedProjectId,
  });

  // Fetch operator's projects for dropdown
  const { data: projectsData, isLoading: loadingProjects } = useOperatorProjects(userId, {
    page: 1,
    limit: 100,
  });
  const projects = projectsData?.data ?? [];

  // Fetch operator's assigned devices for Device select
  const { data: devicesRaw, isLoading: loadingDevices } = useOperatorDevices(userId);
  const devices = useMemo(() => {
    const list = Array.isArray(devicesRaw) ? devicesRaw : devicesRaw?.data ?? [];
    return list.map((device) => ({
      id: device._id || device.id,
      name: device.name || "Unnamed Device",
      status: device.status,
      location: device.location,
    }));
  }, [devicesRaw]);

  // Fetch operator's uploads
  const { data: uploadsData, isLoading: uploadsLoading, refetch: refetchUploads } = useOperatorUploads(100);
  const uploads = useMemo(() => {
    const list = uploadsData?.data ?? uploadsData ?? [];
    return Array.isArray(list) ? list : [];
  }, [uploadsData]);
  const [searchQuery, setSearchQuery] = useState("");

  // File handling
  const addFiles = useCallback((newFiles) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const unique = newFiles.filter((f) => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setUploadProgress({});
  }, []);

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

  const completedCount = Object.values(uploadProgress).filter((v) => v === 100).length;
  const selectedProject = projects.find((p) => p._id === uploadData.projectId) || null;
  const canSubmit =
    files.length > 0 && !!uploadData.projectId && !!uploadData.device && !!uploadData.location;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header — operator standard pattern */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <CloudUpload className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Upload Center</h1>
                <p className="text-gray-600 mt-1">
                  Upload inspection files to your assigned projects
                </p>
              </div>
            </div>
            <ExportButton
              data={uploads}
              columns={[
                { key: "filename", label: "Filename" },
                { key: "status", label: "Status" },
                { key: "size", label: "Size" },
                { key: "uploadedAt", label: "Uploaded At" },
              ]}
              filename="uploads"
            />
          </div>
        </div>

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
                <ProjectSelector
                  projects={projects}
                  value={uploadData.projectId}
                  onChange={(value) =>
                    setUploadData((prev) => ({ ...prev, projectId: value }))
                  }
                  loading={loadingProjects}
                  disabled={uploading}
                />

                <FileDropZone
                  files={files}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                  onAddFiles={addFiles}
                  onRemoveFile={removeFile}
                  onClearAll={clearAllFiles}
                />
              </div>

              {/* Right: Upload Details (1/3) */}
              <div className="space-y-5">
                <UploadDetailsForm
                  value={{ device: uploadData.device, location: uploadData.location }}
                  onChange={(next) =>
                    setUploadData((prev) => ({ ...prev, ...next }))
                  }
                  devices={devices}
                  devicesLoading={loadingDevices}
                  disabled={uploading}
                />

                <UploadSummaryCard
                  files={files}
                  selectedProject={selectedProject}
                  uploading={uploading}
                  completedCount={completedCount}
                  canSubmit={canSubmit}
                  onUpload={handleUpload}
                />
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <UploadHistoryTable
              uploads={filteredUploads}
              loading={uploadsLoading}
              search={searchQuery}
              onSearch={setSearchQuery}
              onRefresh={refetchUploads}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
