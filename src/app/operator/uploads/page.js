"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { CloudUpload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import { useSearchParams } from "next/navigation";
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
import {
  uploadFileChunked,
  wireGlobalOnlineDrain,
  getQueueSnapshot,
  resumeFailedUploads,
  reconcileWithServer,
  listIdbQueueRows,
} from "@/lib/chunkedUploader";

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

  // Queue state — IDB-backed badge. Mounted in useEffect to keep the SSR
  // render hydration-safe (IDB is window-only; reading it during the render
  // pass would diverge the server/client trees).
  const [queueState, setQueueState] = useState(null);
  const refreshQueue = useCallback(async () => {
    try {
      setQueueState(await getQueueSnapshot());
    } catch {
      setQueueState(null);
    }
  }, []);

  // Day 7 — reconcile-progress + hash-mismatch counter exposed to the
  // summary card so the operator gets visible feedback during what was
  // previously a silent on-mount sync.
  const [reconcileState, setReconcileState] = useState({ active: false, scanned: 0, total: 0 });
  const [hashMismatch, setHashMismatch] = useState({ count: 0, lastChunk: null });

  // Day 8 — IDB queue rows mirrored into the history table so anything stuck
  // locally (queued / draining / failed) is visible alongside server uploads.
  // Refreshed whenever the queue snapshot changes; the table re-renders
  // automatically because we feed the merged list through useMemo below.
  const [idbRows, setIdbRows] = useState([]);
  const refreshIdbRows = useCallback(async () => {
    try {
      setIdbRows(await listIdbQueueRows());
    } catch {
      setIdbRows([]);
    }
  }, []);

  const onReconcileProgress = useCallback(({ total, scanned }) => {
    setReconcileState({ active: true, scanned, total });
  }, []);
  const onHashMismatch = useCallback(({ index }) => {
    setHashMismatch((prev) => ({ count: prev.count + 1, lastChunk: index }));
  }, []);

  // Day 6/7 — reconcile-on-mount: before showing the queue badge, ask the
  // server which chunks it already persisted for any uploads we kicked
  // off in a previous session. Without this, a reload mid-upload would
  // re-PUT bytes the server has already accepted. The wire fn also
  // reconciles BEFORE draining on the global 'online' event — so we no
  // longer install a duplicate online handler that races against it.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let cancelled = false;
    (async () => {
      try {
        if (navigator.onLine !== false) {
          setReconcileState({ active: true, scanned: 0, total: 0 });
          await reconcileWithServer({ onProgress: onReconcileProgress });
        }
      } catch {
        // network/auth — leave queue as-is; next online tick retries
      } finally {
        if (!cancelled) {
          setReconcileState({ active: false, scanned: 0, total: 0 });
          await refreshQueue();
      await refreshIdbRows();
        }
      }
    })();
    const unsubscribe = wireGlobalOnlineDrain();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [refreshQueue, refreshIdbRows, onReconcileProgress]);

  // Upload handler — one file at a time, chunked, IDB-persisted.
  // Extracted into a per-file helper so the orchestrator loop stays linear
  // and the page renders progress consistently regardless of which file in
  // the batch is currently active.
  const uploadingRef = useRef(false);

  const uploadOneFile = useCallback(
    async (file, index) => {
      const onProgress = ({ bytesDone, bytesTotal }) => {
        const pct = Math.min(99, Math.floor((bytesDone / Math.max(1, bytesTotal)) * 100));
        setUploadProgress((prev) => ({ ...prev, [index]: pct }));
      };
      try {
        const row = await uploadFileChunked(
          file,
          {
            projectId: uploadData.projectId,
            device: uploadData.device,
            location: uploadData.location,
            uploadedBy: userId || userData?.username || "operator",
            type: getFileType(file),
          },
          { onProgress, onHashMismatch }
        );
        // null = deferred (offline-start); upload sits in IDB waiting for
        // connectivity. Mark the row's progress as queued (-2) so the UI
        // distinguishes it from completed (100) or failed (-1).
        if (row === null) {
          setUploadProgress((prev) => ({ ...prev, [index]: -2 }));
          return { ok: true, deferred: true };
        }
        setUploadProgress((prev) => ({ ...prev, [index]: 100 }));
        return { ok: true };
      } catch (error) {
        setUploadProgress((prev) => ({ ...prev, [index]: -1 }));
        return { ok: false, error };
      }
    },
    [uploadData.projectId, uploadData.device, uploadData.location, userId, userData, onHashMismatch]
  );

  const handleUpload = async () => {
    if (uploadingRef.current) return;
    if (files.length === 0) return showAlert("Please select at least one file", "error");
    if (!uploadData.projectId) return showAlert("Please select a project", "error");
    if (!uploadData.device || !uploadData.location) {
      return showAlert("Please fill in device and location", "error");
    }

    uploadingRef.current = true;
    setUploading(true);
    let failures = 0;
    let deferred = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const result = await uploadOneFile(files[i], i);
        if (!result.ok) failures++;
        else if (result.deferred) deferred++;
        await refreshQueue();
      await refreshIdbRows();
      }

      const successCount = files.length - failures - deferred;
      if (successCount > 0) showAlert(`Successfully uploaded ${successCount} file(s)`, "success");
      if (deferred > 0) {
        showAlert(
          `${deferred} file(s) staged locally — will upload when you reconnect`,
          "info"
        );
      }
      if (failures > 0) showAlert(`${failures} file(s) failed — they remain in the offline queue`, "error");

      if (failures === 0 && deferred === 0) {
        setTimeout(() => {
          setFiles([]);
          setUploadData({ device: "", location: "", projectId: "" });
          setUploadProgress({});
          setActiveTab("history");
          refreshQueue();
          refreshIdbRows();
        }, 1500);
      }
    } finally {
      setUploading(false);
      uploadingRef.current = false;
    }
  };

  const [resuming, setResuming] = useState(false);
  const handleRetryFailed = useCallback(async () => {
    if (resuming) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      showAlert("You're offline — resume will run automatically when you reconnect", "info");
      return;
    }
    setResuming(true);
    try {
      const { requeued, drained, failed } = await resumeFailedUploads({ onHashMismatch });
      if (drained > 0) {
        showAlert(`Resumed ${drained} upload${drained === 1 ? "" : "s"}`, "success");
      } else if (failed > 0) {
        showAlert(`${failed} upload${failed === 1 ? "" : "s"} still failing — check connectivity`, "error");
      } else if (requeued === 0) {
        showAlert("Nothing to resume", "info");
      }
      await refreshQueue();
      await refreshIdbRows();
      refetchUploads();
    } catch (err) {
      showAlert(err?.message || "Resume failed", "error");
    } finally {
      setResuming(false);
    }
  }, [resuming, showAlert, refreshQueue, refreshIdbRows, refetchUploads, onHashMismatch]);

  // Day 8 — fold IDB-staged uploads in ahead of server rows so anything stuck
  // locally is visible at the top of the history. Local rows carry the
  // `isLocal` flag; UploadHistoryTable renders them with a distinct status
  // tone + a "local" badge so they're not mistaken for server-side rows.
  const filteredUploads = useMemo(() => {
    const merged = [...idbRows, ...uploads];
    if (!searchQuery) return merged;
    const q = searchQuery.toLowerCase();
    return merged.filter(
      (u) =>
        u.originalName?.toLowerCase().includes(q) ||
        u.filename?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q)
    );
  }, [idbRows, uploads, searchQuery]);

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
                  queue={queueState}
                  onRetryFailed={handleRetryFailed}
                  resuming={resuming}
                  reconcile={reconcileState}
                  hashMismatch={hashMismatch}
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
