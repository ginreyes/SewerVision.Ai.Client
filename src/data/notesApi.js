import { api } from "@/lib/helper";

export const notesApi = {
    getNotes: async (userId, filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
        if (filters.priority && filters.priority !== 'all') queryParams.append('priority', filters.priority); // Note: Backend doesn't explicitly filter by priority in `qc_notes.controller` but we can filter client side or ask user to update backend. The backend controller showed `isPinned`, `isArchived`, `projectId`, `search`. I will rely on client side filtering for now for things not supported or assume backend might be updated later.
        // Actually, backend supports: category, isArchived, isPinned, projectId, search.
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.isPinned !== undefined) queryParams.append('isPinned', filters.isPinned);

        // Using the generic notes route
        const { data, error } = await api(`/api/notes/${userId}?${queryParams.toString()}`);
        if (error) throw new Error(error);
        return data.data;
    },

    getStats: async (userId) => {
        const { data, error } = await api(`/api/notes/stats/${userId}`);
        if (error) throw new Error(error);
        return data.data;
    },

    createNote: async (noteData) => {
        const { data, error } = await api('/api/notes', 'POST', noteData);
        if (error) throw new Error(error);
        return data.data;
    },

    updateNote: async (noteId, noteData) => {
        const { data, error } = await api(`/api/notes/${noteId}`, 'PATCH', noteData);
        if (error) throw new Error(error);
        return data.data;
    },

    deleteNote: async (noteId) => {
        const { data, error } = await api(`/api/notes/${noteId}`, 'DELETE');
        if (error) throw new Error(error);
        return data;
    }
};
