"use client";

import { api } from "@/lib/helper";

export const permissionLevelApi = {
  async getAll(role) {
    const params = role ? `?role=${role}` : '';
    return api(`/api/permission-levels${params}`, 'GET');
  },

  async getById(id) {
    return api(`/api/permission-levels/${id}`, 'GET');
  },

  async getModulesForRole(role) {
    return api(`/api/permission-levels/modules/${role}`, 'GET');
  },

  async create(data) {
    return api('/api/permission-levels', 'POST', data);
  },

  async update(id, data) {
    return api(`/api/permission-levels/${id}`, 'PUT', data);
  },

  async delete(id) {
    return api(`/api/permission-levels/${id}`, 'DELETE');
  },

  async assignToUser(userId, permissionLevelId) {
    return api(`/api/users/${userId}/assign-permission`, 'PATCH', { permissionLevelId });
  },

  /**
   * Resync: seeds SecurityModule from code + backfills default permission levels.
   * Pass { dryRun: true } to preview changes without committing. Default applies.
   */
  async resyncModules({ dryRun = false } = {}) {
    const qs = dryRun ? '?dryRun=1' : '';
    return api(`/api/permission-levels/resync-modules${qs}`, 'POST');
  },
};

export default permissionLevelApi;
