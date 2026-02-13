"use client";

import { api, getCookie } from "@/lib/helper";

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
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const authToken = getCookie("authToken");
    
    const response = await fetch(`${API}/api/uploads/download/${uploadId}`, {
      method: 'GET',
      headers: {
        ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();
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

    const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const authToken = getCookie("authToken");
    
    const url = `${API}/api/uploads/view/${uploadId}`;
    
    // Fetch file with authentication
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
        },
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to view file';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get content type to determine how to display
      const contentType = response.headers.get('content-type') || '';
      const contentTypeLower = contentType.toLowerCase();
      
      // Check if response is JSON based on content-type header
      if (contentTypeLower.includes('application/json')) {
        // If it's JSON, read as JSON
        const data = await response.json();
        if (data.success === false || data.message) {
          throw new Error(data.message || 'Failed to view file');
        }
        // If it's file info, we can't view it directly
        throw new Error('File cannot be viewed directly. Please download it instead.');
      }

      // Read response as blob for file content
      let blob;
      try {
        blob = await response.blob();
      } catch (blobError) {
        // If blob reading fails, try to get error message
        try {
          const errorText = await response.text();
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to load file');
        } catch (parseError) {
          throw new Error('Failed to load file content');
        }
      }
      
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
};

export default uploadsApi;

