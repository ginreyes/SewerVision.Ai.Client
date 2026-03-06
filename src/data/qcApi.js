"use client";

import { api } from "@/lib/helper";

/**
 * QC Technician API functions
 */
export const qcApi = {
  /**
   * Get QC dashboard statistics
   */
  async getDashboardStats(qcTechnicianId) {
    const response = await api(`/api/qc-technicians/dashboard-stats/${qcTechnicianId}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch QC dashboard statistics');
    }
    
    return response.data.data;
  },

  /**
   * Get QC assignments
   */
  async getAssignments(qcTechnicianId, status = 'all') {
    const query = status !== 'all' ? `?status=${status}` : '';
    const response = await api(`/api/qc-technicians/get-assignments/${qcTechnicianId}${query}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch QC assignments');
    }
    
    return response.data.data;
  },

  /**
   * Get QC assignment by ID
   */
  async getAssignmentById(assignmentId) {
    const response = await api(`/api/qc-technicians/assignments/${assignmentId}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch assignment');
    }
    
    return response.data.data;
  },

  /**
   * Get project by ID (for QC console)
   */
  async getProject(projectId) {
    const response = await api(`/api/projects/get-project/${projectId}`, 'GET');
    if (!response.ok) {
      throw new Error(response.data?.error || response.data?.message || 'Failed to fetch project');
    }
    return response.data?.data ?? null;
  },

  /**
   * Get project videos
   */
  async getProjectVideos(projectId) {
    const response = await api(`/api/videos/project/${projectId}`, 'GET');
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch project videos');
    }
    return response.data?.data ?? [];
  },

  /**
   * Create manual detection
   */
  async createManualDetection(projectId, payload) {
    const response = await api(`/api/qc-technicians/projects/${projectId}/detections`, 'POST', payload);
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to create detection');
    }
    return response.data?.data;
  },

  /**
   * Complete QC assignment
   */
  async completeAssignment(projectId) {
    const response = await api(`/api/qc-technicians/assignments/${projectId}`, 'PATCH', {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to complete assignment');
    }
    return response.data;
  },

  /**
   * Get project detections
   */
  async getProjectDetections(projectId, qcStatus = 'all') {
    const query = qcStatus !== 'all' ? `?qcStatus=${qcStatus}` : '';
    const response = await api(`/api/qc-technicians/projects/${projectId}/detections${query}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch detections');
    }
    
    return response.data.data;
  },

  /**
   * Get detection by ID
   */
  async getDetectionById(detectionId) {
    const response = await api(`/api/qc-technicians/detections/${detectionId}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch detection');
    }
    
    return response.data.data;
  },

  /**
   * Review detection (approve/reject/modify)
   */
  async reviewDetection(detectionId, reviewData) {
    const response = await api(`/api/qc-technicians/detections/${detectionId}`, 'PATCH', reviewData);
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to review detection');
    }
    
    return response.data.data;
  },

  /**
   * Start QC session
   */
  async startQCSession(sessionData) {
    const response = await api('/api/qc-technicians/sessions', 'POST', sessionData);
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to start QC session');
    }
    
    return response.data.data;
  },

  /**
   * End QC session
   */
  async endQCSession(sessionId) {
    const response = await api(`/api/qc-technicians/sessions/${sessionId}/end`, 'PATCH');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to end QC session');
    }
    
    return response.data.data;
  },

  /**
   * Get detection comments
   */
  async getDetectionComments(detectionId) {
    const response = await api(`/api/qc-technicians/detections/${detectionId}/comments`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch comments');
    }
    
    return response.data.data;
  },

  /**
   * Add comment to detection
   */
  async addDetectionComment(commentData) {
    const response = await api('/api/qc-technicians/comments', 'POST', commentData);
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to add comment');
    }
    
    return response.data.data;
  },

  /**
   * Get certifications
   */
  async getCertifications(qcTechnicianId) {
    const response = await api(`/api/qc-technicians/get-certifications/${qcTechnicianId}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch certifications');
    }
    
    return response.data.data;
  },

  /**
   * Create certification
   */
  async createCertification(qcTechnicianId, certificationData) {
    const response = await api(`/api/qc-technicians/create-certificate/${qcTechnicianId}`, 'POST', certificationData);
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to create certification');
    }
    
    return response.data.data;
  },

  /**
   * Update certification
   */
  async updateCertification(certificationId, certificationData) {
    const response = await api(`/api/qc-technicians/certificates/${certificationId}`, 'PATCH', certificationData);
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to update certification');
    }
    
    return response.data.data;
  },

  /**
   * Get QC reports list
   */
  async getReportsList(qcTechnicianId) {
    const response = await api(`/api/qc-technicians/reports/${qcTechnicianId}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch reports');
    }
    
    return response.data || [];
  },

  /**
   * Get QC report by project
   */
  async getReportByProject(projectId, qcTechnicianId) {
    const response = await api(`/api/qc-technicians/report/${projectId}/${qcTechnicianId}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get notes for a user
   */
  async getNotes(userId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.isArchived !== undefined) params.append('isArchived', filters.isArchived);
    if (filters.isPinned !== undefined) params.append('isPinned', filters.isPinned);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const response = await api(`/api/qc-technicians/notes/${userId}${queryString ? `?${queryString}` : ''}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch notes');
    }
    
    return response.data.data;
  },

  /**
   * Get note by ID
   */
  async getNoteById(noteId, userId) {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api(`/api/qc-technicians/notes/detail/${noteId}${params}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch note');
    }
    
    return response.data.data;
  },

  /**
   * Create a note
   */
  async createNote(noteData) {
    const response = await api('/api/qc-technicians/notes', 'POST', noteData);
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to create note');
    }
    
    return response.data.data;
  },

  /**
   * Update a note
   */
  async updateNote(noteId, noteData) {
    const response = await api(`/api/qc-technicians/notes/${noteId}`, 'PATCH', noteData);
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to update note');
    }
    
    return response.data.data;
  },

  /**
   * Delete a note
   */
  async deleteNote(noteId, userId) {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api(`/api/qc-technicians/notes/${noteId}${params}`, 'DELETE');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to delete note');
    }
    
    return response.data;
  },

  /**
   * Get notes statistics
   */
  async getNotesStats(userId) {
    const response = await api(`/api/qc-technicians/notes/stats/${userId}`, 'GET');
    
    if (!response.ok) {
      throw new Error(response.data?.error || 'Failed to fetch notes statistics');
    }
    
    return response.data.data;
  }
};

export default qcApi;

