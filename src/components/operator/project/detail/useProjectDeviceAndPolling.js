import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/helper';

/**
 * Encapsulates device list + assignment + real-time polling for ProjectDetail.
 */
export function useProjectDeviceAndPolling({
  project,
  userId,
  user_id,
  showAlert,
  setSelectedProject,
  projectVideos,
  refetchVideos,
  isReprocessing,
  isAiInfoOpen,
}) {
  const [myDevices, setMyDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [updatingDevice, setUpdatingDevice] = useState(false);

  const fetchMyDevices = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await api(`/api/devices/get-all-devices?operatorId=${userId}`, 'GET');
      const list = data?.data ?? (Array.isArray(data) ? data : []);
      setMyDevices(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Fetch my devices:', e);
      setMyDevices([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchMyDevices();
  }, [fetchMyDevices]);

  useEffect(() => {
    const deviceId = project?.assignedDevice?._id ?? project?.assignedDevice;
    setSelectedDeviceId(deviceId || '');
  }, [project?._id, project?.assignedDevice]);

  const handleSetDevice = useCallback(async () => {
    if (!project?._id || !user_id) return;
    setUpdatingDevice(true);
    try {
      const form = new FormData();
      form.append('projectData', JSON.stringify({ assignedDevice: selectedDeviceId || null }));
      const { ok } = await api(`/api/projects/update-project/${project._id}/${user_id}`, 'PUT', form);
      if (ok) {
        showAlert('Device updated for this project', 'success');
        setSelectedProject?.((p) => (p?._id === project._id ? { ...p, assignedDevice: myDevices.find((d) => d._id === selectedDeviceId) || p.assignedDevice } : p));
      } else {
        showAlert('Failed to update device', 'error');
      }
    } catch (e) {
      showAlert(e?.message || 'Failed to update device', 'error');
    } finally {
      setUpdatingDevice(false);
    }
  }, [project?._id, user_id, selectedDeviceId, myDevices, showAlert, setSelectedProject]);

  // Real-time polling for processing updates
  useEffect(() => {
    if (!project?._id) return;

    const hasActiveVideos = projectVideos.some((v) =>
      ['pending', 'processing', 'uploading'].includes(v.aiProcessingStatus)
    );

    const isProjectActive =
      project.status === 'ai-processing' ||
      project.status === 'uploading' ||
      project.status === 'processing';

    const shouldPoll = isProjectActive || hasActiveVideos || isReprocessing || isAiInfoOpen;

    if (!shouldPoll) return;

    const intervalId = setInterval(() => {
      refetchVideos();
      if (setSelectedProject) {
        api(`/api/projects/get-project/${project._id}`, 'GET')
          .then(({ data }) => {
            if (data?.data) setSelectedProject(data.data);
          })
          .catch(console.error);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [
    project?._id,
    project?.status,
    projectVideos,
    isReprocessing,
    isAiInfoOpen,
    refetchVideos,
    setSelectedProject,
  ]);

  return {
    myDevices,
    selectedDeviceId,
    setSelectedDeviceId,
    updatingDevice,
    handleSetDevice,
  };
}
