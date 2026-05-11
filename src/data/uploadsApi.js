"use client";

import { api, apiBlob, getCookie } from "@/lib/helper";
import { BACKEND_URL as API } from "@/lib/config";

/**
 * Uploads API functions
 */
export const uploadsApi = {
  /**
   * Get all uploads with filters
   */
  async getAllUploads(options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.search) params.append('search', options.search);
    if (options.status) params.append('status', options.status);
    if (options.type) params.append('type', options.type);
    if (options.uploadedBy) params.append('uploadedBy', options.uploadedBy);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const queryString = params.toString();
    const url = `/api/uploads/get-all-uploads${queryString ? `?${queryString}` : ''}`;
    
    const response = await api(url, 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch uploads');
    }
    return response.data.data;
  },

  /**
   * Get system stats
   */
  async getSystemStats() {
    const response = await api('/api/uploads/get-stats', 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch system stats');
    }
    return response.data.data;
  },

  /**
   * Get single upload
   */
  async getUpload(uploadId) {
    const response = await api(`/api/uploads/get-upload/${uploadId}`, 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch upload');
    }
    return response.data.data;
  },

  /**
   * Create upload (metadata only - files should be uploaded separately)
   */
  async createUpload(uploadData) {
    // Remove file from uploadData as backend expects JSON
    const { file, ...data } = uploadData;
    
    const response = await api('/api/uploads/create-uploads', 'POST', data);
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to create upload');
    }
    return response.data.data;
  },

  /**
   * Update upload
   */
  async updateUpload(uploadId, updateData) {
    const response = await api(`/api/uploads/update-upload/${uploadId}`, 'PUT', updateData);
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to update upload');
    }
    return response.data.data;
  },

  /**
   * Delete upload
   */
  async deleteUpload(uploadId) {
    const response = await api(`/api/uploads/delete-upload/${uploadId}`, 'DELETE');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to delete upload');
    }
    return response.data;
  },

  /**
   * Bulk actions (delete, archive, approve)
   */
  async bulkAction(action, uploadIds) {
    const response = await api('/api/uploads/bulk-action', 'POST', {
      action,
      uploadIds
    });
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to perform bulk action');
    }
    return response.data.data;
  },

  /**
   * Track download
   */
  async trackDownload(uploadId) {
    const response = await api(`/api/uploads/track-download/${uploadId}`, 'PUT');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to track download');
    }
    return response.data.data;
  },

  /**
   * Download file
   */
  async downloadFile(uploadId, filename) {
    const response = await apiBlob(`/api/uploads/download/${uploadId}`, 'GET');

    if (!response.ok) {
      throw new Error(response.error?.message || 'Failed to download file');
    }

    const blob = response.blob;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Track download
    try {
      await this.trackDownload(uploadId);
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  },

  /**
   * View file (opens in new tab)
   */
  async viewFile(uploadId, filename) {
    if (!uploadId) {
      throw new Error('Upload ID is required');
    }

    // Fetch file with authentication
    try {
      const response = await apiBlob(`/api/uploads/view/${uploadId}`, 'GET');

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to view file';
        const errorData = response.error;
        if (errorData && typeof errorData === 'object') {
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else if (typeof errorData === 'string' && errorData) {
          errorMessage = errorData;
        }
        throw new Error(errorMessage);
      }

      // Get content type to determine how to display
      const contentType = response.headers?.get('content-type') || '';
      const contentTypeLower = contentType.toLowerCase();

      // Check if response is JSON based on content-type header
      if (contentTypeLower.includes('application/json')) {
        // If it's JSON, read the blob as text then parse
        let data = null;
        try {
          const text = await response.blob.text();
          data = JSON.parse(text);
        } catch {}
        if (data && (data.success === false || data.message)) {
          throw new Error(data.message || 'Failed to view file');
        }
        // If it's file info, we can't view it directly
        throw new Error('File cannot be viewed directly. Please download it instead.');
      }

      const blob = response.blob;

      if (!blob || blob.size === 0) {
        throw new Error('File is empty or could not be loaded');
      }

      const blobUrl = window.URL.createObjectURL(blob);
      
      // For videos, images, and PDFs, open in new tab
      // For other files, download
      if (contentType.startsWith('video/') || 
          contentType.startsWith('image/') || 
          contentType.includes('pdf') ||
          contentType.includes('text/')) {
        const newWindow = window.open(blobUrl, '_blank');
        if (!newWindow) {
          // Popup blocked, download instead
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename || 'download';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
        } else {
          // Clean up blob URL after a delay (for opened tabs)
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
          }, 1000);
        }
      } else {
        // Download other file types
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      // Re-throw with a more user-friendly message if needed
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Could not connect to server');
      }
      throw error;
    }
  },

  /**
   * Get cloud storage provider configuration (masked credentials)
   */
  async getStorageConfig() {
    const response = await api('/api/uploads/storage-config', 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch storage config');
    }
    return response.data.data;
  },

  /**
   * Get a minimal, non-admin-safe storage summary.
   * Returns only { active, primaryRead, providers: { b2: { configured }, s3: { configured } } }.
   * Used by operator/backups and user/backups pages.
   */
  async getStorageSummary() {
    const response = await api('/api/uploads/storage-summary', 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch storage summary');
    }
    return response.data.data;
  },

  /**
   * Get bucket storage usage for both providers: { b2: {...} | null, s3: {...} | null }.
   * Admin-only (returns byte totals + file counts).
   */
  async getStorageUsage() {
    const response = await api('/api/uploads/storage-usage', 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch storage usage');
    }
    return response.data.data;
  },

  /**
   * Update active storage provider + S3 credentials. Admin only.
   * payload: { provider, primaryRead, s3: { bucket, region, accessKeyId, secretAccessKey, endpoint } }
   * Empty secretAccessKey means "keep existing" — does not overwrite.
   */
  async updateStorageConfig(payload) {
    const response = await api('/api/uploads/storage-config', 'PUT', payload);
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to update storage config');
    }
    return response.data.data;
  },

  /**
   * Validate S3 credentials WITHOUT saving. Returns { ok: true } or { ok: false, error }.
   */
  async testStorageConfig(payload) {
    const response = await api('/api/uploads/storage-config/test', 'POST', payload);
    if (!response.ok) {
      const msg = response.data?.error || response.data?.message || 'Failed to test storage config';
      throw new Error(msg);
    }
    return response.data;
  },

  /**
   * Start a backup/migration job between providers.
   * direction: 'b2-to-s3' | 's3-to-b2'
   */
  async startMigration(direction = 'b2-to-s3') {
    const response = await api('/api/uploads/migrate/start', 'POST', { direction });
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to start migration');
    }
    return response.data.data;
  },

  /**
   * Poll a migration job's status + progress.
   */
  async getMigrationStatus(jobId) {
    const response = await api(`/api/uploads/migrate/status/${jobId}`, 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch migration status');
    }
    return response.data.data;
  },

  /**
   * Request cancellation of a running migration.
   */
  async cancelMigration(jobId) {
    const response = await api(`/api/uploads/migrate/cancel/${jobId}`, 'POST');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to cancel migration');
    }
    return response.data;
  },

  /**
   * List recent migration jobs (24h retention, newest first).
   */
  async listMigrations() {
    const response = await api('/api/uploads/migrate/list', 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to list migrations');
    }
    return response.data.data;
  },

  /**
   * Chunked upload: start. Server returns { uploadId, totalChunks }.
   * Caller passes the SAME meta into queueUpload(meta, chunkBlobs) so the
   * IDB row uses the server-issued id as its primary key.
   */
  async startChunkedUpload({ originalName, mimeType, sizeBytes, totalChunks, projectId, device, location }) {
    const response = await api('/api/uploads/start', 'POST', {
      originalName, mimeType, sizeBytes, totalChunks, projectId, device, location,
    });
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to start chunked upload');
    }
    return response.data.data;
  },

  /**
   * Chunked upload: PUT one chunk. Uses raw fetch directly because the api()
   * helper auto-JSON-serializes the body; chunk PUTs must send a Blob with
   * Content-Type: application/octet-stream so the service-worker offline
   * branch and the express raw-body parser both see a Buffer/Blob.
   *
   * Returns the raw Response so the page-side drain() in uploadQueue.js can
   * inspect status + ETag header (its `putChunk` adapter expects a Response).
   */
  async putChunk(uploadId, index, blob) {
    const authToken = getCookie('authToken');
    return fetch(`${API}/api/uploads/${encodeURIComponent(uploadId)}/chunk/${index}`, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'application/octet-stream',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      credentials: 'include',
    });
  },

  /** Chunked upload: server stitches chunks, creates Upload row, returns it. */
  async completeChunkedUpload(uploadId) {
    const response = await api(`/api/uploads/${encodeURIComponent(uploadId)}/complete`, 'POST');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to complete chunked upload');
    }
    return response.data.data;
  },

  /** Chunked upload: discard server-side staging without creating a row. */
  async abortChunkedUpload(uploadId) {
    const response = await api(`/api/uploads/${encodeURIComponent(uploadId)}/abort`, 'POST');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to abort chunked upload');
    }
    return response.data.data;
  },

  /**
   * Get role-scoped backup logs. Admins see all; users/operators see their own actions only.
   * filters: { page, limit, action, startDate, endDate, search }
   */
  async getBackupLogs(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
    const qs = params.toString();
    const response = await api(`/api/uploads/backup-logs${qs ? `?${qs}` : ''}`, 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch backup logs');
    }
    return response.data.data;
  },
};

export default uploadsApi;

