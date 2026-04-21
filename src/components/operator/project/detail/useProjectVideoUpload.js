import { useCallback, useRef, useState } from 'react';
import { api, getCookie } from '@/lib/helper';
import { BACKEND_URL } from '@/lib/config';

/**
 * Encapsulates video upload + delete state and handlers for ProjectDetail.
 */
export function useProjectVideoUpload({
  project,
  isAdmin,
  showAlert,
  uploadLimits,
  refetchVideos,
  projectVideos,
  selectedVideo,
  setSelectedVideo,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [isDeleteVideoOpen, setIsDeleteVideoOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(false);

  const handleVideoUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];
    if (!validTypes.includes(file.type)) {
      showAlert('Please upload a valid video file (MP4, WebM, MOV, AVI, MPEG)', 'error');
      return;
    }

    const maxSize = uploadLimits.videoMaxMB * 1024 * 1024;
    if (file.size > maxSize) {
      showAlert(`Video file is too large. Maximum size is ${uploadLimits.videoMaxMB}MB.`, 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('projectId', project._id);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          showAlert('Video uploaded successfully!', 'success');
          refetchVideos();
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            showAlert(errorData.message || 'Failed to upload video', 'error');
          } catch {
            showAlert('Failed to upload video', 'error');
          }
        }
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        showAlert('Network error occurred while uploading', 'error');
        setIsUploading(false);
        setUploadProgress(0);
      });

      const token = typeof window !== 'undefined' ? (getCookie('authToken') || localStorage.getItem('authToken')) : null;

      xhr.open('POST', `${BACKEND_URL}/api/videos/upload`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading video:', error);
      showAlert('Failed to upload video', 'error');
      setIsUploading(false);
      setUploadProgress(0);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [project, uploadLimits, showAlert, refetchVideos]);

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDeleteVideo = useCallback(async () => {
    if (!videoToDelete || !isAdmin) return;

    setDeletingVideo(true);
    try {
      const { ok } = await api(`/api/videos/${videoToDelete._id}`, 'DELETE');
      if (ok) {
        showAlert('Video deleted successfully', 'success');
        if (selectedVideo?._id === videoToDelete._id) {
          const nextList = projectVideos.filter((v) => v._id !== videoToDelete._id);
          setSelectedVideo(nextList.length > 0 ? nextList[0] : null);
        }
        setIsDeleteVideoOpen(false);
        setVideoToDelete(null);
        refetchVideos();
      } else {
        showAlert('Failed to delete video', 'error');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      showAlert('Failed to delete video', 'error');
    } finally {
      setDeletingVideo(false);
    }
  }, [videoToDelete, isAdmin, selectedVideo, projectVideos, setSelectedVideo, refetchVideos, showAlert]);

  return {
    isUploading,
    uploadProgress,
    fileInputRef,
    handleVideoUpload,
    triggerUpload,
    isDeleteVideoOpen,
    setIsDeleteVideoOpen,
    videoToDelete,
    setVideoToDelete,
    deletingVideo,
    handleDeleteVideo,
  };
}
