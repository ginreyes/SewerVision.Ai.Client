import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/helper';
import { getSnapshotUrl } from '@/lib/getVideoUrl';
import { getSnapshotColorFor } from './statusGradients';

/**
 * Encapsulates metadata, reprocess, reset AI, and AI detection snapshot
 * logic for ProjectDetail. Keeps the parent shell concise.
 */
export function useProjectDetailActions({
  project,
  user_id,
  setSelectedProject,
  showAlert,
  projectMetadata,
  refetchMetadata,
  refetchVideos,
  refetchObservations,
  refetchSnapshots,
  manualSnapshots,
  setObsPage,
  setIsAiInfoOpen,
  isReprocessing,
  setIsReprocessing,
  setIsReprocessConfirmOpen,
  setIsResetConfirmOpen,
  setIsResetting,
  setIsAddMetadataOpen,
  setIsEditMetadataOpen,
  newMetadataKey,
  setNewMetadataKey,
  newMetadataValue,
  setNewMetadataValue,
  editingMetadata,
  setEditingMetadata,
}) {
  // --- AI detection snapshots (operator-specific merge) ---
  const [aiDetectionSnapshots, setAiDetectionSnapshots] = useState([]);

  useEffect(() => {
    if (!project?._id) {
      setAiDetectionSnapshots([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const detRes = await api(`/api/qc-technicians/projects/${project._id}/detections`, 'GET');
        if (cancelled) return;
        if (detRes.ok && detRes.data?.data && Array.isArray(detRes.data.data)) {
          setAiDetectionSnapshots(
            detRes.data.data
              .filter((d) => d.images && d.images.length > 0 && d.images[0].url)
              .map((d) => ({
                id: d._id,
                distance: d.location?.distance != null ? String(d.location.distance) : `Frame ${d.frameNumber || 0}`,
                label: d.type || 'AI Detection',
                timestamp: d.detectedAt || d.createdAt,
                color: getSnapshotColorFor(d.type || ''),
                imageUrl: getSnapshotUrl(d.images[0].url),
                confidence: d.confidence,
                severity: d.severity,
                isAiDetection: true,
              }))
          );
        } else {
          setAiDetectionSnapshots([]);
        }
      } catch {
        if (!cancelled) setAiDetectionSnapshots([]);
      }
    })();
    return () => { cancelled = true; };
  }, [project?._id]);

  // Merge manual snapshots (from hook) + AI detection snapshots
  const snapshots = useMemo(() => {
    const mapped = (manualSnapshots || []).map((snapshot) => ({
      id: snapshot._id || snapshot.id,
      distance: snapshot.distance || 'N/A',
      label: snapshot.label || 'Unlabeled',
      timestamp: snapshot.timestamp || snapshot.created_at || snapshot.createdAt,
      color: snapshot.color || getSnapshotColorFor(snapshot.label),
      imageUrl: snapshot.imageUrl,
    }));
    return [...mapped, ...aiDetectionSnapshots];
  }, [manualSnapshots, aiDetectionSnapshots]);

  // --- Metadata handlers ---
  const handleAddMetadata = useCallback(async () => {
    if (!newMetadataKey.trim() || !newMetadataValue.trim()) {
      showAlert('Please enter both key and value', 'error');
      return;
    }

    if (!project?._id || !user_id) {
      showAlert('Project ID or User ID is missing', 'error');
      return;
    }

    try {
      const updatedMetadata = {
        ...(projectMetadata || project?.metadata || {}),
        [newMetadataKey.trim()]: newMetadataValue.trim()
      };

      const response = await api(
        `/api/projects/update-project/${project._id}/${user_id}`,
        'PUT',
        { metadata: updatedMetadata }
      );

      if (response.ok) {
        showAlert('Custom metadata added successfully', 'success');
        setNewMetadataKey('');
        setNewMetadataValue('');
        setIsAddMetadataOpen(false);
        if (setSelectedProject) {
          const { data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
          if (data?.data) setSelectedProject(data.data);
        }
        refetchMetadata();
      } else {
        const errorMessage = response.data?.message || response.data?.error || 'Failed to add metadata';
        showAlert(errorMessage, 'error');
        console.error('Metadata update failed:', response);
      }
    } catch (error) {
      console.error('Error adding metadata:', error);
      showAlert('Failed to add metadata: ' + (error.message || 'Unknown error'), 'error');
    }
  }, [newMetadataKey, newMetadataValue, project, user_id, projectMetadata, showAlert, setNewMetadataKey, setNewMetadataValue, setIsAddMetadataOpen, setSelectedProject, refetchMetadata]);

  const handleEditMetadata = useCallback(async () => {
    if (!project?._id || !user_id) {
      showAlert('Project ID or User ID is missing', 'error');
      return;
    }

    try {
      const response = await api(
        `/api/projects/update-project/${project._id}/${user_id}`,
        'PUT',
        { metadata: editingMetadata }
      );

      if (response.ok) {
        showAlert('Metadata updated successfully', 'success');
        setIsEditMetadataOpen(false);
        if (setSelectedProject) {
          const { data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
          if (data?.data) setSelectedProject(data.data);
        }
        refetchMetadata();
      } else {
        const errorMessage = response.data?.message || response.data?.error || 'Failed to update metadata';
        showAlert(errorMessage, 'error');
        console.error('Metadata update failed:', response);
      }
    } catch (error) {
      console.error('Error updating metadata:', error);
      showAlert('Failed to update metadata: ' + (error.message || 'Unknown error'), 'error');
    }
  }, [project, user_id, editingMetadata, showAlert, setIsEditMetadataOpen, setSelectedProject, refetchMetadata]);

  const openEditMetadata = useCallback(() => {
    const currentMetadata = projectMetadata || project?.metadata || {};
    const metadataObj = typeof currentMetadata === 'object' && currentMetadata !== null
      ? currentMetadata
      : {};
    setEditingMetadata({ ...metadataObj });
    setIsEditMetadataOpen(true);
  }, [projectMetadata, project, setEditingMetadata, setIsEditMetadataOpen]);

  // --- Reprocess handler ---
  const handleReprocess = useCallback(async () => {
    if (!project?._id) {
      showAlert('Project ID is missing', 'error');
      return;
    }

    if (isReprocessing) return;

    setIsReprocessing(true);
    try {
      let response;
      try {
        response = await api(
          `/api/ai/reprocess/project/${project._id}`,
          'POST'
        );
      } catch (apiError) {
        const apiErrorMessage = apiError?.message || apiError?.toString() || 'Network or API error';
        throw new Error(`Failed to call reprocess API: ${apiErrorMessage}`);
      }

      if (!response) throw new Error('No response received from reprocess API');

      if (response.ok && response.data?.success !== false) {
        showAlert(response.data?.message || 'Video reprocessing started successfully', 'success');
        setTimeout(async () => {
          if (setSelectedProject) {
            try {
              const { data } = await api(`/api/projects/get-project/${project._id}`, 'GET');
              if (data?.data) setSelectedProject(data.data);
            } catch (refreshError) {
              // Silently fail on refresh error
            }
          }
        }, 2000);
      } else {
        const errorMessage = response?.data?.error || response?.data?.message || response?.data?.details || `Failed to start reprocessing (Status: ${response?.status || 'unknown'})`;
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      try {
        if (error?.message) errorMessage = error.message;
        else if (typeof error === 'string') errorMessage = error;
        else if (error?.toString) errorMessage = error.toString();
      } catch {
        errorMessage = 'Failed to reprocess video';
      }
      showAlert('Failed to reprocess video: ' + errorMessage, 'error');
    } finally {
      setIsReprocessing(false);
    }
  }, [project, isReprocessing, showAlert, setIsReprocessing, setSelectedProject]);

  const startReprocessFlow = useCallback(async () => {
    if (!project?._id) {
      showAlert('Project ID is missing', 'error');
      return;
    }
    setIsReprocessConfirmOpen(false);
    setIsAiInfoOpen(true);
    await handleReprocess();
  }, [project, showAlert, setIsReprocessConfirmOpen, setIsAiInfoOpen, handleReprocess]);

  const handleResetAIData = useCallback(async () => {
    setIsResetConfirmOpen(false);
    setIsResetting(true);
    try {
      const { ok, data } = await api(`/api/ai/reset/${project._id}`, 'POST');
      if (ok) {
        showAlert(`AI data reset — ${data?.data?.deletedDetections || 0} detections cleared`, 'success');
        setIsAiInfoOpen(false);
        refetchVideos();
        setObsPage(1);
        refetchObservations();
        refetchSnapshots();
        const { data: refreshed } = await api(`/api/projects/get-project/${project._id}`, 'GET');
        if (refreshed?.data && setSelectedProject) setSelectedProject(refreshed.data);
      } else {
        showAlert('Failed to reset AI data', 'error');
      }
    } catch {
      showAlert('Failed to reset AI data', 'error');
    } finally {
      setIsResetting(false);
    }
  }, [project, showAlert, setIsResetConfirmOpen, setIsResetting, setIsAiInfoOpen, refetchVideos, setObsPage, refetchObservations, refetchSnapshots, setSelectedProject]);

  return {
    snapshots,
    handleAddMetadata,
    handleEditMetadata,
    openEditMetadata,
    handleReprocess,
    startReprocessFlow,
    handleResetAIData,
  };
}
