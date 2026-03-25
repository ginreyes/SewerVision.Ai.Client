"use client";

import { api } from "@/lib/helper";

export const knowledgeBaseApi = {
  async getAllArticles({ category, search, isPublic, page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (isPublic !== undefined) params.append('isPublic', String(isPublic));
    params.append('page', String(page));
    params.append('limit', String(limit));
    const response = await api(`/api/knowledge-base/all?${params}`, 'GET');
    if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch articles');
    return response.data;
  },
  async getArticle(id) {
    const response = await api(`/api/knowledge-base/${id}`, 'GET');
    if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch article');
    return response.data?.data;
  },
  async createArticle(data) {
    const response = await api('/api/knowledge-base/create', 'POST', data);
    if (!response.ok) throw new Error(response.data?.message || 'Failed to create article');
    return response.data?.data;
  },
  async updateArticle(id, data) {
    const response = await api(`/api/knowledge-base/${id}`, 'PUT', data);
    if (!response.ok) throw new Error(response.data?.message || 'Failed to update article');
    return response.data?.data;
  },
  async deleteArticle(id) {
    const response = await api(`/api/knowledge-base/${id}`, 'DELETE');
    if (!response.ok) throw new Error(response.data?.message || 'Failed to delete article');
    return response.data;
  },
  async getCategories() {
    const response = await api('/api/knowledge-base/categories', 'GET');
    if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch categories');
    return response.data?.data || [];
  },
  async markHelpful(id) {
    const response = await api(`/api/knowledge-base/${id}/helpful`, 'PUT');
    if (!response.ok) throw new Error(response.data?.message || 'Failed');
    return response.data?.data;
  },
};

export default knowledgeBaseApi;
